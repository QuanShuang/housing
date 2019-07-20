#! usr/bin/env python

from sys import argv
from os.path import exists
import simplejson as json 

script, in_file, out_file = argv

data = json.load(open(in_file))

a = data["data"]["geo_json"]

b=[]

for i in range(len(a[0])):
    b.append([a[0][i][1],a[0][i][0]])

c = [b]

geojson = {
    "type": "FeatureCollection",
    "features": [
    {
        "type": "Feature",
        "geometry" : {
            "type": "Polygon",
            "coordinates": c,
            },
            "properties" : {"name": data["data"]["name"],"score": float(data["data"]["score"])}
    }]
}


output = open(out_file, 'w')
json.dump(geojson, output)

print(geojson)