function TimeSeriesChart(holder, series_name, data) {



    // Need to get the x and y domains of the series
    var y_data = _.map(data, function(d) {
        return d[series_name]
    })
    var x_data = _.map(data, function(d) {
        return d[VMT.filter_field]
    })
    ymax = _.max(y_data, function(d) {
        return d
    })
    ymin = _.min(y_data, function(d) {
        return d
    })
    ymax = ymax * 1.05
    ymin = ymin * 0.95

    xmax = _.max(x_data, function(d) {
        return d
    })
    xmin = _.min(x_data, function(d) {
        return d
    })


    var margin = {
            top: 40,
            right: 20,
            bottom: 40,
            left: 50
        },
        width = 350 - margin.left - margin.right,
        height = 130 - margin.top - margin.bottom;

    var formatDate = d3.time.format("%d-%b-%y");

    var x = d3.time.scale()
        .domain([xmin, xmax])
        .range([0, width])
        .nice();

    var y = d3.scale.linear()
        .domain([ymin, ymax])
        .range([height, 0])
        .nice();

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(5)

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient("left")
        .ticks(3)
        .tickFormat(VMT.column_descriptions_data[series_name].format)

    var line = d3.svg.line()
        .x(function(d) {
            return x(d.date);
        })
        .y(function(d) {
            return y(d[series_name]);
        })
        .defined(function(d) { return !isNaN(d[series_name]); });

    var svg = holder.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)


    svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line)
        .attr("stroke", "steelblue")


    svg.append("text")
        .text(VMT.column_descriptions_data[series_name].long_name)
        .attr("y", -10)
        .attr("x", 150)
        .attr("class", "title")
        .attr("text-anchor","middle")

    // Finally get the current selected month and plot a marker on the chart with the current data point

    var filter_value = $("#filter_records_date_field").val();
    var filter_format = VMT.column_descriptions_data[VMT.filter_field].format

    var this_date = filter_format.parse(filter_value)

    svg.append("line")
        .attr("x1",x(this_date))
        .attr("x2",x(this_date))
        .attr("y1",height+5)
        .attr("y2",0)
        .style("stroke", "red")

    var this_data = _.filter(data, function(d) {
        return filter_format(this_date) == filter_format(d[VMT.filter_field])
    })
    
    var var_format = VMT.column_descriptions_data[series_name].format
    svg.append("text")
        .text(filter_format(this_date) + ": " + var_format(this_data[0][series_name]))
        .attr("y", height +30)
        .attr("x", x(this_date))
        .attr("text-anchor","middle")
        .attr("fill", "red")





}