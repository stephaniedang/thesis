/* global d3 */

// Sankey Function
function createSankeyChart(selector, data) {
  const width = 960;
  const height = 595;

  const svg = d3.select(selector)
    .append('svg')
    .attr('width', width)
    .attr('height', height);

  const sankey = d3.sankey()
    .nodeId(d => d.name)
    .nodeAlign(d3.sankeyJustify)
    .nodeWidth(15)
    .nodePadding(20)
    .extent([[1, 1], [width - 1, height - 56]]);

  const {nodes, links} = sankey(data);

  const totalValue = nodes.reduce((total, node) => total + node.value, 0);

  sankey(data);

  let link = svg.append('g')
    .attr('class', 'links')
    .attr('fill', 'none')
    .attr('stroke', '#dad7cd')
    .selectAll('path');

  const node = svg.append('g')
    .attr('class', 'nodes')
    .attr('font-family', 'sans-serif')
    .attr('font-size', 14)
    .selectAll('g');

  const group = node.data(nodes)
    .join('g')
    .attr('transform', d => `translate(${d.x0},${d.y0})`);

  group.append('rect')
    .attr('width', d => d.x1 - d.x0)
    .attr('height', d => 0)
    .attr('fill', d => d3.interpolateViridis(Math.random()))
    .transition() 
    .duration(800)
    .delay((d, i) => i * 50)
    .attr('height', d => d.y1 - d.y0);

  const labels = group.append('text')
    .attr('x', d => d.targetLinks.length > 0 ? -6 : d.x1 - d.x0 + 6)
    .attr('y', d => (d.y1 - d.y0) / 2)
    .attr('dy', '0.35em')
    .attr('text-anchor', d => d.targetLinks.length > 0 ? 'end' : 'start')
    .attr('fill', '#000')
    .text(d => `${d.name} (${Math.round(d.value*2 / totalValue * 100)}%)`)
    .style('visibility', 'hidden')
    .style('opacity', 0)
    .classed('text-label', true); 

  link = link.data(links)
    .join('path')
    .attr('d', d3.sankeyLinkHorizontal())
    .attr('stroke-width', d => Math.max(1, d.width))
    .attr('stroke-opacity', 0);

  link.transition()
    .duration(800)
    .delay(800) 
    .attr('stroke-opacity', 0.5)
    .end()
    .then(() => {
      labels.transition()
        .duration(800)
        .style('visibility', 'visible')
        .style('opacity', 1);  
    });

  svg.append("text")
    .attr("x", 10)  
    .attr("y", height - 10) 
    .attr("text-anchor", "start")  
    .attr("font-family", "Arial, sans-serif")  
    .attr("font-size", "10px") 
    .attr("fill", "#999")  
    .text("Source: Our World in Data"); 
}

document.addEventListener("DOMContentLoaded", function() {
let observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
      if(entry.isIntersecting) {
          d3.csv("data/agriculture_ghg.csv", ({ "Emission Food Group": group, "Emission Food Subgroup": subgroup, Value: value }) => {
              return { group, subgroup, value: parseFloat(value) / 100 };
            }).then(parsedData => {
              const nodes = Array.from(new Set(parsedData.flatMap(d => [d.group, d.subgroup])))
              .map(name => ({ name }));

              const links = parsedData.map(({ group, subgroup, value }) => ({
                source: group,
                target: subgroup,
                value
              }));
          
              const sankeyData = { nodes, links };
          
              createSankeyChart('#sankey-container', sankeyData);
            });
          observer.unobserve(entry.target);
      }
  });
}, { rootMargin: '0px', threshold: 0.1 });

let sankeyContainer = document.getElementById('sankey-container');
observer.observe(sankeyContainer);
});
