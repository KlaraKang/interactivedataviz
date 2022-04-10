/* CONSTANTS AND GLOBALS */
const width = window.innerWidth*.8,
height = window.innerHeight*.8,
margin = {top:20, bottom:20, left:150, right:20};

// // since we use our scales in multiple functions, they need global scope
// let xScale, yScale;
let xScale, yScale, colorScale;
let year_menu;
let bias_types;
let svg;

/* APPLICATION STATE */
let state = {
    data: [],  
    hover: null,
    selectYear: 2020 //default selection
};

/* LOAD DATA */
d3.csv('../data/20YrsUSHateCrime.csv', d3.autoType).then(raw_data => {
  // group and sum the data
  var sum_victim = d3.rollup(raw_data, v=>d3.sum(v, g=>g.SUM_VICTIM_COUNT),
                          d => d.BIAS_TYPES, d=>d.DATA_YEAR)  // Reduced, but it's an InternMap
  // reorganizing to a flat array
  function unroll(rollup, keys, label = "value", p ={}){
            return Array.from(rollup, ([key, value]) => 
            value instanceof Map ? unroll(value, keys.slice(1), label, 
            Object.assign({}, { ...p, [keys[0]]: key } ))
          : Object.assign({}, { ...p, [keys[0]]: key, [label] : value })
          ).flat();
  } 
  sums = unroll(sum_victim, ["BIAS_TYPES", "DATA_YEAR"], "SUM_VICTIM_COUNT")
  
  // save the summed data to application state
  state.data = sums;
  console.log(state.data) // Year as number

  year_menu = Array.from(d3.group(state.data, d=>d.DATA_YEAR).keys())
  year_menu = year_menu.sort(d3.descending)

  /* year_menu = Array.from(d3.group(state.data, d=>d.DATA_YEAR),
                         ([key, value]) => ({key: key, value: key}))
  year_menu = year_menu.sort((d,i)=>d3.descending(d.value,i.value)) */
 //console.log(year_menu) // [{key: 2020, value: 2020}, {key: 2019, value: 2019},..]
  bias_types = Array.from(d3.group(state.data, d=>d.BIAS_TYPES).keys())
  bias_types = bias_types.sort(d3.ascending) 
  console.log(bias_types) 
    
  init();
});          

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
                    
  /* SCALES */
  // xScale - linear
  xScale = d3.scaleLinear()
             .domain(d3.extent(state.data, d=>d.SUM_VICTIM_COUNT))
             .range([margin.left, width-margin.right])
            
  // yScale - categorical
  yScale = d3.scaleBand()
             .domain(state.data.map(d=> d.BIAS_TYPES).sort(d3.ascending) )
             .range([margin.bottom, height-margin.top])
             .padding(.3)
            
  // color scale
  colorScale = d3.scaleOrdinal()
                .domain(bias_types)
                .range(["#878f99","#124559","#598392","#a2b9bc","#b2ad7f","#bdcebe","#cfe0e8","#A5C4E7","#92a8d1","#034f84","#deeaee"])  

  // + AXES
  const xAxis = d3.axisBottom(xScale)
  const yAxis = d3.axisLeft(yScale)

  // + CREATE SVG ELEMENT

  const container = d3.select("#container")
      .style("position", "relative");

  svg = container
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("position", "relative");

  tooltip = d3.select("body")
        .append("div")
        .attr("class", "tooltip")
        .style("z-index", "10")
        .style("position", "absolute")
        .style("visibility", "hidden")
        .style("opacity", 0.8)
        .style("padding", "8px")
        .attr("font-size", "10px")
        .attr("font-color", "red")
        .text("tooltip");

  // + CALL AXES to draw Axis lines
  const xAxisGroup = svg.append("g")
    .attr("class","xAxis")
    .attr("transform", `translate(${0},${height-margin.bottom})`)
    .call(xAxis)
   
  const yAxisGroup = svg.append("g")
    .attr("class","yAxis")
    .attr("transform", `translate(${margin.left},${0})`)
    .call(yAxis)

  // + UI ELEMENT SETUP
  /*manual drop-down menu */
  const selectElement = d3.select("#dropdown")

  selectElement.selectAll("option") // "option" is a HTML element
                .data(year_menu) 
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
  const filteredData = state.data
       .filter(d => state.selectYear === d.DATA_YEAR) 
  console.log(filteredData) 

  svg.selectAll("rect")
     .data(filteredData, d => d.INCIDENT_ID)
     .join(
      // + HANDLE ENTER SELECTION
      enter => enter
        .append("rect")
        .attr("class","bar")
        .attr("width", 0)
        .attr("height", yScale.bandwidth())
        .attr("x", margin.left)
        .attr("y", d=>yScale(d.BIAS_TYPES))
        .attr("fill", d=>colorScale(d.BIAS_TYPES))
          .on("mouseover", function(event, d, i){
              tooltip
                .html(`<div>Bias Types: ${d.BIAS_TYPES}</div>
                      <div>Number of Victims: ${d.SUM_VICTIM_COUNT}</div>`)
                .style("visibility", "visible")
                .style("background","yellow")
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
        .call(enter => enter
          .transition()
          .duration(1000)
          .attr("width", (d,i)=> xScale(d.SUM_VICTIM_COUNT)-margin.left)
          .attr("fill", d=>colorScale(d.BIAS_TYPES))
        )
        ,
        // + HANDLE UPDATE SELECTION
        update => update
        ,
        // + HANDLE EXIT SELECTION
        exit => exit
          .transition()
          .duration(500)
          .attr("x", xScale(0))
          .attr("width", 0)
          .remove()  
      )   
           
  svg.selectAll("text")
     .data(filteredData, d => d.INCIDENT_ID)
     .join(
      enter=>enter
       .append("text")
       .attr("class","data-labels")
         .text(d=>d.SUM_VICTIM_COUNT)
         .attr("y", (d, i) => yScale(d.BIAS_TYPES)+yScale.bandwidth()/2)
         .attr("x", d=>xScale(d.SUM_VICTIM_COUNT)+10)
         .attr("font-size","10px")
         .attr("text-anchor", "middle")
         .attr("fill", "red")
      ,
      update=>update
      ,
      exit => exit
       .transition()
       .duration(50)
       .attr("x", 0)
       .remove("data-labels")
       
         
   )  
  
}  