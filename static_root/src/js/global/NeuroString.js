var diameter = 360;
var tree = d3.layout
  .tree()
  .size([360, diameter / 2 - 80])
  .separation(function(a, b) {
    return (a.parent == b.parent ? 1 : 2) / a.depth;
  });

var diagonal = d3.svg.diagonal.radial().projection(function(d) {
  return [d.y, d.x / 180 * Math.PI];
});

var svg = d3
  .select("#rt_colors")
  .append("svg")
  .attr("width", diameter)
  .attr("height", diameter - 15)
  .style('margin-top','-5px')
  .append("g")
  .attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

d3.json("flare.json", function(error, root) {
  function getData() {
    return {
      name: "",
      color: "#00897b",
      children: [
        {
          name: "",
          color: "#f44336",
          children: [
            {
              name: "50",
              color: "#ffebee"
            },
            {
              name: "100",
              color: "#ffcdd2"
            },
            {
              name: "200",
              color: "#ef9a9a"
            },
            {
              name: "300",
              color: "#e57373"
            },
            {
              name: "400",
              color: "#ef5350"
            },
            {
              name: "500",
              color: "#f44336"
            },
            {
              name: "600",
              color: "#e53935"
            },
            {
              name: "700",
              color: "#d32f2f"
            },
            {
              name: "800",
              color: "#c62828"
            },
            {
              name: "900",
              color: "#b71c1c"
            },
            {
              name: "A100",
              color: "#ff8a80"
            },
            {
              name: "A200",
              color: "#ff5252"
            },
            {
              name: "A400",
              color: "#ff1744"
            },
            {
              name: "A700",
              color: "#d50000"
            }
          ]
        },
        {
          name: "",
          color: "#e91e63",
          children: [
            {
              name: "50",
              color: "#fce4ec"
            },
            {
              name: "100",
              color: "#f8bbd0"
            },
            {
              name: "200",
              color: "#f48fb1"
            },
            {
              name: "300",
              color: "#f06292"
            },
            {
              name: "400",
              color: "#ec407a"
            },
            {
              name: "500",
              color: "#e91e63"
            },
            {
              name: "600",
              color: "#d81b60"
            },
            {
              name: "700",
              color: "#c2185b"
            },
            {
              name: "800",
              color: "#ad1457"
            },
            {
              name: "900",
              color: "#880e4f"
            },
            {
              name: "A100",
              color: "#ff80ab"
            },
            {
              name: "A200",
              color: "#ff4081"
            },
            {
              name: "A400",
              color: "#f50057"
            },
            {
              name: "A700",
              color: "#c51162"
            }
          ]
        },
        {
          name: "",
          color: "#9c27b0",
          children: [
            {
              name: "50",
              color: "#f3e5f5"
            },
            {
              name: "100",
              color: "#e1bee7"
            },
            {
              name: "200",
              color: "#ce93d8"
            },
            {
              name: "300",
              color: "#ba68c8"
            },
            {
              name: "400",
              color: "#ab47bc"
            },
            {
              name: "500",
              color: "#9c27b0"
            },
            {
              name: "600",
              color: "#8e24aa"
            },
            {
              name: "700",
              color: "#7b1fa2"
            },
            {
              name: "800",
              color: "#6a1b9a"
            },
            {
              name: "900",
              color: "#4a148c"
            },
            {
              name: "A100",
              color: "#ea80fc"
            },
            {
              name: "A200",
              color: "#e040fb"
            },
            {
              name: "A400",
              color: "#d500f9"
            },
            {
              name: "A700",
              color: "#aa00ff"
            }
          ]
        },
        {
          name: "",
          color: "#673ab7",
          children: [
            {
              name: "50",
              color: "#ede7f6"
            },
            {
              name: "100",
              color: "#d1c4e9"
            },
            {
              name: "200",
              color: "#b39ddb"
            },
            {
              name: "300",
              color: "#9575cd"
            },
            {
              name: "400",
              color: "#7e57c2"
            },
            {
              name: "500",
              color: "#673ab7"
            },
            {
              name: "600",
              color: "#5e35b1"
            },
            {
              name: "700",
              color: "#512da8"
            },
            {
              name: "800",
              color: "#4527a0"
            },
            {
              name: "900",
              color: "#311b92"
            },
            {
              name: "A100",
              color: "#b388ff"
            },
            {
              name: "A200",
              color: "#7c4dff"
            },
            {
              name: "A400",
              color: "#651fff"
            },
            {
              name: "A700",
              color: "#6200ea"
            }
          ]
        },
        {
          name: "",
          color: "#3f51b5",
          children: [
            {
              name: "50",
              color: "#e8eaf6"
            },
            {
              name: "100",
              color: "#c5cae9"
            },
            {
              name: "200",
              color: "#9fa8da"
            },
            {
              name: "300",
              color: "#7986cb"
            },
            {
              name: "400",
              color: "#5c6bc0"
            },
            {
              name: "500",
              color: "#3f51b5"
            },
            {
              name: "600",
              color: "#3949ab"
            },
            {
              name: "700",
              color: "#303f9f"
            },
            {
              name: "800",
              color: "#283593"
            },
            {
              name: "900",
              color: "#1a237e"
            },
            {
              name: "A100",
              color: "#8c9eff"
            },
            {
              name: "A200",
              color: "#536dfe"
            },
            {
              name: "A400",
              color: "#3d5afe"
            },
            {
              name: "A700",
              color: "#304ffe"
            }
          ]
        },
        {
          name: "",
          color: "#2196f3",
          children: [
            {
              name: "50",
              color: "#e3f2fd"
            },
            {
              name: "100",
              color: "#bbdefb"
            },
            {
              name: "200",
              color: "#90caf9"
            },
            {
              name: "300",
              color: "#64b5f6"
            },
            {
              name: "400",
              color: "#42a5f5"
            },
            {
              name: "500",
              color: "#2196f3"
            },
            {
              name: "600",
              color: "#1e88e5"
            },
            {
              name: "700",
              color: "#1976d2"
            },
            {
              name: "800",
              color: "#1565c0"
            },
            {
              name: "900",
              color: "#0d47a1"
            },
            {
              name: "A100",
              color: "#82b1ff"
            },
            {
              name: "A200",
              color: "#448aff"
            },
            {
              name: "A400",
              color: "#2979ff"
            },
            {
              name: "A700",
              color: "#2962ff"
            }
          ]
        },
        {
          name: "",
          color: "#03a9f4",
          children: [
            {
              name: "50",
              color: "#e1f5fe"
            },
            {
              name: "100",
              color: "#b3e5fc"
            },
            {
              name: "200",
              color: "#81d4fa"
            },
            {
              name: "300",
              color: "#4fc3f7"
            },
            {
              name: "400",
              color: "#29b6f6"
            },
            {
              name: "500",
              color: "#03a9f4"
            },
            {
              name: "600",
              color: "#039be5"
            },
            {
              name: "700",
              color: "#0288d1"
            },
            {
              name: "800",
              color: "#0277bd"
            },
            {
              name: "900",
              color: "#01579b"
            },
            {
              name: "A100",
              color: "#80d8ff"
            },
            {
              name: "A200",
              color: "#40c4ff"
            },
            {
              name: "A400",
              color: "#00b0ff"
            },
            {
              name: "A700",
              color: "#0091ea"
            }
          ]
        },
        {
          name: "",
          color: "#00bcd4",
          children: [
            {
              name: "50",
              color: "#e0f7fa"
            },
            {
              name: "100",
              color: "#b2ebf2"
            },
            {
              name: "200",
              color: "#80deea"
            },
            {
              name: "300",
              color: "#4dd0e1"
            },
            {
              name: "400",
              color: "#26c6da"
            },
            {
              name: "500",
              color: "#00bcd4"
            },
            {
              name: "600",
              color: "#00acc1"
            },
            {
              name: "700",
              color: "#0097a7"
            },
            {
              name: "800",
              color: "#00838f"
            },
            {
              name: "900",
              color: "#006064"
            },
            {
              name: "A100",
              color: "#84ffff"
            },
            {
              name: "A200",
              color: "#18ffff"
            },
            {
              name: "A400",
              color: "#00e5ff"
            },
            {
              name: "A700",
              color: "#00b8d4"
            }
          ]
        },
        {
          name: "",
          color: "#009688",
          children: [
            {
              name: "50",
              color: "#e0f2f1"
            },
            {
              name: "100",
              color: "#b2dfdb"
            },
            {
              name: "200",
              color: "#80cbc4"
            },
            {
              name: "300",
              color: "#4db6ac"
            },
            {
              name: "400",
              color: "#26a69a"
            },
            {
              name: "500",
              color: "#009688"
            },
            {
              name: "600",
              color: "#00897b"
            },
            {
              name: "700",
              color: "#00796b"
            },
            {
              name: "800",
              color: "#00695c"
            },
            {
              name: "900",
              color: "#004d40"
            },
            {
              name: "A100",
              color: "#a7ffeb"
            },
            {
              name: "A200",
              color: "#64ffda"
            },
            {
              name: "A400",
              color: "#1de9b6"
            },
            {
              name: "A700",
              color: "#00bfa5"
            }
          ]
        },
        {
          name: "",
          color: "#4caf50",
          children: [
            {
              name: "50",
              color: "#e8f5e9"
            },
            {
              name: "100",
              color: "#c8e6c9"
            },
            {
              name: "200",
              color: "#a5d6a7"
            },
            {
              name: "300",
              color: "#81c784"
            },
            {
              name: "400",
              color: "#66bb6a"
            },
            {
              name: "500",
              color: "#4caf50"
            },
            {
              name: "600",
              color: "#43a047"
            },
            {
              name: "700",
              color: "#388e3c"
            },
            {
              name: "800",
              color: "#2e7d32"
            },
            {
              name: "900",
              color: "#1b5e20"
            },
            {
              name: "A100",
              color: "#b9f6ca"
            },
            {
              name: "A200",
              color: "#69f0ae"
            },
            {
              name: "A400",
              color: "#00e676"
            },
            {
              name: "A700",
              color: "#00c853"
            }
          ]
        },
        {
          name: "",
          color: "#8bc34a",
          children: [
            {
              name: "50",
              color: "#f1f8e9"
            },
            {
              name: "100",
              color: "#dcedc8"
            },
            {
              name: "200",
              color: "#c5e1a5"
            },
            {
              name: "300",
              color: "#aed581"
            },
            {
              name: "400",
              color: "#9ccc65"
            },
            {
              name: "500",
              color: "#8bc34a"
            },
            {
              name: "600",
              color: "#7cb342"
            },
            {
              name: "700",
              color: "#689f38"
            },
            {
              name: "800",
              color: "#558b2f"
            },
            {
              name: "900",
              color: "#33691e"
            },
            {
              name: "A100",
              color: "#ccff90"
            },
            {
              name: "A200",
              color: "#b2ff59"
            },
            {
              name: "A400",
              color: "#76ff03"
            },
            {
              name: "A700",
              color: "#64dd17"
            }
          ]
        },
        {
          name: "",
          color: "#cddc39",
          children: [
            {
              name: "50",
              color: "#f9fbe7"
            },
            {
              name: "100",
              color: "#f0f4c3"
            },
            {
              name: "200",
              color: "#e6ee9c"
            },
            {
              name: "300",
              color: "#dce775"
            },
            {
              name: "400",
              color: "#d4e157"
            },
            {
              name: "500",
              color: "#cddc39"
            },
            {
              name: "600",
              color: "#c0ca33"
            },
            {
              name: "700",
              color: "#afb42b"
            },
            {
              name: "800",
              color: "#9e9d24"
            },
            {
              name: "900",
              color: "#827717"
            },
            {
              name: "A100",
              color: "#f4ff81"
            },
            {
              name: "A200",
              color: "#eeff41"
            },
            {
              name: "A400",
              color: "#c6ff00"
            },
            {
              name: "A700",
              color: "#aeea00"
            }
          ]
        },
        {
          name: "",
          color: "#ffeb3b",
          children: [
            {
              name: "50",
              color: "#fffde7"
            },
            {
              name: "100",
              color: "#fff9c4"
            },
            {
              name: "200",
              color: "#fff59d"
            },
            {
              name: "300",
              color: "#fff176"
            },
            {
              name: "400",
              color: "#ffee58"
            },
            {
              name: "500",
              color: "#ffeb3b"
            },
            {
              name: "600",
              color: "#fdd835"
            },
            {
              name: "700",
              color: "#fbc02d"
            },
            {
              name: "800",
              color: "#f9a825"
            },
            {
              name: "900",
              color: "#f57f17"
            },
            {
              name: "A100",
              color: "#ffff8d"
            },
            {
              name: "A200",
              color: "#ffff00"
            },
            {
              name: "A400",
              color: "#ffea00"
            },
            {
              name: "A700",
              color: "#ffd600"
            }
          ]
        },
        {
          name: "",
          color: "#ffc107",
          children: [
            {
              name: "50",
              color: "#fff8e1"
            },
            {
              name: "100",
              color: "#ffecb3"
            },
            {
              name: "200",
              color: "#ffe082"
            },
            {
              name: "300",
              color: "#ffd54f"
            },
            {
              name: "400",
              color: "#ffca28"
            },
            {
              name: "500",
              color: "#ffc107"
            },
            {
              name: "600",
              color: "#ffb300"
            },
            {
              name: "700",
              color: "#ffa000"
            },
            {
              name: "800",
              color: "#ff8f00"
            },
            {
              name: "900",
              color: "#ff6f00"
            },
            {
              name: "A100",
              color: "#ffe57f"
            },
            {
              name: "A200",
              color: "#ffd740"
            },
            {
              name: "A400",
              color: "#ffc400"
            },
            {
              name: "A700",
              color: "#ffab00"
            }
          ]
        },
        {
          name: "",
          color: "#ff9800",
          children: [
            {
              name: "50",
              color: "#fff3e0"
            },
            {
              name: "100",
              color: "#ffe0b2"
            },
            {
              name: "200",
              color: "#ffcc80"
            },
            {
              name: "300",
              color: "#ffb74d"
            },
            {
              name: "400",
              color: "#ffa726"
            },
            {
              name: "500",
              color: "#ff9800"
            },
            {
              name: "600",
              color: "#fb8c00"
            },
            {
              name: "700",
              color: "#f57c00"
            },
            {
              name: "800",
              color: "#ef6c00"
            },
            {
              name: "900",
              color: "#e65100"
            },
            {
              name: "A100",
              color: "#ffd180"
            },
            {
              name: "A200",
              color: "#ffab40"
            },
            {
              name: "A400",
              color: "#ff9100"
            },
            {
              name: "A700",
              color: "#ff6d00"
            }
          ]
        },
        {
          name: "",
          color: "#ff5722",
          children: [
            {
              name: "50",
              color: "#fbe9e7"
            },
            {
              name: "100",
              color: "#ffccbc"
            },
            {
              name: "200",
              color: "#ffab91"
            },
            {
              name: "300",
              color: "#ff8a65"
            },
            {
              name: "400",
              color: "#ff7043"
            },
            {
              name: "500",
              color: "#ff5722"
            },
            {
              name: "600",
              color: "#f4511e"
            },
            {
              name: "700",
              color: "#e64a19"
            },
            {
              name: "800",
              color: "#d84315"
            },
            {
              name: "900",
              color: "#bf360c"
            },
            {
              name: "A100",
              color: "#ff9e80"
            },
            {
              name: "A200",
              color: "#ff6e40"
            },
            {
              name: "A400",
              color: "#ff3d00"
            },
            {
              name: "A700",
              color: "#dd2c00"
            }
          ]
        },
        {
          name: "",
          color: "#795548",
          children: [
            {
              name: "50",
              color: "#efebe9"
            },
            {
              name: "100",
              color: "#d7ccc8"
            },
            {
              name: "200",
              color: "#bcaaa4"
            },
            {
              name: "300",
              color: "#a1887f"
            },
            {
              name: "400",
              color: "#8d6e63"
            },
            {
              name: "500",
              color: "#795548"
            },
            {
              name: "600",
              color: "#6d4c41"
            },
            {
              name: "700",
              color: "#5d4037"
            },
            {
              name: "800",
              color: "#4e342e"
            },
            {
              name: "900",
              color: "#3e2723"
            }
          ]
        },
        {
          name: "",
          color: "#9e9e9e",
          children: [
            {
              name: "50",
              color: "#fafafa"
            },
            {
              name: "100",
              color: "#f5f5f5"
            },
            {
              name: "200",
              color: "#eeeeee"
            },
            {
              name: "300",
              color: "#e0e0e0"
            },
            {
              name: "400",
              color: "#bdbdbd"
            },
            {
              name: "500",
              color: "#9e9e9e"
            },
            {
              name: "600",
              color: "#757575"
            },
            {
              name: "700",
              color: "#616161"
            },
            {
              name: "800",
              color: "#424242"
            },
            {
              name: "900",
              color: "#212121"
            }
          ]
        },
        {
          name: "",
          color: "#607d8b",
          children: [
            {
              name: "50",
              color: "#eceff1"
            },
            {
              name: "100",
              color: "#cfd8dc"
            },
            {
              name: "200",
              color: "#b0bec5"
            },
            {
              name: "300",
              color: "#90a4ae"
            },
            {
              name: "400",
              color: "#78909c"
            },
            {
              name: "500",
              color: "#607d8b"
            },
            {
              name: "600",
              color: "#546e7a"
            },
            {
              name: "700",
              color: "#455a64"
            },
            {
              name: "800",
              color: "#37474f"
            },
            {
              name: "900",
              color: "#263238"
            }
          ]
        }
      ]
    };
  }
  var myData = getData();
  root = myData;
  var nodes = tree.nodes(root), links = tree.links(nodes);

  var link = svg
    .selectAll(".link-string")
    .data(links)
    .enter()
    .append("path")
    .attr("class", "link")
    .style("stroke", function(d) {
      return d.target.color;
    })
    .attr("d", diagonal);

  var node = svg
    .selectAll(".node-string")
    .data(nodes)
    .enter()
    .append("g")
    .attr("class", "node")
    .style("stroke", function(d) {
      return d.color;
    })
    .attr("transform", function(d) {
      return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
    });

  node
    .append("circle")
    .attr("r", 4.5)
    .style("fill", function(d) {
      return d.color;
    })
    .style("stroke", function(d) {
      return d.color;
    })
    .style("fill-opacity", "0.7")
    .style("stroke-opacity", "0.4");

  node
    .append("text")
    .attr("dy", ".31em")
    .attr("text-anchor", function(d) {
      return d.x < 180 ? "start" : "end";
    })
    .attr("transform", function(d) {
      return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)";
    })
    .text(function(d) {
      return d.name;
    })
    .style('font-size','.67rem')
    .style('stroke','#ffffff')
    .style('stroke-opacity','0.5')
    .style('fill', function(d){return d.color})
    .style('stroke-width','.81');
});

d3.select(self.frameElement).style("height", diameter - 150 + "px");
