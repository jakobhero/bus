from config import config
from sqlalchemy import create_engine, Table, Column, BigInteger, SmallInteger, Float, String, Time, MetaData

meta = MetaData()

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