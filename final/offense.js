/* CONSTANTS AND GLOBALS */
const width = window.innerWidth*.9,
      height = window.innerHeight*.8,
      margin = {top: 10, bottom: 30, left:40, right:10},
      radius = 2.5;

// global empty variables
let xScale, yScale, colorScale;
let year_menu;
let offense_types;
let svg, tooltip;

/* APPLICATION STATE */
let state = {
    data: [],  
    hover: null,
    selection: "All" //default selection
};

/* LOAD DATA */
// + SET YOUR DATA PATH
d3.csv("./data/20YrsUSHateCrime.csv", d=>{
  return{
    DATA_YEAR: +d.DATA_YEAR,
    SUM_VICTIM_COUNT: +d.SUM_VICTIM_COUNT,
    OFFENSE_TYPES: d.OFFENSE_TYPES,
    INCIDENT_ID: d.INCIDENT_ID
  }
}).then(raw_data => {

  // group and sum the data
  var sum_victim = d3.rollup(raw_data, v=>d3.sum(v, g=>g.SUM_VICTIM_COUNT),
                            d => d.OFFENSE_TYPES, d=>d.DATA_YEAR)  // Reduced, but it's an InternMap
  
  // reorganizing to a flat array
  function unroll(rollup, keys, label = "value", p ={}){
            return Array.from(rollup, ([key, value]) => 
            value instanceof Map ? unroll(value, keys.slice(1), label, 
            Object.assign({}, { ...p, [keys[0]]: key } ))
            : Object.assign({}, { ...p, [keys[0]]: key, [label] : value })
            ).flat();
          } 
  sums = unroll(sum_victim, ["OFFENSE_TYPES", "DATA_YEAR"], "SUM_VICTIM_COUNT")
 
  // save the summed data to application state
  state.data = sums;
  console.log(sums) // Year as number

  init();
});

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
  // + SCALES
  xScale = d3.scaleLinear()
            .domain(d3.extent(state.data, d =>d.DATA_YEAR)) //extent gets min and max at the same time.
            .range([margin.left, width-margin.right])
  
  yScale = d3.scaleLinear()
            .domain(d3.extent(state.data, d=>d.SUM_VICTIM_COUNT))
            .range([height-margin.bottom, margin.top])

  colorScale = d3.scaleOrdinal()
              .range(d3.schemeSet1)
             /*  .range(["#8dd3c7","#ffffb3","#bebada","#fb8072","#80b1d3",
              "#fdb462","#b3de69","#fccde5","#d9d9d9","#bc80bd","#ccebc5","#ffed6f"])   */

  // + AXES
  const xAxis = d3.axisBottom(xScale).ticks(20)
  const yAxis = d3.axisLeft(yScale)

  // + UI ELEMENT SETUP
  /*manual drop-down menu */
  const selectElement = d3.select("#dropdown")
 
  selectElement.selectAll("option") // "option" is a HTML element
              .data(["All",
                    ...new Set(state.data.map(d => d.OFFENSE_TYPES).sort(d3.ascending))]) 
              .join("option")
              .attr("value", d => d) // what's on the data
              .text(d=> d) // what user can see

 /* set up event listener to filter data based on dropdown menu selection*/
  selectElement.on("change", event => {
    state.selection = event.target.value
    draw();
  });

  // + CREATE SVG ELEMENT
  svg = d3.select("#container")
        .append("svg")
        .attr("width", width)
        .attr("height", height)

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
  const xAxisGroup = svg.append("g")
      .attr("class","xAxis")
      .attr("transform", `translate(${0},${height-margin.bottom})`)
    //  .attr("class", "axisLine")
      .call(xAxis)
  
  const yAxisGroup = svg.append("g")
      .attr("class","yAxis")
      .attr("transform", `translate(${margin.left},${0})`)
     // .attr("class", "axisLine")
      .call(yAxis)

  draw(); // calls the draw function
}

/* DRAW FUNCTION */
// we call this every time there is an update to the data/state
function draw() {

  // + FILTER DATA BASED ON STATE
  const filteredData = state.data
       .filter(d => state.selection === "All" || 
                    state.selection === d.OFFENSE_TYPES)
  console.log(filteredData)

  const dot = svg
    .selectAll("circle.dot")
    .data(filteredData, d=> d.INCIDENT_ID) // to match data to unique id
    .join(
      // + HANDLE ENTER SELECTION
      enter => enter
      .append("circle")
      .attr("class","dot")      
      .attr("r", radius)
      .attr("cx", 0)
      .attr("cy", d => yScale(d.SUM_VICTIM_COUNT))
      .attr("fill", "black")
        .on("mouseover", function(event, d, i){
          tooltip
            .html(`<div>Year: ${d.DATA_YEAR}</div>
                   <div>${d.OFFENSE_TYPES}</div>
                   <div>${d.SUM_VICTIM_COUNT} Victims</div>`)
            .style("visibility", "visible")
            .style("background","yellow")
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
        .attr("r", radius*1.5)
        .attr("cx", d => xScale(d.DATA_YEAR))
        .attr("fill", d => colorScale(d.OFFENSE_TYPES))
        )
      ,
      // + HANDLE UPDATE SELECTION
      update => update,

      // + HANDLE EXIT SELECTION
      exit => exit
        .transition()
        .duration(500)
        .delay(150)
        .attr("cx", 0)
        .remove("dot")
      )
       
}