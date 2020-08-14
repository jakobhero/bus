from config import config
from sqlalchemy import create_engine, text
import pandas as pd

def pop_table(name,data_df):
    """populates the table 'name' with the data in data_df."""
    data_df.to_sql(name,con=engine,if_exists="append",chunksize=10000,index=False)

if __name__=='__main__':
    
    #create engine from config file
    config=config()
    engine=create_engine("postgresql://"+config["user"]+":"+config["password"]+"@"+config["host"]+"/"+config["database"])

    #populate weather
    weather_df=pd.read_csv("data/weather_cleaned.csv",index_col=0)
    pop_table("weather",weather_df)

    #populate stops
    stops_df=pd.read_csv("data/stops_cleaned.csv",index_col=0)
    pop_table("stops",stops_df)
    
    #populate stop_route_match
    srm_df=pd.read_csv("data/stop_route_match.csv",index_col=0)
    pop_table("stop_route_match",srm_df)

    #populate gtfs_stops
    gtfs_stops_df=pd.read_csv("data/gtfs/stops.csv", index_col=0)
    pop_table('gtfs_stops', gtfs_stops_df)

    #populate gtfs_trips
    gtfs_trips_df=pd.read_csv("data/gtfs/trips.csv", index_col=0)
    pop_table('gtfs_trips', gtfs_trips_df)

    #populate gtfs_times
    gtfs_times_df=pd.read_csv("data/gtfs/times.csv", index_col=0)
    pop_table('gtfs_times', gtfs_times_df)

    #delete the stops that aren't represented in the historical data
    query=text("delete FROM stops WHERE stop_id NOT IN (select (cast(stoppoint_id as varchar)) from stop_route_match)")
    engine.execute(query)

    
		   

