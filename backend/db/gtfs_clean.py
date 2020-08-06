import pandas as pd
from datetime import datetime, timezone

#Script automates the cleaning of GTFS data. For more information, refer to data_analytics/jakob/gtfs_data_cleanup.ipynb
#Data downloaded from http://transitfeeds.com/p/transport-for-ireland/782/latest/download

def name_converter(name):
    """splits name of gtfs stops data into the stop number (used as ID later on) and name without stop number"""
    name_split=name.split(",")
    try:
        return [name_split[0],int(name_split[-1].split()[-1])]
    except:
        return [None,None]

def time_converter(time_string):
    """function that transforms time strings in the gtfs data into timestamps used elsewhere in the app."""
    hour,minute,second=time_string.split(":")
    hour=int(hour)
    day=1
    if hour>23:
        hour=hour%24
        day+=1
    dt=datetime(year=1970,month=1,day=day,hour=hour,minute=int(minute),second=int(second))
    return int(dt.replace(tzinfo=timezone.utc).timestamp())

if __name__=='__main__':
    #viable service lines are hand-coded for now, should be automated at some point
    viable_service_lines=["y1002","y1001","y1003"]
    
    trips_df=pd.read_csv("data/gtfs/raw/trips.txt")
    #only trips that are covered by relevant service_id will be covered
    trips_df=trips_df[trips_df["service_id"].isin(viable_service_lines)]
    #drop unnecessary features
    trips_df=trips_df.drop(["shape_id","trip_headsign"],axis=1)
    #map direction to schema used in historical data
    trips_df["direction_id"]=trips_df["direction_id"]+1

    routes_df=pd.read_csv("data/gtfs/raw/routes.txt")
    #drop unnecessary features
    routes_df=routes_df.drop(["agency_id","route_long_name","route_type"],axis=1)
    #merge with routes to find route short name
    trips_df=pd.merge(trips_df, routes_df, on='route_id', how='inner')
    trips_df=trips_df.drop(["route_id"],axis=1)
    trips_df=trips_df.rename({"route_short_name":"route_id","direction_id":"direction"},axis="columns")
    #convert to upper case letters for consistency reason w/ historic data
    trips_df["route_id"]=trips_df["route_id"].apply(lambda x:x.upper())

    stops_df=pd.read_csv("data/gtfs/raw/stops.txt")
    #apply name_converter function to retrieve IDs used in backend (i.e. stop number) and station name without stop number
    stops_df["name"],stops_df["new_id"]=zip(*stops_df["stop_name"].apply(lambda x:name_converter(x)))
    #only n/a is stop that could not be assigned to stop number after research
    stops_df=stops_df.dropna()
    #create supporting df that helps to map stop_id of GTFS to the IDs used in backend
    id_match=stops_df[["stop_id","new_id"]]

    times_df=pd.read_csv("data/gtfs/raw/stop_times.txt")
    #drop unnecessary fetures
    times_df=times_df.drop(["stop_headsign","pickup_type","drop_off_type","shape_dist_traveled"],axis=1)
    #match with supporting df to replace GTFS IDs with those used in backend
    times_df=pd.merge(times_df, id_match, on='stop_id', how='inner')
    times_df=times_df.drop(["stop_id"],axis=1)
    times_df=times_df.rename({"new_id":"stop_id","stop_sequence":"progr_number","arrival_time":"arr","departure_time":"dep"},axis="columns")
    #format times with time_converter function to datetime.
    #only done for one of the time columns as they are duplicats.
    times_df["dep"]=times_df["dep"].apply(lambda x:time_converter(x))
    #create supporting df that holds the first stop of each trip
    times_start_df=times_df[["trip_id","dep","progr_number"]][times_df.progr_number==1]
    times_start_df=times_start_df.drop(["progr_number"],axis=1)
    times_start_df=times_start_df.rename({"dep":"start"},axis=1)
    #merge support df with times_df so that start time of trips is contained in each row
    times_df=pd.merge(times_df, times_start_df, on="trip_id", how='inner')
    #calculate cumulative duration
    times_df["cum_dur"]=times_df["dep"]-times_df["start"]
    #drop redundant feature
    times_df=times_df.drop(["arr"],axis=1)
    #old stop_id and stop_name are no longer required
    stops_df=stops_df.drop(["stop_id","stop_name"],axis=1)
    stops_df=stops_df.rename({"new_id":"stop_id","stop_lat":"lat","stop_lon":"lon"},axis="columns")

    #save the cleaned dataframes
    stops_df.to_csv("data/gtfs/clean/stops.csv")
    times_df.to_csv("data/gtfs/clean/times.csv")
    trips_df.to_csv("data/gtfs/clean/trips.csv")