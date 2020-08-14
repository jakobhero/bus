import pandas as pd
import datetime

def clean_leavetimes(data):
    """function that cleans up leavetimes data to only feature the relevant columns for storage.
    The DAYOFSERVICE column is transformed to a unix timestamp of the specific day."""
    #apply function that converts datestring to unix timestamp
    data["DAYSTAMP"]=data["DAYOFSERVICE"].apply(lambda x:int(datetime.datetime.strptime(x.split(" ")[0], "%d-%b-%y").timestamp()))
    data["WEATHERSTAMP"]=data["DAYSTAMP"].values+data["ACTUALTIME_ARR"].values
    data["WEATHERSTAMP"]=data["WEATHERSTAMP"].apply(lambda x:round(x/3600)*3600)
    data=data[["DAYSTAMP","TRIPID","PROGRNUMBER","STOPPOINTID","PLANNEDTIME_ARR","PLANNEDTIME_DEP","ACTUALTIME_ARR","ACTUALTIME_DEP","WEATHERSTAMP","SUPPRESSED"]]
    rename_dict={
        "DAYSTAMP":"daystamp",
        "TRIPID":"trip_id",
        "PROGRNUMBER":"progr_number",
        "STOPPOINTID":"stoppoint_id",
        "PLANNEDTIME_ARR":"arrival_time_p",
        "PLANNEDTIME_DEP":"departure_time_p",
        "ACTUALTIME_ARR":"arrival_time_a",
        "ACTUALTIME_DEP":"departure_time_a",
        "WEATHERSTAMP":"weather_id",
        "SUPPRESSED":"suppressed"
    }
    data=data.rename(columns=rename_dict)
    data["suppressed"]=data["suppressed"].fillna(0)
    return data.astype("int64")

if __name__=='__main__':
    leavetimes = pd.read_csv('data/rt_leavetimes_DB_2018.txt', delimiter=';', chunksize=10**6)
    header=True
    count=0
    for chunk in leavetimes:
        clean_leavetimes(chunk).to_csv("data/leavetimes_cleaned.csv",mode='a',header=header)
        header=False
        count+=1
        print(f"Finished cleaning chunk {count}.")
