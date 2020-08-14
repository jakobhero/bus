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

def pop_table(name,data_df):
    """populates the table 'name' with the data in data_df."""
    data_df.to_sql(name,con=engine,if_exists="append",chunksize=10000,index=False)

if __name__=='__main__':
    
    #create engine from config file
    config=config()
    engine=create_engine("postgresql://"+config["user"]+":"+config["password"]+"@"+config["host"]+"/"+config["database"])

    #populate leavetimes
    leavetimes_df=pd.read_csv("data/leavetimes_cleaned.csv",index_col=0,chunksize=10**6)
    pop_leavetimes(leavetimes_df)

    #populate trips
    trips_df=pd.read_csv("data/trips_cleaned.csv",index_col=0)
    pop_table("trips",trips_df)

    #populate weather
    weather_df=pd.read_csv("data/weather_cleaned.csv",index_col=0)
    pop_table("weather",weather_df)