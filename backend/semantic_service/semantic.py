from flask import Flask
from nltk.corpus import wordnet as wn
from flask_cors import CORS
import json
from flask_pymongo import PyMongo
import tweepy 
import requests
import logging

app = Flask(__name__)

app.config["MONGO_URI"] = "mongodb://localhost:27017/lumi"

spq_endpoint = "http://dbpedia.org/sparql"
lookup_endpoint = "http://lookup.dbpedia.org/api/search.asmx"

CORS(app)
mongo = PyMongo(app)

consumer_key=""
consumer_secret=""
access_token=""
access_token_secret=""
auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
auth.set_access_token(access_token, access_token_secret)

api = tweepy.API(auth)

def get_twitter(term):
    screen_name = term[1:]
    users = tweepy.api.lookup_users(screen_names=[screen_name])
    if len(users)>0:
        user = users[0]
        return {"entity_type":"twitter_handle", 
                "name": user.name,
                "bio": user.description,
                "followers": user.followers_count,
                "followees": user.friends_count,
                "tweets": user.statuses_count,
                "verified": user.verified,
                "image": user.profile_image_url
        }


def hit_cache(term):
    print("checking cache")
    print(term)
    res = mongo.db.cache.find({"cterm":term})
    print(res.count())
    if (res.count()>0):
        return res[0]["data"]
    else:
        return None

def save_cache(term,data):
    
    mongo.db.cache.insert({"cterm":str(term),"data":data})



def get_person(term):
    attr = { "image" : "http://xmlns.com/foaf/0.1/depiction", 
            "gender": "http://xmlns.com/foaf/0.1/gender",
            "description": "http://purl.org/dc/terms/description",
            "name":"http://xmlns.com/foaf/0.1/name",
            "surname":"http://xmlns.com/foaf/0.1/surname",
            "birth_date":"http://dbpedia.org/ontology/birthYear", 
            }

    
    rdf_type = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type"
    person_type = "http://xmlns.com/foaf/0.1/Person"
    # prepname
    prep_name = "_".join([x.capitalize() for x in term.split(" ")])
    # get resource
    r = requests.get("http://dbpedia.org/data/"+prep_name+".json")
    unk = {"entity_type": "unknown"}
    
    if "http://dbpedia.org/resource/"+prep_name not in r.json():
        return unk

    data = r.json()["http://dbpedia.org/resource/"+prep_name]
   
    # create info card
    info = {"entity_type": "person"}
    
    if rdf_type not in data:
        return unk
    get_types_z = data[rdf_type]
    get_types = []
    for item in get_types_z:
        get_types.append(item["value"])
    print(get_types)
    if person_type not in get_types:
        return unk 
    
    for attr_name in attr:
        if attr[attr_name] in data:
            info[attr_name] = data[attr[attr_name]][0]["value"]
    
    return info
    


def geo_check_country(term):
    # check for country
    term = str(term).lower()
    res = mongo.db.countries.find({"$or":[{"sname":term.lower()},{"cc":term.upper()}]})
    if (res.count() > 0):
        res0 = res[0]
        print(res0)
        return {"entity_type":"geo", 
        "geo_type": "country", 
        "original_name": res0["ogname"], 
        "lat":res0["lat"],
        "lon":res0["lon"],
        "cc":res0["cc"],
        }
    return None


def geo_check_city(term):
    # check for city
    term = str(term).lower()
    res = mongo.db.cities.find({"sname":term})
    if (res.count() > 0):
        res0 = res[0]
        print(res0)
        return {"entity_type":"geo", 
        "geo_type": "city", 
        "original_name": res0["name"], 
        "lat":res0["lat"],
        "lon":res0["lon"],
        "cc":res0["cc"],
        "elevation":res0["el"],
        "timezone":res0["tz"]
        }
    return None


def check_ner():
    pass

def get_ner(term,ogterm):
    print(type(term))
    term = str(term)
    #if begins with @is a mention
    extras={}
    if term.startswith("@"):
        extras = get_twitter(term)
        item =  {"name":term, "semantic": "named_entity",  "hypernyms":[], "extras": extras}
        save_cache(ogterm,item)
        return item
    if term.startswith("#"):
        extras["entity_type"]="twitter hashtag"
        item =  {"name":term, "semantic": "named_entity",  "hypernyms":[], "extras": extras}
        save_cache(ogterm,item)
        return item
    # check geo    
    extras = geo_check_city(term)
    if not extras:
        extras = get_person(term)

    item = {"name":term, "semantic": "named_entity",  "hypernyms":[], "extras": extras}
    save_cache(ogterm,item)
    return item


@app.route("/terms/<terms>")
def get_terms(terms):
    list_terms = terms.split(",")
    res_terms = []
    for term in list_terms:
        res_terms.append(get_term(term))
    return json.dumps(res_terms)


def sparqlQuery(spq_endpoint, query):
    headers='application/json'

    try:
        params = {'query': query}
        resp = requests.get(epr, params=params, headers={'Accept': headers})
        return resp.json
    except Exception as e:
        print(e, file=sys.stdout)
        raise

def lookup(look_endpoint,q_class, q_term):
    uri = look_endpoint+ "api/search.asmx/KeywordSearch?QueryClass="+q_class+"&QueryString="+q_term
    headers='application/json'
    try:
        params = {'query': query}
        resp = requests.get(epr, params=params, headers={'Accept': headers})
        return resp.json
    except Exception as e:
        print(e, file=sys.stdout)
        raise


def get_term(term):
    print("trying cache")
    citem = hit_cache(term)
    print(citem)
    if (citem):
        
        return citem

    # check first for country 
    h_list = []
    country = geo_check_country(term)
    if (country):
        item = {"name":term, "semantic": "named_entity", "hypernyms":h_list, "extras": country}
        save_cache(term,item)
        return item

        
    hypo = lambda s: s.hyponyms()
    hyper = lambda s: s.hypernyms()
   
    
    lemma = wn.morphy(term, wn.NOUN)
    print("-----", lemma)
    if not lemma:
        return  get_ner(term,term)
        
    ss =  wn.synsets(lemma)
    
    first_meaning = ""
    for meaning in ss:
        tokens = meaning.name().split(".")
        if tokens[0] == term:
            first_meaning = meaning
            break 

    
    if isinstance(first_meaning, str):
        return get_ner(lemma,term)
        
   
    hypernyms = list(first_meaning.closure(hyper))
    print(hypernyms)
   
    for hypernym in hypernyms:
        h_list.append(hypernym.name().split(".")[0])

    # captured = []
    # for h in hypernyms:
    #     if h=="person":
    #         captured.append(h)
    #     if h=="living_thing":
    #         captured.append(h)
    #     if h=="vehicle":
    #         captured.append(h)
    #     if h=="object":
    #         captured.append()
    item = {"name":term, "semantic": first_meaning.name().split(".")[0], "hypernyms":h_list}
    save_cache(term,item)
    return item 
