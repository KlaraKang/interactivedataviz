/* CONSTANTS AND GLOBALS */
 const width = window.innerWidth * .7,
   height = window.innerHeight * .8,
   margin = {top: 20, bottom: 30, left:50, right:20};


// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
 let svg, tooltip;
 let xScale, yScale, colorScale;
 let xAxis, yAxis;
 let xAxisGroup, yAxisGroup;

/* APPLICATION STATE */
let state = {
  data: [],
  hover: null,
  selection: "All", // + YOUR FILTER SELECTION
};

/* LOAD DATA */
// + SET YOUR DATA PATH
d3.csv('./data/hateCrime_stateLine.csv', d => {
  return {
    DATA_YEAR: new Date(+d.DATA_YEAR, 0, 1),
    STATE_NAME: d.STATE_NAME,
    SUM_VICTIM_COUNT: +d.SUM_VICTIM_COUNT
  }
})
  .then(rawdata => {
  /*   // group and sum the data
  var sum_victim = d3.rollup(data, v=>d3.sum(v, g=>g.SUM_VICTIM_COUNT),
                             d => d.STATE_NAME, d=>d.DATA_YEAR)  // Reduced, but it's an InternMap

  // reorganizing to a flat array
  function unroll(rollup, keys, label = "value", p ={}){
          return Array.from(rollup, ([key, value]) => 
          value instanceof Map ? unroll(value, keys.slice(1), label, 
          Object.assign({}, { ...p, [keys[0]]: key } ))
          : Object.assign({}, { ...p, [keys[0]]: key, [label] : value })
          ).flat();
        } 
  sums = unroll(sum_victim, ["STATE_NAME", "DATA_YEAR"], "SUM_VICTIM_COUNT")

  // save the summed data to application state 
  state.data = sums;*/
  state.data = rawdata;
  console.log(state.data) // Year as number

    init();
  });

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
  // + SCALES
  xScale = d3.scaleTime()
          .domain(d3.extent(state.data, d=>d.DATA_YEAR))
          .range([margin.left, width-margin.right])
  
  yScale = d3.scaleLinear()
          .domain([0, d3.max(state.data, d=> d.SUM_VICTIM_COUNT)])
          .range([height-margin.bottom, margin.top])

  // + AXES
  xAxis = d3.axisBottom(xScale)
          .ticks(20)

  yAxis = d3.axisLeft(yScale)

  // + UI ELEMENT SETUP
  const selectElement = d3.select("#dropdown")

  selectElement.selectAll("option")
        .data([...new Set(state.data.map(d => d.STATE_NAME))])
        .join("option")
        .attr("attr", d=> d)
        .text(d => d)

  selectElement.on("change", event => {
    state.selection = event.target.value
    console.log("updated state =", state)
    draw();
  })

  // + CREATE SVG ELEMENT
  const container = d3.select("#container")
                  .style("position","relative");

  svg = container.append("svg")
        .attr("width", width)
        .attr("height", height)

  tooltip = container.append("div")
          .attr("class", "tooltip")
          .style("top", 0)
          .style("left", 0)
          .style("color", "black")
          .style("position", "absolute")

  // + CALL AXES
  xAxisGroup = svg.append("g")
          .attr("class","xAxis")
          .attr("transform", `translate(${0},${height-margin.bottom})`)
          .call(xAxis)

  yAxisGroup = svg.append("g")
          .attr("class","yAxis")
          .attr("transform", `translate(${margin.left},${0})`)
          .call(yAxis)

  draw(); // calls the draw function
}

/* DRAW FUNCTION */
// we call this every time there is an update to the data/state
function draw() {
  // + FILTER DATA BASED ON STATE
  const filteredData = state.data
     .filter(d => state.selection === d.STATE_NAME)

  // + UPDATE SCALE(S), if needed
  yScale.domain([0, d3.max(filteredData, d=> d.SUM_VICTIM_COUNT)])

  // + UPDATE AXIS/AXES, if needed
  yAxisGroup
      .transition()
      .duration(500)
      .call(yAxis.scale(yScale)) // generated updated scale

  // UPDATE LINE GENERATOR FUNCTION
  const lineGen = d3.line()
                .x(d=> xScale(d.DATA_YEAR))
                .y(d=> yScale(d.SUM_VICTIM_COUNT))

  // AREA GENERATOR
  const areaGen = d3.area()
                .x(d => xScale(d.DATA_YEAR))
                .y1(d => yScale(d.SUM_VICTIM_COUNT))
                .y0(height-margin.bottom)

  // + DRAW LINE AND/OR AREA
  svg.selectAll(".line")
     .data([filteredData]) // needs [] for line 
     .join("path")
        .attr("class","line")
        .attr("stroke","#9A1904")
        .attr("fill","none")
        .attr("d", d=>lineGen(d))
        .on("mouseover", function(event, d, i){
          tooltip
          .html(`<div>${d.DATA_YEAR}:</div>
                  <div>${d.SUM_VICTIM_COUNT} Victims</div>`)
          .style("visibility", "visible")
          .style("background","lightblue")
        })
        .on("mousemove", function(event){
            tooltip
            .style("top", event.pageY - 10 + "px")
            .style("left", event.pageX +10 +"px")
        })
        .on("mouseout", function(event, d) {
            tooltip
            .html(``)
            .style("visibility", "hidden");
        })

  // FILL AREA WITH A COLOR WITH A TIME DELAY        
  svg.selectAll("Path.area")
      .data([filteredData]) 
      .join("path")
      .attr("class","area")  
      .attr("fill","#E1A22D")
      .style("opacity",0.5) 
      .attr("d", d=>areaGen(d))
    
  }
