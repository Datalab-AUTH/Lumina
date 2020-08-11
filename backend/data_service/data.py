from flask import Flask
from flask import request
import json 
import csv

app = Flask(__name__)



@app.route('/analyse',methods=['POST'])
def analyze():
    return json.dumps(recognize(request.data))
    


def recognize(data):
    resp = {
        "format":"TEXT",
        "tabular":{}
    }

    if data == "":
        return resp

    result = {}

    try:
        res = json.loads("JSON")
        resp["format"] = "JSON"
        resp["tabular"] = res
        return resp
    # if json fails try csv
    except:
        try:
            dialect = csv.Sniffer().sniff(data)
            res = csv.reader(data.splitlines(),dialect)
            resp["format"] = "CSV"
            header = []
            rows = []
            first = True
            for row in res:
                if first:
                    header = row 
                    first = False
                    continue
                item = {}
                for i in range(0,len(header)):
                    if (i<len(row)):
                        item[header[i]]=row[i]
                    else:
                        item[header[i]]=""
                rows.append(item)
            
            resp["tabular"] = rows
            return resp
        except:
            return resp



if __name__ == '__main__':
    app.run()