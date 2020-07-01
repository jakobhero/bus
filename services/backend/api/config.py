class Config(object):
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'postgresql+psycopg2://user:password@db/bus_data'
    SQLALCHEMY_TRACK_MODIFICATIONS = False