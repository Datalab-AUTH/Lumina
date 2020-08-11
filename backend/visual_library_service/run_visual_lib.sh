#change host and port value to bind the discovery service to
HOST=localhost
PORT=5003
DISC=localhost:5000

#register with discovery service first
curl -X POST http://$DISC/register/visual_lib/$HOST:$PORT

export FLASK_APP=visual_lib.py
flask run --host=$HOST --port=$PORT 
