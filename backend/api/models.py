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

class GTFS_trips(db.Model):
    __tablename__='gtfs_trips'
    trip_id=db.Column(db.String, primary_key=True, nullable=False)
    route_id=db.Column(db.String)
    service_id=db.Column(db.String)
    direction=db.Column(db.SmallInteger)

class GTFS_stops(db.Model):
    __tablename__='gtfs_stops'
    stop_id=db.Column(db.SmallInteger, primary_key=True, nullable=False)
    name=db.Column(db.String, nullable=False)
    lat=db.Column(db.FLOAT)
    lon=db.Column(db.FLOAT)

class GTFS_times(db.Model):
    __tablename__='gtfs_times'
    trip_id=db.Column(db.String, db.ForeignKey("gtfs_trips.trip_id"), primary_key=True, nullable=False)
    progr_number=db.Column(db.SmallInteger, primary_key=True, nullable=False)
    stop_id=db.Column(db.SmallInteger, db.ForeignKey("gtfs_stops.stop_id"))
    start=db.Column(db.BigInteger)
    dep=db.Column(db.BigInteger)
    cum_dur=db.Column(db.BigInteger)
    trip=db.relationship(GTFS_trips, backref='times',lazy=True)
    stop=db.relationship(GTFS_stops, backref='times',lazy=True)

class Weather(db.Model):
    __tablename__="weather"
    daytime=db.Column(db.BigInteger, primary_key=True,nullable=False)
    temp=db.Column(db.FLOAT)
    feels_like=db.Column(db.FLOAT)
    temp_min=db.Column(db.FLOAT)
    temp_max=db.Column(db.FLOAT)
    pressure=db.Column(db.SmallInteger)
    humidity=db.Column(db.SmallInteger)
    wind_speed=db.Column(db.FLOAT)
    wind_deg=db.Column(db.SmallInteger)
    clouds_all=db.Column(db.SmallInteger)
    weather_id=db.Column(db.SmallInteger)
    weather_main=db.Column(db.String)
    weather_description=db.Column(db.String)
    month=db.Column(db.SmallInteger)
    hour=db.Column(db.SmallInteger)
    