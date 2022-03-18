 /* CONSTANTS AND GLOBALS */
const width = window.innerWidth * .8,
      height = window.innerHeight * .8,
      margin = {top:20, right:20, bottom:50, left:50};

const formatDate = d3.timeFormat("%b")
      
/* LOAD DATA */
d3.csv('../data/pedestrianSum.csv', d => {
  return {
    month: new Date(2019, +d.Month, -16, 0), // + sign is to force the data to be recognized as number 
    pedestrian: +d.PedestrianSum
  }
}).then(data => {
  console.log('data :>> ', data)  
  // SCALES
  const xScale = d3.scaleTime()
                .domain(d3.extent(data, d => d.month))
                .range([margin.left, width - margin.right])
  
  const yScale = d3.scaleLinear()
                .domain([0,d3.max(data, d=> d.pedestrian)])
                .range([height-margin.bottom, margin.top])
 
  // CREATE SVG ELEMENT
  const svg = d3.select("#container")
              .append("svg")
            //  .attr("width", width)
            //  .attr("height", height)
              .attr("viewBox",`0, 0, ${width+margin.left+margin.right},
                    ${height+margin.top+margin.bottom}`)
              .append("g")
              .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // add chart label
   svg.append("text")      
   .attr("x",  width*.5)
   .attr("y",  height-5)
   .style("text-anchor", "middle")
   .attr("fill","#442288") 
   .text("<Brooklyn Bridge Pedestrian Count 2019>");   

  // BUILD AND CALL AXES
  const xAxis = d3.axisBottom(xScale).tickFormat(formatDate)
   .ticks(13) // limit the number of tick marks showing -- note: this is approximate
   
   svg.append("g")
      .attr("class", "xAxis")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(xAxis)

const yAxis = d3.axisLeft(yScale)

   svg.append("g")
      .attr("class", "yAxis")
      .attr("transform", `translate(${margin.left}, ${0})`)
      .call(yAxis)
 
  // LINE GENERATOR FUNCTION
  const lineGen = d3.line()
                .x(d => xScale(d.month))
                .y(d => yScale(d.pedestrian))
  
  // AREA GENERATOR
  const areaGen = d3.area()
                 .x(d => xScale(d.month))
                 .y1(d => yScale(d.pedestrian))
                 .y0(height-margin.bottom)

  // DRAW LINE 
  svg.selectAll("path.line")
      .data([data]) // data in [] is only for line chart
      .join("path")
      .attr("class", "line")
      .attr("stroke", "blue")
      .attr("fill","none")
      .attr("d", d=>lineGen(d))
  
  // FILL AREA WITH A COLOR WITH A TIME DELAY    
  svg.selectAll("Path.area")
      .data([data]) 
      .join("path")
      .attr("class","area")  
      .attr("fill","yellow") 
      .attr("d", d=>areaGen(d))
      
      
      
});
