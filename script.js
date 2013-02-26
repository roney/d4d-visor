    var width = 900,
    height = 600;

    color = d3.scale.linear()
    .range(["#FDE0DD", "#49006A"])
    .domain([0, 1700]);

    var projection = d3.geo.mercator()
    .center([7.1317, 5.5230])
    .translate([width / 2, height / 2])
    .rotate([9, -0.75])
    .scale(20000);

    var path = d3.geo.path()
    .projection(projection);

    var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

    var day_text = svg.append("text")
    .attr("class", "day")
    .attr("transform", "translate(460, 200)")
    .text("sunday");

    var hour_text = svg.append("text")
    .attr("class", "hour")
    .attr("transform", "translate(460, 260)")
    .text("0:00h");

    queue()
    .defer(d3.json, "ivory.geojson")
    .defer(d3.csv, "https://raw.github.com/yarox/d4d-visor/master/data/weights0_0.csv?login=yarox&token=4fbb133fa73e368d7ed54b2e2e558f74")
    .await(ready);

    function ready(error, ivory, weights) {
        svg.append("g")
        .attr("class", "counties")
        .selectAll("path")
        .data(ivory.features)
        .enter().append("path")
        .attr("d", path)

        redraw(error, weights);
    }

    function redraw(error, weights) {
        var rateById = {};

        weights.forEach(function(d) { rateById[d.id] = +d.weight; });

        svg.selectAll("path")
        .transition()
        .duration(750)
        .attr("fill", function(d) { return color(rateById[d.id] || 1); });
    }

    var days = {0: "sunday", 1: "monday", 2: "tuesday", 3: "wednesday",
    4: "thursday", 5: "friday", 6: "saturday"}
    var hour = 0;
    var day = 0;

    window.focus();
    d3.select(window).on("keydown", function() {
        switch (d3.event.keyCode) {
          case 37: hour = Math.max(0, hour - 1); break;
          case 39: hour = Math.min(23, hour + 1); break;
          case 38: day = Math.max(0, day - 1); break;
          case 40: day = Math.min(6, day + 1); break;
      }
      update();

      function update() {
        hour_text
        .transition()
        .text(hour+":00h");

        day_text
        .transition()
        .text(days[day]);

        queue()
        .defer(d3.csv, "data/weights" + day + "_" + hour + ".csv")
        .await(redraw);
    }

});
