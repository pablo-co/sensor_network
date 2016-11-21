function colorMinMaxDegreeNodes(graph) {
  var hist = histogram(graph.degreeDist, 1);
  var min = hist[0][0];
  var max = hist[hist.length - 1][0];


  var maxNodes = [];

  for (var i = 0; i < graph.nodes.length; ++i) {
    var node = graph.nodes[i];
    if (node.edges.length == max) {
      colorNeighbors(graph, node, "blue");
      maxNodes.push(node);
    } else if (node.edges.length == min) {
      colorNeighbors(graph, node, "goldenrod");
      node.visualNode.setColor("lime");
    }
  }

  for (var i = 0; i < maxNodes.length; ++i) {
    maxNodes[i].visualNode.setColor("red");
  }
}

function colorNeighbors(graph, node, color) {
  for (var i = 0; i < node.edges.length; ++i) {
    var otherNodeIndex = node.edges[i];
    var otherNode = graph.nodes[otherNodeIndex];
    otherNode.visualNode.setColor(color);
  }
}

function generateFromGraph(graph, visualGraph) {
  operationTypes[graph.type].generator.generate(graph);
  operationTypes[graph.type].builder.build(graph);
  addIds(graph);
  addStats(graph);
  var ordering = smallest_last_ordering(graph);
  colorGraph(graph, ordering.smallest_last);
  graph["colorDist"] = colorDistribution(graph);
  graph["maxDeletedDegree"] = calculateMaxDeletedDegree(ordering);
  graph["colors"] = calculateColors(graph);
  graph["maxColorSize"] = calculateMaxColorSize(graph);
  var backbones = buildBackbones(graph);

  for (var i = 0; i < backbones.length; ++i) {
    addStats(backbones[i]);
  }

  generateGraphs(graph);
  generateDegreeGraph(ordering);
  generateColorGraph(graph);


  displayGraph(graph, visualGraph, function(node) { return "azure" });
  colorMinMaxDegreeNodes(graph);
  return backbones;
}

function displayGraph(graph, visualGraph, nodeColor) {
  visualGraph.purgeNodes();
  visualGraph.purgeEdges();

  visualGraph.disableAutoRender();
  buildVisualGraph(graph, visualGraph, nodeColor, "cadetblue");
  visualGraph.enableAutoRender();
}
