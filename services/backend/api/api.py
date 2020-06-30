import json
from flask_restful import Resource, Api

from .models import Stops as StopsModel

api = Api()

class Stops(Resource):
    def get(self):
        stops=[]
        for stop in StopsModel.query.all():
            stops.append({'id': stop.stop_id, 'name':stop.name, 'coords':{'lat':stop.lat,'lon':stop.lon}})
        return json.dumps(stops)

api.add_resource(Stops, '/')
