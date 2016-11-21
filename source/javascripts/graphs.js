function range(n) {
  Array.apply(null, Array(n)).map(function (_, i) { return toString(i); });
}

function histogram(data, step) {
  var histo = {},
    x,
    i,
    arr = [];

  for (i = 0; i < data.length; i++) {
    x = Math.floor(data[i][0] / step) * step;
    if (!histo[x]) {
      histo[x] = 0;
    }
    histo[x]++;
  }

  for (x in histo) {
    if (histo.hasOwnProperty((x))) {
      arr.push([parseFloat(x), histo[x]]);
    }
  }

  arr.sort(function (a, b) {
    return a[0] - b[0];
  });

  return arr;
}

function generateGraphs(graph) {
  $('#graph-stats').highcharts({
    chart: {
      type: 'column'
    },
    title: {
      text: 'Degree Distribution'
    },
    xAxis: {
      gridLineWidth: 1
    },
    yAxis: [{
      title: {
        text: 'Count'
      }
    }],
    series: [{
      name: 'Histogram',
      type: 'column',
      data: histogram(graph.degreeDist, 1),
      pointPadding: 0,
      groupPadding: 0,
      pointPlacement: 'between'
    }]
  });
}

function generateColorGraph(graph) {
  var hist = histogram(graph.colorDist, 1);
  var categories = [];
  for (var i = 0; i < hist.length; i++) {
    categories.push(hist[i][0]);
  }

  var values = [];
  for (var i = 0; i < hist.length; i++) {
    values.push(hist[i][1]);
  }

  $('#color-graph').highcharts({
    chart: {
      type: 'column'
    },
    title: {
      text: 'Color classes'
    },
    xAxis: {
      categories: range(hist.length - 1)
    },
    yAxis: [{
      title: {
        text: 'Count'
      }
    }],
    series: [{
      name: 'Color classes',
      type: 'column',
      data: values,
      pointPadding: 0,
      groupPadding: 0,
      pointPlacement: 'between'
    }]
  });
}

function orderingCategories(ordering) {
  var values = [];
  for (var i = 0; i < ordering.oldDegress; i++) {
    values.push(i);
  }
  return values;
}

function generateDegreeGraph(ordering) {
  $(function () {
    $('#ordering-graph').highcharts({
      chart: {
        zoomType: 'x'
      },
      title: {
        text: 'Node Degrees'
      },
      xAxis: {
        categories: orderingCategories(ordering)
      },
      yAxis: {
        title: {
          text: 'Degree'
        }
      },
      tooltip: {
        shared: true,
        valueSuffix: ' units'
      },
      credits: {
        enabled: false
      },
      plotOptions: {
        area: {
          fillColor: {
            linearGradient: {
              x1: 0,
              y1: 0,
              x2: 0,
              y2: 1
            },
            stops: [
              [0, Highcharts.getOptions().colors[0]],
              [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
            ]
          },
          marker: {
            radius: 2
          },
          lineWidth: 1,
          states: {
            hover: {
              lineWidth: 1
            }
          },
          threshold: null
        }
      },
      series: [{
        type: 'area',
        name: 'Original',
        data: ordering.oldDegrees
      }, {
        type: 'area',
        name: 'When deleted',
        data: ordering.newDegrees
      }]
    });
  });
}

function buildVisualGraph(graph, visualGraph, nodeColor, edgeColor) {
  var visualNodes = [];
  for (var i = 0; i < graph.nodes.length; ++i) {
    var node = graph.nodes[i];
    var visualNode = G.node([node.z, node.x, node.y], {color: nodeColor(node)});
    node.visualNode = visualNode;
    visualNodes.push(visualNode);
  }
  visualGraph.addNodes(visualNodes);

  var visualEdges = [];
  for (var i = 0; i < graph.nodes.length; ++i) {
    var node = graph.nodes[i];
    for (var j = 0; j < node.edges.length; ++j) {
      var otherIndex = node.edges[j];
      if (otherIndex > i) {
        var otherNode = graph.nodes[otherIndex];
        visualEdges.push(
          G.edge([
            node.visualNode,
            otherNode.visualNode
          ], {color: edgeColor}));
      }
    }
  }
  visualGraph.addEdges(visualEdges);
}
