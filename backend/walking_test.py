from api.api import directions_parser
import json
import time

with open("api/debugging/1596533577.json") as json_file:
    data=json.load(json_file)
response=directions_parser(data,int(time.time()))
print(json.dumps(response))