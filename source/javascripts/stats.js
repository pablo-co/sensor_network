var statsCalculators = {
  average_degree: calculateAverageDegree,
  edges: calculateNumOfEdges,
  degreeDist: degreeDistribution,
  minDegree: calculateMinDegree,
  maxDegree: calculateMaxDegree
};

function calculateColors(graph) {
  var colors = {};
  for (var i = 0; i < graph.nodes.length; i++) {
    var color = graph.nodes[i].color;
    colors[color] = 1;
  }
  return Object.keys(colors).length;
}

function calculateMaxColorSize(graph) {
  return getLargestColors(graph)[0][1];
}

function calculateNumOfEdges(graph) {
  var sum = 0;
  for (var i = 0; i < graph.nodes.length; ++i) {
    sum += graph.nodes[i].edges.length;
  }
  return sum / 2;
}

function calculateAverageDegree(graph) {
  var sum = 0;
  for (var i = 0; i < graph.nodes.length; ++i) {
    sum += graph.nodes[i].edges.length;
  }
  return sum / graph.nodes.length;
}

function degreeDistribution(graph) {
  var dist = [];
  for (var i = 0; i < graph.nodes.length; ++i) {
    dist.push([graph.nodes[i].edges.length, 1]);
  }
  return dist;
}

function colorDistribution(graph) {
  var dist = [];
  for (var i = 0; i < graph.nodes.length; ++i) {
    dist.push([graph.nodes[i].color, 1]);
  }
  return dist;
}

function calculateMinDegree(graph) {
  var min = graph.nodes[0].edges.length;
  for (var i = 1; i < graph.nodes.length; ++i) {
    if (graph.nodes[i].edges.length < min) {
      min = graph.nodes[i].edges.length;
    }
  }
  return min;
}

function calculateMaxDegree(graph) {
  var max = graph.nodes[0].edges.length;
  for (var i = 1; i < graph.nodes.length; ++i) {
    if (graph.nodes[i].edges.length > max) {
      max = graph.nodes[i].edges.length;
    }
  }
  return max ;
}

function calculateMaxDeletedDegree(ordering) {
  var max = 0;
  for (var i = 0; i < ordering.newDegrees.length; i++) {
    if (ordering.newDegrees[i] > max) {
      max = ordering.newDegrees[i];
    }
  }
  return max;
}



function addStats(graph) {
  for (var key in statsCalculators) {
    if (!graph[key]) {
      graph[key] = statsCalculators[key](graph);
    }
  }
}
