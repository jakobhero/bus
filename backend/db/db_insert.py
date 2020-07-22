#!/usr/bin/python
import psycopg2
import pandas as pd
import datetime
from config import config

def insert_data(query_func, data):
    """ Insert data of dataframe into stop table """
    conn = None
    try:
        # read connection parameters
        params = config()

        # connect to the PostgreSQL server
        conn = psycopg2.connect(**params)
		
        # create a cursor
        cur = conn.cursor()

	    # run insert function
        for i in range(data.shape[0]):
            row=data.iloc[i]
            db_string=query_func(row)
            cur.execute(db_string)
       
	    # close the communication with the PostgreSQL
        cur.close()

        # commit the changes
        conn.commit()

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()

def stops_query(row):
    db_string="INSERT INTO stops VALUES ('"+str(row[0])+"','"+str(row[1]).replace("'","''")+"',"+str(row[2])+","+str(row[3])+")"\
        "ON CONFLICT (stop_id) DO UPDATE SET name=excluded.name, lat=excluded.lat, lon=excluded.lon;"
    return db_string

def leavetimes_query(row):
    value_string=""
    for i in range(len(row)):
        value_string+="'"+str(row[i])+"'"
        if(i<(len(row)-1)):
            value_string+=","
    db_string="INSERT INTO leavetimes VALUES ("+value_string+");"
    return db_string

def clean_leavetimes(data):
    #apply function that converts datestring to unix timestamp
    data["DAYSTAMP"]=data["DAYOFSERVICE"].apply(lambda x:int(datetime.datetime.strptime(x.split(" ")[0], "%d-%b-%y").timestamp()))
    return data[["DAYSTAMP","TRIPID","PROGRNUMBER","STOPPOINTID","PLANNEDTIME_ARR","PLANNEDTIME_DEP","ACTUALTIME_ARR","ACTUALTIME_DEP"]].astype("int64")

def insert_leavetimes():
    """Easy wrapper function that feeds params to insert data function to execute leavetimes population."""
    leavetimes = pd.read_csv('rt_leavetimes_DB_2018.txt', delimiter=';', chunksize=10**6)
    count=0
    for chunk in leavetimes:
        chunk=clean_leavetimes(chunk)
        insert_data(leavetimes_query,chunk)
        count+=1
        print(f"Finished inserting chunk {count}.")

if __name__ == '__main__':
    # stops_df=pd.read_csv("stops_cleaned.txt")
    # insert_data(stops_query,stops_df)
    insert_leavetimes()