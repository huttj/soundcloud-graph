(function () {

  const dim = 25;
  const offset = dim / 2;

  let svg, color, simulation, node, link;

  window.Graph = {
    loadData,
    render
  };

  function render() {
    svg = d3.select("svg"),
      width = +svg.attr("width"),
      height = +svg.attr("height");

    color = d3.scaleOrdinal(d3.schemeCategory20);

    simulation = d3.forceSimulation()
      // .force("link", d3.forceLink().id(d => d.id))
      .force("link", d3.forceLink().distance(()=>dim*2))
      .force("charge", d3.forceManyBody(d => -dim*10000))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .on("tick", ticked);
  }

  function strength(link) {
    return 1 / Math.min(count(link.source), count(link.target));
  }

  function count(node) {
    let total = 0;
    const id = node.id;

    link && link.forEach(other => {
      if (other.source.id === id || other.target.id === id) total++;
    });

    return total;
  }

  function loadData({ nodes=[], links=[] }) {

    simulation.nodes([]);
    simulation.force("link").links([]);

    svg.selectAll("*").remove();

    link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(links)
      .enter().append("line")
      .attr("stroke-width", function (d) {
        return Math.sqrt(d.value);
      });

    node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("image")
      .data(nodes)
      .enter()

      // .append("circle")
      // .attr("r", 5)
      // .attr("fill", function (d) {
      //   return color(d.group);
      // })
      .append("svg:image")
      .attr('class', 'song')
      .attr("width", dim)
      .attr("height", dim)
      .attr("xlink:href", d => {
        console.log(d);
        return d.image;
      })

      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    node.append("title")
      .text(d => d.id);

    simulation.nodes(nodes);
    simulation.force("link").links(links);

  }

  function ticked() {
    link && link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node && node
      .attr("x", d => d.x - offset)
      .attr("y", d => d.y - offset);
  }

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

}());