from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

from api.api import api
from api.models import db
from api.config import Config


def create_app(config):
    app = Flask(__name__)
    CORS(app)
    app.config.from_object(config)
    register_extensions(app)
    return app


def register_extensions(app):
    api.init_app(app)
    db.init_app(app)


app = create_app(Config)

if __name__ == '__main__':
    load_dotenv()
    app = create_app(Config)
    app.run(debug=True, threaded=True)
