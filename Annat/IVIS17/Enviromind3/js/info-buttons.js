d3.select('#tradebalance-info').on('mouseover', function(d){
    tooltip.classed("hidden", false)
        .attr("style", "left:"+(event.pageX)+"px;top:"+(event.pageY)+"px")
        .attr("class", "info-box-tooltip")
        .html("	<h4>Trade balance</h4>"+
        		"<p>Trade balance as percentage of GDP (Gross Domestic Product) "+ 
        		"is the difference between a country’s exports and imports for "+ 
        		"goods and services standardized to its GDP for the given year."+ "</br></br>"+ 
        		"A positive trade balance means that the country exports more than "+ 
        		"it imports, and vice versa. Positive trade balance leads to a "+ 
        		"financial surplus while negative trade balance leads to a deficit. "+ "</br></br>" +
        		"The data is collected from The World Bank’s database.</p>");
})

d3.select('#tradebalance-info').on('mouseout', function(d){
    tooltip.classed("hidden", true)
            .classed("info-box-tooltip", false)
            .classed("tooltip", true)
})

d3.select('#barchart-info').on('mouseover', function(d){
    tooltip.classed("hidden", false)
        .attr("style", "left:"+(event.pageX-10)+"px;top:"+(event.pageY-100)+"px;"+"width:150px;")
        .attr("class", "info-box-tooltip")
        .html("	<h4>Co2-emissions</h4>"+
        		"<p>Each country’s annual CO2-emissions per capita and in total."+
        		"</br></br>The data is collected from The World Bank’s database.");
})

d3.select('#barchart-info').on('mouseout', function(d){
    tooltip.classed("hidden", true)
            .classed("info-box-tooltip", false)
            .classed("tooltip", true)
})

d3.select('#renewable-info').on('mouseover', function(d){
    tooltipSide.classed("hidden", false)
        .attr("style", "left:"+(event.pageX-100)+"px;top:"+(event.pageY+10)+"px;"+"width:150px;")
        .attr("class", "info-box-tooltip")
        .html(" <h4>Renewable Energy</h4>"+
                "<p>The percentage of the country’s energy consumption that doesn’t derive from fossil energy sources. "+
                "</br></br>The data is collected from The World Bank’s database.");
})


d3.select('#renewable-info').on('mouseout', function(d){
    tooltipSide.classed("hidden", true)
            .classed("info-box-tooltip", false)
            .classed("tooltip", true)
})

