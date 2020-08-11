import pandas as pd, numpy as np, holidays, seaborn as sns, matplotlib.pyplot as plt, time, xgboost as xgb, json, pickle, sys
from sqlalchemy import create_engine
from datetime import datetime

from sklearn.model_selection import train_test_split
from sklearn.feature_selection import SelectKBest, f_regression
from sklearn import metrics

from config import config

"""This script automates the modelling for the scheduled and actual duration of each bus line.
For more detailed information, please refer to pipeline_automation.ipynb and pipeline_testing.ipynb."""

#initialise Irish Holidays
holidays_IE=holidays.Ireland()

def daystamp_converter(time):
    """extracts and returns tuple of (weekday,month,hour,holiday) from datetime object."""
    global holidays_ie
    date=datetime.fromtimestamp(time)
    if date in holidays_IE:
        holiday=1
    else:
        holiday=0
    return (date.weekday(),date.month,date.hour,holiday)

if __name__=='__main__':
    #check provided arguments and matches them with project member
    argvs=sys.argv
    if(len(argvs)<=1 or argvs[1].lower() not in ["yuqian","callum","jakob"]):
        print("Please provide your first name as command line argument when running the Script.")
        quit()
    name=argvs[1].lower()
    
    #read in the assignments of the models which were computed in pipeline_automation.ipynb
    with open('assignment.json') as json_file:
        assignment = json.load(json_file)
    
    #match assignments with command line argument.
    models=assignment[name]
    # models=assignment["yuqian"]+assignment["mohamed"]+assignment["jakob"]

    #create sql alchemy engine
    config=config()
    engine=create_engine("postgresql://"+config["user"]+":"+config["password"]+"@"+config["host"]+"/"+config["database"])

    count=0
    length=len(models)
    features={}

    #train each model in the assignment
    for model in models:
        #keep track of runtime per model
        start_time=time.time()

        #For more details on the modelling procedure, please refer to pipeline_test.ipynb.
        line,direction=model[:2]
        count+=1
        print(f"Training model {count}/{length} for ({line},{direction}).")
        #assemble sql query.
        sql=("SELECT lt.daystamp, lt.progr_number, lt.stoppoint_id,lt.arrival_time_p,lt.arrival_time_a,"
            "lt.departure_time_p,lt.departure_time_a,trips.route_id,"
            "trips.arrival_time_p,trips.departure_time_p,trips.departure_time_a,"
            "weather_main,temp,feels_like,temp_min,temp_max,pressure,humidity,wind_speed,wind_deg,clouds_all,weather_description "
            "FROM leavetimes AS lt, trips, weather "
            "WHERE trips.line_id='"+line+"' AND trips.direction="+str(direction)+" AND trips.suppressed=0 "
            "AND lt.daystamp = trips.daystamp AND lt.trip_id = trips.trip_id AND lt.suppressed=0"
            "AND lt.weather_id = weather.daytime")
        
        #load queried data into df and rename columns
        df = pd.read_sql(sql,engine)
        features=list(df.columns)
        features[0]="daystamp"
        features[2]="stop_id"
        features[3]="arr_p"
        features[4]="arr_a"
        features[5]="dep_p"
        features[6]="dep_a"
        features[8]="end_p"
        features[9]="start_p"
        features[10]="start_a"
        df.columns=features

        #convert time specific data from the dataframe
        df["dt"]=df.daystamp.values+df.dep_p.values
        df["weekday"],df["month"],df["hour"],df["holiday"]=zip(*df['dt'].apply(daystamp_converter))
        df["dur_s"]=df.dep_p.values-df.start_p.values
        df["dur_a"]=df.dep_a.values-df.start_a.values

        #create log dict
        logs={
            "rows":{
                "start":df.shape[0]
            }
        }

        #filter out uncommon routes
        routes=df.route_id.value_counts().index[0]
        df_clean=df[df.route_id==routes]
        rows_routes=df_clean.shape[0]
        logs["rows"]["route_filter"]=rows_routes-logs["rows"]["start"]

        #remove null values
        df_clean = df_clean.dropna(axis = 0, how ='any') 
        rows_after_nan=df_clean.shape[0]
        logs["rows"]["nan_filter"]=rows_after_nan-rows_routes

        #calculate ratio of least to most visited stop
        stop_counts=df_clean.stop_id.value_counts()
        logs["scr"]=min(stop_counts)/max(stop_counts)

        #assign features to type
        categorical=["stop_id","route_id","weather_main","weather_description","weekday","month","hour","holiday"]
        df_clean[categorical]=df_clean[categorical].astype("category")
        ints=['daystamp','progr_number','arr_p','arr_a','dep_p','dep_a','dur_s','dur_a','pressure','humidity','wind_deg','clouds_all']
        floats=['temp','feels_like','temp_min','temp_max','wind_speed']

        #clean up dataframe
        df_clean=df_clean.drop(["route_id"],axis=1)
        df_clean[ints]=df_clean[ints].astype('int64')
        df_clean=df_clean[df_clean.dur_a>=0]
        rows_after_dur=df_clean.shape[0]
        logs["rows"]["negative_dur"]=rows_after_dur-rows_after_nan
        df_clean=df_clean.drop(["stop_id"],axis=1)

        #create dataframe with means and standard deviations per progr_number
        dur_stats_df=pd.DataFrame(columns=["progr_number","dur_mean","dur_std"])
        for progr_number in df_clean.progr_number.unique():
            durations=df_clean.dur_a[df_clean["progr_number"]==progr_number]
            dur_stats_df=dur_stats_df.append(pd.Series([progr_number,durations.mean(),durations.std()],index=dur_stats_df.columns),ignore_index=True)
            dur_stats_df["progr_number"]=dur_stats_df["progr_number"].astype('int64')

        #merge duration stats with df_clean and look for outliers (outside 3 SDs from mean)
        df_clean=df_clean.merge(dur_stats_df,how='inner',on='progr_number')
        df_clean["outlier"]=abs(df_clean["dur_a"]-df_clean["dur_mean"])>3*df_clean["dur_std"]

        #only keep rows that aren't outliers
        df_clean=df_clean[df_clean["outlier"]==False]
        rows_after_outliers=df_clean.shape[0]
        logs["rows"]["outliers"]=rows_after_outliers-rows_after_dur
        logs["rows"]["end"]=rows_after_outliers
        #remove stat columns from dataframe
        df_clean=df_clean.drop(["dur_mean","dur_std","outlier"],axis=1)

        #add statistics of means and std to logs
        logs["stats"]=dur_stats_df.set_index("progr_number").to_dict("index")

        #determine best feature combinations
        y=df_clean["dur_a"]
        X=df_clean.drop(["dur_a"],axis=1)
        X_train,X_test,y_train,y_test=train_test_split(X,y,test_size=0.3,random_state=1)
        categorical=X_train.columns[X_train.dtypes=="category"]
        X_train_enc=pd.get_dummies(X_train[categorical],drop_first=True)
        X_test_enc=pd.get_dummies(X_test[categorical],drop_first=True)
        dummy_columns=list(X_train_enc.columns)
        #calculate f-regression values
        fs=SelectKBest(score_func=f_regression, k='all')
        fs.fit(X_train_enc,y_train)
        X_train_fs=fs.transform(X_train_enc)
        X_test_fs=fs.transform(X_test_enc)

        #plot f-values of categorical features
        plt.figure(figsize=(16,9))
        ax = sns.barplot(x=dummy_columns, y=fs.scores_,palette="Blues_d")
        ax.set_xticklabels(ax.get_xticklabels(), rotation=90, ha="right")
        plt.savefig("img/"+line+"_"+str(direction)+"_cat.png")

        #calculate correlation for numerical features
        numeric=X_train.columns[(X_train.dtypes=="int64") | (X_train.dtypes=="float64")]
        corr=pd.concat([X_train[numeric], y], axis=1).corr()

        #plot heatmap of pearson's correlation for numerical features
        plt.figure(figsize=(16,9))
        sns.heatmap(corr,xticklabels=corr.columns,yticklabels=corr.columns,linewidth=.5,cmap="YlGnBu")
        plt.savefig("img/"+line+"_"+str(direction)+"_num.png")

        #assemble dataframe for modelling
        high_corr=corr["dur_a"][(corr["dur_a"]>=0.5) | (corr["dur_a"]<=-0.5)]
        numeric=high_corr.drop(["dur_a"]).index
        X=pd.concat([pd.get_dummies(X[categorical].drop(["weather_main"],axis=1),drop_first=True),df_clean[numeric]],axis=1)
        y=df_clean["dur_a"]
        X=X.reset_index(drop=True)
        y=y.reset_index(drop=True)

        #split data
        X_train,X_test,y_train,y_test=train_test_split(X,y,random_state=1)
        
        #set up and train model
        xgb_reg=xgb.XGBRegressor(learning_rate=0.3, max_depth=5, n_estimators=200)
        start=time.time()
        xgb_reg.fit(X_train,y_train)
        wall_time=time.time()-start
        wall_time

        #store model performance
        mse=metrics.mean_squared_error(y_pred=xgb_reg.predict(X_test), y_true=y_test)
        logs["modelling"]={
            "XGBoost":{
                "time":wall_time,
                "r_2":metrics.r2_score(y_pred=xgb_reg.predict(X_test), y_true=y_test),
                "mse":mse,
                "rmse":mse**(1/2),
                "mae":metrics.mean_absolute_error(y_pred=xgb_reg.predict(X_test), y_true=y_test)   
            }    
        }

        #store model benchmarks
        mse=metrics.mean_squared_error(y_pred=X_test.dur_s, y_true=y_test)
        logs["modelling"]["Benchmark"]={
            "r_2":metrics.r2_score(y_pred=X_test.dur_s, y_true=y_test),
            "mse":mse,
            "rmse":mse**(1/2),
            "mae":metrics.mean_absolute_error(y_pred=X_test.dur_s, y_true=y_test)
        }

        #store model features
        logs["features"]=list(X.columns)
        
        #write logs
        with open("logs/"+line+"_"+str(direction)+".json", "w") as outfile: 
            outfile.write(json.dumps(logs,indent = 4)) 
        
        #dump model
        with open ("pickle/"+line+"_"+str(direction)+".sav", "wb") as pickle_file:
            pickle.dump(xgb_reg,pickle_file)
        print(f"Finished training model {count}/{length} for ({line},{direction}) in {(time.time()-start_time)/60:.1f} mins.")
        break