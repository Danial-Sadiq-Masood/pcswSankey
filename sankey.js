/*jshint esversion : 6*/
function SankeyChart({
		nodeWidth,
		nodePadding,
		width,
		height,
		svgSelector,
		pToolTipConfig,
		rToolTipConfig
	} = {}){

	var pToolTip = Tooltip(pToolTipConfig);
	var rToolTip = Tooltip(rToolTipConfig);

	function create(){

		var sankey = d3.sankey()
	      	.nodeWidth(nodeWidth)
	      	.nodePadding(nodePadding)
	      	.extent([[1, 1], [width - 1, height - 5]]);

    var color = (function(){
		  const color = d3.scaleOrdinal(d3.schemeCategory10);
		  return name => color(name.replace(/ .*/, ""));
		})();

		const svg = d3.select(svgSelector);
      /*.style("width", "100%")
      .style("height", "auto");*/
    const {nodes, links} = sankey(res);

    const rects = svg.append("g")
	    .selectAll("rect")
	    .data(nodes)
	    .enter().append("rect")
	      .attr("x", d => d.x0)
	      .attr("y", d => d.y0)
	      .attr("height", d => d.y1 - d.y0)
	      .attr("width", d => d.x1 - d.x0)
	      .attr("fill", d => color(d.name));

    /*rects.append("title")
      .text(d => `${d.name}\n${d.value}`);*/

	  const link = svg.append("g")
	      .attr("fill", "none")
	      .attr("stroke-opacity", 0.5)
	    .selectAll("g")
	    .data(links)
	    .enter().append("g")
	      .style("mix-blend-mode", "multiply");

	  var id  = 0;
    const gradient = link.append("linearGradient")
        .attr("id", d => {d.uid = id; return id++;})
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", d => d.source.x1)
        .attr("x2", d => d.target.x0);

    gradient.append("stop")
        .attr("offset", "0%")
        .attr("stop-color", d => color(d.source.name));

    gradient.append("stop")
        .attr("offset", "100%")
        .attr("stop-color", d => color(d.target.name));

    link.append("path")
	      .attr("d", d3.sankeyLinkHorizontal())
	      .attr("stroke", d => `url(#${d.uid})`)
	      .attr("stroke-width", d => Math.max(1, d.width));

	  /*link.append("title")
	      .text(d => `${d.source.name} → ${d.target.name}\n${d.value}`);*/

	  //set up link event listener

	  link.on('mouseover', function(d){
			var currEl = this;
			fadeOutPaths(link.filter(function(){
				return this !== currEl;
			}));

			highlightPath(d3.select(this).raise());

			fadeOutRects(rects.filter(function(e){
				return !(e.index === d.source.index || e.index === d.target.index);
			}));
		});

		link.on('mouseout', function(d){
			fadeInPaths(link);
			fadeInRects(rects);
			pToolTip.removeTooltip(d);
		});

		link.on('mousemove', function(d){
			pToolTip.createTooltip(d, d3.event);
		});

		//set up rects events listener
		rects.on('mouseover', function(d){
			var currEl = this;
			var {links, connectedRects} = getRectLinks(d);

			fadeOutRects(rects.filter(function(e){
				return this !== currEl && !connectedRects[e.index];
			}));
			
			fadeOutPaths(link.filter(function(e){
				return !links[e.index];
			}));

			highlightPath(link.filter(function(e){
				return links[e.index];
			}));
		});

		rects.on('mouseout', function(d){
			fadeInRects(rects);
			fadeInPaths(link);
			rToolTip.removeTooltip(d);
		});

		rects.on('mousemove', function(d){
			rToolTip.createTooltip(d, d3.event);
		});

	  svg.append("g")
	      .style("font-size", "15px")
	    .selectAll("text")
	    .data(nodes)
	    .enter().append("text")
	      .attr("x", d => d.x0 < width / 2 ? d.x1 + 6 : d.x0 - 6)
	      .attr("y", d => (d.y1 + d.y0) / 2)
	      .attr("dy", "0.35em")
	      .attr("text-anchor", d => d.x0 < width / 2 ? "start" : "end")
	      .text(d => d.name);
	}

	function fadeOutRects(selection){
		selection.transition()
			.duration(100)
			.attr('opacity', 0.5);
	}

	function fadeInRects(selection){
		selection.transition()
			.duration(100)
			.attr('opacity', 1);
	}

	function fadeOutPaths(selection){
		selection.transition()
			.duration(100)
			.attr('stroke-opacity', 0.2);
	}

	function fadeInPaths(selection){
		selection.transition()
			.duration(100)
			.attr('stroke-opacity', 0.5);
	}

	function highlightPath(selection){
		selection.transition()
			.duration(100)
			.attr('stroke-opacity', 0.7);
	}

	function getRectLinks(d){
		var links = {};
		var connectedRects = {};

		d.sourceLinks.forEach(function(e){
			links[e.index] = true;
			connectedRects[e.target.index] = true;
		});

		d.targetLinks.forEach(function(e){
			links[e.index] = true;
			connectedRects[e.source.index] = true;
		});

		return {links : links, connectedRects : connectedRects};
	}

	return {
		create : create
	};
}