updateSideBar = function(){
	d3.select("#sidebarOneCountry").selectAll(".value").remove()
	hoverExportCountries = [];
	hoverImportCountries = [];

	var code = name2code(landETT.properties.name);

	//We will only treat the countries that exist
	if(countries[code] !=undefined ){
		// Append values to sidebarOneContry with the class=value and they will be cleared in the line above on new click
		d3.select("#country-name").insert("h2").attr("class", "value").html(landETT.properties.name)

		d3.select("#year-label").insert("h2").attr("class", "value").html(year)

		if(countries[code].co2[year] == ""){
			d3.select("#co2-label").insert("p").attr("class", "value").html('No data avaliable')						
		}else{
			d3.select("#co2-label").insert("p").attr("class", "value").html(Math.round(countries[code].co2[year]*100)/100 + " ton")
		}

		if(countries[code].tradingBalance[year] == ".."){
			d3.select("#trade-label").insert("p").attr("class", "value").html('No data avaliable')						
		}else{
			d3.select("#trade-label").insert("p").attr("class", "value").html(Math.round(countries[code].tradingBalance[year]*100)/100 + "%")					
		}

		d3.select('#top-5-export').insert("h4").attr("class", "value").html("Exporting to");
		if (countries[code].exports[year] == undefined || isEmpty(countries[code].exports[year])) {
			d3.select('#top-export-container').insert("p").attr("class", "value").html("No export data for "+landETT.properties.name+" in "+year);
		} else {
			for (i in countries[code].exports[year]) {
				d3.select('#top-5-export').insert("li").attr("class", "value").html(countries[code].exports[year][i].partner+
			  	"<span style='position:absolute;right:3px;font-size:10px;opacity:0.5;'>"+Math.round(countries[code].exports[year][i].mDollars)+" m$</span>"
				);
				hoverExportCountries.push(countries[code].exports[year][i].partnerCode);
			}
		}
		d3.select('#top-5-import').insert("h4").attr("class", "value").html("Importing from");
		if (countries[code].imports[year] == undefined || isEmpty(countries[code].imports[year])) {
			d3.select('#top-import-container').insert("p").attr("class", "value").html("No import data for "+landETT.properties.name+" in "+year);
		} else {
			for (i in countries[code].imports[year]) {
				d3.select('#top-5-import').insert("li").attr("class", "value").html(countries[code].imports[year][i].partner+
			  	"<span style='position:absolute;right:3px;font-size:10px;opacity:0.5;'>"+Math.round(countries[code].imports[year][i].mDollars)+" m$</span>"
				);

				hoverImportCountries.push(countries[code].imports[year][i].partnerCode);
			}
		}

		d3.select('#top-export-container')
			.on('mouseover', function(d) {
				highlightInMap();
			
			function highlightInMap(){
				if(hoverExportCountries[0] != undefined){
					d3.selectAll(".country").classed("unfocus", true);
					d3.select("#"+code).classed("unfocus", false);
					for(i in hoverExportCountries){
						var hovered = d3.select("#" + hoverExportCountries[i]);
						hovered.classed("unfocus", false);
					}
				}
			}
			})
			
			.on('mouseout', function(d) {
				d3.selectAll(".unfocus").classed("unfocus", false);
			});

		d3.select('#top-import-container')

		.on('mouseover', function(d) {
			highlightInMap();
			function highlightInMap(){
				if(hoverImportCountries[0] != undefined){
					d3.selectAll(".country").classed("unfocus", true);
					d3.select("#"+code).classed("unfocus", false);
					for(i in hoverImportCountries){
						var hovered = d3.select("#" + hoverImportCountries[i]);
						hovered.classed("unfocus", false);
					}
				}
			}
		})

		.on('mouseout', function(d) {
			d3.selectAll(".unfocus").classed("unfocus", false);
		});

	}
	else{
		console.log("country is undefined")
	}
}

//Utility function to check if object is empty
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

var selectedlist;


clearSideBarSelected = function(){
		d3.select("#selectedCountriesDiv").selectAll("p").remove()
}

updateSideBarSelected = function(){
	d3.select("#selectedCountriesDiv").selectAll("p").remove()

	selectedlist = d3.select("#selectedCountriesDiv")
		.selectAll('p')
		.data(selectedCountries)

	selectedlist	
		.enter()
    	.append('p')
    	.text(function(d) { return d.properties.name})
    	.append('br')	
}



