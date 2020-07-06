import json
from .api import directions_parser

def test_response(file_name):
    with open("api/debugging/"+file_name+".json") as f:
        data=json.load(f)
    return directions_parser(data)