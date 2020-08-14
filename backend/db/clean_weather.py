import pandas as pd

#script automates cleaning of weather data. for detailed info and comments, refer to data_analytics/jakob/weather_prep.ipynb

def datetime_converter(timestamp):
    """takes unix timestamp and returns its month and hour in a tuple."""
    dt=datetime.fromtimestamp(timestamp)
    return dt.month,dt.hour

weather=pd.read_csv("data/2018_historic_weather.csv")
weather=weather.drop(["dt_iso","timezone","city_name","lat","lon","sea_level","grnd_level","rain_1h","rain_3h","snow_1h","snow_3h"],axis=1)
weather=weather.drop_duplicates(subset="dt",keep="last")
column_dict={
    "dt":"daytime"
}
weather.rename(columns=column_dict,inplace=True)

#convert weather time to month and hour
weather["month"],weather["hour"]=zip(*weather["daytime"].apply(datetime_converter))

weather.to_csv("data/weather_cleaned.csv")
