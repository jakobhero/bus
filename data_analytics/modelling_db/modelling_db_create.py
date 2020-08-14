from config import config
from sqlalchemy import create_engine, Table, Column, BigInteger, SmallInteger, Float, String, MetaData

meta = MetaData()

leavetimes = Table(
   'leavetimes', meta, 
   Column('daystamp', BigInteger, primary_key=True, nullable=False), 
   Column('trip_id', BigInteger, primary_key=True, nullable=False),
   Column('progr_number', BigInteger, primary_key=True, nullable=False),
   Column('stoppoint_id', BigInteger),
   Column('arrival_time_p', BigInteger),
   Column('departure_time_p', BigInteger),
   Column('arrival_time_a', BigInteger),
   Column('departure_time_a', BigInteger),
   Column('weather_id', BigInteger),
   Column('suppressed', SmallInteger)
)

trips = Table(
    'trips', meta,
    Column('daystamp', BigInteger, primary_key=True, nullable=False),
    Column('trip_id', BigInteger, primary_key=True, nullable=False),
    Column('line_id', String(length=5)),
    Column('route_id', SmallInteger),
    Column('direction', SmallInteger),
    Column('arrival_time_p', BigInteger),
    Column('departure_time_p', BigInteger),
    Column('arrival_time_a', Float),
    Column('departure_time_a', Float),
    Column('suppressed', SmallInteger)
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