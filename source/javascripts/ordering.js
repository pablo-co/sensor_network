function build_degree_map(graph) {
  var degree_map = {};
  var max = -1;
  for (var i = 0; i < graph.nodes.length; ++i) {
    var degree = graph.nodes[i].edges.length
    degree_map[degree] = [];
    if (degree > max) {
      max = degree;
    }
  }

  for (var i = 0; i < max; ++i) {
    if (!degree_map[i]) {
      degree_map[i] = [];
    }
  }

  for (var i = 0; i < graph.nodes.length; ++i) {
    degree_map[graph.nodes[i].edges.length].push(graph.nodes[i]);
  }
  return degree_map;
}

function remove_node_from_edges(edges, node) {
  var index = edges.indexOf(node.id);
  edges.splice(index, 1);
}

function update_degree_map_from_node(degree_map, node) {
  var degree = node.edges.length;
  degree_map[degree].push(node);
  remove_from_map(degree_map, node, degree + 1);
}

function remove_from_map(degree_map, node, degree) {
  var index = objectIndex(degree_map[degree], node);
  degree_map[degree].splice(index, 1)[0];
}

function objectIndex(arr, o) {
  for (var i = 0; i < arr.length; i++) {
    if (arr[i].id == o.id) {
      return i;
    }
  }
  return -1;
}

function update_node_neighbors(graph, degree_map, node) {
  var nodeDegree = node.edges.length;
  for (var i = 0; i < nodeDegree; ++i) {
    var otherIndex = node.edges[i];
    var otherNode = graph.nodes[otherIndex];
    remove_node_from_edges(otherNode.edges, node);
    update_degree_map_from_node(degree_map, otherNode);
  }
  node.edges = [];
  return node;
}

function smallest_last_ordering(graph) {
  var copy = jQuery.extend(true, {}, graph);
  var degree_map = build_degree_map(copy);

  var smallest_last = [];
  var oldDegrees = [];
  var newDegrees = [];
  var nodesCount = graph.nodes.length;

  for (var i = 0; i < graph.nodes.length; ++i) {
    oldDegrees[i] = graph.nodes[i].edges.length;
    newDegrees[i] = 0;
  }

  for (var i = 0; i <= graph.maxDegree; i++) {
    var inserted = degree_map[i].length > 0;
    var amount = i;

    while (degree_map[i].length > 0) {
      checkClique(graph, nodesCount--, i);
      var node = degree_map[i].shift();
      smallest_last.push(node.id);
      newDegrees[node.id] = node.edges.length;
      update_node_neighbors(copy, degree_map, node);
      amount--;
    }

    if (i > 0 && inserted) {
      i = Math.max(0, amount) - 1;
    }
  }

  return {smallest_last: smallest_last.reverse(), oldDegrees: oldDegrees, newDegrees: newDegrees};
}

function checkClique(graph, nodesCount, i) {
  if (nodesCount == i + 1 && !graph.clique) {
    graph.clique = nodesCount;
  }
}
