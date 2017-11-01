/* 	Creating a list of objects with each country as an object. The partners are not ranked in any way. 
	Structure of countries:

countries =
	{	Country code:{	
					name: country name,
					code: country code,
					imports:{
						import partner1 country code:{
							indicator, 
							indicator type, 
							indicator value, 
							partner, 
							category, 
							year
						}import partner2 country code:{
							indicator... 
						}
					exports{
						export partner1 country code:{
							indicator... 
						},
					co2: { 	year: "value",
							year: "value",
							...
						},
					tradingBalance: { 	year: "value",
										year: "value",
										...
						},
					twoLetterCode: { two letter code for country 
						},
					continent: { ex. "NA" 
					}
				}
	}	Country 2 code {
					name: country name, 
					code: country code...},
		Country 3 code {
					name: country name, 
					code: country code...} and so on */

var countries;
var codeList;
var test = [1,2,3];
var year = 1968; 
var topo;
var imports = [];
var exports = [];
var co2val = "capita"  //vs. "total" för att kunna switcha mellan

// These countries are missing for export and import data
var exceptCountries = [	'AGO', 'ASM', 'VGB', 'CHI', 'ZAR', 'CUW', 'GNQ', 'GUM', 'GIB', 
						'HTI', 'IRQ', 'IMY', 'PRK', 'KSV', 'LAO', 'LBR', 'LIE', 'MHL', 
						'MCO', 'MNE', 'NRU', 'MNP', 'PRI', 'SMR', 'SRB', 'SXM', 'SOM', 
						'SSD', 'MAF', 'UZB', 'VIR', 'WBG']

//Fetching topographic data for map
d3.json("world-topo-min.json", function(error, world) {
	topo = topojson.feature(world, world.objects.countries).features;
});

// Waits until readCountries is ready and then runs readData 
d3.queue()
	.defer(readCountries)
	.await(readData);

function readCountries(callback){
	// Create list object containing objects with Key = Country Code and Value = {Country: Name of country} 
		d3.csv('data/iso_countries.csv', function(data){
		countries = {};	
		codeList = {};
		for(i in data){
			console.log('i loop')
			// Adding country object to list object
			countries[data[i]['ISO 3166-1 3 Letter Code']] = {'code': data[i]['ISO 3166-1 3 Letter Code'], 'name': data[i]['Common Name'], 'exports': {}, 'imports': {}, 'co2':{}, 'co2total':{}, 'tradingBalance': {}, 'twoLetterCode': data[i]['ISO 3166-1 2 Letter Code'], 'continent': {}, 'continentID': {}, 'renewables': {} }
			
			for (y=1988;y<2016;y++){
				countries[data[i]['ISO 3166-1 3 Letter Code']].exports[y] = {};
				countries[data[i]['ISO 3166-1 3 Letter Code']].imports[y] = {};
			}

			//Adding data to codelist
			codeList[data[i]['Common Name']] = data[i]['ISO 3166-1 3 Letter Code']
		}
		callback()
	})
}

// Queing all datafiles and waits until they are all in. 
//When done, it moves on to getTop5ExportImport
function readData(){
	//if(error) throw error;
	d3.queue()
		//reads all export and import data and sorting it (this takes time) 
		.defer(readImportExport)
		//Adds CO2 per capita
		.defer(readCo2)
		//Add Total CO2 per country
		.defer(readCo2Total)
		//Continues with adding continents
		.defer(addContinent)
		//Adding renewable data
		.defer(addRenewables)
		//Finally adding trade balance
		.defer(readTradingBalance)
		//On callback we move on to update visualisations 
		//with correct values
		.await(updateVis);
}

//Updates visualisations when manipulation 
//of countries-list is finished
function updateVis(){
	$("#capita").prop("checked", true)
	console.log("here are our countries after manipulation", countries);
// Draws map, barchart, updates mapcolor, hides loading message and displays it all! 
	draw(topo);
	drawBarChart();
	updateMapColors();
	displayContent();
	//countryInteraction();
}


function readImportExport(){
	q2 = d3.queue()
	for(i in countries){
		if(jQuery.inArray(countries[i].code, exceptCountries) !== -1){
			continue;
		}else{
			q2.defer(d3.csv, 'data/allcountries_allyears_full/en_'+countries[i].code+'_AllYears_WITS_Trade_Summary.csv')				
		}			
	}
	q2.awaitAll(getTop5ExportImport)
}

//Sorts the top 5 export/import countries by the amount of money in decreasing order.
function sortTopList(type) {
	console.log(type);
	//Loop through the countries
	for (i in countries) {
		//Loop through the years
		for (j in countries[i][type]) {
			//Delete empty years
			if (isEmpty(countries[i][type][j])) {
				delete countries[i][type][j];
			//Sort the partners based on the sum. Note that the partners now are in an array.
			} else {
				sortedTop5 = [];
				for (k in countries[i][type][j]) {
						sortedTop5.push(countries[i][type][j][k]);
				}
				sortedTop5.sort(function(a,b) {
					return parseFloat(b.mDollars) - parseFloat(a.mDollars);
				});
				countries[i][type][j] = sortedTop5;
			}
		}
	}
}


// Takes out all data for top 5 export and top 5 import
function getTop5ExportImport(error, files){
	//There are no files here, so reading the csv-files in readData is not working correctly
	console.log(files);
	if(error){
		console.log("Ops, something went wrong")
	}
	for(i in files){
		file = files[i];
		for(j in file){
			if(file[j].Indicator == "Trade (US$ Mil)-Top 5 Export Partner"){
				exports.push(file[j])
			}else if(file[j].Indicator == "Trade (US$ Mil)-Top 5 Import Partner"){
				imports.push(file[j])
			};			
		}
	}
	sortTop5ExportImport(imports, 'imports')
	sortTop5ExportImport(exports, 'exports')
	sortTopList('exports');
	sortTopList('imports');
}


// Sorts all the top 5 export and import data by country 
// Adding the whole object(indicator, partner, category, reporter, year) to the export/import-list with the country code as key
function sortTop5ExportImport(list, type){
	// Läser igenom varje csv-fils-rad 
    for(i in list){
	// Hämtar ut kod för reporter och partner-land
		var reporter = name2code(list[i].Reporter);
		var partner = name2code(list[i].Partner);
		// Kollar så de inte är undefined
		if(!(countries[reporter] == undefined || countries[partner] == undefined)){
		// Går igenom varje år
			for(y=1988;y<2016;y++){
			// Kolla så att data för det året finns
				if(list[i][y] != ""){
				// Går till countries-objektet för det landet och till export/importlistan beroende på type
				// Går till rätt år i listan och lägger där in nytt objekt med partner-landets kod som id 
				// Och partner-landets namn + mDollars som värden
					countries[reporter][type][y][partner] = {
						'partnerCode':partner,
						'mDollars' :list[i][y].replace(/\s+/g, ''),
						'partner' :list[i].Partner
					};          
				}
			}
        }
    }
	console.log(countries);
}

// *************************************************



//Add trading balance to countries
function readTradingBalance(callback){
	// Create dictionary of trading balance where key = year (1960-2016) and  value = trading balance as % of GDP
	d3.csv('data/trading_balance/trading_balance_data.csv', function(data){
		//Loops through the csv getting the country code
		for(i in data){
			countryCode = data[i].Country_Code;

			//Excludes empty rows in the csv
			if (countryCode != undefined) {
				//For every year, add to the object countries
				for(j=1960 ; j<2017; j++ ){
					countries[countryCode].tradingBalance[j] = data[i][j];
				}
			}

		}
		//Let's send a message that we are ready with adding everything so we can move on
		callback("all done");
	})
}

//Add co2 per capita to countries
function readCo2(){
	// Create dictionary of co2 emissions where key = year (1960-2015) and value = co2 per capita
		d3.csv('data/API_co2_capita.csv', function(data){
			
			for(i in data){
				var countryCode = name2code(data[i]['Country Name']);

				//Only if name is correct: 
				if(countryCode != undefined){
					for(j=0 ; j<=55; j++ ){
						countries[countryCode].co2[1960+j] = data[i][1960+j];
					}	
				}
			}
		})
}

//Add total co2 per country to countries
function readCo2Total(){
	// key = year (1960-2015) and  value = co2 per country in kt (kiloton?)
		d3.csv('data/API_co2_total.csv', function(data){
			
			for(i in data){
				var countryCode = name2code(data[i]['Country Name']);

				//Only if name is correct: 
				if(countryCode != undefined){
					for(j=0 ; j<=55; j++ ){
						countries[countryCode].co2total[1960+j] = data[i][1960+j];
					}	
				}
			}
		})
}

//Add continent-code to countries
function addContinent(){
	d3.csv('data/country_continent.csv', function(data){
		//loop all items in continent-data
		for(i in data){
			// loops all countries and match twoLetterCode with country-code in continent-data
			for(j in countries){
				if(countries[j].twoLetterCode == data[i].country){
					//Add continent code to country if match
					countries[j].continent = data[i].continent;

					//We also want to give each country a continentID 
					//so that we can sort by map position and not by continentName
					addContinentID(countries[j], data[i].continent)
				}
			}
		}
	});
}

//Adds a continentID depending on what continent 
//Going from North America (=1) to Ociania (=7)
//If no match id is set to 8 so that we can group any 'leftovers' to the right (as safty)
function addContinentID(position, value){
	//North America
	if(value == "NA"){
		position.continentID = 1;
	}
	//South America
	else if(value == "SA"){
		position.continentID = 2;
	}
	//Antarctica
	else if(value == "AN"){
		position.continentID = 3;
	}
	//Europe
	else if(value == "EU"){
		position.continentID = 4;
	}
	//Africa
	else if(value == "AF"){
		position.continentID = 5;
	}
	//Asia
	else if(value == "AS"){
		position.continentID = 6;
	}
	//Ociania
	else if(value == "OC"){
		position.continentID = 7;
	}
	//If there should be some leftovers
	else{
		position.continentID = 8;
	}
}


// Fetching renewable energy data, in percent per year, and adding to countries. 
function addRenewables(){
	d3.csv("data/renewable_energy_percent.csv", function(data){
		for(i in data){
			var code = data[i].CountryCode;
			if(countries[code]){
				for(j=0; j<=22; j++){
					countries[code].renewables[1990+j] = [	["Fossil fuel", 100-data[i][1990+j]],
															["Renewable", Number(data[i][1990+j])]
														]
				}
			}
			else{
				// These country codes are not in the countries-list
			}
		}
	});
}


//Returns country code for country name. i.e. Sweden->SWE
function name2code(name){
	if(codeList[name]==undefined){
		// console.log(name + " stämmer ej med namn i land/kod-lista")
	}
	return codeList[name];
}


//Utility function to check if object is empty
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}


