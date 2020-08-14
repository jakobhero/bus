import unittest, datetime
from app import app

class test_api(unittest.TestCase):

    def setUp(self):
        self.app = app.test_client()
    
    def test_stops(self):
        #check if request with no parameter is handled
        req_url="api/stops"
        response=self.app.get(req_url)
        self.assertEqual(response.status_code,200)
        self.assertEqual(response.json["status"],"Error! No substring specified.")

        #check if request with substring parameter is handled
        substring="blackha"
        req_url+="?substring="+substring
        response=self.app.get(req_url)
        self.assertEqual(response.status_code,200)
        #check if returned elements contain substring in their names
        for element in response.json["stops"]:
            self.assertTrue(substring in element["fullname"].lower())
        
        #check if request with substring parameter as integer is handled
        req_url="api/stops?substring="
        number=11
        req_url+=str(number)
        response=self.app.get(req_url)
        self.assertEqual(response.status_code,200)
        #check if returned elements contain specified numbers in their stop_id
        for element in response.json["stops"]:
            self.assertTrue(str(number) in str(element["stop_id"]))      

    def test_nearestneighbor(self):
        #check if request for no parameters is handled
        req_url="api/nearestneighbor"
        response=self.app.get(req_url)
        self.assertEqual(response.status_code,200)
        self.assertEqual(response.json["status"],"OK")

        #check if request is handled when only coordinates are passed
        dublin=[53.3498,-6.2603]
        req_url+="?lat="+str(dublin[0])+"&lng="+str(dublin[1])
        response=self.app.get(req_url)
        self.assertEqual(response.status_code,200)
        self.assertEqual(response.json["status"],"OK")
        self.assertEqual(len(response.json["stops"]),20)
        
        #check if request is handled when coordinates and k are passed
        k=5
        req_url+="&k="+str(k)
        response=self.app.get(req_url)
        self.assertEqual(response.status_code,200)
        self.assertEqual(response.json["status"],"OK")
        self.assertEqual(len(response.json["stops"]),k)

    def test_realtime(self):
        #check if request without parameters is handled correctly
        req_url="api/realtime"
        response=self.app.get(req_url)
        self.assertEqual(response.status_code,200)
        self.assertEqual(response.json["status"],"NO_STOP")

        #check if request with specified stop_id is handled correctly
        req_url+="?stopid=1715"
        response=self.app.get(req_url)
        self.assertEqual(response.status_code,200)
        self.assertTrue(len(response.json)>0)

    def test_routes(self):
        #check if request without parameters is empty dict at beginning
        req_url="api/routeinfo"
        response=self.app.get(req_url)
        self.assertEqual(response.status_code,200)
        self.assertEqual(response.json,{})

        #check if request with specified route_id returns expected results
        route="39A"
        req_url+="?routeid="+route
        response=self.app.get(req_url)
        self.assertEqual(response.status_code,200)
        #check that specified route serves each stop on the route
        for direction in response.json:
            for stop in response.json[direction]:
                self.assertTrue(route in stop['lines'])

    def test_directions(self):
        #check if request without dep parameter returns with expected error code
        req_url="api/directions"
        response=self.app.get(req_url)
        self.assertEqual(response.status_code,200)
        self.assertEqual(response.json["status"],"NO_START")

        #check if request without arr parameter returns with expected error code
        req_url+="?dep=blackhall+pl,+dublin"
        response=self.app.get(req_url)
        self.assertEqual(response.status_code,200)
        self.assertEqual(response.json["status"],"NO_DESTINATION")

        #check if request with dep and arr specified works
        req_url+="&arr=ucd,+dublin"
        response=self.app.get(req_url)
        self.assertEqual(response.status_code,200)

        #make sure that the parsing was successful
        self.assertEqual(response.json["status"], "OK")

        #make sure that the return provides connections
        self.assertTrue(len(response.json["connections"])>0)
        
        #make sure proprietary predictions are provided for dublin bus journeys on the connections
        for connection in response.json["connections"]:
            for db_leg in connection["db_index"]:
                self.assertEqual(connection["steps"][db_leg]["transit"]["source"],"TFI HOOLIGANS")

        #check if request with specified time returns expected results
        tomorrow=int(datetime.datetime.timestamp(datetime.datetime.now()+datetime.timedelta(days=1)))
        req_url+="&time="+str(tomorrow)
        response=self.app.get(req_url)
        self.assertEqual(response.status_code,200)
        self.assertEqual(response.json["status"],"OK")

        #check that the first dublin bus journey on each connection is not before the specified time
        print("\nTest that the journey times line up with the specified time")
        print("")
        for connection in response.json["connections"]:
            if len(connection["db_index"])==0:
                continue
            transit_info=connection["steps"][connection["db_index"][0]]["transit"]
            db_journey_start=transit_info["dep"]["time"]
            print(f"tomorrow: {tomorrow}\njourney start: {db_journey_start}\n")
            self.assertTrue(tomorrow<=db_journey_start)

if __name__=='__main__':
    unittest.main()