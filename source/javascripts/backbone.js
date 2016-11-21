function buildBackbones(graph) {
  var colors = getLargestColors(graph);

  var vertices = [];
  for (var i = 0; i < colors.length; i++) {
    vertices.push(buildColorList(graph, colors[i][0]));
  }

  var crossProduct = buildCrossProduct(vertices);

  var graphs = [];
  for (var i = 0; i < crossProduct.length; i++) {
    var newGraph = buildGraph(graph, crossProduct[i]);
    var largestSubGraph = getLargestSubGraph(newGraph);
    largestSubGraph["edges"] = calculateNumOfEdges(largestSubGraph);
    graphs.push(largestSubGraph);
  }

  graphs.sort(function(a, b) {
    if (a.edges == b.edges) {
    return a.nodes.length < b.nodes.length ? -1 : (a.nodes.length > b.nodes.length ? 1 : 0);
    } else {
      return a.edges < b.edges ? -1 : (a.edges > b.edges ? 1 : 0);
    }
  });

  graphs.reverse();

  return graphs.splice(0, 2);
}

function buildGraph(graph, vertices) {
  var newGraph = {
    sensors: graph.sensors,
    radius: graph.radius,
    type: graph.type,
    nodes: $.extend(true, [], vertices)
  };
  return operationTypes[newGraph.type].builder.build(newGraph);
}

function getLargestSubGraph(graph) {
  var bestSubGraph = {edgeCount: -1};
  for (var i = 0; i < graph.nodes.length; i++) {
    if (!graph.nodes[i].visited) {
      var subGraph = getSubGraph(graph, graph.nodes[i]);
      if (subGraph.edgeCount > bestSubGraph.edgeCount) {
        bestSubGraph = subGraph;
      }
    }
  }
  if (bestSubGraph.nodes) {
    return buildGraph(graph, bestSubGraph.nodes);
  } else {
    return {nodes: []};
  }
}

function getSubGraph(graph, start) {
  var stack = [];
  var nodes = [];
  var edgeCount = 0;
  stack.push(start);
  start.visited = true;
  while (stack.length) {
    var node = stack.pop();
    var copy = $.extend({}, node);
    copy.edges = null;
    copy.visualNode = null;
    nodes.push(copy);
    for (var i = 0; i < node.edges.length; i++) {
      var otherNode = graph.nodes[node.edges[i]];
      if (!otherNode.visited) {
        otherNode.visited = true;
        stack.push(otherNode);
        edgeCount += otherNode.edges.length;
      }
    }
  }
  return {nodes: nodes, edgeCount: edgeCount};
}

function buildColorList(graph, color) {
  var nodes = [];
  for (var i = 0; i < graph.nodes.length; i++) {
    if (graph.nodes[i].color == color) {
      var copy = $.extend(true, {}, graph.nodes[i]);
      copy.edges = null;
      copy.visualNode = null;
      nodes.push(copy);
    }
  }
  return nodes;
}

function buildCrossProduct(vertices) {
  var product = [];
  for (var i = 0; i < vertices.length; i++) {
    for (var j = i + 1; j < vertices.length; j++) {
      product.push(vertices[i].concat(vertices[j]));
    }
  }
  return product;
}

function getLargestColors(graph) {
  var colors = {};
  for (var i = 0; i < graph.nodes.length; i++) {
    var color = graph.nodes[i].color;
    if (colors[color]) {
      colors[color]++;
    } else {
      colors[color] = 1;
    }
  }

  var tuples = [];

  for (var key in colors) tuples.push([key, colors[key]]);

  tuples.sort(function(a, b) {
    a = a[1];
    b = b[1];
    return a < b ? -1 : (a > b ? 1 : 0);
  });

  tuples.reverse();

  return tuples.splice(0, 4);
}
