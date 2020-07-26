#!/usr/bin/python
import psycopg2
import pandas as pd
import datetime
from config import config
from sqlalchemy import create_engine

def insert_data(query_func, data):
    """ Insert data of dataframe into db schema. requires the name of a function 
    that creates the SQL query for the insertion of a row into a specific table
    and a dataframe holding the data to be inserted."""
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
    """Function that when provided a row of a dataframe that holds stops info creates a SQL
    string to insert that row into the stops table."""
    db_string="INSERT INTO stops VALUES ('"+str(row[0])+"','"+str(row[1]).replace("'","''")+"',"+str(row[2])+","+str(row[3])+")"\
        "ON CONFLICT (stop_id) DO UPDATE SET name=excluded.name, lat=excluded.lat, lon=excluded.lon;"
    return db_string

def leavetimes_query(row):
    """Function that when provided a row of a dataframe that holds leavetimes info creates a SQL
    string to insert that row into the leavetimes table."""
    value_string=""
    for i in range(len(row)):
        value_string+="'"+str(row[i])+"'"
        if(i<(len(row)-1)):
            value_string+=","
    db_string="INSERT INTO leavetimes VALUES ("+value_string+");"
    return db_string

def leavetimes_update(row):
    """Updates leavetimes with weather_id."""
    value_string="UPDATE leavetimes SET weather_id = '"+str(row[3])+"' WHERE daystamp= '"+str(row[0])+"' AND trip_id = '"+str(row[1])+"' AND progr_number = '"+str(row[2])+"';"
    return value_string

def trips_query(row):
    """Function that when provided a row of a dataframe that holds trips info creates a SQL
    string to insert that row into the trips table."""
    value_string=""
    for i in range(len(row)):
        value_string+="'"+str(row[i])+"'"
        if(i<(len(row)-1)):
            value_string+=","
    db_string="INSERT INTO trips VALUES ("+value_string+");"
    return db_string

def weather_query(row):
    """Function that when provided a row of a dataframe that holds weather info creates a SQL
    string to insert that row into the weather table."""
    value_string=""
    for i in range(len(row)):
        value_string+="'"+str(row[i])+"'"
        if(i<(len(row)-1)):
            value_string+=","
    db_string="INSERT INTO weather VALUES ("+value_string+");"
    return db_string

def insert_leavetimes(leavetimes):
    """Easy wrapper function that feeds params to insert data function to execute leavetimes population."""
    count=0
    for chunk in leavetimes:
        #insert_data(leavetimes_query,chunk)
        count+=1
        insert_data(leavetimes_query,chunk[["DAYSTAMP","TRIPID","PROGRNUMBER","WEATHERSTAMP"]])
        print(f"Finished updating chunk {count}.")

if __name__ == '__main__':
    #below's function inserts cleaned stops into stops table (must exist already)
    #stops_df=pd.read_csv("stops_cleaned.txt")
    # insert_data(stops_query,stops_df)
    
    #below's function cleans and inserts leavetimes into leavetimes table (must exist already)
    leavetimes_df=pd.read_csv("leavetimes_clean.csv",index_col=0,chunksize=10**6)
    insert_leavetimes(leavetimes_df)

    #below's function inserts cleaned trips into trips table (must exist already)
    #trips_df=pd.read_csv("trips_cleaned.csv",index_col=0)
    # insert_data(trips_query,trips_df)

    #below's function inserts cleaned weather into weather table (must exist already)
    #weather_df=pd.read_csv("weather_clean.csv", index_col=0)
    # insert_data(weather_query,weather_df)

