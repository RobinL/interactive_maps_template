
var draw_map_key_categorical = function() {

    var scale = VMT.column_descriptions_data[$("#keyOptions").val()]["colour_scale"]

    var key_position_top = 200;
    var key_position_left = 70;
    var key_height = 300;

    var bounds = VMT.map.getBounds(),
        topLeft = VMT.map.latLngToLayerPoint(bounds.getNorthWest()),
        bottomRight = VMT.map.latLngToLayerPoint(bounds.getSouthEast()),
        existing = d3.set(),
        drawLimit = bounds.pad(0.4);

    // Need a scale that turns domain into height then just draw rectanges and text
    var axis_scale = d3.scale.ordinal().domain(scale.domain()).rangeBands([scale.domain().length *20, 0])

    var svg = d3.select(VMT.map.getPanes().overlayPane).append("svg")
        .attr('id', 'map_key')
        .attr("class", "leaflet-zoom-hide")
        .style("width", VMT.map.getSize().x + 'px')
        .style("height", VMT.map.getSize().y + 'px')
        .style("margin-left", topLeft.x + "px")
        .style("margin-top", topLeft.y + "px")
        .style("pointer-events", "none");

    var key_elements = svg.append("g")
        .attr("transform", "translate(" + key_position_left + "," + key_position_top + ")")
        .selectAll(".keyrects")
        .data(scale.domain())
        .enter()

    key_elements
        .append("rect")
        .attr("x", 0)
        .attr("y", function(d) {
            return axis_scale(d)
        })
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", function(d) {
            return scale(d)
        })

    key_elements.append("text")
        .text(function(d) {
            return d
        })

    .attr("x", 20)
        .attr("y", function(d) {
            return axis_scale(d) + 10
        })
}


var draw_map_key_continuous = function() {

    var key_position_top = 200
    var key_position_left = 70
    var key_height = 300

    var bounds = VMT.map.getBounds(),
        topLeft = VMT.map.latLngToLayerPoint(bounds.getNorthWest()),
        bottomRight = VMT.map.latLngToLayerPoint(bounds.getSouthEast()),
        existing = d3.set(),
        drawLimit = bounds.pad(0.4);

    var num_steps = 50;

    var map_colour_scale = VMT.column_descriptions_data[$("#keyOptions").val()]["colour_scale"];

    var num_cats = map_colour_scale.domain().length

    var axis_scale = d3.scale.linear().domain(map_colour_scale.domain()).range(d3.range(key_height, -0.001, -key_height / (num_cats - 1)))

    var inverted_scale = axis_scale.invert;

    var svg = d3.select(VMT.map.getPanes().overlayPane).append("svg")
        .attr('id', 'map_key')
        .attr("class", "leaflet-zoom-hide")
        .style("width", VMT.map.getSize().x + 'px')
        .style("height", VMT.map.getSize().y + 'px')
        .style("margin-left", topLeft.x + "px")
        .style("margin-top", topLeft.y + "px")
        .style("pointer-events", "none");

    steps = _.map(d3.range(num_steps), function(i) {
        return i * key_height / num_steps
    })

    svg.append("g")
        .attr("transform", "translate(" + key_position_left + "," + key_position_top + ")")
        .selectAll(".keyrects")
        .data(steps)
        .enter()
        .append("rect")
        .attr("x", 0)
        .attr("y", function(d) {
            return d 
        })
        .attr("width", 10)
        .attr("height", (key_height / num_steps))
        .attr("fill", function(d) {
            return map_colour_scale(inverted_scale(d+(key_height / num_steps)/2))
        })

    var yAxis = d3.svg.axis()
        .scale(axis_scale)
        .orient("left")
        .ticks(10, ",0.2s")
        .tickSize(-10, 0)
        .tickFormat(VMT.column_descriptions_data[$("#keyOptions").val()]["format"])


    svg.append("g")
        .attr("transform", "translate(" + key_position_left + "," + key_position_top + ")")
        .attr("class", "y axis")
        .call(yAxis)

    svg.append("g")
        .attr("transform", "translate(90," + key_position_top + ") rotate(90)")
        .append("text")
        .text(function(d) {
            return VMT.column_descriptions_data[$("#keyOptions").val()]["long_name"]
        })
        .style("font-weight", "bold")
        .style("font-size", "12px")

    svg.append("g").attr("transform", "translate(" + (key_position_left - 30) + "," + (key_position_top - 10) + ")")
        .append("text")
        .text("Key:")
        .style("font-weight", "bold")
        .style("font-size", "12px")
}
