#change host and port value to bind the discovery service to
HOST=localhost
PORT=5001
DISC=localhost:5000

#register with discovery service first
curl -X POST http://$DISC/register/data/$HOST:$PORT

export FLASK_APP=data.py
flask run --host=$HOST --port=$PORT 
