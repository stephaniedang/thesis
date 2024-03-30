/* global d3 */

const exampleData = [
    { year: "1970", wheat: 4.00, corn: 0.55, oat: 0.12, rye: 0.07, barley: 0.03 },
    { year: "2000", wheat: 5.26, corn: 1.40, oat: 0.12, rye: 0.03, barley: 0.02 },
    { year: "2021", wheat: 4.65, corn: 1.73, oat: 0.13, rye: 0.03, barley: 0.02 },
  ]; 
 
// Legend Function
function appendLegend(svg, categories, colorScale, width, height, margin) {
    const legendItemWidth = 100;
    const legendWidth = categories.length * legendItemWidth;
    const legendStartX = (width - legendWidth) / 2;
  
    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", `translate(${legendStartX}, ${height + margin.bottom / 2 + 40})`);
  
    categories.forEach((category, i) => {
      const legendItem = legend
        .append("g")
        .attr("class", "legend-item")
        .attr("transform", `translate(${i * legendItemWidth}, 0)`);
  
      legendItem
        .append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", colorScale(category));
  
      legendItem
        .append("text")
        .attr("x", 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "start")
        .text(category);
    });
  }  

function createPercentageStackedBarChart(selector, data) {
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const width = 960 - margin.left - margin.right;
    const height = 520 - margin.top - margin.bottom;
  
    const categories = ["wheat","corn","oat","rye","barley"];
  
    // Calculate the total and percentages for each year
    data.forEach((d) => {
      const total = categories.reduce((acc, cur) => acc + d[cur], 0);
      categories.forEach((category) => {
        d[category] = d[category] / total;
      });
    });
  
    const x = d3.scaleLinear().range([0, width]).domain([0, 1]);
    const y = d3.scaleBand().range([height, 0]).padding(0.1);
    const z = d3.scaleOrdinal().range(["#f3dcaf", "#fbc107", "#adac33", "#b1652b", "#893302"]);
  
    const svg = d3
      .select(selector)
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom + 40)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);
  
    const stack = d3.stack().keys(categories)(data);
    y.domain(data.map((d) => d.year));
    z.domain(categories);

    const rects = svg
    .selectAll(".serie")
    .data(stack)
    .enter()
    .append("g")
    .attr("class", "serie")
    .attr("fill", (d) => z(d.key))
    .selectAll("rect")
    .data((d) => d)
    .enter()
    .append("rect")
    .attr("y", (d) => y(d.data.year))
    .attr("x", 0)
    .attr("height", y.bandwidth())
    .attr("width", 0); 

// Apply the transition
  rects.transition()
      .duration(4000) 
      .delay(function(d, i) { return i * 100; })
      .attr("x", (d) => x(d[0])) 
      .attr("width", (d) => x(d[1]) - x(d[0])); 

    svg
      .append("g")
      .attr("class", "x axis")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format(".0%")));

    // Add x-axis label
    svg
        .append("text")
        .attr("class", "x axis-label")
        .attr("x", width / 2)
        .attr("y", height + margin.bottom)
        .style("text-anchor", "middle")
        .text("Average Grain Consumption Per Day");
  
    svg
      .append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(y));

    const tooltip = svg.append("foreignObject")
      .attr("class", "tooltip")
      .attr("width", 200)
      .attr("height", 70)
      .style("opacity", 0);

    const tooltipDiv = tooltip.append("xhtml:div")
      .attr("class", "tooltip-inner");
  
    rects
      .on("mouseover", function (event, d) {
        const [x, y] = d3.pointer(event);
        const data = d.data;
        const category = d3.select(this.parentNode).datum().key;
        const percentage = d[1] - d[0];
    
        tooltip
          .attr("x", x)
          .attr("y", y - 50)
          .style("opacity", 1);
        tooltipDiv.html(
          `<strong>Category:</strong> ${category}<br/><strong>% Consumption:</strong> ${d3.format(".2%")(percentage)}`
        );
      })
      .on("mousemove", function (event) {
        const [x, y] = d3.pointer(event, this);
        const tooltipWidth = 200; 
        const tooltipHeight = 50;
      
        let xPos = x;
        let yPos = y - tooltipHeight
      
        if (xPos + tooltipWidth > width) {
          xPos = width - tooltipWidth;
        }
      
        if (yPos < 0) {
          yPos = 0;
        }
        tooltip
          .attr("x", xPos)
          .attr("y", yPos);
      })
      .on("mouseout", function (event) {
        tooltip.style("opacity", 0);
      });
    
    // Add the legend
    appendLegend(svg, categories, z, width, height, margin);

      // Add a source footer
      svg.append("text")
      .attr("x", -10)
      .attr("y", height+40) 
      .attr("text-anchor", "start") 
      .attr("font-family", "Arial, sans-serif") 
      .attr("font-size", "10px")  
      .attr("fill", "#999") 
      .text("Source: USDA Economic Research Service");
  }

  document.addEventListener("DOMContentLoaded", function() {
    let observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                createPercentageStackedBarChart("#bar-container", exampleData);
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px', threshold: 0.1 });

    let barContainer = document.getElementById('bar-container');
    observer.observe(barContainer);
});