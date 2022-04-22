<<<<<<< HEAD
/* CONSTANTS AND GLOBALS */
const width = window.innerWidth*.9,
height = window.innerHeight*.8,
margin = {top:20, bottom:20, left:70, right:70};

// // since we use our scales in multiple functions, they need global scope
// let xScale, yScale;
let xScale1, yScale1, xScale2, yScale2;
let colorScale;
let svg, tooltip;

/* APPLICATION STATE */
let state = {
    biasData: [], 
    victData: [],
    hover: null,
    selectYear: "Select Year" //default selection
};

/* LOAD DATA */
d3.csv('./data/20YrsUSHateCrime.csv', d3.autoType).then(raw_data => {
  // group and sum the data
  var bias_sum = d3.rollup(raw_data, v=>d3.sum(v, g=>g.SUM_VICTIM_COUNT),
                          d => d.BIAS_TYPES, d=>d.DATA_YEAR)  // Reduced, but it's an InternMap
  
  var vict_sum = d3.rollup(raw_data, v=>d3.sum(v, g=>g.SUM_VICTIM_COUNT),
                          d => d.VICTIM_TYPES, d=>d.DATA_YEAR) 

  // reorganizing to a flat array
  function unroll(rollup, keys, label = "value", p ={}){
            return Array.from(rollup, ([key, value]) => 
            value instanceof Map ? unroll(value, keys.slice(1), label, 
            Object.assign({}, { ...p, [keys[0]]: key } ))
          : Object.assign({}, { ...p, [keys[0]]: key, [label] : value })
          ).flat();
  } 
  sums_bias = unroll(bias_sum, ["BIAS_TYPES", "DATA_YEAR"], "SUM_VICTIM_COUNT")
  sums_vict = unroll(vict_sum, ["VICTIM_TYPES", "DATA_YEAR"], "SUM_VICTIM_COUNT")

  // save the summed data to application state
  state.biasData = sums_bias;
  state.victData = sums_vict;
  console.log(state.biasData) 
  console.log(state.victData)
  init();
});          

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
                    
  /* SCALES */
  // xScale1 for Bias Type - linear
  xScale1 = d3.scaleLinear()
            .domain(d3.extent(state.biasData, d=>d.SUM_VICTIM_COUNT))
            .range([margin.left, width-margin.right])
            
  // yScale1 for Bias Type - categorical
  yScale1 = d3.scaleBand()
            .domain(state.biasData.map(d=> d.BIAS_TYPES).sort(d3.ascending) )
            .range([margin.bottom, height-margin.top])
            .padding(.3)
  
  // xScale2 for Victim Type - linear
  xScale2 = d3.scaleLinear()
            .domain(d3.extent(state.victData, d=>d.SUM_VICTIM_COUNT))
            .range([margin.left, width-margin.right])
  
  // yScale2 for Victim Type - categorical
  yScale2 = d3.scaleBand()
            .domain(state.victData.map(d=> d.VICTIM_TYPES).sort(d3.ascending) )
            .range([margin.bottom, height-margin.top])
            .padding(.3)           

  // color scale
  colorScale = d3.scaleOrdinal()
                .range(["#878f99","#124559","#598392","#a2b9bc","#b2ad7f","#bdcebe","#cfe0e8","#A5C4E7","#92a8d1","#034f84","#deeaee"])  

  // + AXES
  const xAxis1 = d3.axisBottom(xScale1).ticks(20)
  const yAxis1 = d3.axisLeft(yScale1)

  // + AXES
  const xAxis2 = d3.axisBottom(xScale2).ticks(20)
  const yAxis2 = d3.axisLeft(yScale2)

  // + CREATE SVG ELEMENT
  const container = d3.select("#container")
                    .style("position", "relative");

  svg1 = container
        .append("svg")
        .attr("width", width/2)
        .attr("height", height)
        .style("position", "relative");

  svg2 = container
        .append("svg")
        .attr("width", width/2)
        .attr("height", height)
        .attr("x", width/2+margin.right)
        .style("position", "relative");
 
  tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("z-index", "9")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("opacity", 0.8)
        .style("padding", "8px")
        .attr("font-size", "9px")
        .text("tooltip");

  // + CALL AXES to draw Axis lines
  const xAxisGroup1 = svg1.append("g")
    .attr("class","xAxis1")
    .attr("transform", `translate(${0},${height-margin.bottom})`)
    .attr("width",width/2)
    .call(xAxis1)
   
  const yAxisGroup1 = svg1.append("g")
    .attr("class","yAxis1")
    .attr("transform", `translate(${margin.left},${0})`)
    .call(yAxis1)

// + CALL AXES to draw Axis lines
  const xAxisGroup2 = svg2.append("g")
    .attr("class","xAxis2")
    .attr("transform", `translate(${50},${height-margin.bottom})`)
    .attr("width",width/2+50)
    .call(xAxis2)
   
  const yAxisGroup2 = svg2.append("g")
    .attr("class","yAxis2")
    .attr("transform", `translate(${margin.left+50},${0})`)
    .call(yAxis2)

  // + UI ELEMENT SETUP
  /*manual drop-down menu */
  const selectElement = d3.select("#dropdown")

  selectElement.selectAll("option") // "option" is a HTML element
                .data(["Select Year",
                ...new Set(state.biasData.map(d => d.DATA_YEAR).sort(d3.descending))]) 
                .join("option")
                .attr("value", d => d) // what's on the data
                .text(d=> d) // what users can see
  
  /* set up event listener to filter data based on dropdown menu selection*/
  selectElement.on("change", event => {
    console.log(event.target.value) // to test if filtered 

    state.selectYear = +event.target.value

    //console.log("new state", state) // to check changes after selection
    draw(); 
    });

  draw();  // calls the draw function
}

/* DRAW FUNCTION */
function draw() {
  // + FILTER DATA BASED ON STATE
  const filteredData1 = state.biasData
       .filter(d => state.selectYear === d.DATA_YEAR) 
  
  const filteredData2 = state.victData
         .filter(d => state.selectYear === d.DATA_YEAR) 
  console.log(filteredData1) 
  console.log(filteredData2) 

  svg1.selectAll("rect.bar1")
      .data(filteredData1, d => d.INCIDENT_ID)
      .join(
      // + HANDLE ENTER SELECTION
      enter => enter
        .append("rect")
        .attr("class","bar1")
        .attr("width", 0)
        .attr("height", yScale1.bandwidth())
        .attr("x", margin.left)
        .attr("y", d=>yScale1(d.BIAS_TYPES))
        .attr("fill", d=>colorScale(d.BIAS_TYPES))
          .on("mouseover", function(event, d, i){
              tooltip
                .html(`<div>Bias: ${d.BIAS_TYPES}</div>
                      <div>${d.SUM_VICTIM_COUNT} Victims</div>`)
                .style("visibility", "visible")
                .style("background","lightblue")
            })
          .on("mousemove", function(event){
              tooltip
                .style("top", event.pageY - 9 + "px")
                .style("left", event.pageX +9 +"px")
            })
          .on("mouseout", function(event, d) {
              tooltip
                .html(``)
                .style("visibility", "hidden");
            })
        .call(enter => enter
          .transition()
          .duration(500)
          .attr("width", (d,i)=> xScale1(d.SUM_VICTIM_COUNT)-margin.left)
          .attr("fill", d=>colorScale(d.BIAS_TYPES))
        )
        ,
        // + HANDLE UPDATE SELECTION
        update => update
        ,
        // + HANDLE EXIT SELECTION
        exit => exit
          .transition()
          .duration(50)
          .attr("x", xScale1(0))
          .attr("width", 0)
          .remove("bar1")  
      )   

  svg1.selectAll("text.data-labels1")
     .data(filteredData1, d => d.INCIDENT_ID)
     .join(
      enter=>enter
        .append("text")
        .attr("class","data-labels1")
        .text(d=>d.SUM_VICTIM_COUNT)
        .attr("y", (d, i) => yScale1(d.BIAS_TYPES)+yScale1.bandwidth()/2)
        .attr("x", d=>xScale1(d.SUM_VICTIM_COUNT)+15)
        .attr("text-anchor", "middle")
        .attr("fill","rgb(242, 121, 8)")
      ,
      update=>update
      ,
      exit => exit
       .transition()
       .duration(50)
       .attr("x", 0)
       .remove("data-labels1")   
      )
  
  svg2.selectAll("rect.bar2")
      .data(filteredData2, d => d.INCIDENT_ID)
      .join(
      // + HANDLE ENTER SELECTION
      enter => enter
        .append("rect")
        .attr("class","bar2")
        .attr("width", 0)
        .attr("height", yScale2.bandwidth())
        .attr("x", margin.left+50)
        .attr("y", d=>yScale2(d.VICTIM_TYPES))
        .attr("fill", d=>colorScale(d.VICTIM_TYPES))
          .on("mouseover", function(event, d, i){
              tooltip
                .html(`<div>Victim Type: ${d.VICTIM_TYPES}</div>
                      <div>${d.SUM_VICTIM_COUNT} Victims</div>`)
                .style("visibility", "visible")
                .style("background","lightblue")
          })
          .on("mousemove", function(event){
              tooltip
                .style("top", event.pageY - 9 + "px")
                .style("left", event.pageX +9 +"px")
          })
          .on("mouseout", function(event, d) {
              tooltip
                .html(``)
                .style("visibility", "hidden");
          })
        .call(enter => enter
          .transition()
          .duration(500)
          .attr("width", (d,i)=> xScale2(d.SUM_VICTIM_COUNT)-margin.left)
          .attr("fill", d=>colorScale(d.VICTIM_TYPES))
        )
        ,
        // + HANDLE UPDATE SELECTION
        update => update
        ,
        // + HANDLE EXIT SELECTION
        exit => exit
          .transition()
          .duration(50)
          .attr("x", xScale2(0))
          .attr("width", 0)
          .remove("bar2")  
      )   

  svg2.selectAll("text.data-labels2")
     .data(filteredData2, d => d.INCIDENT_ID)
     .join(
      enter=>enter
        .append("text")
        .attr("class","data-labels2")
        .text(d=>d.SUM_VICTIM_COUNT)
        .attr("y", (d, i) => yScale2(d.VICTIM_TYPES)+yScale2.bandwidth()/2)
        .attr("x", d=>xScale2(d.SUM_VICTIM_COUNT)+65)
        .attr("text-anchor", "middle")
        .attr("fill","rgb(242, 121, 8)")
      ,
      update=>update
      ,
      exit => exit
       .transition()
       .duration(50)
       .attr("x", 0)
       .remove("data-labels2")   
      )
=======
/* CONSTANTS AND GLOBALS */
const width = window.innerWidth*.9,
height = window.innerHeight*.8,
margin = {top:20, bottom:20, left:70, right:50};

// // since we use our scales in multiple functions, they need global scope
// let xScale, yScale;
let xScale1, yScale1, xScale2, yScale2;
let colorScale;
let svg, tooltip;

/* APPLICATION STATE */
let state = {
    biasData: [], 
    victData: [],
    hover: null,
    selectYear: "Select Year" //default selection
};

/* LOAD DATA */
d3.csv('./data/20YrsUSHateCrime.csv', d3.autoType).then(raw_data => {
  // group and sum the data
  var bias_sum = d3.rollup(raw_data, v=>d3.sum(v, g=>g.SUM_VICTIM_COUNT),
                          d => d.BIAS_TYPES, d=>d.DATA_YEAR)  // Reduced, but it's an InternMap
  
  var vict_sum = d3.rollup(raw_data, v=>d3.sum(v, g=>g.SUM_VICTIM_COUNT),
                          d => d.VICTIM_TYPES, d=>d.DATA_YEAR) 

  // reorganizing to a flat array
  function unroll(rollup, keys, label = "value", p ={}){
            return Array.from(rollup, ([key, value]) => 
            value instanceof Map ? unroll(value, keys.slice(1), label, 
            Object.assign({}, { ...p, [keys[0]]: key } ))
          : Object.assign({}, { ...p, [keys[0]]: key, [label] : value })
          ).flat();
  } 
  sums_bias = unroll(bias_sum, ["BIAS_TYPES", "DATA_YEAR"], "SUM_VICTIM_COUNT")
  sums_vict = unroll(vict_sum, ["VICTIM_TYPES", "DATA_YEAR"], "SUM_VICTIM_COUNT")

  // save the summed data to application state
  state.biasData = sums_bias;
  state.victData = sums_vict;
  console.log(state.biasData) 
  console.log(state.victData)
  init();
});          

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
                    
  /* SCALES */
  // xScale1 for Bias Type - linear
  xScale1 = d3.scaleLinear()
            .domain(d3.extent(state.biasData, d=>d.SUM_VICTIM_COUNT))
            .range([margin.left, width-margin.right])
            
  // yScale1 for Bias Type - categorical
  yScale1 = d3.scaleBand()
            .domain(state.biasData.map(d=> d.BIAS_TYPES).sort(d3.ascending) )
            .range([margin.bottom, height-margin.top])
            .padding(.3)
  
  // xScale2 for Victim Type - linear
  xScale2 = d3.scaleLinear()
            .domain(d3.extent(state.victData, d=>d.SUM_VICTIM_COUNT))
            .range([margin.left, width-margin.right])
  
  // yScale2 for Victim Type - categorical
  yScale2 = d3.scaleBand()
            .domain(state.victData.map(d=> d.VICTIM_TYPES).sort(d3.ascending) )
            .range([margin.bottom, height-margin.top])
            .padding(.3)           

  // color scale
  colorScale = d3.scaleOrdinal()
                .range(["#878f99","#124559","#598392","#a2b9bc","#b2ad7f","#bdcebe","#cfe0e8","#A5C4E7","#92a8d1","#034f84","#deeaee"])  

  // + AXES
  const xAxis1 = d3.axisBottom(xScale1).ticks(20)
  const yAxis1 = d3.axisLeft(yScale1)

  // + AXES
  const xAxis2 = d3.axisBottom(xScale2).ticks(20)
  const yAxis2 = d3.axisLeft(yScale2)

  // + CREATE SVG ELEMENT
  const container = d3.select("#container")
                    .style("position", "relative");

  svg1 = container
        .append("svg")
        .attr("width", width/2)
        .attr("height", height)
        .style("position", "relative");

  svg2 = container
        .append("svg")
        .attr("width", width/2)
        .attr("height", height)
        .attr("x", width/2+margin.right)
        .style("position", "relative");
 
  tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("z-index", "9")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("opacity", 0.8)
        .style("padding", "8px")
        .attr("font-size", "9px")
        .text("tooltip");

  // + CALL AXES to draw Axis lines
  const xAxisGroup1 = svg1.append("g")
    .attr("class","xAxis1")
    .attr("transform", `translate(${0},${height-margin.bottom})`)
    .attr("width",width/2)
    .call(xAxis1)
   
  const yAxisGroup1 = svg1.append("g")
    .attr("class","yAxis1")
    .attr("transform", `translate(${margin.left},${0})`)
    .call(yAxis1)

// + CALL AXES to draw Axis lines
  const xAxisGroup2 = svg2.append("g")
    .attr("class","xAxis2")
    .attr("transform", `translate(${50},${height-margin.bottom})`)
    .attr("width",width/2+50)
    .call(xAxis2)
   
  const yAxisGroup2 = svg2.append("g")
    .attr("class","yAxis2")
    .attr("transform", `translate(${margin.left+50},${0})`)
    .call(yAxis2)

  // + UI ELEMENT SETUP
  /*manual drop-down menu */
  const selectElement = d3.select("#dropdown")

  selectElement.selectAll("option") // "option" is a HTML element
                .data(["Select Year",
                ...new Set(state.biasData.map(d => d.DATA_YEAR).sort(d3.descending))]) 
                .join("option")
                .attr("value", d => d) // what's on the data
                .text(d=> d) // what users can see
  
  /* set up event listener to filter data based on dropdown menu selection*/
  selectElement.on("change", event => {
    console.log(event.target.value) // to test if filtered 

    state.selectYear = +event.target.value

    //console.log("new state", state) // to check changes after selection
    draw(); 
    });

  draw();  // calls the draw function
}

/* DRAW FUNCTION */
function draw() {
  // + FILTER DATA BASED ON STATE
  const filteredData1 = state.biasData
       .filter(d => state.selectYear === d.DATA_YEAR) 
  
  const filteredData2 = state.victData
         .filter(d => state.selectYear === d.DATA_YEAR) 
  console.log(filteredData1) 
  console.log(filteredData2) 

  svg1.selectAll("rect.bar1")
      .data(filteredData1, d => d.INCIDENT_ID)
      .join(
      // + HANDLE ENTER SELECTION
      enter => enter
        .append("rect")
        .attr("class","bar1")
        .attr("width", 0)
        .attr("height", yScale1.bandwidth())
        .attr("x", margin.left)
        .attr("y", d=>yScale1(d.BIAS_TYPES))
        .attr("fill", d=>colorScale(d.BIAS_TYPES))
          .on("mouseover", function(event, d, i){
              tooltip
                .html(`<div>Bias: ${d.BIAS_TYPES}</div>
                      <div>${d.SUM_VICTIM_COUNT} Victims</div>`)
                .style("visibility", "visible")
                .style("background","lightblue")
            })
          .on("mousemove", function(event){
              tooltip
                .style("top", event.pageY - 9 + "px")
                .style("left", event.pageX +9 +"px")
            })
          .on("mouseout", function(event, d) {
              tooltip
                .html(``)
                .style("visibility", "hidden");
            })
        .call(enter => enter
          .transition()
          .duration(500)
          .attr("width", (d,i)=> xScale1(d.SUM_VICTIM_COUNT)-margin.left)
          .attr("fill", d=>colorScale(d.BIAS_TYPES))
        )
        ,
        // + HANDLE UPDATE SELECTION
        update => update
        ,
        // + HANDLE EXIT SELECTION
        exit => exit
          .transition()
          .duration(50)
          .attr("x", xScale1(0))
          .attr("width", 0)
          .remove("bar1")  
      )   

  svg1.selectAll("text.data-labels1")
     .data(filteredData1, d => d.INCIDENT_ID)
     .join(
      enter=>enter
        .append("text")
        .attr("class","data-labels1")
        .text(d=>d.SUM_VICTIM_COUNT)
        .attr("y", (d, i) => yScale1(d.BIAS_TYPES)+yScale1.bandwidth()/2)
        .attr("x", d=>xScale1(d.SUM_VICTIM_COUNT)+10)
        .attr("text-anchor", "middle")
        //.attr("fill","yellow")
        .attr("font-size","9px")
      ,
      update=>update
      ,
      exit => exit
       .transition()
       .duration(50)
       .attr("x", 0)
       .remove("data-labels1")   
      )
  
  svg2.selectAll("rect.bar2")
      .data(filteredData2, d => d.INCIDENT_ID)
      .join(
      // + HANDLE ENTER SELECTION
      enter => enter
        .append("rect")
        .attr("class","bar2")
        .attr("width", 0)
        .attr("height", yScale2.bandwidth())
        .attr("x", margin.left+50)
        .attr("y", d=>yScale2(d.VICTIM_TYPES))
        .attr("fill", d=>colorScale(d.VICTIM_TYPES))
          .on("mouseover", function(event, d, i){
              tooltip
                .html(`<div>Victim Type: ${d.VICTIM_TYPES}</div>
                      <div>${d.SUM_VICTIM_COUNT} Victims</div>`)
                .style("visibility", "visible")
                .style("background","lightblue")
          })
          .on("mousemove", function(event){
              tooltip
                .style("top", event.pageY - 9 + "px")
                .style("left", event.pageX +9 +"px")
          })
          .on("mouseout", function(event, d) {
              tooltip
                .html(``)
                .style("visibility", "hidden");
          })
        .call(enter => enter
          .transition()
          .duration(500)
          .attr("width", (d,i)=> xScale2(d.SUM_VICTIM_COUNT)-margin.left)
          .attr("fill", d=>colorScale(d.VICTIM_TYPES))
        )
        ,
        // + HANDLE UPDATE SELECTION
        update => update
        ,
        // + HANDLE EXIT SELECTION
        exit => exit
          .transition()
          .duration(50)
          .attr("x", xScale2(0))
          .attr("width", 0)
          .remove("bar2")  
      )   

  svg2.selectAll("text.data-labels2")
     .data(filteredData2, d => d.INCIDENT_ID)
     .join(
      enter=>enter
        .append("text")
        .attr("class","data-labels2")
        .text(d=>d.SUM_VICTIM_COUNT)
        .attr("y", (d, i) => yScale2(d.VICTIM_TYPES)+yScale2.bandwidth()/2)
        .attr("x", d=>xScale2(d.SUM_VICTIM_COUNT)+60)
        .attr("text-anchor", "middle")
        //.attr("fill","yellow")
        .attr("font-size","9px")
      ,
      update=>update
      ,
      exit => exit
       .transition()
       .duration(50)
       .attr("x", 0)
       .remove("data-labels2")   
      )
>>>>>>> b9ed81d2830dfcb633b6611ec647d083afbbb5c6
}  