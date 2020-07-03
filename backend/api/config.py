class Config(object):
    DEBUG = True
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'postgresql://postgres:super_pw@localhost:5432/postgres'
    SQLALCHEMY_TRACK_MODIFICATIONS = False