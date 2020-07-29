import unittest
import api.api as api
import json
import time

class test_api(unittest.TestCase):

    def test_directions_parser(self):
        #load sample response that features several edge cases - mutliple BUS journeys, and a LUAS journey
        sample1=json_loader("1594728742")
        result=api.directions_parser(sample1,time.time())

        #make sure that the parsing was successful
        self.assertEqual(result["status"], "OK")

        #make sure that the number of connections is correct
        self.assertEqual(len(result["connections"]),4)
        
        #make sure that each connection holds the correct number of legs
        lengths=[3,3,5,3]
        for i in range(len(lengths)):
            self.assertEqual(len(result["connections"][i]["steps"]),lengths[i])

        #check that transit_index points to correct transit options, routes
        transits=[["Dublin Bus"],["Dublin Bus"],["Dublin Bus","Luas"],["Luas"]]
        routes=[["46a"],["11"],["145","Green Line"],["Green Line"]]
        for i in range(len(transits)):
            for j in range(len(transits[i])):
                index=result["connections"][i]["transit_index"][j]
                self.assertEqual(result["connections"][i]["steps"][index]["transit"]["operator"],transits[i][j])
                self.assertEqual(result["connections"][i]["steps"][index]["transit"]["route"],routes[i][j])
        
def json_loader(file_name):
    with open("api/debugging/"+file_name+".json") as f:
        return json.load(f)

if __name__=='__main__':
    unittest.main()