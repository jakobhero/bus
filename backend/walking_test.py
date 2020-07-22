from api.api import directions_parser
import json
import time

with open("api/debugging/1595329107.json") as json_file:
    data=json.load(json_file)
response=directions_parser(data,int(time.time()))
print(response)