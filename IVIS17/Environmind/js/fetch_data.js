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
var year = 1960; 

function readCountries(callback){
	console.log("in country")
	// Create list object containing objects with Key = Country Code and Value = {Country: Name of country} 
		d3.csv('data/iso_countries.csv', function(data){
		countries = {};	
		codeList = {};
		for(i in data){
			// Adding country object to list object
			countries[data[i]['ISO 3166-1 3 Letter Code']] = {'code': data[i]['ISO 3166-1 3 Letter Code'], 'name': data[i]['Common Name'], 'exports': {}, 'imports': {}, 'co2':{}, 'tradingBalance': {}, 'twoLetterCode': data[i]['ISO 3166-1 2 Letter Code'], 'continent': {}, 'continentID': {}, 'renewables': {} }
			
			for (y=1988;y<2016;y++){
				countries[data[i]['ISO 3166-1 3 Letter Code']].exports[y] = {};
				countries[data[i]['ISO 3166-1 3 Letter Code']].imports[y] = {};
			}

			//Adding data to codelist
			codeList[data[i]['Common Name']] = data[i]['ISO 3166-1 3 Letter Code']
		}
		callback(null);
	})
}

// Waits until readCountries is ready and then runs readData 
d3.queue()
	.defer(readCountries)
	.await(readData);


// Queing all datafiles and waits until they are all in. 
//When done, it moves on to getTop5ExportImport
function readData(){
	console.log("in readData")
	//if(error) throw error;
	d3.queue()
		//Starts with adding CO2
		.defer(readCo2)
		//Continues with adding continents
		.defer(addContinent)
		//Adding renewable data
		.defer(addRenewables)
		//Finally adding trade balance
		.defer(readTradingBalance)
		//On callback we move on to update visualisations 
		//with correct values
		.await(updateVis);

				//THIS IS FOR EXPORT/IMPORT	
						// for(i in countries){
						// 	q2.defer(d3.csv, 'data/allcountries_allyears_full/en_'+countries[i].code+'_AllYears_WITS_Trade_Summary.csv')
						// }

						// q2.defer(getTop5ExportImport)
						// 	.defer(sortTop5ExportImport, exports)
						// 	.defer(sortTop5ExportImport, imports)
}


//Updates visualisations when manipulation 
//of countries-list is finished
function updateVis(){
	console.log("here are our countries after manipulation",countries);
	drawBarChart();
	updateMapColors();
	//countryInteraction();
}


// ************** NOT USED RIGHT NOW (EXPORT/IMPORT) ****************


// Takes out all data for top 5 export and top 5 import
function getTop5ExportImport(error, files){

	//There are no files here, so reading the csv-files in readData is not working correctly
	console.log(files);
	if(error){
		console.log("Ops, something went wrong")
	}
	exports = [];
	imports = [];
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

	}


// Sorts all the top 5 export and import data by country 
// Adding the whole object(indicator, partner, category, reporter, year) to the export/import-list with the country code as key
function sortTop5ExportImport(list){
	//NOTE: Går att sortera listor i d3 med .sort() om vi inte vill loopa genom allt 
	// Kan nog spara tid - om vi kommer använda detta nu :) 

	// loops through list of export data 
	for(i in list){
		// loops all countries in code-name list and compares name to reporting country name in export-list
		for(j in countries){
			
			if(countries[j].name == list[i].Reporter){
				// compares export partner with names in countries code-name list and adds partner country to 
				// reporting countries topExport. Adds partner as an object with partner country code as key and data as value. 
				for(k in countries){
					
					for(y=1988;y<2016;y++){
					
						if(countries[k].name == list[i].Partner && list[i][y] != ""){
							countries[j].list[y][countries[k].code] = {
							  mDollars:list[i][y].replace(/\s+/g, ''),
							  partner:list[i].Partner
							  };
						}
					
					}
				}
			}
			
		}
	}
	console.log(countries);
}

// *************************************************



//Add trading balance to countries
function readTradingBalance(callback){
	console.log("in trading")
	// Create dictionary of trading balance where key = year (1960-2016) and  value = trading balance as % of GDP
	d3.csv('data/trading_balance/trading_balance_data.csv', function(data){
		//Loops through the csv getting the country code
		for(i in data){
			console.log("in trading balance loop")
			countryCode = data[i].Country_Code;
			//Excludes empty rows in the csv
			if (countryCode != "") {
				//For every year, add to the object countries
				for(j=1960 ; j<2017; j++ ){
					countries[countryCode].tradingBalance[j] = data[i][j];
				}
			}

		}
		console.log("out of trading balance loop")

		//Let's send a message that we are ready with adding everything so we can move on
		callback("all done");
	})
}

//Add co2 to countries
function readCo2(){

	console.log("in co2")
	// Create dictionary of co2 emissions where key = year (1960-2010) and  value = co2 per capita
		d3.csv('data/co2_capita.csv', function(data){
			
			for(i in data){
				console.log("in co2 loop")
				var countryCode = name2code(data[i].country);

				//Only if name is correct: 
				if(countryCode != undefined){
					for(j=0 ; j<=50; j++ ){
						countries[countryCode].co2[1960+j] = data[i][1960+j];
					}	
				}
			}
			console.log("out of co2 loop")	
		})
}

//Add continent-code to countries
function addContinent(){
	console.log("in continent")
	d3.csv('data/country_continent.csv', function(data){
		//loop all items in continent-data
		for(i in data){
			console.log("in contintent loop")
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
		console.log("out of continent loop")
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
	console.log("Getting renewables")
	d3.csv("data/renewable_energy_percent.csv", function(data){
		for(i in data){
			var code = data[i].CountryCode;
			if(countries[code]){
				for(j=0; j<=22; j++){
					countries[code].renewables[1990+j] = [	["renewable", Number(data[i][1990+j])],
															["fossil", 100-data[i][1990+j]]
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


