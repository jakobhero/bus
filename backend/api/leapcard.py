from pyleapcard import *
from pprint import pprint

session = LeapSession()
session.try_login("golfleap","Monty1999")

overview = session.get_card_overview()
pprint(vars(overview))