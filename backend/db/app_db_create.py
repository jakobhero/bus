from config import config
from sqlalchemy import create_engine, Table, Column, BigInteger, SmallInteger, Float, String, Time, MetaData

meta = MetaData()

stops = Table(
    'stops', meta,
    Column('stop_id', String(length=12), primary_key=True, nullable=False),
    Column('name', String(length=100), nullable=False),
    Column('lat', Float),
    Column('lon', Float)
)

weather = Table(
    'weather', meta,
    Column('daytime', BigInteger, primary_key=True, nullable=False),
    Column('temp', Float),
    Column('feels_like', Float),
    Column('temp_min', Float),
    Column('temp_max', Float),
    Column('pressure', SmallInteger),
    Column('humidity', SmallInteger),
    Column('wind_speed', Float),
    Column('wind_deg', SmallInteger),
    Column('clouds_all', SmallInteger),
    Column('weather_id', SmallInteger),
    Column('weather_main', String),
    Column('weather_description', String),
    Column('weather_icon', String),
    Column('month', SmallInteger),
    Column('hour', SmallInteger)
)

stop_route_match= Table(
    'stop_route_match', meta,
    Column('line_id', String(length=5), primary_key=True, nullable=False),
    Column('direction', SmallInteger, primary_key=True, nullable=False),
    Column('stoppoint_id', BigInteger, primary_key=True, nullable=False),
    Column('route_id', SmallInteger),
    Column('progr_number', SmallInteger)
)

gtfs_trips = Table(
   'gtfs_trips', meta, 
   Column('trip_id', String, primary_key=True, nullable=False),
   Column('route_id', String), 
   Column('service_id', String),
   Column('direction', SmallInteger)
)

gtfs_times = Table(
    'gtfs_times', meta,
    Column('trip_id', String, primary_key=True, nullable=False),
    Column('progr_number', SmallInteger, primary_key=True, nullable=False),
    Column('stop_id', SmallInteger),
    Column('start', BigInteger),
    Column('dep', BigInteger),
    Column('cum_dur', BigInteger)
)

gtfs_stops = Table(
    'gtfs_stops', meta,
    Column('stop_id', SmallInteger, primary_key=True, nullable=False),
    Column('name', String, nullable=False),
    Column('lat', Float),
    Column('lon', Float)
)

if __name__=='__main__':
    #create engine
    config=config()
    engine=create_engine("postgresql://"+config["user"]+":"+config["password"]+"@"+config["host"]+"/"+config["database"])

    #create tables
    meta.create_all(engine)