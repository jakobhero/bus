import os

class Config(object):
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:super_pw@localhost:5432/postgres'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    GOOGLE_KEY = "YOUR_GOOGLE_KEY"
    OWM_KEY = "YOUR_OWM_KEY"
