/*jshint esversion:6*/
d3.csv('data.csv').then((data)=>{

	data = data.filter((d)=>d.employment === 'employed');
	tData = data;

	totalWeight = data.reduce((a,d)=>a + parseFloat(d.weight),0);

	res = buildGraph(data, ['employment', 'empType','industry', 'barrier']);

	sankey = SankeyChart({
		data : res,
		nodeWidth : 15,
		nodePadding: 10,
		width : 1300,
		height : 800,
		svgSelector : 'svg',
		pToolTipConfig : {
			idPrefix : 'p-tooltip',
			dataId : 'index',
			templateSelector : '#p-tooltip',
			selectorDataMap : {
				'.s-p__tooltip-header h1' : function(d){
					return d.source.name + ' → ' + d.target.name;
				},
				'.s-p__value-source' : function(d){
					return ((d.value / d.source.value) * 100).toFixed(2) + '%'; 
				}, 
				'.s-p__value-total' : function(d){
					return ((parseFloat(d.value) / totalWeight) * 100).toFixed(2) + '%'; 
				}
			}
		},
		rToolTipConfig : {
			idPrefix : 'r-tooltip',
			dataId : 'index',
			templateSelector : '#r-tooltip',
			selectorDataMap : {
				'.s-p__tooltip-header h1' : function(d){
					return d.name;
				}, 
				'.s-p__value' : function(d){
					return ((parseFloat(d.value) / totalWeight) * 100).toFixed(2) + '%'; 
				}
			}
		}
	});

	sankey.create();
});

function buildGraph(data,colArr){
	var nodes = new Array(colArr.length);

	for(let i = 0; i < nodes.length; i++){
		nodes[i] = {};
	}

	data.forEach(function(row){
		for(var i = 1; i < colArr.length; i++){
			var startNode = row[colArr[i - 1]];
			var endNode = row[colArr[i]];

			var startGroup = nodes[i - 1];
			startGroup[startNode] = startGroup[startNode] || {};

			var endGroup = nodes[i];
			endGroup[endNode] = endGroup[endNode] || {};

			if(startGroup[startNode][endNode]){
				startGroup[startNode][endNode] = startGroup[startNode][endNode] + parseFloat(row.weight);
			}else{
				startGroup[startNode][endNode] = parseFloat(row.weight);
			}
		}
	});

	tNodes = nodes;

	var nodesArr = nodes.reduce((a,d,i)=>{
		return a.concat(Object.keys(d).map((d)=>{return {name: d, col : colArr[i]};}));
		}, []);

	var nodesDict = {};

	nodesArr.forEach((d,i)=>{nodesDict[d.name + '-' + d.col] = i});

	var edgesArr = [];

	for(var i = 1; i < nodes.length; i++){
		var startGroup = nodes[i - 1];
		var endGroup = nodes[i];

		for(var j in startGroup){
			
			var edgesObj = startGroup[j];
			var sourceIndex = nodesDict[j + '-' + colArr[i - 1]];

			for(var k in edgesObj){
				edgesArr.push({
					source : sourceIndex,
					target : nodesDict[k + '-' + colArr[i]],
					value : edgesObj[k]
				});
			}
		}
	}

	return {nodes : nodesArr, links : edgesArr, test : nodes};
}

function getUniqueValCountObj(colArr, data){
	var obj = {};
	
	colArr.forEach(function(col){
		obj[col] = {};
	});

	data.forEach(function(row){
		colArr.forEach(function(col){
			obj[col][row[col]] = obj[col][row[col]] || 0;
			obj[col][row[col]] = obj[col][row[col]] + parseFloat(row.weight);
		});
	});

	return obj;
}
