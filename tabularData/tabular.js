function tabular(fileLoc,targetTableEl,sortCol) {
	createGenericTable(fileLoc,targetTableEl,sortCol);
}

/**
 * Called if you have a file location
 * @public
 * 
 * @param {any} fileLoc 
 * @param {any} targetTableEl 
 * @param {any} sortCol 
 */
function createGenericTable(fileLoc,targetTableEl,sortCol) {
	// create table
	var tableData;
	var table;

	if (targetTableEl==""||targetTableEl==undefined||targetTableEl==null) {
		targetTableEl="body";
	}

	d3.tsv(fileLoc,function(error,data) {
		createGenericTableInner(error,data);
	});

	function createGenericTableInner(error,data) {
		if (error) {
			throw error;
		}

		tableData=data;
		table = tabulate(tableData,targetTableEl);
		if (sortCol) {
			table.selectAll("tbody tr")
			.sort(function(a,b) {
				if (isNaN(a[sortCol])) {
						return d3.ascending(a[sortCol], b[sortCol]);
					} 
					else {
						return b[sortCol] - a[sortCol]; 	
				}
			});
		var e = document.createEvent('UIEvents');
		e.initUIEvent('click', true, true);
		d3.select("#_h"+sortCol).node().dispatchEvent(e);
		}
	}
}

/**
 * Called if you already have the json data loaded from D3.
 * @public
 * 
 * @param {Object} data 
 * @param {string} container - 
 * @param {Array} columns - Optional, needed if the data passed in does not have a row of header names
 * @returns 
 */
function tabulate(data,container,columns) {
	var sortAscending = true;
    var table = d3.select(container).append("table"),
        thead = table.append("thead"),
        tbody = table.append("tbody");
	var titles;
	if (!columns) {
		titles = d3.keys(data[0]);
	} 
	else {
		titles = columns;
	}

	for(var i = titles.length - 1; i >= 0; i--) {
		if(titles[i].indexOf("_")===0) {
			titles.splice(i, 1);
		}
	}

    // append the header row
    var headers = thead.append("tr")
		.selectAll("th")
		.data(titles)
		.enter()
		.append("th")
		.attr("id",function(d) {
			return "_h" + d;
		})
		.text(function(column) { return column; })
		.on('click', function (d) {
			headers.attr('class', 'header');
			if (sortAscending) {
				rows.sort(function(a, b) {
					if (isNaN(a[d])) {
						return d3.ascending(a[d], b[d]);
					} 
					else {
						return b[d] - a[d]; 	
					}
				});
				sortAscending = false;
				this.className = 'aes';
			} else {
				rows.sort(function(a, b) {
					if (isNaN(a[d])) {
						return d3.descending(a[d], b[d]);
					} 
					else {
						return a[d] - b[d]; 	
					}
				});
				sortAscending = true;
				this.className = 'des';
			}
		});

    // create a row for each object in the data
    var rows = tbody.selectAll("tr")
		.data(data)
		.enter()
		.append("tr")
		.attr("class",function(d) {
			var classes=d["_Style"];
			if (d["_% Completed"]) {
				classes+="completed";
			}
			return classes;
		});

    // create a cell in each row for each column
    var cells = rows.selectAll("td")
		.data(function(row) {
			return titles.map(function(column) {
				return {column: column, value: row[column]};
            });
		})
		.enter()
		.append("td")
		.html(function(d) { 
			if (d.column==="_Link") {
				return '<a href="http://'+d.value+'">'+ d.value +'</a>';
			}
			else if (d.column==="% Complete") {

			}
			else {
				return d.value; 
			}
		})
		.attr('class', function(d,i) {
			if (d.column==="Days In Status") {
				if (d.value <=2) {
					return "goodColor";
				}
				else if (d.value>5) {
					return "errorColor";
				}
				else {
					return "warningColor";
				}
			}
			else {
				return;
			}
		})
		.classed('rightAlign', function(d) {
			
			if (!isNaN(d.value)) {
				return true;
			}
			return false;
		})
		.classed('tableCell', true)
		.attr('data-th', function (d) {
			return d.name;
		});    
    return table;
}

// Made it a function to make it reusable!
function removeColumn(data, colIndex) {
    var temp = data.split("\n");
    for(var i = 0; i < temp.length; ++i) {
        temp[i] = temp[i].split(",");
        temp[i].splice(colIndex,1);
        temp[i] = temp[i].join(","); // comment this if you want a 2D array
    }
    return temp.join("\n");     // returns CSV
    return temp;                // returns 2D array
    return d3.csv.parse(temp);  // returns a parsed object
}
