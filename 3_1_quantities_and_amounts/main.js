/* CONSTANTS AND GLOBALS */
const width = window.innerWidth*.9,
height = window.innerHeight*.8,
margin = {top:20, bottom:20, left:50, right:20};

// // since we use our scales in multiple functions, they need global scope
// let xScale, yScale;
let xScale, yScale;
let year_menu;
let bias_types;

/* APPLICATION STATE */
let state = {
    data: [],  
    selectYear: 2020 //default selection
};

/* LOAD DATA */
d3.csv('../data/HateCrimeByBiasType.csv', d3.autoType).then(raw_data => {
  // group and sum the data
  sum_victim = d3.rollup(raw_data, v=>d3.sum(v, g=>g.SUM_VICTIM_COUNT),
                          d => d.BIAS_TYPE, d=>d.DATA_YEAR)  // Reduced, but it's an InternMap
  // reorganizing to a flat array
  function unroll(rollup, keys, label = "value", p ={}){
            return Array.from(rollup, ([key, value]) => 
            value instanceof Map ? unroll(value, keys.slice(1), label, 
            Object.assign({}, { ...p, [keys[0]]: key } ))
          : Object.assign({}, { ...p, [keys[0]]: key, [label] : value })
          ).flat();
  }
  sums = unroll(sum_victim, ["BIAS_TYPE", "DATA_YEAR"], "SUM_VICTIM_COUNT")
  
  // save the summed data to application state
  state.data = sums;
  console.log(state.data)

  year_menu = Array.from(d3.group(state.data, d=>d.DATA_YEAR),
                         ([key, value]) => ({key: key, value: key}))

  bias_types = Array.from(d3.group(state.data, d=>d.BIAS_TYPE).keys()) 

  console.log(year_menu) // [{key: 2001, value: 2001}, {key: 2002, value: 2002},..]
  console.log(bias_types) // ['Race', 'Gender', 'Religion', 'Disability', 'Unknown']
    
  init();
});          

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
  
  /* SCALES */
  // xScale - linear
  xScale = d3.scaleLinear()
            .domain(d3.extent(state.data, d =>d.SUM_VICTIM_COUNT))
            .range([margin.left, width-margin.right])

  // yScale - categorical
  yScale = d3.scaleBand()
            .domain(state.data.map(d=> d.BIAS_TYPE))
            .range([height-margin.top, margin.bottom])

  // color scale
  colorScale = d3.scaleOrdinal()
            .domain(bias_types)
            .range(d3.schemeSet3)   

  // + AXES
  const xAxis = d3.axisBottom(xScale)
  const yAxis = d3.axisLeft(yScale)

  // + UI ELEMENT SETUP
  /*manual drop-down menu */
  const selectElement = d3.select("#dropdown")

  selectElement.selectAll("option") // "option" is a HTML element
                .data(year_menu) 
                .enter()
                .append("option")
                .attr("value", d => d.key) // what's on the data
                .text(d=> d.value) // what users can see
  
  /* set up event listener to filter data based on dropdown menu selection*/
  selectElement.on("change", event => {
    console.log(event.target.value) // to test if filtered 

    state.selectYear = +event.target.value

    console.log("new state",state) // to check changes after selection
    
    draw(); 
  });
  // + CREATE SVG ELEMENT
   svg = d3.select("#container")
          .append("svg")
          .attr("width", width)
          .attr("height", height)

  // + CALL AXES to draw Axis lines
  const xAxisGroup = svg.append("g")
          .attr("class","xAxis")
          .attr("transform", `translate(${0},${height-margin.bottom})`)
          .call(xAxis)

  const yAxisGroup = svg.append("g")
          .attr("class","yAxis")
          .attr("transform", `translate(${margin.left},${0})`)
          .call(yAxis)

  draw();  // calls the draw function
}
 
/* DRAW FUNCTION */
function draw() {
  // + FILTER DATA BASED ON STATE
  const filteredData = state.data
       .filter(d => state.selectYear === d.DATA_YEAR)
  console.log(filteredData) 

  svg.selectAll("rect")
     .data(filteredData)
     .join(
      // + HANDLE ENTER SELECTION
      enter => enter
        .append("rect")
        .attr("class","bar")
        .attr("width", d=> xScale(d.SUM_VICTIM_COUNT))
        .attr("height", yScale.bandwidth())
        .attr("x", d=>xScale(0))
        .attr("y", d=>yScale(d.BIAS_TYPE))
        .attr("fill", d=>colorScale(d.BIAS_TYPE))
        .call(enter => enter
          .transition()
          .duration(1000)
          )
        ,
        // + HANDLE UPDATE SELECTION
        update => update
        // what should I do something to update the bars??? 
        ,
  
        // + HANDLE EXIT SELECTION
        exit => exit
          .transition()
          .duration(1000)
          .attr("fill","gray")
          .remove()    
      ) 
        
}  