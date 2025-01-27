// step 1. VARIABLES
/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * .7;
const height = window.innerHeight * .7;
const margin = {top:20, right:20, bottom:50, left:55};
const innerWidth = width - margin.right - margin.left; 
const innerHeight = height - margin.top - margin.bottom;
// step 2. DATA
/* LOAD DATA */
d3.csv('../data/squirrelActivities.csv', d3.autoType)
  .then(sdata => {
    console.log("data", sdata)

// step 3. SCALES /
/** This is where you should define your scales from data to pixel space */
    const xScales_v = d3.scaleBand() // scaleBand is for a bar chart
                  .domain(sdata.map(d=> d.activity)) // domain is the whole data
                  .range([0,innerWidth])                 // range is data array for visual
                  .padding(0.05)

    const yScales_v = d3.scaleLinear()
                  .domain([0, d3.max(sdata, d=> d.count)]) // for numeric data, domain[min,max]
                  .range([innerHeight, 0]); // data range relates to visuals

    const colorScale = d3.scaleOrdinal()
                      .domain(sdata.map(d=> d.activity))
                      .range(["#e86100","#69b3a2","#A5C4E7","#B0AA49","#BB81F7"])              
// step 4. ELEMENT APPEND
/* HTML ELEMENTS */// # is for selecting from id
    const svg_v= d3.select("#barchart_v")
                   .append("svg")
                     .attr("width", width)
                     .attr("height", height) // width and height of the entire svg area 
                   .append("g")
                     .attr("transform",`translate(${margin.left}, ${margin.top})`);
                 
          svg_v.append("g").call(d3.axisBottom(xScales_v))
                           .attr("transform",`translate(0,${innerHeight})`)
                           .append("text")
                           .attr("y", margin.bottom-margin.top)
                           .attr("x", innerWidth-margin.right)
                           .attr("stroke", "black")
                           .attr("text-anchor", "end")
                           .text("Activity Type");  
                                
          svg_v.append("g").call(d3.axisLeft(yScales_v)) 
               .append("text")
               .attr("transform", "rotate(-90)")
               .attr("y", 0-margin.left+10)
               .attr("x", margin.top-margin.bottom)
               .attr("stroke", "black")
               .attr("text-anchor", "end")
               .text("Activity Volume");                           
                   
// step 5. SELECT
/* Select your container and append the visual elements to it */
          svg_v.selectAll("rect") // grab all graphic in rect
               .data(sdata) // take our data
               .join("rect") // join the rect and data
               .attr("width", xScales_v.bandwidth()) // to band the width and height according to my data
               .attr("height", d=> innerHeight - yScales_v(d.count))
               .attr("x", d=>xScales_v(d.activity)) // 6. ATTRIBUTES: where to place in x and y plane to visualize
               .attr("y", d=>yScales_v(d.count))
               .attr("fill", d=>colorScale(d.activity))
});

/* Code below is for converting the vertical bar chart into horizontal bar chart*/
  //SCALE: Adjusting both scales to map data to create a horizontal bar chart   

d3.csv('../data/catActivities.csv', d3.autoType)
  .then(cdata => {
    console.log("data", cdata)

// step 3. SCALES /
    const xScales_h = d3.scaleLinear() // scaleBand is for a bar chart
                  .domain([0, d3.max(cdata, d=> d.count)]) // domain is the whole data
                  .range([0, innerWidth])                 // range is data array for visual

    const yScales_h = d3.scaleBand()
                  .domain(cdata.map(d=> d.activity)) // for numeric data, domain[min,max]
                  .range([0, innerHeight]) // data range relates to visuals
                  .padding(0.05)

    const colorScale = d3.scaleOrdinal()
                         .domain(cdata.map(d=> d.activity))
                         .range(["red", "orange", "green", "blue","purple"])

// step 4. ELEMENT APPEND
/* HTML ELEMENTS */// # is for selecting from id
    const svg_h= d3.select("#barchart_h")
                .append("svg")
                   .attr("width", width)
                   .attr("height", height) // width and height of the entire svg area 
                .append("g")
                   .attr("transform",`translate(${margin.left}, ${margin.top})`);
                 
          svg_h.append("g").call(d3.axisLeft(yScales_h))
               .append("text")
                  .attr("transform", "rotate(-90)")
                  .attr("y", 0-margin.left+10)
                  .attr("x", margin.top-margin.bottom)
                  .attr("stroke", "black")
                  .attr("text-anchor", "end")
                  .text("Activity Type");   

          svg_h.append("g").call(d3.axisBottom(xScales_h))
                   .attr("transform",`translate(0,${innerHeight})`)
              .append("text")
                   .attr("y", margin.bottom-margin.top)
                   .attr("x", innerWidth-margin.right)
                   .attr("stroke", "black")
                   .attr("text-anchor", "end")
                   .text("Activity Volume");  
       
// step 5. SELECT
/* Select your container and append the visual elements to it */
          svg_h.selectAll("rect") // grab all graphic in rect
               .data(cdata) // take our data
               .join("rect") // join the rect and data
               .attr("y", d=>yScales_h(d.activity))
               .attr("width", d=> xScales_h(d.count)) // to band the width and height according to my data
               .attr("height", yScales_h.bandwidth())
               .attr("x", d=>xScales_h(0)) // 6. ATTRIBUTES: where to place in x and y plane to visualize
               .attr("fill", d=> colorScale(d.activity))
                         
    
});

