var squareGenerator = {
  generate: function(graph) {
    graph.nodes = [];
    for (var i = 0; i < graph.sensors; ++i) {
      graph.nodes.push(this.generateNumber());
    }
    return graph;
  },
  generateNumber: function() {
    return {x: Math.random(), y: Math.random(), z: 0, edges: []};
  }
};

var diskGenerator = {
  generate: function(graph) {
    graph.nodes = [];
    for (var i = 0; i < graph.sensors; ++i) {
      graph.nodes.push(this.generateNumber());
    }
    return graph;
  },
  generateNumber: function() {
    var angle = Math.random() * 2 * Math.PI;
    var radius = Math.sqrt(Math.random());
    return {x: radius * Math.cos(angle), y: radius * Math.sin(angle), z: 0, edges: []};
  }
};

var sphereGenerator = {
  generate: function(graph) {
    graph.nodes = [];
    for (var i = 0; i < graph.sensors; ++i) {
      graph.nodes.push(this.generateNumber());
    }
    return graph;
  },
  generateNumber: function() {
    var u = Math.random() * 2 - 1;
    var angle = Math.random() * 2 * Math.PI;
    var x = Math.sqrt(1 - Math.pow(u, 2)) * Math.cos(angle);
    var y = Math.sqrt(1 - Math.pow(u, 2)) * Math.sin(angle);
    return {x: x, y: y, z: u, edges: []};
  }
};

var squareBuilder = {
  build: function(graph) {
    graph.nodes.sort(this.compare);
    var points = graph.nodes;
    for (var i = 0; i < points.length; ++i) {
      graph.nodes[i].edges = [];
    }

    for (var i = 0; i < points.length; ++i) {
      var j = i + 1;
      while (j < points.length && points[j].x - points[i].x <= graph.radius) {
        if (this.inRange(points[i], points[j], graph.radius)) {
          graph.nodes[i].edges.push(j);
          graph.nodes[j].edges.push(i);
        }
        ++j;
      }
    }
    return graph;
  },
  compare: function(a, b) {
    if (a.x < b.x)
      return -1;
    if (a.x > b.x)
      return 1;
    return 0;
  },
  inRange: function(pointA, pointB, radius) {
    return Math.sqrt(
      Math.pow(pointB.x - pointA.x, 2) +
        Math.pow(pointB.y - pointA.y, 2) +
        Math.pow(pointB.z - pointA.z, 2)
    ) < radius;
  }
};

var diskBuilder = squareBuilder;
var sphereBuilder = squareBuilder;

var operationTypes = {
  "square": {
    generator: squareGenerator,
    builder: squareBuilder
  },
  "disk": {
    generator: diskGenerator,
    builder: diskBuilder
  },
  "sphere": {
    generator: sphereGenerator,
    builder: sphereBuilder
  }
};

function addIds(graph) {
  for (var i = 0; i < graph.nodes.length; i++) {
    graph.nodes[i]["id"] = i;
  }
}
