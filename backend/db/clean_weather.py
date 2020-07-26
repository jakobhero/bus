import pandas as pd

#script automates cleaning of weather data. for detailed info and comments, refer to data_analytics/jakob/weather_prep.ipynb

weather=pd.read_csv("2018_historic_weather.csv")
weather=weather.drop(["dt_iso","timezone","city_name","lat","lon","sea_level","grnd_level","rain_1h","rain_3h","snow_1h","snow_3h"],axis=1)
weather=weather.drop_duplicates(subset="dt",keep="last")
column_dict={
    "dt":"daytime"
}
weather.rename(columns=column_dict,inplace=True)
weather.to_csv("weather_cleaned.csv")
