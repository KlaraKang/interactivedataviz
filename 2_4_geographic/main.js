/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.8,
      height = window.innerHeight * 0.8,
      margin = { top: 20, bottom: 50, left: 40, right: 40 };      

/**
 * LOAD DATA
 * Using a Promise.all([]), we can load more than one dataset at a time
 * */
Promise.all([
  d3.json("../data/usState.json"),
  d3.csv("../data/usHeatExtremes.csv", d => {
    if(d.Change_in_95_percent_Days != 0)
       return d
  }),
]).then(([geojson, state]) => {
  
  // SPECIFY PROJECTION: IN SCALES AREA SPECIFY PROJECTION as scale
  const projection = d3.geoAlbersUsa()
     .fitSize([width - margin.left - margin.right, 
      height - margin.top - margin.bottom], geojson)
  
   // Scale of dots
  const redScale = d3.scaleSequential()
                      .domain([0,54])
                      .interpolator(d3.interpolateReds)                     
  const blueScale = d3.scaleSequential()
                      .domain([-54,0])
                      .interpolator(d3.interpolateBlues)

  // CREATE SVG ELEMENT
  const svg = d3.select("#container")
              .append("svg")
              .attr("width", width)
              .attr("height", height)
  
  // add chart title on the top and description on the bottom
  svg.append("text")
     .attr("x", width/2-margin.left-margin.right)
     .attr("y", margin.top) 
     .attr("font-size","20px")
     .attr("stroke", "navy")
     .text("<US Heat Extremes>")
  
  svg.append("text")
     .attr("x", width/2)
     .attr("y", height-margin.bottom) 
     .attr("font-size","15px")
     .attr("text-anchor","middle")
     .attr("stroke", "green")     
     .text("Places where temperature changed in 95 percent of days.")

  // PREPARE TO JOIN DATA+DRAW GEO OUTLINES
  // DEFINE PATH FUNCTION TO DRAW LINES
  const pathGen = d3.geoPath(projection)


  // SELECTALL-DATA-JOIN
  // Because we joined two datasets, we need 2 joins here.
  
  svg.selectAll("path")
      .data(geojson.features)
      .join("path")
      .attr("d", d => pathGen(d))
      .attr("fill", "#F5EACB")
      .attr("stroke", "black")

  svg.selectAll("circle")
      .data(state)
      .join(
        enter => enter
        .append("circle")
        .attr("r", 3)
        .attr("transform", d => {
            const [x, y] = projection([d.Long, d.Lat])
            return `translate(${x}, ${y})`
        })
        .attr("fill","green")
        .call(enter => enter.transition()
              .delay(200)
              .attr("r", 5)
              .attr("fill", d=> {
                  if(d.Change_in_95_percent_Days > 0)
                    return redScale(d.Change_in_95_percent_Days)
                  else
                    return blueScale(d.Change_in_95_percent_Days)
                  }
              )
        )
      )

});

// add color label 
const svg = d3.select("#legend")
              .append("svg")
              .attr("width", 150)
              .attr("height", 20)

 svg.append("rect")
 .attr("width",20)
 .attr("height",10)
 .attr("x",margin.left)
 .attr("fill", d3.interpolateRdBu(0.1))

svg.append("rect")
 .attr("width",20)
 .attr("height",10)
 .attr("x",margin.left+20)
 .attr("fill", d3.interpolateRdBu(0.3))

svg.append("rect")
 .attr("width",20)
 .attr("height",10)
 .attr("x",margin.left+40)
 .attr("fill", d3.interpolateRdBu(0.5))

svg.append("rect")
 .attr("width",20)
 .attr("height",10)
 .attr("x",margin.left+60)
 .attr("fill", d3.interpolateRdBu(0.7))   

svg.append("rect")
 .attr("width",20)
 .attr("height",10)
 .attr("x",margin.left+80)
 .attr("fill", d3.interpolateRdBu(0.9)) 