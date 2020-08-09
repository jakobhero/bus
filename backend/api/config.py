import os

class Config(object):
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:super_pw@localhost:5432/postgres'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    GOOGLE_KEY="your_google_key"
    OWM_KEY="your_own_key"