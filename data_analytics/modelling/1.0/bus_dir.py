import requests, bs4, time, re, json

def process(x):
   x = x.replace("From ", "")
   y = re.split("Towards ", x, flags=re.IGNORECASE)
   if (len(y) != 2):
      y = re.split("to ", x, flags=re.IGNORECASE)
      output = "From " + y[1].strip() + " To " + y[0].strip()
   else:
      output = "From " + y[1].strip() + " Towards " + y[0].strip()

   return output

url = 'https://www.dublinbus.ie/Your-Journey1/Timetables/'

r = requests.get(url, headers={'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36"})
soup = bs4.BeautifulSoup(r.text, 'html.parser')

dir_dict = {}

table = soup.find_all( "table")[2]

rows=list()
for row in table.findAll("tr"):
   if row.findAll('th'):
      continue
   route = row.findAll("td")[0].text.strip()
   header = row.findAll("td")[1].text.strip()
   dir1 = header
   dir2 = process(header)
   dir_dict[route] = {
	   					'dir1': dir1,
						'dir2': dir2
  					 }



print(len(dir_dict))
with open('directions.json', 'w') as fp:
    json.dump(dir_dict, fp)


