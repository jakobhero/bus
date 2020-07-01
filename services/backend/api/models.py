import json
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.ext.declarative import DeclarativeMeta

db = SQLAlchemy()

class Stops(db.Model):
    __tablename__ = 'stops'
    stop_id = db.Column(db.String(12), nullable=False, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    lat = db.Column(db.FLOAT)
    lon = db.Column(db.FLOAT)

    def __repr__(self):
        return 'ID: '+self.stop_id+', Name:  '+self.name+" , Pos: ("+self.lat+","+self.lon+")."