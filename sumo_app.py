from flask import Flask, render_template, redirect
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
from flask import Flask, jsonify
# from config import password
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta


################################################
# Database Setup
#################################################
#Connect to Postgress
engine = create_engine(f'postgres://ztgexgjclxfheo:20bb0d604d935040e9de0b13db2c690d4fed54fe3754e320c0cdd6eff9cedf57@ec2-18-206-20-102.compute-1.amazonaws.com:5432/d2rnm6e1m17esc')
connection = engine.connect()

# reflect an existing database into a new model
Base = automap_base()

# reflect the tables
Base.prepare(engine, reflect=True)

# Save reference to the table
results = Base.classes.tournament_results
fighters = Base.classes.stables
images = Base.classes.image


# Create an instance of Flask
app = Flask(__name__)
app.config['JSON_SORT_KEYS'] = False



# Route to render index.html template using data from Mongo
@app.route("/")
def home():

    # Return template and data
    return render_template("index.html")




# route to stables 
@app.route("/api/v1.0/stables/")
def fighter():

    # create session
    session = Session(engine)

    #collect fighters
    fighter = session.query(fighters.fighter).all()

    dictionary_list = []
    for fighter in fighter:

        # gather fighter names
        fighter_dictionary = {}
        fighter_dictionary["Fighter_Name"] = fighter[0]

        #gather fighter stats
        attributes = session.query(fighters.id, fighters.rank, fighters.birth_date, fighters.height, fighters.weight).filter(fighters.fighter == fighter).all()
        for Id, rank, birth_date, height, weight in attributes:
            attribute_dictionary = {}
            attribute_dictionary["id"] = Id
            attribute_dictionary["rank"] = rank
            attribute_dictionary["birth_date"] = birth_date.strftime("%m/%d/%Y")  
            attribute_dictionary["height"] = height 
            attribute_dictionary["weight"] = weight 

        #gather dojo data
        dojo_location = session.query(fighters.dojo, fighters.district, fighters.lat, fighters.lng).filter(fighters.fighter == fighter).all()
        for dojo, district, lat, lng, in dojo_location:
            dojo_location_dictionary = {}
            dojo_location_dictionary["dojo_name"] = dojo 
            dojo_location_dictionary["district"] = district
            dojo_location_dictionary["latitude"] = lat
            dojo_location_dictionary["longitude"] = lng

        #setting up the json 
        fighter_dictionary["Fighter_Info"] = attribute_dictionary
        fighter_dictionary["Dojo"] = dojo_location_dictionary
        
        response = jsonify(dictionary_list.append(fighter_dictionary))
        response.headers.add('Access-Control-Allow-Origin', '*')

    return response


# route to tournaments by tournament and fighter
@app.route("/api/v1.0/tournament-fighter/<tournament>/<fighter>")
def tournament_fighter(tournament, fighter):
    # create session
    session = Session(engine)
    #collect tournaments
    tournament = session.query(results.tournament, results.day, results.fighter1_id, results.fighter1_rank, results.fighter1_name, results.fighter1_result, results.fighter1_win, results.finishing_move, results.fighter2_id, results.fighter2_rank, results.fighter2_name, results.fighter2_result, results.fighter2_win).filter(results.tournament == tournament).filter(results.fighter1_name == fighter).all() 
    dictionary_list = []
    for tournament, day, fighter1_id, fighter1_rank, fighter1_name, fighter1_result, fighter1_win, finishing_move, fighter2_id, fighter2_rank, fighter2_name, fighter2_result, fighter2_win in tournament:
        tournament_dictionary = {}
        tournament_dictionary["tournament"] = tournament
        tournament_dictionary["day"] = day
        tournament_dictionary["fighter1_id"] = fighter1_id
        tournament_dictionary["fighter1_rank"] = fighter1_rank
        tournament_dictionary["fighter1_name"] = fighter1_name
        tournament_dictionary["fighter1_result"] = fighter1_result
        tournament_dictionary["fighter1_win"] = fighter1_win
        tournament_dictionary["finishing_move"] = finishing_move
        tournament_dictionary["fighter2_id"] = fighter2_id
        tournament_dictionary["fighter2_rank"] = fighter2_rank
        tournament_dictionary["fighter2_name"] = fighter2_name
        tournament_dictionary["fighter2_result"] = fighter2_result
        tournament_dictionary["fighter2_win"] = fighter2_win
        dictionary_list.append(tournament_dictionary)
    return jsonify(dictionary_list)



# route to all tournaments by tournament
@app.route("/api/v1.0/tournament/<tournament>")
def tournament(tournament):


    # create session
    session = Session(engine)

    #collect tournaments
    tournament = session.query(results.tournament, results.day, results.fighter1_id, results.fighter1_rank, results.fighter1_name, results.fighter1_result, results.fighter1_win, results.finishing_move, results.fighter2_id, results.fighter2_rank, results.fighter2_name, results.fighter2_result, results.fighter2_win).filter(results.tournament == tournament).all() 

    dictionary_list = []
    for tournament, day, fighter1_id, fighter1_rank, fighter1_name, fighter1_result, fighter1_win, finishing_move, fighter2_id, fighter2_rank, fighter2_name, fighter2_result, fighter2_win in tournament:
    
        tournament_dictionary = {}
        tournament_dictionary["tournament"] = tournament
        tournament_dictionary["day"] = day
        tournament_dictionary["fighter1_id"] = fighter1_id
        tournament_dictionary["fighter1_rank"] = fighter1_rank
        tournament_dictionary["fighter1_name"] = fighter1_name
        tournament_dictionary["fighter1_result"] = fighter1_result
        tournament_dictionary["fighter1_win"] = fighter1_win
        tournament_dictionary["finishing_move"] = finishing_move
        tournament_dictionary["fighter2_id"] = fighter2_id
        tournament_dictionary["fighter2_rank"] = fighter2_rank
        tournament_dictionary["fighter2_name"] = fighter2_name
        tournament_dictionary["fighter2_result"] = fighter2_result
        tournament_dictionary["fighter2_win"] = fighter2_win
    
        dictionary_list.append(tournament_dictionary)

    return jsonify(dictionary_list)




@app.route("/api/v1.0/img/<fighter>")
def img(fighter):

    # create session
    session = Session(engine)

    #collect tournaments
    img = session.query(images.fighter_name, images.image_url).filter(images.fighter_name == fighter).all() 

    dictionary_list = []
    for fighter, image in img:  
    
        image_dictionary = {}
        image_dictionary["fighter_name"] = fighter
        image_dictionary["image_url"] = image 

        dictionary_list.append(image_dictionary )

    return jsonify(dictionary_list)


if __name__ == "__main__":
    app.run(debug=True)
