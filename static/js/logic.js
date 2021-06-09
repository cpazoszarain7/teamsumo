
//******************************************************* */
//FUNCTION TO INITIALIZE DASHBOARD

function initDashboard(){
    console.log("Hello world!");
    //Change flag for function to be callend just one time
    initDashboard = noop; // swap the functions

    //Initialize Drop Down menu for Tournament Years
    //Create List of Tournament Years
    function range(start, end) {
        return Array(end - start + 1).fill().map((_, idx) => start + idx)
      };
    var years = range (1983,2021);
    years = years.map(String)
    
    
    // tournament_dates = []
    months = ['01','03','05','07','09','11']
    

    //Initialize Drop Down Menu of Tournament Years
    var drop_dates = d3.select('#selYear')

    years.forEach( item => {

        op = drop_dates.append('option')
        op.attr('value',item)
        op.text(item)
        
    })
    
    //Initialize Drop Down Menu of Tournament Months
    var drop_months = d3.select('#selMonth')

    months.forEach( item => {

        op = drop_months.append('option')
        op.attr('value',item)
        op.text(item)

    })

    

}

//******************************************************* */
//FUNCTION TO UPDATE LIST OF FIGHTERS FOR SELECTED TOURNAMENT
function updateFightersList(tournament){

    //Initialize Drop Down Menu for Fighter Names
    var fighters = tournament.map(d => d.fighter1_name)
    var unique_fighters = fighters.filter((item, i, ar) => ar.indexOf(item) === i);
    unique_fighters.sort()

    var drop_fighters = d3.select('#selFighter')
    drop_fighters.html("")
    unique_fighters.forEach( item => {

        op = drop_fighters.append('option')
        op.attr('value',item)
        op.text(item)

    });

    updateImage()
    updateTable()
    updateInfo()
    pie()

}

//******************************************************* */
//FUNCTION TO UPDATE MAP OF JAPAN WITH MARKERS FOR ALL FIGHTERS

function updateJapanMap(tournament, stables, settings){

 
    //create the map object
    let myMap = MapObject();

    
    //create the base layers.baselayers is a dictionary/Object
    let baseLayers = createBaseLayers(settings);
   
    //Create Legend
    let legend = createLegend();
    legend.addTo(myMap);
    
    layers = createLayers(stables);
    
    //Add Default Layer
    myMap.addLayer(baseLayers["Dark Map"]);
    myMap.addLayer(layers.markers);

    //Create Overlay Maps
    var overlayMaps = {

        "Markers": layers.markers,
        "Heatmap": layers.heatmap

    }

    //Add Controls
    L.control.layers(baseLayers,overlayMaps, {
        collapsed: false
    }).addTo(myMap)
     
    //Add Legend
    updateLegend(stables);

     
};

function MapObject(){

    var centerCoords = [38.652832, 139.839478];
    var mapZoomLevel = 5;
    var myMap = L.map("mapid", {
      center: centerCoords,
      zoom: mapZoomLevel    
    });
    return myMap

};

function createBaseLayers(settings){

    key = settings.map(d => d.key)
    
    var lightmap = L.tileLayer(
        "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
        {
        attribution:
        'Doris [ドリス] • Nader [ナダー] • Carlos [カルロス]',
        maxZoom: 18,
        id: "light-v10",
        accessToken: key[0],
        }
    );
    
    var darkmap = L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",
    {
        attribution:
        'Doris [ドリス] • Nader [ナダー] • Carlos [カルロス]',
        maxZoom: 18,
        id: "dark-v10",
        accessToken: key[0],
    }
    );

    var baseMaps = {
        "Light Map": lightmap,
        "Dark Map": darkmap
    };
    
    return baseMaps;

    
};

function createLayers(stables){

    //Create HeatMap Layer
    points = stables.map((d) => [
        d.Dojo.latitude,
        d.Dojo.longitude,
        d.Fighter_Info.weight
      ]);

    // console.log(points)

    var heat = L.heatLayer(points, { radius: 25, blur: 15 });

    // Initialize an object containing icons for each layer group
    var icons = {
        
        FIGHTER: L.ExtraMarkers.icon({
        icon: "ion-social-yen",
        iconColor: "white",
        markerColor: "red",
        shape: "penta"
        })
    };
    //Create Markers 
    markers=[]
    stables.forEach(d =>{      

       markers.push(
            L.marker([d.Dojo.latitude,d.Dojo.longitude],{

                icon: icons.FIGHTER
            }).bindPopup("<h4>" + d.Fighter_Name + "</h4> <hr> <strong>Dojo:</strong> " + d.Dojo.dojo_name + "<br><strong>District:</strong> "+d.Dojo.district)        
        
        )       

    }) 
    // console.log(markers.length)
    return {markers: L.layerGroup(markers), heatmap:heat}

}

function createLegend() {
    let info = L.control({
      position: "bottomright",
    });
    // When the layer control is added, insert a div with the class of "legend"
    info.onAdd = function () {
      let div = L.DomUtil.create("div", "legend");
      return div;
    };
    return info;
  }

  function updateLegend(stables) {
    
    weights = stables.map(d => d.Fighter_Info.weight)
    // console.log(weights)
    limits = [20,110,120,130,140,190]
    colors = ["#69B34C","#ACB334","#FAB733","#FF8E15","#FF4E11","#FF0D0D"]
    var labels = [];
    // console.log(Math.min.apply(Math,depths))
    limits.forEach(function(limit, index) {
        labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
      });

    var html_legend = "<h1>Fighters Weight</h1>" +
    "<div class=\"labels\">" +
      "<div class=\"min\">" + Math.min.apply(Math,weights)+ "</div>" +
      "<div class=\"max\">" + Math.max.apply(Math,weights) + "</div>" +
      "<ul>" + labels.join("") + "</ul>"+
    "</div>";
  
  div = d3.selectAll('.legend').html(html_legend)
    
  
  }





//END OF FUNCTIONS TO UPDATE MAP OF JAPAN
//******************************************************* */

//******************************************************* */
//FUNCTION TO UPDATE IMAGE OF FIGHTER
function updateImage(){

        //Get the filter for Fighter
        var Fighter = document.getElementById("selFighter");
        var FighterFilter = Fighter.options[Fighter.selectedIndex].text;
        // console.log(FighterFilter)

        // Default URLs to initialize dashboard
        image_url = 'https://grandsumobasho.herokuapp.com/api/v1.0/img/'+FighterFilter

        // Call API to get url
        d3.json(image_url).then((img_data)=>{

            // console.log(img_data[0].image_url)
            image_div = d3.select('#fighter_img')
            image_div.html("")
            image_div.append('img')
            .attr('class','picture')
            .attr('class','responsive')
            .attr('src',img_data[0].image_url)
            // .attr('width','130')
            // .attr('height','170')
            
        })

}

//******************************************************* */
//PROPRIETARY FUNCTIONS FOR TABLE UPDATE 
function win(result) {
    if (result == 1) { return "Yes" } else { return "No" }
}
function rank(r) {
    if (r.startsWith("Y", 0 )) {  return "Yokozuna"   } else
    if (r.startsWith("O", 0 )) {  return "Ozeki"      } else
    if (r.startsWith("S", 0 )) {  return "Sekiwake"   } else
    if (r.startsWith("K", 0 )) {  return "Komusubi"   } else
    if (r.startsWith("M", 0 )) {  return "Maegashira" } else
    if (r.startsWith("J", 0 )) {  return "Juryo"      } else  {return "rank unavailable"}
}
//******************************************************* */
//FUNCTION TO UPDATE TABLE
function updateTable(){
    //Get the filter for Fighter
    var Fighter = document.getElementById("selFighter");
    var FighterFilter = Fighter.options[Fighter.selectedIndex].text;
    //Get the filter for Year
    var Year = document.getElementById("selYear");
    var YearFilter = Year.options[Year.selectedIndex].text;
    //Get the filter for Month
    var Month = document.getElementById("selMonth");
    var MonthFilter = Month.options[Month.selectedIndex].text;
    var DateFilter = YearFilter+'.'+MonthFilter
    tournament_by_fighter_url = `https://grandsumobasho.herokuapp.com/api/v1.0/tournament-fighter/${DateFilter}/${FighterFilter}`
    //Call API to get fighter information
    d3.json(tournament_by_fighter_url).then((fighter_data)=>{
        tbody = d3.select('tbody')
        tbody.html("")
        fighter_data.forEach(tournament => {
            var row = tbody.append("tr")
            row.append("td").text(YearFilter);
            row.append("td").text(MonthFilter);
            row.append("td").text(tournament.day);
            row.append("td").text(tournament.fighter1_name);
            row.append("td").text(rank(tournament.fighter1_rank));
            row.append("td").text(tournament.fighter2_name);
            row.append("td").text(tournament.fighter1_result);
            row.append("td").text(tournament.fighter2_result);
            row.append("td").text(tournament.finishing_move);
            row.append("td").text(win(tournament.fighter1_win));
        })
    })
}

//******************************************************* */
//FUNCTION TO UPDATE FIGHTER INFORMATION
// Display each key value pair from the fighter.csv file on the page.
function updateInfo() {
   
    //Get the filter for Fighter
    var Fighter = document.getElementById("selFighter");
    var FighterFilter = Fighter.options[Fighter.selectedIndex].text;
    
    

    //Call route with fighter information
    stables_url = 'https://grandsumobasho.herokuapp.com/api/v1.0/stables'

    figfhter_info = {}
    
    d3.json(stables_url).then( fighters =>{

        fighters.forEach(item => {


            
            if (item.Fighter_Name === FighterFilter){
                
                html = `<strong>Name:</strong> ${item.Fighter_Name}<br>
                        <strong>Birth Date:</strong> ${item.Fighter_Info.birth_date}<br>
                        <strong>Height:</strong> ${item.Fighter_Info.height}m<br>
                        <strong>Weight:</strong> ${item.Fighter_Info.weight}kg<br>
                        <strong>Dojo:</strong> ${item.Dojo.dojo_name}<br>
                        <strong>District:</strong> ${item.Dojo.district}<br>`               


                div = d3.select('#fighter_info')
                div.html(html)

            }

        })

    })
    
    
  }

//******************************************************* */
// FREQUENCY FUNCTION
function frequency(array) {
    var object = {};
    array.forEach(function (item) {
        if ( !object.hasOwnProperty(item) ) { object[item] = 1; } else { object[item] += 1; }});
    return object;
}
//******************************************************* */
//FUNCITON TO BUILD AND UPDATE PIE CHART 
function pie() {
    //Get the filter for Fighter
    var Fighter = document.getElementById("selFighter");
    var FighterFilter = Fighter.options[Fighter.selectedIndex].text;
    //Get the filter for Year
    var Year = document.getElementById("selYear");
    var YearFilter = Year.options[Year.selectedIndex].text;
    //Get the filter for Month
    var Month = document.getElementById("selMonth");
    var MonthFilter = Month.options[Month.selectedIndex].text;
    var DateFilter = YearFilter+'.'+MonthFilter
    tournament_by_fighter_url = `https://grandsumobasho.herokuapp.com/api/v1.0/tournament-fighter/${DateFilter}/${FighterFilter}`
    d3.json(tournament_by_fighter_url).then((fighter_data)=>{
        var moves = fighter_data.map(tournament => tournament.finishing_move)
        moves = frequency(moves)
        labels = []
        values = []
        for (let m in moves) {
            labels.push(m)
            values.push(moves[m])   
        }
        var data = [{
            values: values,
            labels: labels,
            type: 'pie',
            hoverinfo: 'labels',
            textinfo: 'none',
            marker: {
                colors: ["#9e0142","#d53e4f","#f46d43","#fdae61","#fee08b","#ffffbf","#e6f598","#abdda4","#66c2a5","#3288bd","#5e4fa2"]
            }
          }];
          var layout = {
            height: 400,
            width: 400,
            paper_bgcolor: "rgba(26,27,27,255)",
            title: {
                text: 'FREQUENCY OF FINISHING MOVE',
                font:{
                    color: 'rgb(248,248,248)'
                }
            },
            legend: {
                orientation: 'h',
                font:{
                    color: 'rgb(248,248,248)' 
                }                               
            }
          };
          Plotly.newPlot('piechart', data, layout, {displayModeBar: false});
    })
 }


//******************************************************* */
//TRIGGER EVENT FOR DATE CHANGE
var dropYear = d3.select('#selYear')
var dropMonth = d3.select('#selMonth')
var dropFighter = d3.select('#selFighter')
dropYear.on('change', newTournament)
dropMonth.on('change', newTournament)
dropFighter.on('change', newFighter)

function newFighter(){

    updateImage()
    updateTable()
    updateInfo()
    pie()
     

}

function newTournament(){

    
    //Get the filter for Year
    var Year = document.getElementById("selYear");
    var YearFilter = Year.options[Year.selectedIndex].text;
    

    //Get the filter for Month
    var Month = document.getElementById("selMonth");
    var MonthFilter = Month.options[Month.selectedIndex].text;

    //concatenate date to be used in API
    var DateFilter = YearFilter+'.'+MonthFilter

 
    
    //Default URLs to initialize dashboard
    stables_url = 'https://grandsumobasho.herokuapp.com/api/v1.0/stables/'
    tournament_url = 'https://grandsumobasho.herokuapp.com/api/v1.0/tournament/'+DateFilter
    settings_url = 'https://grandsumobasho.herokuapp.com/settings'
 

    //Make API calls to get data and initializa dashboard
    d3.json(stables_url).then((stables_data)=> {
        
        d3.json(tournament_url).then((tournament_data)=> {
            
            d3.json(settings_url).then((settings_data)=>{
                // console.log(stables_data)
                // console.log(tournament_data)
                // console.log(settings_data)

                initDashboard(stables_data,tournament_data)
                //Initialize List of Fighters for Default Tournament
                updateFightersList(tournament_data) 
        
                //Update Map with List of fighters
                updateJapanMap(tournament_data, stables_data, settings_data)

                
            })           
              
        })

    })

};

initDashboard()
// this function does nothing, 
function noop() {};
d3.select("#selYear").dispatch("change")



const element = document.getElementById('fighter_img');

document.getElementById('fighter_img').addEventListener('click', () => {
	if (screenfull.isEnabled) {
		screenfull.request(element);
	}
});
    

/*!
* screenfull
* v5.1.0 - 2020-12-24
* (c) Sindre Sorhus; MIT License
*/

!function(){"use strict";var c="undefined"!=typeof window&&void 0!==window.document?window.document:{},e="undefined"!=typeof module&&module.exports,s=function(){for(var e,n=[["requestFullscreen","exitFullscreen","fullscreenElement","fullscreenEnabled","fullscreenchange","fullscreenerror"],["webkitRequestFullscreen","webkitExitFullscreen","webkitFullscreenElement","webkitFullscreenEnabled","webkitfullscreenchange","webkitfullscreenerror"],["webkitRequestFullScreen","webkitCancelFullScreen","webkitCurrentFullScreenElement","webkitCancelFullScreen","webkitfullscreenchange","webkitfullscreenerror"],["mozRequestFullScreen","mozCancelFullScreen","mozFullScreenElement","mozFullScreenEnabled","mozfullscreenchange","mozfullscreenerror"],["msRequestFullscreen","msExitFullscreen","msFullscreenElement","msFullscreenEnabled","MSFullscreenChange","MSFullscreenError"]],l=0,r=n.length,t={};l<r;l++)if((e=n[l])&&e[1]in c){for(l=0;l<e.length;l++)t[n[0][l]]=e[l];return t}return!1}(),l={change:s.fullscreenchange,error:s.fullscreenerror},n={request:function(t,u){return new Promise(function(e,n){var l=function(){this.off("change",l),e()}.bind(this);this.on("change",l);var r=(t=t||c.documentElement)[s.requestFullscreen](u);r instanceof Promise&&r.then(l).catch(n)}.bind(this))},exit:function(){return new Promise(function(e,n){var l,r;this.isFullscreen?(l=function(){this.off("change",l),e()}.bind(this),this.on("change",l),(r=c[s.exitFullscreen]())instanceof Promise&&r.then(l).catch(n)):e()}.bind(this))},toggle:function(e,n){return this.isFullscreen?this.exit():this.request(e,n)},onchange:function(e){this.on("change",e)},onerror:function(e){this.on("error",e)},on:function(e,n){e=l[e];e&&c.addEventListener(e,n,!1)},off:function(e,n){e=l[e];e&&c.removeEventListener(e,n,!1)},raw:s};s?(Object.defineProperties(n,{isFullscreen:{get:function(){return Boolean(c[s.fullscreenElement])}},element:{enumerable:!0,get:function(){return c[s.fullscreenElement]}},isEnabled:{enumerable:!0,get:function(){return Boolean(c[s.fullscreenEnabled])}}}),e?module.exports=n:window.screenfull=n):e?module.exports={isEnabled:!1}:window.screenfull={isEnabled:!1}}();




