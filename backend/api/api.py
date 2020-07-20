import json, os, requests, datetime
import numpy as np
from sklearn.neighbors import KDTree
from flask_restful import Resource, Api, reqparse
from sqlalchemy.types import String

from .models import Stops as StopsModel

api = Api()

class Stops(Resource):
    """API Endpoint for Dublin Bus stop information. Returns all stops that contain specified substring in either
    ID or name."""
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('substring', type=str)
        frontend_params=parser.parse_args()

        if frontend_params["substring"]==None:
            return {"status":"Error! No substring specified."}
        
        response=[]
        looking_for=frontend_params["substring"]+'%'

        #if the length of substring is shorter than 3, only the beginning of stopid, name is checked.
        if (len(frontend_params["substring"])>2):
            looking_for='%'+looking_for #if substring is longer than 2 chars, it is checked whether substring is contained. 
        print(looking_for)
        for row in StopsModel.query.filter(StopsModel.stop_id.ilike(looking_for)).all():
            response.append([row.stop_id,row.name,row.lat,row.lon])
        for row in StopsModel.query.filter(StopsModel.name.ilike(looking_for)).all():
            response.append([row.stop_id,row.name,row.lat,row.lon])
        return {"stops":response,"status":"OK"}


class NearestNeighbor(Resource):
    """API endpoint for Dublin Bus stop information. Returns the k nearest bus stops to the coordinates specified in request.
    If k is not specified in request, the a default of 10 closest stops is returned. If coordinates are not specified in request,
    all bus stops are returned. For the calculation of the closest stops, a KD tree is used to find results in O(log(n))."""
    def get(self):

        #parse arguments "lat", "lon", "k" in request
        parser = reqparse.RequestParser()
        parser.add_argument('lat', type=str)
        parser.add_argument('lng', type=str)
        parser.add_argument('k',type=int)
        frontend_params=parser.parse_args()

        stops=[]
        coords=np.empty([0,2]) #necessary for KD tree data structure
        for stop in StopsModel.query.all():
            stops.append({'stopid': stop.stop_id, 'fullname':stop.name, 'lat':stop.lat,'lng':stop.lon})
            coords=np.append(coords,[[stop.lat,stop.lon]],axis=0)
    
        #check for required params
        if frontend_params["lat"] == None or frontend_params["lng"] == None:
            return {"stops":stops,"status":"OK"}
        
        k=20 #set default value for nearest neighbors to be returned

        if frontend_params["k"]!=None:
            k=frontend_params["k"]

        #set coordinates for nearest neighbor search
        try: 
            target=[[float(frontend_params["lat"]),float(frontend_params["lng"])]]
        except:
            return {"status":"Error: Coordinates could not be parsed to float"}
        
        #set up KD tree
        tree=KDTree(coords)

        #calculate the nearest neighbours
        nearest_dist,nearest_ind=tree.query(target,k=k)

        #populate response with rows from stops specified by calculated indices
        response=[]
        for ind in nearest_ind[0]:
            response.append(stops[ind])
        
        return {"stops":response,"status":"OK"}
        #http://localhost/stops?lat=53.305544&lon=-6.237866&k=10

class realTime(Resource):
    def get(self):

        parser = reqparse.RequestParser()
        parser.add_argument('stopid', type=str)

        frontend_params=parser.parse_args()
        if frontend_params["stopid"]==None:
            return {"status":"NO_STOP"}

        stop_id = frontend_params['stopid']
        URL = 'https://data.smartdublin.ie/cgi-bin/rtpi/realtimebusinformation'
        req_items = {'stopid': stop_id}  
        resp = requests.get(URL, params=req_items)
        parsed_json = (json.loads(resp.text))
        return parsed_json['results']

class routeInfo(Resource):
    def match(self,list1,list2):
        return len(list(set(list1).intersection(list2)))

    def get_stops(self, stopsObj):
        """Iterates through object and extracts stopid for place in list"""
        stops = []
        for stop in stopsObj:
            stops.append(stop['stopid'])
        return stops

    def split_by_direction(self, results):
        """[Assumes first and last objects corresponds to different directions, then iterates through the list and finds stops arrays more similar to one direction than to another
        If an object cannot be classified, then assume 1st index and last correspond to different directions etc]

        Args:
            results ([list]): [list of objects returned by api request]

        Returns:
            [Two lists]: [Each list corresponds to the indexes of those objects in the array which predominatly go in the same direction]
        """
        for start in range(len(results)):
            dir1, dir2 = [], []
            count = 0
            for i, result in enumerate(results):
                match_dir1 = self.match(self.get_stops(results[start]['stops']), self.get_stops(result['stops']))
                match_dir2 = self.match(self.get_stops(results[-start-1]['stops']), self.get_stops(result['stops']))
                # print(i, " matches with dir1 ", match_dir1, " and with dir2 ", match_dir2, " num of stops in i ", len(self.get_stops(result['stops'])))
                if match_dir1 > match_dir2:
                    dir1.append(i)
                elif match_dir1 < match_dir2:
                    dir2.append(i)
                else:
                    count += 1
            if count < 1:
                break
        return dir1, dir2

    def stop_in_response(self, stopid, response):
        for indiv in response:
            if indiv['stopid'] == stopid:
                return True
        return False

    def process_route_info(self, results):
        """If the stop has not already been placed in the response then clean it and add to response"""
        dir1, dir2 = self.split_by_direction(results)
        
        overall_response = []
        for dir_ in [dir1, dir2]:
            response = []
            for obj in dir_:
                for stop in results[obj]['stops']:
                    if not self.stop_in_response(stop['stopid'], response):
                        stop['lat'] = float(stop.pop('latitude'))
                        stop['lng'] = float(stop.pop('longitude'))
                        stop.pop('shortnamelocalized', None)
                        stop.pop('fullnamelocalized', None)
                        stop.pop('shortname', None)
                        stop.pop('operators', None)
                        stop.pop('displaystopid', None)
                        response.append(stop)
            overall_response.append(response)
        return overall_response

    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('routeid', type=str)

        frontend_params=parser.parse_args()
        if "routeid" not in frontend_params:
            return {"status":"NO_ROUTE"}

        route_id = frontend_params['routeid']
        URL='https://data.smartdublin.ie/cgi-bin/rtpi/routeinformation'
        req_items = {'routeid': route_id, 'operator':'Dublin Bus'}  
        resp = requests.get(URL, params=req_items)
        parsed_json = (json.loads(resp.text))
        # print(len(parsed_json))

        return self.process_route_info(parsed_json['results'])



class Directions(Resource):
    """API endpoint for transit directions from A to B in Dublin from Google's directions API.
    Expects the parameters "dep", "arr" (both required) and "time" (optional).
    Locations can be provided as address strings (spaces replaced by "+" in request) or coordinates in format "lat,lng".
    Response from Google API is processed for Frontend display."""
    def get(self):

        #parse request
        parser = reqparse.RequestParser()
        parser.add_argument('dep', type=str)
        parser.add_argument('arr', type=str)
        parser.add_argument('time',type=int)
        frontend_params=parser.parse_args()

        #check for required params
        if frontend_params["dep"]==None:
            return {"status":"NO_START"}
        elif frontend_params["arr"]==None:
            return {"status":"NO_DESTINATION"}
        
        #set params
        params={
            "origin":frontend_params["dep"],
            "destination":frontend_params["arr"],
            "key":os.environ.get('GOOGLE_KEY'),
            "mode":"transit",
            "departure_time":"now",
            "alternatives":"true"
        }
        if "time" in frontend_params: #overwrite default value if time is specified
            params["departure_time"]=frontend_params["time"]

        #make request-
        url="https://maps.googleapis.com/maps/api/directions/json?"
        req = requests.get(url, params=params)
        res = req.json()

        #NEXT BLOCK ONLY FOR DEVELOPMENT PURPOSES
        #store results for debugging purposes
        now=str(int(datetime.datetime.now().timestamp()))
        with open('api/debugging/'+now+'.json', 'w') as outfile:
            json.dump(res, outfile, sort_keys=True, indent=8)

        #process response
        res=directions_parser(res)

        return res        
        

def directions_parser(directions):
    """transforms response of Google's direction service into frontend-friendly format."""
    
    #check status of response
    status=directions["status"]
    if status!="OK":
        return directions

    routes=directions["routes"]

    #the response will be an array of routes
    connections=[]

    #the available alternatives for getting from A to B are stored in the routes array
    for route in routes:
        #as there are not waypoints specified, there is always going to be exactly one leg in the response:
        route=route["legs"][0]
        
        #route specific information is stored in variable curr
        curr={
            "distance":route["distance"]["value"],
            "duration":route["duration"]["value"]
        }
        
        db_index=[] #holds index of dublin bus travel(s) in leg array
        transit_index=[] #holds index of all transit travel(s) in leg array
        steps=[]
        index=0

        #the required steps to get from A to B in each alternative are stored in the legs array
        for step in route["steps"]:
            
            #step specific information is stored in variable curr_step.
            #the information pertinent to all steps will be accessible from the routes in the steps array.
            curr_step={
                "distance":step["distance"]["value"],
                "duration":step["duration"]["value"],
                "start":step["start_location"],
                "stop":step["end_location"],
                "mode":step["travel_mode"]
            }
            
            #directions for walking are stored in array of polylines
            if curr_step["mode"]=="WALKING":
                polylines=[]
                for poly_elem in step["steps"]:
                    polylines.append(poly_elem["polyline"]["points"])
                curr_step["polyline"]=polylines
            #transic specific information is stored in variable transit, which will be addedd to curr_step
            if curr_step["mode"]=="TRANSIT":
                transit={
                    "dep":{
                        "name":step["transit_details"]["departure_stop"]["name"],
                        "time":step["transit_details"]["departure_time"]["value"]
                    },
                    "arr":{
                        "name":step["transit_details"]["arrival_stop"]["name"],
                        "time":step["transit_details"]["arrival_time"]["value"]
                    },
                    "headsign":step["transit_details"]["headsign"],
                    "type":step["transit_details"]["line"]["vehicle"]["type"],
                    "operator":step["transit_details"]["line"]["agencies"][0]["name"]
                }

                if transit["operator"] in ["Dublin Bus","Go-Ahead"]:
                    if transit["operator"]=="Dublin Bus":
                        db_index.append(index)
                    transit["route"]=step["transit_details"]["line"]["short_name"]
                if transit["operator"] == "Luas":
                    transit["route"]=step["transit_details"]["line"]["name"]
                transit_index.append(index)
                polyline=[]
                polyline.append(step["polyline"]["points"])
                curr_step["polyline"]=polyline
                curr_step["transit"]=transit
            
            steps.append(curr_step)
            index+=1

        curr["db_index"]=db_index
        curr["transit_index"]=transit_index
        curr["steps"]=steps

        #times are only specified if transit is involved
        if len(curr["transit_index"])>=1:
            curr["start"]={
                "time":route["departure_time"]["value"],
                "address":route["start_address"],
                "location":route['start_location']
            }
            curr["end"]={
                "time":route["arrival_time"]["value"],
                "address":route["end_address"],
                "location":route["end_location"]
            }

        connections.append(curr)
    
    return {"connections": connections, "status": status}

api.add_resource(Directions, '/directions', endpoint='direction')
api.add_resource(NearestNeighbor, '/nearestneighbor', endpoint='nearestneighbor')
api.add_resource(realTime, '/realtime', endpoint='realtime')
api.add_resource(routeInfo, '/routeinfo', endpoint='routeinfo')
api.add_resource(Stops, '/stops', endpoint='stops')