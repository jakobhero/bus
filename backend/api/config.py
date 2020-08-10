import os


class Config(object):
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:super_pw@localhost:5432/postgres'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    GOOGLE_KEY = "AIzaSyB2pRGqvZyPk9HhYUvpShe9KUHFASAq9kI"
    OWM_KEY = "0324f68680731d1f1c47d73aef71e333"
