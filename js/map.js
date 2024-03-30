/* global d3 */

// Corn Map Function

let geojsonData;

// Preload the data
d3.json("data/states.json").then(data => {
    geojsonData = data;
    createUSMap(geojsonData); 
});

const cornBeltStates = [
    "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Michigan",
    "Minnesota", "Missouri", "Nebraska", "North Dakota", "Ohio",
    "South Dakota", "Wisconsin"
];

function createUSMap(geojson) {
    const width = 960;
    const height = 595;

    const svg = d3.select("#map-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const projection = d3.geoAlbersUsa()
        .scale(1280)
        .translate([width / 2, height / 2]);

    const path = d3.geoPath()
        .projection(projection);

    svg.selectAll("path")
        .data(geojson.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("fill", "#e9ecef")
        .attr("stroke", "#333")
        .attr("class", d => cornBeltStates.includes(d.properties.NAME) ? "corn-belt" : "");

    // Add a source footer
    svg.append("text")
    .attr("x", 10) 
    .attr("y", height) 
    .attr("text-anchor", "start")
    .attr("font-family", "Arial, sans-serif")  
    .attr("font-size", "10px")  
    .attr("fill", "#999") 
    .text("Source: National Centers for Environmental Information");  

}

function colorCornBelt() {
    d3.selectAll(".corn-belt")
        .transition()
        .duration(1500)
        .attr("fill", "#87986a");
}

document.addEventListener("DOMContentLoaded", function() {
    let observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                colorCornBelt();
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px', threshold: 0.1 });

    let mapContainer = document.getElementById('map-container');
    observer.observe(mapContainer);
});
