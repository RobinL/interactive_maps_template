L.mapbox.accessToken = 'pk.eyJ1Ijoicm9iaW5saW5hY3JlIiwiYSI6IjAwYTg3MDAwNmFlZTk3MDlhNGIxY2VjNDk5Yjk4NWE1In0.DWAN8Om-9kOnwVTQIiDGaw';
    map = L.mapbox.map('map', 'mapbox.light')
    map.setView([53,0],7)
    url = '';

// These deferreds are used when we have a proper web server.
// var p1 = $.ajax("data/uk.json")
// var p2 = $.ajax("data/data_template.csv")


var p3 = jQuery.Deferred();
map.on('ready', function(d) {p3.resolve( "hurray" )})
 
 
// Wait for all data to be loaded, and for the map to be ready, and then draw the map
// $.when(p1, p2,p3).done(function(uk_clip_data, csvdata, x) {
    
//     var uk_clip_data = uk_clip_data[0]
//     var points_data = d3.csv.parse(csvdata[0])
//     voronoi_map(map, uk_clip_data, points_data)

// })


$.when(p3).done(function(x) {
    
    var uk_clip_data = uk
    var points_data = points
    voronoi_map(map, uk_clip_data, points_data)

})

function voronoi_map(map,uk_clip_data, csvdata) {


    var points = csvdata, //Stores all the points for the current metrics
        filteredPoints = [],  //Stores the points within the current map bounds (at current zoom level)
        uk = uk_clip_data, //Stores data for clipping mask
        listOfMetrics, //Store the different metrics (metric_1, metric_2 etc)
        lastSelectedPoint,  //So the tooltip 'remembers' where we were when we leave the map area
        plotDataField,  //Which metric?
        colour_scales_dict = {};


    var voronoi = d3.geom.voronoi()
        .x(function(d) {
            return d.x;
        })
        .y(function(d) {
            return d.y;
        });

    var update_hover_panel = function() {
        d3.selectAll('.selected').classed('selected', false);

        var cell = d3.select(this),
            point = cell.datum();

        lastSelectedPoint = point;
        cell.classed('selected', true);

        var format = column_descriptions_data[$("#shadingOptions").val()]["format"]

        var template_dict = {
            name: point.name,
            metric_1: format(point.metric_1),
            metric_2: format(point.metric_2),
            metric_3: format(point.metric_3),

        };

        var source = $("#view_location_info").html();
        var template = Handlebars.compile(source);
        var html = template(template_dict);
        d3.select('#selected')
            .html(html)
    }


    var draw_map_key_continuous = function() {

        var key_position_top = 200
        var key_position_left = 70
        var key_height = 300

        var bounds = map.getBounds(),
            topLeft = map.latLngToLayerPoint(bounds.getNorthWest()),
            bottomRight = map.latLngToLayerPoint(bounds.getSouthEast()),
            existing = d3.set(),
            drawLimit = bounds.pad(0.4);

        var num_steps = 50;


        var map_colour_scale = colour_scales_dict["#keyOptions"]  ;

        var axis_scale = d3.scale.linear().domain(colour_scales_dict["#keyOptions"]   .domain()).range([key_height, key_height / 2, 0])

        var inverted_scale = axis_scale.invert;

        var svg = d3.select(map.getPanes().overlayPane).append("svg")
            .attr('id', 'map_key')
            .attr("class", "leaflet-zoom-hide")
            .style("width", map.getSize().x + 'px')
            .style("height", map.getSize().y + 'px')
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
            .attr("height", (key_height / num_steps) * 1.0)
            .attr("fill", function(d) {
                return map_colour_scale(inverted_scale(d))
            })

        var yAxis = d3.svg.axis()
            .scale(axis_scale)
            .orient("left")
            .ticks(10, ",0.2s")
            .tickSize(-10, 0)
            .tickFormat(column_descriptions_data[$("#keyOptions").val()]["format"])

        svg.append("g")
            .attr("transform", "translate(" + key_position_left + "," + key_position_top + ")")
            .attr("class", "y axis")
            .call(yAxis)

        svg.append("g")
            .attr("transform", "translate(90," + key_position_top + ") rotate(90)")
            .append("text")
            .text(function(d) {
                return column_descriptions_data[$("#keyOptions").val()]["long_name"]
            })
            .style("font-weight", "bold")
            .style("font-size", "12px")

        svg.append("g").attr("transform", "translate(" + (key_position_left -30)+ "," + (key_position_top - 10) + ")")
            .append("text")
            .text("Key:")
            .style("font-weight", "bold")
            .style("font-size", "12px")
    }


    var getListOfMetrics = function() {

        var keys = _.filter(_.keys(points[0]), function(d) {
            return !_.contains(["name","lng", "lat"], d)
        })

        return keys
    }



    var setColourScale = function() {


        // Compute the highest and lowest values of the metric
    
        colourScaleOption = d3.select("#colourOptions").node().value

         

        _.each(["#shadingOptions", "#pointShadingOptions", "#pointSizeOptions", "#keyOptions"], function(d) {
            metric = d3.select(d).node().value

            var thisFieldData = points.map(function(thisData) {
                return parseFloat(thisData[metric]);
            });

            minMetric = Math.min.apply(null, thisFieldData);
            maxMetric = Math.max.apply(null, thisFieldData);
            var mid = (maxMetric + minMetric) / 2;

             // Need to lookup the scale 
            if (column_descriptions_data[metric]["domain"] == null) {
                var domain = [minMetric, mid, maxMetric]
            } else {
                domain = column_descriptions_data[metric]["domain"]
            }

            if (metric != "none") {
            colour_scales_dict[d] = d3.scale.linear()
            .domain(domain)
            .range(colourOptions[colourScaleOption]);
        } else {
            colour_scales_dict[d] = d3.scale.linear()
            .domain([0,0,0])
            .range(["#000","#000","#000"]);

        }

        })

        colour_scales_dict["#pointSizeOptions"].range([1,3,10])




    

    }

    var drawMetricSelection = function() {

        _.each(["#shadingOptions", "#pointShadingOptions", "#pointSizeOptions", "#keyOptions"], function(selector) {
        d3.select(selector).selectAll('option')
            .data(["none"].concat(listOfMetrics))
            .enter()
            .append("option")
            .attr("value", function(d) {
                return d
            })
            .text(function(d) {
                return column_descriptions_data[d].long_name
            })

        d3.select(selector).on("change", function(d) {
            drawWithLoading()
        })

    })
    
    // First option
    $("#shadingOptions").val(listOfMetrics[0]);
    $("#keyOptions").val(listOfMetrics[0]);

    }

    var drawColourSelection = function() {

        var data = _.keys(colourOptions)
        d3.select("#colourOptions").selectAll('option')
            .data(data)
            .enter()
            .append("option")
            .attr("value", function(d) {
                return d
            })
            .text(function(d) {
                return d
            })

        d3.select("#colourOptions").on("change", function(d) {
            drawWithLoading()
        })

    }


    var drawWithLoading = function(e) {
        d3.select('#loading').classed('visible', true);
        if (e && e.type == 'viewreset') {
            d3.select('#overlay').remove();
        }

        setTimeout(function() {
            draw();
            d3.select('#loading').classed('visible', false);
        }, 0);
    }

    var get_options = function() {
        plotDataField = d3.select("#shadingOptions").node().value;
        colourScaleOption = d3.select("#colourOptions").node().value;
    }

    var draw = function() {

        d3.select('#overlay').remove();
        d3.select('#map_key').remove();

        d3.select('#selected')
            .html("<h1>Hover over voronoi areas to display statistics</h1>")

        get_options()


        var bounds = map.getBounds(),
            topLeft = map.latLngToLayerPoint(bounds.getNorthWest()),
            bottomRight = map.latLngToLayerPoint(bounds.getSouthEast()),
            existing = d3.set(),
            drawLimit = bounds.pad(0.4);

        filteredPoints = points.filter(function(d) {
            var latlng = new L.LatLng(d.lat, d.lng);

            if (!drawLimit.contains(latlng)) {
                return false
            };

            var point = map.latLngToLayerPoint(latlng);

            key = point.toString();
            if (existing.has(key)) {
                return false
            };
            existing.add(key);


            d.x = point.x;
            d.y = point.y;
            return true;
        });

        setColourScale();

        var svg = d3.select(map.getPanes().overlayPane).append("svg")

        voronoi(filteredPoints).forEach(function(d) {
            d.point.cell = d;
        });

        var svg = d3.select(map.getPanes().overlayPane).append("svg")
            .attr('id', 'overlay')
            .attr("class", "leaflet-zoom-hide")
            .style("width", map.getSize().x + 'px')
            .style("height", map.getSize().y + 'px')
            .style("margin-left", topLeft.x + "px")
            .style("margin-top", topLeft.y + "px");

        var g = svg.append("g")
            .attr("transform", "translate(" + (-topLeft.x) + "," + (-topLeft.y) + ")");

        var svgPoints = g.attr("class", "voronoi_areas")
            .selectAll("g")
            .data(filteredPoints)
            .enter().append("g")
            .attr("class", "point");

        var buildPathFromPoint = function(point) {
            return "M" + point.cell.join("L") + "Z";
        }

        plotDataField = d3.select("#shadingOptions").node().value

        svgPoints.append("path")
            .attr("class", "point-cell")
            .attr("d", buildPathFromPoint)
            .style("fill", function(d) {
                return colour_scales_dict["#shadingOptions"]  (d[plotDataField])
            })
            .style("fill-opacity", function(d){
                 if (d3.select("#shadingOptions").node().value == "none") {
                    return 0.1
                 } else {
                    return 0.7
                 }
            })
            .style("stroke-opacity", function(d){
                 if (d3.select("#shadingOptions").node().value == "none") {
                    return 0.1
                 } else {
                    return 0.7
                 }
            })
            .on('mouseover', update_hover_panel)
            .classed("selected", function(d) {
                return lastSelectedPoint == d
            });

        g.attr("clip-path", "url(#EWClipPath)")

        var vor_points = svg.append("g")
            .selectAll("g .voronoi_points")
            .data(filteredPoints)
            .enter().append("g")
            .attr("class", "point")
            .attr("transform", "translate(" + (-topLeft.x) + "," + (-topLeft.y) + ")");

        vor_points.append("circle")
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            })
            .style('fill', function(d) {

                var metric = d3.select("#pointShadingOptions").node().value 
                if (metric == "none") {
                    return "#000"
                 } else {
                    return colour_scales_dict["#pointShadingOptions"](d[metric])
                 }
            })
            .attr("r", function(d) {

                var metric = d3.select("#pointSizeOptions").node().value 
                if (metric == "none") {
                    var pointsize = d3.select("#shadingOptions").node().value 
                    if (pointsize == "none") {
                        return 4
                     } else {
                        return 2
                     }
                 } else {
                    return colour_scales_dict["#pointSizeOptions"](d[metric])
                 }

            })
            .attr("fill-opacity", function(d) {

                var metric = d3.select("#pointSizeOptions").node().value 
                if (metric == "none") {
                    return 1
                 } else {
                    return 0.4
                 }

            })
            ;

        vor_points.append("text")
            .attr("class", "place-label")
            .attr("text-anchor", "middle")
            .attr("transform", function(d) {
                return "translate(10,10)";
            })
            .attr("dy", ".35em")
            .text(function(d) {
                return d.name;
            })
       



        draw_map_key_continuous()
        

        //*******************
        //Draw clipping mask
        //*******************
 

        var allCountries = topojson.object(uk, uk.objects.subunits);
        allCountries.geometries = [allCountries.geometries[0], allCountries.geometries[4], allCountries.geometries[3]]  //England, Wales and Scotland

        function projectPoint(x, y) {
            var point = map.latLngToLayerPoint(new L.LatLng(y, x));
            this.stream.point(point.x, point.y);
        }
        var transform = d3.geo.transform({
            point: projectPoint
        })

        var path = d3.geo.path().projection(transform);

        g.append("svg:clipPath")
            .attr("id", "EWClipPath")
            .append("svg:path")
            .datum(allCountries)
            .attr("d", path);

        
    }

    var mapLayer = {
        onAdd: function(map) {
            map.on('viewreset moveend', drawWithLoading);
            drawWithLoading();
        }
    };

  
    listOfMetrics = getListOfMetrics(points)
    drawMetricSelection();
    drawColourSelection();
    setColourScale();
    map.addLayer(mapLayer);
}
