#!/usr/bin/python
import psycopg2
import pandas as pd
from config import config

def insert_stops(stops):
    """ Insert data of dataframe into stop table """
    conn = None
    try:
        # read connection parameters
        params = config()

        # connect to the PostgreSQL server
        print('Connecting to the PostgreSQL database...')
        conn = psycopg2.connect(**params)
		
        # create a cursor
        cur = conn.cursor()
        
        # delete old data
        cur.execute("DELETE FROM stops;")

	    # include new data, if stop_id exists, update DB
        for i in range(stops.shape[0]):
            row=stops.iloc[i]
            db_string="INSERT INTO stops VALUES ('"+str(row[0])+"','"+str(row[1]).replace("'","''")+"',"+str(row[2])+","+str(row[3])+")"\
                "ON CONFLICT (stop_id) DO UPDATE SET name=excluded.name, lat=excluded.lat, lon=excluded.lon;"
            print(db_string)
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
            print('Database connection closed.')


if __name__ == '__main__':
    stops_df=pd.read_csv("stops_cleaned.txt")
    insert_stops(stops_df)