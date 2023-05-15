/* global d3 */

// Line Chart

async function loadDataAndCreateLineChart(selector, url) {
    try {
        const rawData = await d3.csv(url);

        const data = rawData.map(d => ({
            year: parseInt(d.year, 10),
            beef: +d.beef,
            corn: +d.corn
        }));

        // Format data
        const data1 = data.map(d => ({
            year: new Date(d.year, 0),
            value: d.beef
        }));

        const data2 = data.map(d => ({
            year: new Date(d.year, 0),
            value: d.corn
        }));

        createLineChart(selector, data1, data2);
    } catch (error) {
        console.error("Error loading data:", error);
    }
}

function createLineChart(selector, data1, data2) {
    // SVG dimensions
    const width = 1000+50;
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 60, left: 50 };

    // Create scales
    const xScale = d3.scaleTime()
        .domain([
            d3.min([...data1, ...data2], d => d.year),
            d3.max([...data1, ...data2], d => d.year)
        ])
        .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
        .domain([
            0,
            d3.max([...data1, ...data2], d => d.value)
        ]).nice()
        .range([height - margin.bottom, margin.top]);

    // Create line generators
    const line1 = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.value));

    const line2 = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.value));

    // Create SVG
    const svg = d3.select(selector)
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const clipPath1 = svg.append("clipPath")
        .attr("id", "clip1")
        .append("rect")
        .attr("x", margin.left)
        .attr("y", margin.top)
        .attr("height", height - margin.top - margin.bottom)
        .attr("width", 0);

    const clipPath2 = svg.append("clipPath")
        .attr("id", "clip2")
        .append("rect")
        .attr("x", margin.left)
        .attr("y", margin.top)
        .attr("height", height - margin.top - margin.bottom)
        .attr("width", 0);
        
    // Add lines
    const linePath1 = svg.append("path")
        .datum(data1)
        .attr("fill", "none")
        .attr("stroke", "#1976d2")
        .attr("stroke-width", 2)
        .attr("d", line1)
        .attr("clip-path", "url(#clip1)");

    const linePath2 = svg.append("path")
        .datum(data2)
        .attr("fill", "none")
        .attr("stroke", "#797521")
        .attr("stroke-width", 2)
        .attr("d", line2)
        .attr("clip-path", "url(#clip2)");


    // Add axes
    const xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale).ticks(10).tickFormat(d3.timeFormat("%Y")))
        .style("font-size", "14px"); 

    const yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).tickFormat(d3.format("$.2f")))
        .style("font-size", "14px"); 

    svg.append("g").call(xAxis);
    svg.append("g").call(yAxis);

    // Add SVG image point markers
    const imageSize = 40;
    const imageUrl1 = "images/cownelius.svg";
    const imageUrl2 = "images/cornelius.svg";
    const padding = 4;
    const totalSize = imageSize + 2 * padding;
    
    // Create image patterns
    svg.append("defs")
        .append("pattern")
        .attr("id", "imagePattern1")
        .attr("width", 1)
        .attr("height", 1)
        .attr("patternUnits", "objectBoundingBox")
        .append("image")
        .attr("href", imageUrl1)
        .attr("width", totalSize)
        .attr("height", totalSize)
        .attr("x", -padding)
        .attr("y", -padding);

    svg.append("defs")
        .append("pattern")
        .attr("id", "imagePattern2")
        .attr("width", 1)
        .attr("height", 1)
        .attr("patternUnits", "objectBoundingBox")
        .append("image")
        .attr("href", imageUrl2)
        .attr("width", totalSize)
        .attr("height", totalSize)
        .attr("x", -padding)
        .attr("y", -padding);

    // Add point markers with SVG images and animate them
    const totalTime = 8000; // 8 seconds
    
    function animateMarker(marker, data, linePath, clipPath, totalTime) {
        // Get total length of the path
        const totalLength = linePath.node().getTotalLength();
    
        // Transition for the marker
        const markerTransition = d3.transition()
            .duration(totalTime)
            .ease(d3.easeCubicInOut);
    
        // Animate marker along the path
        marker.transition(markerTransition)
            .attrTween('transform', function() {
                return function(t) {
                    const p = linePath.node().getPointAtLength(t * totalLength);
                    return `translate(${p.x - imageSize / 2},${p.y - imageSize / 2})`;
                };
            });
    
        // Animate clip path rectangle
        clipPath.transition()
            .duration(totalTime)
            .attrTween('width', function() {
                return function(t) {
                    return (width - margin.left - margin.right) * t;
                };
            });
    
        // Animate line
        linePath.attr('stroke-dasharray', `0,${totalLength}`)
            .transition()
            .duration(totalTime)
            .ease(d3.easeCubicInOut) // Use the same easing function for the line
            .attr('stroke-dasharray', `${totalLength},0`);
    }
    
    const marker1 = svg.append("image")
        .attr("class", "point-marker1")
        .attr("href", imageUrl1)
        .attr("width", imageSize)
        .attr("height", imageSize);
    
    animateMarker(marker1, data1, linePath1, clipPath1, totalTime);
    
    const marker2 = svg.append("image")
        .attr("class", "point-marker2")
        .attr("href", imageUrl2)
        .attr("width", imageSize)
        .attr("height", imageSize);
    
    animateMarker(marker2, data2, linePath2, clipPath2, totalTime);

    // Add a source footer
    svg.append("text")
    .attr("x", 10)  // Position it 10 units from the left edge of the SVG
    .attr("y", height - 10)  // Position it 10 units from the bottom edge of the SVG
    .attr("text-anchor", "start")  // Align the text to the start (left)
    .attr("font-family", "Arial, sans-serif")  // Choose a font
    .attr("font-size", "10px")  // Choose a font size
    .attr("fill", "#999")  // Choose a text color
    .text("Source: USDA Economic Research Service, Federal Reserve Economic Data St. Louis Fed");  // The text to display
    
};

document.addEventListener("DOMContentLoaded", function() {
    // Setup IntersectionObserver
    let observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // If the element is in the viewport, start the animation
            if(entry.isIntersecting) {
                loadDataAndCreateLineChart('#chart-container', 'data/corn_beef_price_yoy.csv');
                // Stop observing once the animation has started
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px', threshold: 0.1 });

    // Observe the chart container
    let chartContainer = document.getElementById('chart-container');
    observer.observe(chartContainer);
});

// Usage: call the createLineChart function with a CSS selector for the container element
// loadDataAndCreateLineChart('#chart-container', 'data/corn_beef_price_yoy.csv');