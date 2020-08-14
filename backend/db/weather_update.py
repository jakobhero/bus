import pandas as pd
from sqlalchemy import create_engine
from datetime import datetime
from config import config

def datetime_converter(timestamp):
    """takes unix timestamp and returns its month and hour in a tuple."""
    dt=datetime.fromtimestamp(timestamp)
    return dt.month,dt.hour

if __name__=='__main__':
    
    #create engine from config file
    config=config()
    engine=create_engine("postgresql://"+config["user"]+":"+config["password"]+"@"+config["host"]+"/"+config["database"])

    #get weather data
    sql="select * from weather"
    weather_df=pd.read_sql(sql,engine)

    #convert weather data
    weather_df["month"],weather_df["hour"]=zip(*weather_df["daytime"].apply(datetime_converter))
    
    #replace old weather data
    weather_df.to_sql("weather",engine,if_exists="replace")

