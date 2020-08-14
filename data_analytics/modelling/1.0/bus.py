
import requests, json, pprint
start = 'Clonskeagh'
end = 'Belvedere College'
URL = f'https://maps.googleapis.com/maps/api/directions/json?origin={start}&destination={end}&key=AIzaSyA_eCNDMfLDrxbweb-FbZ4TzaVJtnN1rHY&region=ie&mode=transit&alternatives=true'
# &mode=transit&transit_mode=bus
r = requests.get(URL)
data = r.json()

pprint.pprint(data)



def travel_dets(route):
	for j in route['legs'][0]['steps']:
		print("Travel mode: ", j['travel_mode'])
		print(j['html_instructions'])
		if j['travel_mode'] == "WALKING":
			print("To Do")
		elif j['travel_mode'] == "TRANSIT":
			try:
				print(j['transit_details']['line']['short_name'])
				print(j['transit_details']['departure_stop']['name'])
				print(j['transit_details']['arrival_stop']['name'])
			except:
				print("Not a bus")

		print("="*25)

# for i in data['routes']:
# 	travel_dets(i)
# 	print("="*25)

lineid = eachstep["transit_details"]["line"]["short_name"]
headsign =  eachstep["transit_details"]["headsign"].split(' ')[0]
with open('/stopSeq/directions.json', 'r') as f:
    data_dir = json.load(f)
try:
    dir1 = data_dir[lineid]["dir1"]
except KeyError:
    return Response({"status":"fail", "msg":"Sorry, DublinBus doesn't go to that destination!"})
if dir1.find(headsign) > dir1.find('To'):
    direction = '1'
else:
    direction = '2'