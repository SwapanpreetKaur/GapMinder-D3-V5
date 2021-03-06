//Showing how the life expectancy has been increasing over the years with GDP per capita(income). 
var outerHeight = 600;
var outerWidth = 1000;
var margin = {left:80, right: 70, top:50, bottom:100 };
var innerHeight = outerHeight - margin.top - margin.bottom;
var innerWidth = outerWidth - margin.left - margin.right;
var time = 0;
var interval;
var updatedData;

//Add SVG element
var svg = d3.select("#chart-area").append('svg')
            .attr('height',outerHeight)
            .attr('width',outerWidth);
var g = svg.append('g')
           .attr('transform','translate(' + margin.left + ',' + margin.top + ')');

//Add Scales
var xScale = d3.scaleLog()
               .base(10)
               .range([0,innerWidth])
               .domain([142,150000]);
var yScale = d3.scaleLinear()
               .range([innerHeight,0])
               .domain([0,90]);
var area = d3.scaleLinear()
              .range([25*Math.PI,2500*Math.PI])
              .domain([2000, 1400000000]);

//Add color according to continents
var continentColor = d3.scaleOrdinal(d3.schemePastel1);

//Add Labels
var xAxisG = g.append('g')
              .attr("class","x axis")
              .attr("transform","translate(0,"+ innerHeight +")")
var xLabel = g.append('text')
              .attr('x',innerWidth / 2)
              .attr('y',innerHeight  + 50)
              .attr('text-anchor','middle')
              .attr('font-size','23px')
              .text('GDP Per Capita ($)');
var yAxisG = g.append('g')
              .attr('class','y axis')
var yLabel = g.append('text')
              .attr('x',-200)
              .attr('y',-56)
              .attr('transform','rotate(-90)')
              .attr('text-anchor','middle')
              .attr('font-size','23px')
              .text('Life Expectancy');
var timeyearLabel = g.append('text')
                     .attr('x',innerWidth - 30)
                     .attr('y',innerHeight - 30)
                     .attr('text-anchor','middle')
                     .attr('font-size','70px')
                     .attr('fill-opacity','0.4')
                     .attr('fill','red')
                     .text('1800');
var xAxis = d3.axisBottom(xScale)
              .tickValues([400, 4000, 40000])
              .tickFormat(d3.format('$'));
            xAxisG.call(xAxis);

var yAxis = d3.axisLeft(yScale)
              .tickFormat(function(d){ return +d + 'yrs'});
            yAxisG.call(yAxis);

//Add legend
var continents = ['europe','asia','americas','africa']

var legendG = g.append('g')
           .attr("transform", "translate(" + (innerWidth - 50) +  "," + (innerHeight - 200) + ")");

continents.forEach(function(continent,i){
var legendRow = legendG.append('g')
                       .attr('transform','translate(0,' + (i * 20) + ')');

legendRow.append('rect')
         .attr('height',10)
         .attr('width',10)
         .attr('fill',continentColor(continent));

legendRow.append('text')
         .attr('x',73)
         .attr('y',10)
         .attr('text-anchor','end')
         .style('text-transform','capitalize')
         .text(continent);
})

//Add tooltip
var toolTip = d3.tip().attr('class','tip')
                .html(function(d){
               var text = "<strong>Country:</strong> <span style='color:red'>"+d.country + "</span><br>";
               text += "<strong>Continent:</strong> <span style='color:red'>" +d.continent + "</span><br>";
               text += "<strong>Life Expectancy:</strong> <span style='color:red'>" +d.life_exp + "</span><br>";
               text += "<strong>GDP Per Capita:</strong> <span style='color:red'>" +d.income + "</span><br>";
               text += "<strong>Population::</strong> <span style='color:red'>" +d.population + "</span><br>";
               return text;
            });
g.call(toolTip);

//If there are any null values for one of the countries in one of the years
//Exclude that country-year data point from the dataset.
d3.json("data.json").then(function(data){

updatedData = data.map(function(year){
              return year.countries.filter(function(country){
              var filterData = (country.income && country.life_exp)
              return filterData
              }).map(function(country){
              country.income = +country.income;
              country.life_exp = +country.life_exp;
              return country;
              })
});
})

//setInterval() calling update function on each iteration of the loop
//Put the transition on update() function of 100ms,it cannot be larger 
//Set the timer for years goes from 1800 to 2014 and reset it

function set() {
interval=setInterval(step,100);
}

function pause() {  
clearInterval(interval);
}

function reset() {
time = 0;
update(updatedData[time]);
}

function onchangecontinents(){
update(updatedData[time]);
}

//Add Slider
$("#date-slider").slider({
max: 2014,
min: 1800,
slide: function(event, ui){
  time = ui.value - 1800;
  update(upDatedData[time]);
}
})

function step(){
time = (time < 214) ? time + 1 : 0
update(updatedData[time]);
}


//On each run of the update function,passing in different array of countries
//Associate population with the area,not the radius of circle
//Year label updates with every run of the update loop
//Fill of the circles associate with the continents 
function update(data) {
var transition = d3.transition()
                   .duration(100);
var  e = document.getElementById ('continents1');
var  continent_val = e.options [e.selectedIndex] .value;

var data = data.filter(function(d){
  if (continent_val == "all") { return true; }
  else {
      return d.continent == continent_val;
  }
})
var circles = g.selectAll('circle').attr('class','circle').data(data, function(d){ return d.country; });

circles.exit()
       .attr("class", "exit")
       .remove();

circles.enter().append('circle')
       .attr('fill',function(d){ return continentColor(d.continent); })
       .on('mouseover',toolTip.show)
       .on('mouseout',toolTip.hide)
       .merge(circles)
       .transition(transition)
       .attr('cx',function(d){ return xScale(d.income); })
       .attr('cy',function(d){ return yScale(d.life_exp); })
       .attr('r',function(d){ return Math.sqrt(area (d.population) / 3); })
       timeyearLabel.text(+(time + 1800))
       $("#year")[0].innerHTML = +(time + 1800)
       $("#date-slider").slider("value", +(time + 1800))
}
