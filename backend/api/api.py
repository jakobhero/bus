import json, os, requests, datetime
from flask_restful import Resource, Api, reqparse

from .models import Stops as StopsModel

api = Api()

class Stops(Resource):
    """API endpoint for Dublin Bus stop information. Returns a JSON containing all stops."""
    def get(self):
        stops=[]
        for stop in StopsModel.query.all():
            stops.append({'id': stop.stop_id, 'name':stop.name, 'coords':{'lat':stop.lat,'lon':stop.lon}})
        return json.dumps(stops)

class Directions(Resource):
    """API endpoint for transit directions from A to B in Dublin from Google's directions API.
    Expects the parameters "dep", "arr" (both required) and "time" (optional).
    Response from Google API is processed for Frontend display."""
    def get(self):

        #parse request
        parser = reqparse.RequestParser()
        parser.add_argument('dep', type=str)
        parser.add_argument('arr', type=str)
        parser.add_argument('time',type=int)
        frontend_params=parser.parse_args()

        #check for required params
        if "dep" not in frontend_params:
            return "Error: No starting coords provided."
        elif "arr" not in frontend_params:
            return "Error: No destination coords provided."
        
        #set params
        params={
            "origin":frontend_params["dep"],
            "destination":frontend_params["arr"],
            "key":os.environ.get('GOOGLE_KEY'),
            "mode":"transit",
            "departure_time":"now"
        }
        if "time" in frontend_params: #overwrite default value if time is specified
            params["departure_time"]=frontend_params["time"]

        #make request
        url="https://maps.googleapis.com/maps/api/directions/json?"
        req = requests.get(url, params=params)
        res = req.json()

        #NEXT BLOCK ONLY FOR DEVELOPMENT PURPOSES
        #store results for debugging purposes
        now=str(int(datetime.datetime.now().timestamp()))
        with open('debugging/'+now+'.json', 'w') as outfile:
            json.dump(res, outfile, sort_keys=True, indent=8)

        #process response
        res=directions_parser(res)

        return res        
        

def directions_parser(directions):
    """transforms response of Google's direction service into frontend-friendly format."""
    
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
            "start":{
                "time":route["departure_time"]["value"],
                "address":route["start_address"],
                "location":route['start_location']
            },
            "end":{
                "time":route["arrival_time"]["value"],
                "address":route["end_address"],
                "location":route["end_location"]
            }
        }
        
        bus_index=[] #holds index of bus travel(s) in leg array
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
                    "type":step["transit_details"]["line"]["agencies"][0]["name"]
                }
                if transit["type"]=="Dublin Bus":
                    bus_index.append(index)
                transit["route"]=step["transit_details"]["line"]["short_name"]
                curr_step["transit"]=transit
            
            steps.append(curr_step)
            index+=1

        curr["bus_index"]=bus_index
        curr["steps"]=steps
        connections.append(curr)
    
    return connections

api.add_resource(Directions, '/directions', endpoint='direction')
api.add_resource(Stops, '/stops', endpoint='stops')