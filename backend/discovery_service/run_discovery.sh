#change host and port value to bind the discovery service to
HOST=localhost
PORT=5000

export FLASK_APP=discovery.py
flask run --host=$HOST --port=$PORT 
