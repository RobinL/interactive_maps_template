column_descriptions_data = {
    "metric_1": {
        "long_name": "My metric 1",
        "format" : d3.format(",.1%")
            },
    "metric_2": {
        "long_name": "My metric 2",
        "format": d3.format(",.1%")
    },
        "metric_3": {
        "long_name": "My metric 3",
        "format": d3.format(",.1%"),
        "domain": [0,0.5,1]  //If you want to explicitly set the domain you can use this
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