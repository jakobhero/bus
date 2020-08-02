import json
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.ext.declarative import DeclarativeMeta

db = SQLAlchemy()

class Stops(db.Model):
    __tablename__ = 'stops'
    stop_id = db.Column(db.String(12), nullable=False, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    lat = db.Column(db.FLOAT)
    lon = db.Column(db.FLOAT)

    def __repr__(self):
        return 'ID: '+self.stop_id+', Name:  '+self.name+" , Pos: ("+str(self.lat)+","+str(self.lon)+")."

class StopsRoute(db.Model):
    __tablename__ = 'stop_route_match'
    line_id = db.Column(db.String(length=5), primary_key=True, nullable=False)
    direction = db.Column(db.SmallInteger, primary_key=True, nullable=False)
    stoppoint_id = db.Column(db.BigInteger, primary_key=True, nullable=False)
    route_id = db.Column(db.SmallInteger)
    progr_number = db.Column(db.SmallInteger)

    def __repr__(self):
        return 'Line: '+self.line_id+", Direction: "+str(self.direction)+", Stop: "+str(self.stoppoint_id)+", Route: "+str(self.route_id)

    