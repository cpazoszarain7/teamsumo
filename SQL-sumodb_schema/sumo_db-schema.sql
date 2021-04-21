DROP TABLE IF EXISTS tournament_results;
CREATE TABLE tournament_results 
(
	--.-Name--------------------.Type----------------------.Null/NotNull
	tournament_id SERIAL  PRIMARY KEY,   
	tournament               CHAR(7)             	NOT NULL      
	,   day                      INTEGER           		NOT NULL 
	,   fighter1_id        	     INTEGER                    NOT NULL    
	,   fighter1_rank	     VARCHAR(25)             	NOT NULL 
	,   fighter1_name	     VARCHAR(60)		NOT NULL
	,   fighter1_result	     VARCHAR(60)	 	NOT NULL 
	,   fighter1_win	     INTEGER 			NOT NULL 
	,   finishing_move	     VARCHAR(60)		NOT NULL 
	,   fighter2_id        	     INTEGER         		NOT NULL    
	,   fighter2_rank	     VARCHAR(25)             	NOT NULL 
	,   fighter2_name	     VARCHAR(60)	 	NOT NULL
	,   fighter2_result	     VARCHAR(60)		NOT NULL 
	,   fighter2_win	     INTEGER 			NOT NULL 
);

DROP TABLE IF EXISTS stables;
CREATE TABLE stables
(
	--.-Name--------------------.Type----------------------.Null/NotNull
	    id               	     INTEGER             	NOT NULL PRIMARY KEY      
	,   rank                     VARCHAR(25)           	NOT NULL 
	,   fighter        	     VARCHAR(60)             	NOT NULL
	,   dojo		     VARCHAR(25)             	NOT NULL 
	,   district		     VARCHAR(60)		NOT NULL
	,   birth_date		     DATE		 	NOT NULL 
	,   height		     FLOAT 			NOT NULL 
	,   weight		     FLOAT			NOT NULL 
	,   Lat 		     FLOAT			NOT NULL 
	,   Lng			     FLOAT			NOT NULL
	
);
