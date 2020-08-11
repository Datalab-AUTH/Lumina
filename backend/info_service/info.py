from flask import Flask
import json 
import tweepy
from wikipedia import wikipedia
import logging
logging.basicConfig(level=logging.INFO)

app = Flask(__name__)



consumer_key=""
consumer_secret=""
access_token=""
access_token_secret=""
auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
auth.set_access_token(access_token, access_token_secret)

api = tweepy.API(auth)


@app.route('/twitter/<terms>')
def get_twitter(terms):
    results = []
    terms = terms.split(",")
    for term in terms:
        results.append(api_twitter_get_profile(term))
        
    
    return json.dumps(results)



def api_twitter_get_profile(term):
    screen_name = term[1:]
    users = []
    app.logger.info(term)
    try:
        users = api.lookup_users(screen_names=[screen_name])
        
    except:
        pass
    if len(users)>0:
        user = users[0]
        return {"entity_type":"twitter_handle", 
                "name": user.name,
                "bio": user.description,
                "followers": user.followers_count,
                "followees": user.friends_count,
                "tweets": user.statuses_count,
                "verified": user.verified,
                "img": user.profile_image_url
        }
    

@app.route('/wikipedia/<terms>')
def get_wikipedia(terms):
    results = []
    terms = terms.split(",")
    for term in terms:
        sum = wikipedia.summary(term)
        item = {"term":term, "summary":sum }
    
    return json.dumps(results)


if __name__ == '__main__':
    app.run()
