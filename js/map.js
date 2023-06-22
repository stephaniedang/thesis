/* global d3 */

// Corn Map Function

let geojsonData;  // Define geojsonData variable

// Preload the data
d3.json("data/states.json").then(data => {
    geojsonData = data;
    createUSMap(geojsonData);  // Create the map right away
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
    .attr("x", 10)  // Position it in the middle of the SVG width
    .attr("y", height)  // Position it near the bottom of the SVG height
    .attr("text-anchor", "start")  // Align the text to the middle
    .attr("font-family", "Arial, sans-serif")  // Choose a font
    .attr("font-size", "10px")  // Choose a font size
    .attr("fill", "#999")  // Choose a text color
    .text("Source: National Centers for Environmental Information");  // The text to display

}

function colorCornBelt() {
    // Change the color of the Corn Belt states
    d3.selectAll(".corn-belt")
        .transition()
        .duration(1500)
        .attr("fill", "#87986a");
}

document.addEventListener("DOMContentLoaded", function() {
    // Setup IntersectionObserver
    let observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // If the element is in the viewport, start the animation
            if(entry.isIntersecting) {
                colorCornBelt();  // Color the Corn Belt when intersection is observed
                // Stop observing once the animation has started
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px', threshold: 0.1 });

    // Observe the chart container
    let mapContainer = document.getElementById('map-container');
    observer.observe(mapContainer);
});
