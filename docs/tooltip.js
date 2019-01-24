/*jshint esversion: 6*/
function Tooltip({
	idPrefix = 'tooltip',
	dataId,
	templateSelector,
	selectorDataMap,
	stylingFunc = function(){},
	opacity,
	defaultWidth = 300,
	defaultHeight = 200
} = {}){
	

	function createTooltip(d, event){
		var tooltipElement = document.getElementById(idPrefix + d[dataId]);
		if(!tooltipElement){

			var tooltip = d3.select(cloneTooltipFromTemplate(d));

			tTooltip = tooltip;

			tooltip
					.attr('id',idPrefix + d[dataId])
					.style('position', 'fixed')
					.style('opacity', 0);

			stylingFunc(tooltip,d);

			d3.select('body').append(function(){
				return tooltip.node();
			});

			let finalPos = getToolTipPosition(event, tooltip.node());

			tooltip
					.style('left', finalPos[0] + 'px')
					.style('top', finalPos[1] + 'px')
					.transition()
					.duration(300)
					.style('opacity', 1);

		}else{
			let finalPos = getToolTipPosition(event, tooltipElement);

			tooltipElement.style.left = finalPos[0] + 'px';
			tooltipElement.style.top = finalPos[1] + 'px';
		}
	}

	function getToolTipPosition(event, tooltip){

		tooltip = tooltip.children[0];

		var x = event.clientX,
			y = event.clientY,
			windowWidth = window.innerWidth,
			windowHeight = window.innerHeight,
			elemWidth = tooltip.offsetWidth,
			elemHeight = tooltip.offsetHeight,
			offset = 20;

		if(!elemHeight || !elemWidth){
			var style = window.getComputedStyle(tooltip);
			elemWidth = style.width;
			elemHeight = style.height;
			console.log(elemWidth, elemWidth);
			console.log('Not defined');
		}

		var finalX, finalY;

		if(x + elemWidth  + offset < windowWidth){
			finalX = x + offset;
		}else{
			finalX = x - elemWidth - offset;
		}

		if(y + elemHeight  + offset < windowHeight){
			finalY = y + offset;
		}else{
			finalY = y - elemHeight - offset;
		}

		return [finalX, finalY];
	}

	function cloneTooltipFromTemplate(d){
		
		var template = document.querySelector(templateSelector);
		var clone = document.importNode(template.content, true);

		for(var j in selectorDataMap){
			var mappedData = selectorDataMap[j];

			var res;

			if(typeof mappedData === 'function'){
				res = mappedData(d);
			}else{
				res = d[mappedData];
			}

			clone.querySelector(j).innerText = res;
		}

		var container = document.createElement('div');

		container.appendChild(clone);
		return container;
	}

	function removeTooltip(d){
		var tooltip = document.getElementById(idPrefix + d[dataId]);

		if(tooltip){
			d3.select(tooltip)
				.transition()
				.duration(100)
				.style('opacity', 0)
				.remove();
		}
	}

	return {
		createTooltip : createTooltip,
		removeTooltip : removeTooltip
	};
}