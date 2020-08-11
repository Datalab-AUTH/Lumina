#change host and port value to bind the discovery service to
HOST=localhost
PORT=5005
DISC=localhost:5000

#register with discovery service first
curl -X POST http://$DISC/register/info/$HOST:$PORT

export FLASK_APP=info.py
flask run --host=$HOST --port=$PORT 
