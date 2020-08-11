import json
import xml.etree.ElementTree as ET
from flask import Flask
from flask_pymongo import PyMongo
from flask_cors import CORS
import base64


app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb://localhost:27017/lumi"
mongo = PyMongo(app)
CORS(app)
service_status = {'service': 'lumi visual library service', 'status': 'ok'}



def loadSVG(sub_path,name):

    file_path = "./files/" + sub_path + "/" + name + ".svg" 
    print(file_path)
    with open(file_path) as svg:
        data=svg.read()
        return data
        

@app.route("/")
def hello():
    return json.dumps(service_status)

@app.route("/<graphic>")
def get_graphic(graphic):
    svgs = set()
    g_tokens = graphic.split("-")

    # find exact
    graphics = mongo.db.symbols.find({"name": graphic},{"_id":0})
    for item in graphics:
        data = loadSVG(item["styles"][0],item["name"])
        svgs.add(str(data)) 

    # find strict
    graphics = mongo.db.symbols.find({"strict": { "$all" : g_tokens}},{"_id":0})

    for item in graphics:
        data = loadSVG(item["styles"][0],item["name"])
        svgs.add(str(data))

     # find all
    graphics = mongo.db.symbols.find({"all": { "$all" : g_tokens}},{"_id":0})

    for item in graphics:
        data = loadSVG(item["styles"][0],item["name"])
        svgs.add(str(data))
    
    
    graphics = mongo.db.flags.find({"name":graphic.capitalize()},{"_id":0})

    for item in graphics:
        data = loadSVG("flags",str(item["code"]).lower())
        svgs.add(str(data))
    
    return '<svgs width="100">' + "".join(list(svgs)) + "</svgs>"

@app.route("/name/<graphics>")
def get_graphic_name(graphics):
    glist = graphics.split(",")
    svgs = []
    for graphic in glist:

        # find exact
        graphics = mongo.db.symbols.find({"name": graphic},{"_id":0})
        for item in graphics:
            data = loadSVG(item["styles"][0],item["name"])
            svg_item = {}
            svg_item["name"] = graphic
            svg_item["data"] = base64.b64encode(data) 
            svgs.append(svg_item)
    
    return json.dumps(svgs)

@app.route("/strict/<graphic>")
def get_graphic_strict(graphic):
    svgs = set()
    g_tokens = graphic.split("-")

    # find strict
    graphics = mongo.db.symbols.find({"strict": { "$all" : g_tokens}},{"_id":0})

    for item in graphics:
        data = loadSVG(item["styles"][0],item["name"])
        svgs.add(str(data))
    
    return '<svgs width="100">' + "".join(list(svgs)) + "</svgs>"



@app.route("/color/<graphics>")
def get_color_all(graphics):
    glist = graphics.split(",")
    svgs = []
    for graphic in glist:
  
            g_tokens = graphic.split("-")
            # find all
            graphics = mongo.db.color.find({"all": { "$all" : g_tokens}},{"_id":0})
            for item in graphics:
                color_item = {}
                color_item["name"] = graphic
                color_item["color"] = item["color"] 
                svgs.append(color_item)
                break
        
       
    
    return json.dumps(svgs)

@app.route("/all/<graphics>")
def get_graphic_all(graphics):
    glist = graphics.split(",")
    svgs = []
    for graphic in glist:
  
        g_tokens = graphic.split("-")

        found = False;
        # find geo
        print("$$$$", graphic.title())
        geo = mongo.db.flags.find({"$or":[{"name":graphic.title()},{"code":graphic.upper()}]})
        for item in geo:
            print(item)
            data = loadSVG("flags",item["code"].lower())
            svg_item = {}
            svg_item["name"] = graphic
            svg_item["data"] = base64.b64encode(data) 
            svgs.append(svg_item)
            found = True
            break

       

        if not found:
            # find all
            graphics = mongo.db.symbols.find({"all": { "$all" : g_tokens}},{"_id":0})
            for item in graphics:
                data = loadSVG(item["styles"][0],item["name"])
                svg_item = {}
                svg_item["name"] = graphic
                svg_item["data"] = base64.b64encode(data) 
                svgs.append(svg_item)
                found = True
                break
        
        if not found:    
            graphics = mongo.db.flags.find({"name":graphic.capitalize()},{"_id":0})
            
            for item in graphics:
                print(item)
                data = loadSVG("flags",item["code"].lower())
                svg_item = {}
                svg_item["name"] = graphic
                svg_item["data"] = base64.b64encode(data) 
                svgs.append(svg_item)
                break;
    
    return json.dumps(svgs)
