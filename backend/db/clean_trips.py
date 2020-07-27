import pandas as pd
import datetime

#script automates cleaning of trip data. for detailed info and comments, refer to data_analytics/jakob/trips_prep.ipynb

trips=pd.read_csv("data/rt_trips_DB_2018.txt",sep=";")
trips["DAYSTAMP"]=trips["DAYOFSERVICE"].apply((lambda x:int(datetime.datetime.strptime(x.split(" ")[0], "%d-%b-%y").timestamp())))
trips["DAYSTAMP"].astype("int64",copy=False)
trips["ROUTE"]=trips["ROUTEID"].apply(lambda x:x.split("_")[1])
trips=trips.drop(["DATASOURCE","DAYOFSERVICE","BASIN","TENDERLOT","JUSTIFICATIONID","LASTUPDATE","NOTE","ROUTEID"],axis=1)
column_dict={
    "TRIPID":"trip_id",
    "LINEID":"line_id",
    "DIRECTION":"direction",
    "PLANNEDTIME_ARR":"arrival_time_p",
    "PLANNEDTIME_DEP":"departure_time_p",
    "ACTUALTIME_ARR":"arrival_time_a",
    "ACTUALTIME_DEP":"departure_time_a",
    "DAYSTAMP":"daystamp",
    "ROUTE":"route_id",
    "SUPPRESSED":"suppressed"
}
trips.rename(columns=column_dict,inplace=True)
trips["suppressed"]=trips["suppressed"].fillna(0)
trips.to_csv("data/trips_cleaned.csv")