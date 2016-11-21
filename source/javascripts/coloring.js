function colorNode(graph, node, colors) {
  var bitField = new BitField32(node.edges.length);
  for (var i = 0; i < node.edges.length; i++) {
    var nodeIndex = node.edges[i];
    var otherNode = graph.nodes[nodeIndex];
    if (otherNode.id != node.id && otherNode.color != null) {
      bitField.set(otherNode.color);
    }
  }

  var actualColor = 1;
  while (bitField.get(actualColor)) {
    actualColor = actualColor + 1;
  }

  node.color = actualColor;
}

function colorGraph(graph, vertices) {
  for (var i = 0; i < vertices.length; ++i) {
    colorNode(graph, graph.nodes[vertices[i]], colors);
  }
}
