import requests
import json
#the required first parameter of the 'get' method is the 'url':
x = requests.get('https://api.openalex.org/topics')
x.json()

data = json.loads(x.text)

#print the response text (the content of the requested file):