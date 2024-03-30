/* global d3 */

// Treemap Function
function createTreemap(selector) {
    const margin = { top: 10, right: 10, bottom: 50, left: 10 };
    const width = 900 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    const data = {
        "name": "root",
        "children": [
            { "name": "🐮", "category": "Animal Feed", "value": 37 },
            { "name": "⛽️", "category": "Fuel", "value": 35 },
            { "name": "📦", "category": "Exports", "value": 18 },
            { "name": "🌽", "category": "Food", "value": 10 }
        ]
    };

    const svg = d3.select(selector)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // color scale
    const color = d3.scaleOrdinal()
        .domain(data.children.map(d => d.name))
        .range(["#ADAC33", "#F3DCAF", "#FBC107", "#893302"]);

    // treemap layout
    const treemap = d3.treemap()
        .size([width, height])
        .padding(2);

    const root = d3.hierarchy(data)
        .sum(d => d.value)
        .sort((a, b) => b.height - a.height || b.value - a.value);

    treemap(root);

    // osition treemap nodes
    const nodes = svg.selectAll(".node")
        .data(root.leaves())
        .enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x0},${d.y0})`)
        .on("mouseover", (event, d) => {
            const [x, y] = d3.pointer(event, svg.node());
            tooltip
                .attr("x", x)
                .attr("y", y - 50)
                .style("opacity", 1);
            tooltipDiv.html(`<strong>Category:</strong> ${d.data.category}<br/><strong>Value:</strong> ${d.data.value}%`);
        })
        .on("mousemove", (event) => {
            const [x, y] = d3.pointer(event, svg.node());
            const tooltipWidth = 200; 
            const tooltipHeight = 50;

            let xPos = x;
            let yPos = y - tooltipHeight;

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
        .on("mouseout", (event) => {
            tooltip.style("opacity", 0);
        });

    nodes.append("rect")
        .attr("width", 0)
        .attr("height", 0)
        .attr("fill", d => color(d.data.name))
        .transition()
        .duration(900)
        .delay((d, i) => i * 900)
        .attr("width", d => d.x1 - d.x0)
        .attr("height", d => d.y1 - d.y0);

    // add emoji labels to nodes based on the value and scale to the node size
    nodes.each(function (d, i) {
        const node = d3.select(this);
        const width = d.x1 - d.x0;
        const height = d.y1 - d.y0;

        const aspectRatio = width / height;
        const emojisPerRow = Math.ceil(Math.sqrt(d.data.value * aspectRatio));
        const numRows = Math.ceil(d.data.value / emojisPerRow);

        const fontSize = Math.min(width / emojisPerRow, height / numRows) * 0.9;
        const xOffset = (width - emojisPerRow * fontSize) / 2;
        const yOffset = (height - numRows * fontSize) / 2;

        for (let j = 0; j < d.data.value; j++) {
            node.append("text")
                .attr("x", xOffset + (j % emojisPerRow) * fontSize)
                .attr("y", yOffset + fontSize + Math.floor(j / emojisPerRow) * fontSize)
                .attr("font-size", fontSize)
                .style("opacity", 0)
                .text(d.data.name)
                .transition()
                .delay(i * 900 + 900) 
                .duration(900)
                .style("opacity", 1);
        }
    });

    // tooltip
    const tooltip = svg.append("foreignObject")
        .attr("class", "tooltip")
        .attr("width", 200)
        .attr("height", 70)
        .style("opacity", 0);

    const tooltipDiv = tooltip.append("xhtml:div")
        .attr("class", "tooltip-inner");

    // footer
    svg.append("text")
    .attr("x", 13)  
    .attr("y", height+10) 
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
                createTreemap("#treemap-container");
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px', threshold: 0.1 });

    let treemapContainer = document.getElementById('treemap-container');
    observer.observe(treemapContainer);
});