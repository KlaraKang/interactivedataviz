/* 1. VARIABLES: CONSTANTS AND GLOBALS */
const width = window.innerWidth*.8,
      height = window.innerHeight*.8,
      margin = {top:20, right:20, bottom:50, left:50};

const maxHappyLevel = 10;
const maxLifeExpect = 100;
const strokeWidth = 3;

const legendPosX = width-width/3,
      legendPosY = height-height/3;

/* 2. LOAD DATA */
d3.csv("../data/healthyLifestyleCity_2021.csv", d3.autoType)
  .then(data => {
        console.log(data)

  /* 3. SCALES */
  const xScale = d3.scaleLinear()
                   .domain([0, maxHappyLevel])
                   .range([margin.left, width-margin.right])
  
  const yScale = d3.scaleLinear()
                   .domain([0, maxLifeExpect])
                   .range([height-margin.bottom, margin.top])

  // to color differently by category
  const legendKey = ["EU","OC","AM","AS","AF"]
  const colorSet = ["#0081C8","#00A651","#EE334E","#FCB131","#442288"]
  const colorScale = d3.scaleOrdinal()
                       .domain(legendKey)
                       .range(colorSet)         
  const sizeScale = d3.scaleSqrt()
                      .domain(d3.extent(data, d=> d.cityOutdoorActivity)) 
                      .range([strokeWidth, 30+strokeWidth])

  /* 4. HTML ELEMENTS */
  // svg
  const svg = d3.select("#container")
                .append("svg")
                .attr("width", width)
                .attr("height",height) // for flexible scales relative to window size
  
      // add chart label
            svg.append("text")      
               .attr("x",  width*.5)
               .attr("y",  height-margin.bottom/4)
               .style("text-anchor", "middle")
               .attr("fill","#442288") 
               .text("<Hapiness Level and Life Expectancy>");   

      // add legend
            svg.append("rect")
               .attr("width", width/4)
               .attr("height", height/5)
               .attr("x", legendPosX)
               .attr("y", legendPosY)
               .attr("fill","#E5E3E6")
            
            svg.selectAll("circle")
                  .data(colorSet)           
                  .enter()
                  .append("circle")
                  .attr("cx", legendPosX+10)
                  .attr("cy", function(d,i){ return (legendPosY+10) + i*15})
                  .attr("r",5)
                  .style("fill", d=>colorScale(d))

            svg.selectAll("text")
               .data(legendKey)
               .enter()
               .append("text")
               .attr("x", legendPosX+20)
               .attr("y", function(d,i){ return (legendPosY+10) + i*15})
               .text(function(d,i){ return (legendKey[i])})
                 .style("fill", d=>colorScale(d))
                 .attr("font-size", "12px")
           

  // axis scales              
  const xAxis = d3.axisBottom(xScale)
        svg.append("g") // g is a group of visual content
           .attr("transform", // `` is called "back-tick"
                `translate(0,${height-margin.bottom})`) 
           .call(xAxis)
           .append("text")
                .attr("y", margin.bottom-margin.top)
                .attr("x", width-margin.left)
                .attr("stroke", "blue")
                .attr("font-size","12px")
                .attr("text-anchor", "end")
                .text("Hapiness Level");  

  const yAxis = d3.axisLeft(yScale)  
        svg.append("g")
           .attr("transform",`translate(${margin.left},0)`)
           .call(yAxis)
           .append("text")
               .attr("transform", "rotate(-90)")
               .attr("y", 0-margin.left+10)
               .attr("x", margin.top-margin.bottom)
               .attr("stroke", "blue")
               .attr("font-size","12px")
               .attr("text-anchor", "end")
               .text("Life Expectancy"); 
                
  /* 5. create circles via SELECT-DATA-JOIN*/
  /* 6. */
  
  const dot = svg.selectAll("circle")
                 .data(data)//, d => d.BioID)
                 .join(
                     enter => enter  
                     .append("circle")
                     .attr("r", 1)
                     .attr("cx", d => xScale(d.countryHappinessLevel))
                     .attr("cy", d => yScale(d.countryLifeExpectancy))
                     .attr("fill", "black")
                        .transition()
                        .duration(2000) // in ms
                        .delay(200)
                           .attr("r", d => sizeScale(d.cityOutdoorActivity))
                           .attr("fill", d => colorScale(d.continent))

                 );
                           
                
  });
