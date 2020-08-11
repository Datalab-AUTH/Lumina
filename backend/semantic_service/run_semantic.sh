#change host and port value to bind the discovery service to
HOST=localhost
PORT=5002
DISC=localhost:5000

#register with discovery service first
curl -X POST http://$DISC/register/semantic/$HOST:$PORT

export FLASK_APP=semantic.py
flask run --host=$HOST --port=$PORT 
