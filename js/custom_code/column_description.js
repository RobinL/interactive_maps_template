column_descriptions_data = {
    "metric_1": {
        "long_name": "My metric 1",
        "format": d3.format(",.1%")
    },
    "metric_2": {},
    "metric 5": {
        "long_name": "My metric 5"
    },

}

var colourOptions = {
    "Red (high) to green (low)": ["#6AE817", "#FFD52D", "#B30409"],
    "Green (high) to red (low)": ["#B30409", "#FFD52D", "#6AE817"],
    "Blues": ["#A9BCD3", "#3C81B9", "#27298B"],
    "Greens": ["#3AFF17", "#00660F", "#000000"],
    "Greys": ["#D2EAEE", "#738F95", "#2B333C"],
    "Red and blue": ["#810303", "#542460", "#177CF7"],
};


// {
//     "metric_3": {
//         "long_name": "My metric 3",
//         "format": d3.format(",.1%"),
//         "domain": [0, 0.5, 1] //If you want to explicitly set the domain you can use this}
//         "is_categorical": true //This will be autodetected but you can set it explicitly if you need to
//         "manually_included" : false //This will be autodetected - covers whether a column is included by user in column description data
//         "colour_option": "Red (high) to green (low)"
//     }


// Idea will be to inc
function process_column_descriptions() {

    // Add any keys which are in the data but aren't in column_descriptions_data
    _.each(points[0], function(d, k) {
        if (!(_.has(column_descriptions_data, k))) {
            column_descriptions_data[k] = {
                "manually_included": false
            }
        } else {
            column_descriptions_data[k]["manually_included"] = true
        }

    })

    column_descriptions_data["none"] = {"manually_included" : false,
                                        "long_name": "None"}


    // If they don't have a long name, overwrite with the key
    _.each(column_descriptions_data, function(d, k) {
        if (!(_.has(d, "long_name"))) {
            d["long_name"] = k
        }
    });

    _.each(column_descriptions_data, function(d, k) {
        if (!(_.has(d, "colour_option"))) {
            d["colour_option"] = _.keys(colourOptions)[0]
        }
    })

    _.each(column_descriptions_data, function(d, k) {
        d["key"] = k
    })


    // Detect whether variables are categorical or continuous
    // Iterate through the columns which will be part of this vis
    _.each(column_descriptions_data, function(d, k) {
        if (!(_.has(d, "is_categorical"))) {
            // Look through data - if we can parsefloat every value then we call it numeric otherwise categorical
            var numeric = _.some(points, function(d2) {
                this_value = d2[k];

                if (this_value !== "") {
                    var pf = parseFloat(this_value)

                    if (isNaN(pf)) {
                        return false
                    }
                }
                return true

            })
            column_descriptions_data[k]["is_categorical"] = !numeric
        }
    })

    // Set format if not exists
    // If they don't have a long name, overwrite with the key
    _.each(column_descriptions_data, function(d, k) {
        if (!(_.has(d, "format"))) {
            if (d["is_categorical"]) {
                d["format"] = function(d) {
                    return d
                }

            } else {
                d["format"] = d3.format(",.1f")
            }
        }
    })





}



process_column_descriptions()



function numerical_to_float() {

    _.each(points, function(d) {
        _.each(column_descriptions_data, function(d2, k2) {
            if (!(d2["is_categorical"])) {
                d[k2] = parseFloat(d[k2])
            }
        })
    })

}

numerical_to_float()

// Finally get rid of rows which don't have lat lng

function filter_out_invalid_coordinates() {
    points = _.filter(points, function(d){
        if (isNaN(d["lat"])) {
            return false
        }
        if (isNaN(d["lng"])) {
            return false
        }
        return true


    })
}

filter_out_invalid_coordinates()

var colours = ["#777","#dc3912","#ff9900","#0E8917","#990099","#0099c6","#dd4477","#A6FF3C","#FF3F42","#1C3C5D","#D860DA"];
        
function set_domains() {

    _.each(column_descriptions_data, function(d1,k1) {

        // For each columns, set the domain

        // If categorical, get uniques

        if (d1["is_categorical"]) {

            var uniques = _.uniq(points, function(item, key) {
                a = item[k1]
                return item[k1]
            })

            uniques = _.map(uniques, function(d) {
                return d[k1]
            })

            d1["domain"] = uniques
            d1["colour_scale"] = d3.scale.ordinal().domain(uniques).range(colours)
        }

        // If numeric, get min max

        if (!(d1["is_categorical"])) {
            
            var all_values = _.map(points, function(d) {
                return d[k1]
            });

            
            var minMetric = Math.min.apply(null, all_values);
            var maxMetric = Math.max.apply(null, all_values);

            // Need to split min to max depending on how many items in colour scale

            // get colour scale 

            var c_options = colourOptions[d1["colour_option"]]

            var num_colours = c_options.length
            var diff = maxMetric - minMetric

            domain = d3.range(minMetric, maxMetric+diff/100, diff/(c_options.length -1))

            d1["colour_scale"] = d3.scale.linear()
                . domain(domain)
                .range(c_options);

            d1["domain"] = [minMetric, maxMetric]

        }

     

    })
     

}

set_domains()


// d3.scale.ordinal().domain(["a","b","c","d"]).range(["a","b"])

