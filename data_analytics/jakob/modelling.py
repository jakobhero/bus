import sys, pandas as pd, numpy as np, json, pickle

from sqlalchemy import create_engine
from datetime import datetime
from config import config

from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression

"""This script automates the modelling for the scheduled and actual duration of each bus line.
For more detailed information, please refer to pipeline_automation.ipynb and pipeline_testing.ipynb."""

def daystamp_converter(time):
    """This function returns a tuple of weekday, month and hour for any unix timestamp."""
    date=datetime.fromtimestamp(time)
    return (date.weekday(),date.month,date.hour)

if __name__=='__main__':
    #check provided arguments and matches them with project member
    argvs=sys.argv
    if(len(argvs)<=1 or argvs[1].lower() not in ["yuqian","mohamed","jakob"]):
        print("Please provide your first name as command line argument when running the Script.")
        quit()
    name=argvs[1].lower()
    
    #read in the assignments of the models which were computed in pipeline_automation.ipynb
    with open('assignment.json') as json_file:
        assignment = json.load(json_file)
    
    #match assignments with command line argument.
    models=assignment[name]
    
    #for testing purposes only
    #models=[['46A',1]]

    #create sql alchemy engine
    config=config()
    engine=create_engine("postgresql://"+config["user"]+":"+config["password"]+"@"+config["host"]+"/"+config["database"])

    count=1
    length=len(models)

    #train each model in the assignment
    for model in models:
        #For more details on the modelling procedure, please refer to pipeline_test.ipynb.
        line,direction=model[:2]
        print(f"Training model {count}/{length} for ({line},{direction}).")

        #assemble sql query.
        sql=("SELECT lt.daystamp, lt.trip_id, lt.stoppoint_id,lt.departure_time_p,"
            "lt.departure_time_a,trips.departure_time_p,trips.departure_time_a,"
            "line_id,route_id,weather_main,temp "
            "FROM leavetimes AS lt, trips, weather "
            "WHERE trips.line_id='"+line+"' AND trips.direction="+str(direction)+"AND trips.suppressed=0 "
            "AND lt.daystamp = trips.daystamp AND lt.trip_id = trips.trip_id AND lt.suppressed=0"
            "AND lt.weather_id = weather.daytime")
        
        #load queried data into df and rename columns
        df = pd.read_sql(sql,engine)
        df.columns=["daystamp","trip_id","stop_id","dep_p","dep_a","start_p","start_a","line_id","route_id","weather","temp"]

        #transform times
        df["datetime"]=df.daystamp.values+df.dep_p.values
        df["weekday"],df["month"],df["hour"]=zip(*df['datetime'].apply(daystamp_converter))
        df["dur_s"]=df.dep_p.values-df.start_p.values
        df["dur_a"]=df.dep_a.values-df.start_a.values

        #drop old times
        df_ml=df.drop(["daystamp","trip_id","dep_p","dep_a","start_p","start_a","datetime"],axis=1)
        
        #examine most common routes
        route_counts=df_ml.route_id.value_counts()
        indices=route_counts.index
        values=route_counts.values
        cum_value=0
        size=df_ml.shape[0]
        index=1
        for value in values:
            cum_value+=value
            ratio=cum_value/size
            print(f"{index} most common route(s) cover {ratio*100:.2f}% of the routes.")
            if(ratio>0.9):
                break
            index+=1
        
        #proceed with most common route only.
        routes=[indices[0]]
        df_ml=df_ml[df_ml.route_id.isin(routes)]

        #drop NaNs.
        df_ml = df_ml.dropna(axis = 0, how ='any')

        #drop columns with cardinality 1.
        df_ml=df_ml.drop(["line_id","route_id"],axis=1)

        #create dummies.
        df_weekday=pd.get_dummies(df_ml.weekday)
        df_month=pd.get_dummies(df_ml.month)
        df_hour=pd.get_dummies(df_ml.hour)
        df_weather=pd.get_dummies(df_ml.weather)
        df_stops=pd.get_dummies(df_ml.stop_id)

        #set up model for scheduled duration.
        y_prior=df_ml["dur_s"]
        df_test_prior=pd.concat([df_weekday,df_month,df_hour,df_stops],axis=1)
        X=df_test_prior
        X_train,X_test,y_train,y_test=train_test_split(X,y_prior,random_state=1)

        #train and dump model for scheduled duration.
        reg = LinearRegression().fit(X_train, y_train)
        print(f"Score of schedule prediction: {reg.score(X_test,y_test):.2f}.")
        filename = "schedule_preds/"+line+"_"+str(direction)+".sav"
        pickle.dump(reg, open(filename, 'wb'))        

        #set up model for actual duration.
        y=df_ml["dur_a"]
        df_test=df_ml.drop(["stop_id","weather","dur_a","weekday","month","hour"],axis=1)
        df_test=pd.concat([df_test,df_weather,df_weekday,df_month,df_hour],axis=1)
        X=df_test
        X_train,X_test,y_train,y_test=train_test_split(X,y,random_state=1)

        #train and dump model for actual duration.
        reg = LinearRegression().fit(X_train, y_train)
        print(f"Score of duration prediction: {reg.score(X_test,y_test):.2f}.")
        filename = "duration_preds/"+line+"_"+str(direction)+".sav"
        pickle.dump(reg, open(filename, 'wb'))
        print("")