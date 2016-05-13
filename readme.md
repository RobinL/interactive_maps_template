A generic template for creating interactive maps from a simple csv.

To modify for your purposes, you just need to change the following file:

https://github.com/RobinL/interactive_maps_template/blob/master/data/data_template.csv

and change the config file so that it aligns with your column names

https://github.com/RobinL/interactive_maps_template/blob/master/js/custom_code/column_description.js (edited)

and it should ‘just work'

Current code is  set up to run from a shared drive (i.e. without ajax), so you have to convert the csv into json, like this: https://github.com/RobinL/interactive_maps_template/blob/master/data/csv_data.js 

But there’s some code in the main scripts you can uncomment out and make it work from the csv instead if you have a proper web server:

https://github.com/RobinL/interactive_maps_template/blob/master/js/custom_code/voronoi_map.js#L15

Some pics:


![Alt text](/pics/1.png?raw=true "1")
![Alt text](/pics/2.png?raw=true "2")
![Alt text](/pics/3.png?raw=true "3")
