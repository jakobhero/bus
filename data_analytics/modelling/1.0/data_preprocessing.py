import pandas as pd
import numpy as np
import time
import sqlalchemy

# D:\data\\
# /home/student/data/


class Process():
    def __init__(self):
        self.weather = self.make_weather()
        self.trips = pd.read_csv('D:\data\\clean_trips.csv')
        self.routes = list(self.trips.LINEID.unique())

    def rush_hour(self, x):
        if (0 <= (x - 57600) <= 10800) or (0 <= (x - 25000) <= 7200):
            return 1
        return 0

    def make_weather(self):
        weather = pd.read_excel('D:\data\\2018_historic_weather.xlsx')
        important_weather_features = [
            'dt', 'temp', 'pressure', 'humidity', 'wind_speed', 'weather_main']
        return weather[important_weather_features]

    def create_df(self, bus_line, direction):
        print(bus_line, direction)
        start_time = time.time()
        trip = self.trips.loc[(self.trips['LINEID'] == bus_line) & (
            self.trips['DIRECTION'] == direction)]
        chunk_size = 1000000
        # load the big file in smaller chunks
        temp = []
        for count, leave_chunk in enumerate(pd.read_csv('D:\data\\clean_leavetimes.csv', chunksize=chunk_size)):
            print(count)
            out = pd.merge(trip, leave_chunk, on=[
                           'TRIPID', 'DAYOFSERVICE'], how='inner')
            temp.append(out)
            if count == 3:
                break

        dfObj = pd.concat(temp, axis=0, sort=False)

        # Create unique identifier for each trip
        dfObj['COMB'] = dfObj['DAYOFSERVICE'].map(
            str) + dfObj['TRIPID'].map(str)
        u = dfObj['COMB'].unique()
        print("part 1", time.time() - start_time)
        return dfObj, u

    def create_result_df(self, dfObj, u):
        start_time = time.time()
        max_progrnum = 0.9 * dfObj['PROGRNUMBER'].max()
        temp = []
        for count, date_trip in enumerate(u):
            day_trip = dfObj.loc[(dfObj['COMB'] == date_trip)].sort_values(
                by=['PROGRNUMBER'])
            if (len(day_trip['PROGRNUMBER']) > max_progrnum):  # only full trips
                if count % 50 == 0:
                    print(count/len(u))
                try:
                    day_trip.index = range(len(day_trip))

                    # Calculate the time between each pair stops
                    time_be = day_trip['ACTUALTIME_ARR_y'].shift(
                        -1) - day_trip['ACTUALTIME_ARR_y']
                    time_be.drop(time_be.tail(1).index, inplace=True)
                    time_be = time_be.cumsum()
                    # Get the month and the day, month and the day of week
                    month = pd.to_datetime(day_trip['DAYOFSERVICE']).dt.month
                    day = pd.to_datetime(day_trip['DAYOFSERVICE']).dt.day
                    dayofweek = pd.to_datetime(
                        day_trip['DAYOFSERVICE']).dt.dayofweek
                    hour = day_trip['ACTUALTIME_ARR_y'].apply(
                        lambda x: x//3600)

                    # Add datetime and actual_arrive time as current unix time
                    datetime = pd.DatetimeIndex(day_trip['DAYOFSERVICE']).astype(
                        np.int64)/1000000000 + day_trip['ACTUALTIME_ARR_y']
                    datetime = pd.DataFrame(data={'unixtime': datetime})
                    rush_binary = day_trip['ACTUALTIME_ARR_y'].apply(
                        self.rush_hour)
                    # Convert  float to int, this is for the following merge operation
                    datetime['unixtime'] = datetime['unixtime'].astype(
                        np.int64)

                    # Set End point
                    end_point = day_trip['STOPPOINTID'].shift(-1)
                    end_point.drop(end_point.tail(1).index, inplace=True)

                    tripid = day_trip['TRIPID']
                    # Merge these columns
                    a = pd.concat([tripid, datetime, dayofweek, month, day, hour, rush_binary,
                                   day_trip['PROGRNUMBER'], end_point, time_be], axis=1, sort=False)

                    # Change the name of columns
                    a.columns = ['tripid', 'dt', 'dayofweek', 'month', 'day',
                                 'hour', 'rush_hour', 'progrnum', 'stop_id', 'cum_duration']
                    a.drop(a.tail(1).index, inplace=True)

                    # Merge two tables                   r = pd.merge_asof(a, self.weather, on = "dt", direction='nearest')

                    temp.append(r)
                except Exception as e:
                    print(e)
                    pass

        result = pd.concat(temp, sort=False)
        print("part 2", time.time() - start_time)
        return result

    def main(self):
        for bus_line in self.routes[:1]:
            for direction in [1, 2]:
                df, u = self.create_df(bus_line, direction)
                result = self.create_result_df(df, u)
                result.to_csv(str(bus_line) + "_"+str(direction) + '.csv')


if __name__ == "__main__":
    pp = Process()
    # pp.main()
    print(pp.routes)
