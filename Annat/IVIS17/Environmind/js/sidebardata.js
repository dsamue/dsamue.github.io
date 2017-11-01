updateSideBar = function(){
	d3.select("#sidebarOneCountry").selectAll(".value").remove()
	console.log("UPDATE SIDE")

	var code = name2code(landETT.properties.name);
			
	// Append values to sidebarOneContry with the class=value and they will be cleared in the line above on new click
	d3.select("#country-name").insert("h2").attr("class", "value").html(landETT.properties.name)

	d3.select("#year-label").insert("h2").attr("class", "value").html(year)

	d3.select("#co2-label").insert("p").attr("class", "value").html(Math.round(countries[code].co2[year]*100)/100)

	d3.select("#trade-label").insert("p").attr("class", "value").html(Math.round(countries[code].tradingBalance[year]*100)/100)

	d3.select('#additional-countries-hint').insert("p").attr("class", "value").html("Select two countries to compare them");

	if (countries[code].exports[year] == undefined || isEmpty(countries[code].exports[year])) {
		d3.select('#top-export-container').insert("p").attr("class", "value").html("No export data for "+landETT.properties.name+" in "+year);
	} else {
		d3.select('#top-5-export').insert("h4").attr("class", "value").html("Exporting to");
		for (i in countries[code].exports[year]) {
			d3.select('#top-5-export').insert("li").attr("class", "value").html(countries[code].exports[year][i].partner+
			  "<br/>("+countries[code].exports[year][i].mDollars+" m $)"
			);
		}
	}
	if (countries[code].imports[year] == undefined || isEmpty(countries[code].imports[year])) {
		d3.select('#top-import-container').insert("p").attr("class", "value").html("No import data for "+landETT.properties.name+" in "+year);
	} else {
		d3.select('#top-5-import').insert("h4").attr("class", "value").html("Importing to");
		for (i in countries[code].imports[year]) {
			d3.select('#top-5-import').insert("li").attr("class", "value").html(countries[code].imports[year][i].partner+
			  "<br/>("+countries[code].imports[year][i].mDollars+" m $)"
			);
		}
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


createSideBarSelected = function(){
	console.log("HALLÅ")
	selectedlist = d3.select("#selectedCountriesDiv")
		.selectAll('li')
		.data(selectedCountries)

	selectedlist	
		.enter()
    	.append('li')
    	.text(function(d) { return d.properties.name });	
}

updateSideBarSelected = function(){
	d3.select("#selectedCountriesDiv").selectAll("li").remove()

	selectedlist = d3.select("#selectedCountriesDiv")
		.selectAll('li')
		.data(selectedCountries)

	selectedlist	
		.enter()
    	.append('li')
    	.text(function(d) { return d.properties.name });	
}