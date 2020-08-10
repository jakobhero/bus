from config import config
from sqlalchemy import create_engine
import pandas as pd


def pop_leavetimes(leavetimes_df):
    """populates the leavetimes table with data in leavetimes df."""
    count=0
    for chunk in leavetimes_df:
        count+=1
        if count<=115:
            continue
        chunk.to_sql("leavetimes",con=engine,if_exists="append",chunksize=10000,index=False)
        print(f"Finished populating chunk {count}.")

def pop_trips(trips_df):
    """populates the trips table with data in trips df."""
    trips_df.to_sql("trips",con=engine,if_exists="append",chunksize=10000,index=False)

def pop_weather(weather_df):
    """populates the weather table with data in weather df."""
    weather_df.to_sql("weather",con=engine,if_exists="append",chunksize=10000,index=False)

def pop_stops(stops_df):
    """populates the stops table with data in stops df."""
    stops_df.to_sql("stops",con=engine,if_exists="append",chunksize=10000,index=False)

if __name__=='__main__':

    #create engine from config file
    config=config()
    engine=create_engine("postgresql://"+config["user"]+":"+config["password"]+"@"+config["host"]+"/"+config["database"])

    #populate leavetimes
    leavetimes_df=pd.read_csv("data/leavetimes_cleaned.csv",index_col=0,chunksize=10**6)
    pop_leavetimes(leavetimes_df)

    #populate trips
    trips_df=pd.read_csv("data/trips_cleaned.csv",index_col=0)
    pop_trips(trips_df)

    #populate weather
    weather_df=pd.read_csv("data/weather_cleaned.csv",index_col=0)
    pop_weather(weather_df)

    #populate stops
    stops_df=pd.read_csv("data/stops_cleaned.csv",index_col=0)
    pop_stops(stops_df)





    