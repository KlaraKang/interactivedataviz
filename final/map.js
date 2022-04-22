<<<<<<< HEAD
/**
 * CONSTANTS AND GLOBALS
 * */
 const width = window.innerWidth * 0.9,
 height = window.innerHeight * 0.8,
 margin = { top: 20, bottom: 20, left: 20, right: 20 },
 radius = 3;     

 let xScale, yScale, colorScale;
 let year_menu, state_name;
 let svg;
 let geojson, projection;
 
/**
* APPLICATION STATE
* */
let state = {
    data:[],
    hover: null,
    selectYear: "All"
};

/**
 * LOAD DATA
 * Using a Promise.all([]), we can load more than one dataset at a time
 * */
Promise.all([
    d3.json("./data/usState.geojson"),
    d3.csv("./data/hateCrime_stateMap_year.csv", d=> {
      d.SUM_VICTIM_COUNT= +d.SUM_VICTIM_COUNT
        {return d}
      }),
    ]).then(([geojson, usState]) => {
    state.geojson = geojson;

    // save the summed data to application state
    state.data = usState;
    console.log(state.data) //Year as string

    year_menu = Array.from(d3.group(state.data, d=>d.DATA_YEAR).keys())
    year_menu = year_menu.sort(d3.descending)
   
    console.log("state: ", state);

    // SPECIFY PROJECTION: IN SCALES AREA SPECIFY PROJECTION as scale
    projection = d3.geoAlbersUsa()
                    .fitSize([width - margin.left - margin.right, 
                     height - margin.top - margin.bottom], geojson)

    // Scale of dots
    colorScale = d3.scaleSequential()
                        .domain([0,500])//d3.extent(state.data, d=>d.SUM_VICTIM_COUNT))
                        .interpolator(d3.interpolateOrRd)                     
    
    // CREATE SVG ELEMENT
    const container = d3.select("#container")
                        .style("position", "relative");

    svg = container.append("svg")
                   .attr("width", width)
                   .attr("height", height)
                   .style("position", "relative");

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
       .style("opacity",0.2) 

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
        console.log(event.target.value) // to check if filtered 

        state.selectYear = event.target.value

        console.log("new state", state) // to check changes after selection
        draw(); 
    });
                  
 draw(); // calls the draw function
});

/**
* DRAW FUNCTION
* call this every time there is an update to the data/state
* */
function draw() {

    // + FILTER DATA BASED ON STATE
    const filteredData = state.data
         .filter(d => state.selectYear === d.DATA_YEAR) 
         console.log(filteredData)

    svg.selectAll("circle")
       .data(filteredData, d => d.ID)
       .join(
            enter => enter
            .append("circle")
            .attr("r", 2)
            .attr("transform", d => {
                const [x, y] = projection([d.longitude, d.latitude])
                return `translate(${x}, ${y})`
            })
            .attr("fill","white")
                .on("mouseover", function(event, d, i){
                    tooltip
                    .html(`<div>${d.STATE_NAME}:</div>
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
            .call(enter => enter.transition()
                .delay(500)
                .attr("r", d=>{
                    if(d.DATA_YEAR === "All")
                      return Math.log(d.SUM_VICTIM_COUNT)*2.5
                    else
                      return d.SUM_VICTIM_COUNT*0.02
                })
                
                .attr("fill", d=> colorScale(d.SUM_VICTIM_COUNT))
            )
            ,
            // + HANDLE UPDATE SELECTION
            update => update
            ,
            // + HANDLE EXIT SELECTION
            exit => exit
            .transition()
            .duration(500)
            .attr("fill","gray")
            .attr("r", (radius*.25))
            .delay(250)
            .attr("cx", 0)
            .remove() 
        )   
=======
/**
 * CONSTANTS AND GLOBALS
 * */
 const width = window.innerWidth * 0.9,
 height = window.innerHeight * 0.8,
 margin = { top: 20, bottom: 20, left: 20, right: 20 },
 radius = 3;     

 let xScale, yScale, colorScale;
 let year_menu, state_name;
 let svg;
 let geojson, projection;
 
/**
* APPLICATION STATE
* */
let state = {
    data:[],
    hover: null,
    selectYear: "All"
};

/**
 * LOAD DATA
 * Using a Promise.all([]), we can load more than one dataset at a time
 * */
Promise.all([
    d3.json("./data/usState.geojson"),
    d3.csv("./data/hateCrime_stateMap_year.csv", d=> {
      d.SUM_VICTIM_COUNT= +d.SUM_VICTIM_COUNT
        {return d}
      }),
    ]).then(([geojson, usState]) => {
    state.geojson = geojson;

    // save the summed data to application state
    state.data = usState;
    console.log(state.data) //Year as string

    year_menu = Array.from(d3.group(state.data, d=>d.DATA_YEAR).keys())
    year_menu = year_menu.sort(d3.descending)
   
    console.log("state: ", state);

    // SPECIFY PROJECTION: IN SCALES AREA SPECIFY PROJECTION as scale
    projection = d3.geoAlbersUsa()
                    .fitSize([width - margin.left - margin.right, 
                     height - margin.top - margin.bottom], geojson)

    // Scale of dots
    colorScale = d3.scaleSequential()
                        .domain([0,500])//d3.extent(state.data, d=>d.SUM_VICTIM_COUNT))
                        .interpolator(d3.interpolateOrRd)                     
    
    // CREATE SVG ELEMENT
    const container = d3.select("#container")
                        .style("position", "relative");

    svg = container.append("svg")
                   .attr("width", width)
                   .attr("height", height)
                   .style("position", "relative");

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
       .style("opacity",0.2) 

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
        console.log(event.target.value) // to check if filtered 

        state.selectYear = event.target.value

        console.log("new state", state) // to check changes after selection
        draw(); 
    });
                  
 draw(); // calls the draw function
});

/**
* DRAW FUNCTION
* call this every time there is an update to the data/state
* */
function draw() {

    // + FILTER DATA BASED ON STATE
    const filteredData = state.data
         .filter(d => state.selectYear === d.DATA_YEAR) 
         console.log(filteredData)

    svg.selectAll("circle")
       .data(filteredData, d => d.ID)
       .join(
            enter => enter
            .append("circle")
            .attr("r", 2)
            .attr("transform", d => {
                const [x, y] = projection([d.longitude, d.latitude])
                return `translate(${x}, ${y})`
            })
            .attr("fill","white")
                .on("mouseover", function(event, d, i){
                    tooltip
                    .html(`<div>${d.STATE_NAME}:</div>
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
            .call(enter => enter.transition()
                .delay(500)
                .attr("r", d=>{
                    if(d.DATA_YEAR === "All")
                      return Math.log(d.SUM_VICTIM_COUNT)*2
                    else
                      return d.SUM_VICTIM_COUNT*0.02
                })
                
                .attr("fill", d=> colorScale(d.SUM_VICTIM_COUNT))
            )
            ,
            // + HANDLE UPDATE SELECTION
            update => update
            ,
            // + HANDLE EXIT SELECTION
            exit => exit
            .transition()
            .duration(500)
            .attr("fill","gray")
            .attr("r", (radius*.25))
            .delay(250)
            .attr("cx", 0)
            .remove() 
        )   
>>>>>>> b9ed81d2830dfcb633b6611ec647d083afbbb5c6
}; 