import pandas as pd
import numpy as np
import time
import json

# D:\data\\
# /home/student/data/


class Process():
    def __init__(self):
        self.trips = pd.read_csv('D:\data\\clean_trips.csv')
        self.routes = list(self.trips.LINEID.unique())

    def create_df(self, bus_line, direction):
        print(bus_line, direction)
        trip = self.trips.loc[(self.trips['LINEID'] == bus_line) & (
            self.trips['DIRECTION'] == direction)]
        chunk_size = 1000000
        # load the big file in smaller chunks
        temp = []
        for count, leave_chunk in enumerate(pd.read_csv('D:\data\\clean_leavetimes.csv', chunksize=chunk_size)):
            out = pd.merge(trip, leave_chunk, on=[
                           'TRIPID', 'DAYOFSERVICE'], how='inner')
            temp.append(out)
            if count == 2:
                break

        dfObj = pd.concat(temp, axis=0, sort=False)

        return dfObj

    def convert(self, o):
        if isinstance(o, np.int64):
            return int(o)
        return o

    def main(self):
        routes_and_stops = {}
        for bus_line in self.routes[:3]:
            dir_dict = {}
            for direction in [1, 2]:
                temp_dict = {}
                try:
                    temp = []
                    df = self.create_df(bus_line, direction)
                    max_progrnum = df['PROGRNUMBER'].max()
                    while max_progrnum > 0:
                        try:
                            temp.append(
                                df[df['PROGRNUMBER'] == max_progrnum]['STOPPOINTID'].iloc[0])
                        except:
                            pass
                        max_progrnum -= 1
                    temp_dict['stops'] = temp
                    dir_dict[direction] = temp_dict

                except Exception as e:
                    print(e)
            routes_and_stops[bus_line] = dir_dict
        with open('routesAndStops.json', 'w') as fp:
            json.dump(routes_and_stops, fp, default=self.convert)


if __name__ == "__main__":
    pp = Process()
    # print(pp.routes)
    pp.main()
