from config import config
from sqlalchemy import create_engine
import pandas as pd

def pop_table(name,data_df):
    """populates the table 'name' with the data in data_df."""
    data_df.to_sql(name,con=engine,if_exists="append",chunksize=10000,index=False)

if __name__=='__main__':
    #create engine from config file
    config=config()
    engine=create_engine("postgresql://"+config["user"]+":"+config["password"]+"@"+config["host"]+"/"+config["database"])

    stops_df=pd.read_csv("data/gtfs/clean/stops.csv", index_col=0)
    print(stops_df.head())
    pop_table('gtfs_stops', stops_df)

    trips_df=pd.read_csv("data/gtfs/clean/trips.csv", index_col=0)
    print(trips_df.head())
    pop_table('gtfs_trips', trips_df)

    times_df=pd.read_csv("data/gtfs/clean/times.csv", index_col=0)
    print(times_df.head())
    pop_table('gtfs_times', times_df)
