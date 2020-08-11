from flask import Flask
from flask_cors import CORS
import json 

app = Flask(__name__)
CORS(app)

services = {}

@app.route('/register/<service>/<uri>',methods=["post"])
def do_register(service,uri):
    services[service]=uri
    return json.dumps({"updated":True})

@app.route('/services')
def get_services():
    return json.dumps(services)


if __name__ == '__main__':
    app.run()