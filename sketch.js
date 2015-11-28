var canvasW = 800;
var canvasH = 600;
var voronoi = new Voronoi();
var currentDiagram;
var futureDiagram;
var bbox = {xl: 0, xr: canvasW, yt: 0, yb: canvasH};
var currentSites = [];
var futureSites = [];
var shops = [];
var slider;
var currentColor;
var mode;
var touchedNum;

var date;
var beginTime;
var time;
var undoButton;

// site of shops
function Site(_x, _y){
	this.x=_x;
	this.y=_y;
}

function preload() {

}


function setup(){
	// set canvas
	var myCanvas = createCanvas(canvasW, canvasH);
	myCanvas.parent("myContainer");
	frameRate(30);
	// initialize diagrams
	currentDiagram = voronoi.compute(currentSites, bbox);
	futureDiagram = voronoi.compute(futureSites, bbox);
	// initial time set
	date = new Date();
	beginTime = date.getTime();

	mode=1;
	touchedNum=-1;

	// get html undo button
	// undoButton = select("#undoButton");
	// undoButton.mousePressed(function(){
	// 	removeLatestShop();
	// });
   putButton = select("#putButton");
	putButton.mousePressed(function(){
		mode = 1;
	});
	dragButton = select("#dragButton");
	dragButton.mousePressed(function(){
		mode = 2;
	});
	deleteButton = select("#deleteButton");
	deleteButton.mousePressed(function(){
		mode = 3;
	});

	//noLoop();

}

function draw(){
	date = new Date();
	time = (date.getTime() - beginTime)/1000;
	time = time.toFixed(0);

	currentColor = select('#currentColor').elt.style.backgroundColor;
	background(50);

	//draw all shops and current cells
	drawCurrentShopsAndCells();

	//draw current diagram edges
	push()
	stroke('rgba(255, 255, 255, 0.5)');
	strokeWeight(2);
	drawEdges(currentDiagram);
	pop();

	

	if(mode==1){
		//draw future cell 
		if(mouseIsInCanvas()){
			push();
			strokeWeight(3);
			drawOneCellEdges(futureDiagram, futureSites[futureSites.length-1], color(currentColor));
			drawOneCellFill(futureDiagram, futureSites[futureSites.length-1], color('rgba(255,255,255,0.3)'));
			pop();
		}

		//draw pointer
		push();
		strokeWeight(1);
		noStroke();
		fill(currentColor);
		ellipse(mouseX, mouseY, 10, 10);
		pop();
	}

}

function mouseClicked() {
	if(mode==1){
		if (!mouseIsInCanvas()) return;
		//create new shop, new site
		var newShop = new Shop(mouseX, mouseY, color(currentColor));
		var newSite = new Site(mouseX, mouseY);
		//update shop arrays and sites array
		shops[shops.length] = newShop;
		currentSites[currentSites.length] = newSite;
		futureSites[futureSites.length-1] = newSite;
		futureSites[futureSites.length] = newSite;
		//updateDiagram(currentDiagram, currentSites);
	  	currentDiagram = voronoi.compute(currentSites, bbox);
	}
  	// delete mode
	else if(mode == 3){
		if(touchedNum!=-1) {
			removeOneShop(touchedNum);
			touchedNum = -1;
		};

	}


  	//redraw();
  	  	

  	return false;
}


function mouseMoved(){
	// add mode
	if(mode==1){
		if (!mouseIsInCanvas()) return;
		var newSite = new Site(mouseX, mouseY);
		futureSites[currentSites.length] = newSite;
		//updateDiagram(futureDiagram, futureSites);
		futureDiagram = voronoi.compute(futureSites, bbox);
		//console.log(mouseX + ", " + mouseY);
		//redraw();
		return false;
	}
	// drag mode
	else if(mode==2 || mode==3){
		//one shop being touched
		if(touchedNum!=-1){
			if(dist(shops[touchedNum].x, shops[touchedNum].y, mouseX, mouseY)>5){
				shops[touchedNum].touched = false;
				touchedNum = -1;
			}
		}
		//NO shop being touched
		else{
			for(var key in shops){
				if(dist(shops[key].x, shops[key].y, mouseX, mouseY)<=5){
					shops[key].touched = true;
					touchedNum = key;
					break;
				}
			}
		}
	}
	

}

function mouseDragged(){
	if(mode==1){
		return;
	}
	else if(mode==2){
		//no shop being touched
		if(touchedNum==-1){
			return;
		}
		//do drag task
		else{
			if (mouseIsInCanvas()){
				shops[touchedNum].x = mouseX;
				shops[touchedNum].y = mouseY;
				currentSites[touchedNum].x = mouseX;
				currentSites[touchedNum].y = mouseY;
				futureSites[touchedNum].x = mouseX;
				futureSites[touchedNum].y = mouseY;
				currentDiagram = voronoi.compute(currentSites, bbox);
			}
		}
	}
}
//Don't know why diagrams can't be passed in and updated
// function updateDiagram(diagram, sites){
// 	diagram = voronoi.compute(sites, bbox);
// }

function drawEdges(diagram){
	//console.log(diagram);
	//console.log("draw diagram");
	for(var key in diagram.edges){
		line(diagram.edges[key].va.x, diagram.edges[key].va.y, 
			diagram.edges[key].vb.x, diagram.edges[key].vb.y);
	}
}

function drawOneCellEdges(diagram, site, color){
	push();
	stroke(color);
	noFill();
	var cellKey;
	for(cellKey in diagram.cells){
		if(diagram.cells[cellKey].site.x == site.x &&
			diagram.cells[cellKey].site.y == site.y){
			//console.log("the site found!");
			break;
		}
	}
	if(!cellKey) return;
	for(var edgeKey in diagram.cells[cellKey].halfedges){
		var startPoint = diagram.cells[cellKey].halfedges[edgeKey].getStartpoint();
		var endPoint = diagram.cells[cellKey].halfedges[edgeKey].getEndpoint();
		line(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
	}
	pop();
}

function drawOneCellFill(diagram, site, color){
	push();
	stroke(0,0,0,0);
	fill(color);
	var cellKey;
	for(cellKey in diagram.cells){
		if(diagram.cells[cellKey].site.x == site.x &&
			diagram.cells[cellKey].site.y == site.y){
			//console.log("the site found!");
			break;
		}
	}
	if(!cellKey) return;
	beginShape();
	for(var edgeKey in diagram.cells[cellKey].halfedges){
		var startPoint = diagram.cells[cellKey].halfedges[edgeKey].getStartpoint();
		var endPoint = diagram.cells[cellKey].halfedges[edgeKey].getEndpoint();
		vertex(startPoint.x, startPoint.y);
	}
	endShape(CLOSE);

	pop();
}

function removeLatestShop(){
	// remove array items
	shops.pop();
	currentSites.pop();
	futureSites.pop();

	// refresh Diagrams
	currentDiagram = voronoi.compute(currentSites, bbox);
	futureDiagram = voronoi.compute(futureSites, bbox);
	
	drawCurrentShopsAndCells();
}

function removeOneShop(removeNum){
	// remove array items
	shops.splice(touchedNum, 1);
	currentSites.splice(touchedNum, 1);
	futureSites.splice(touchedNum, 1);
	touchedNum=-1;

	// refresh Diagrams
	currentDiagram = voronoi.compute(currentSites, bbox);
	futureDiagram = voronoi.compute(futureSites, bbox);
	
	drawCurrentShopsAndCells();
}

function drawCurrentShopsAndCells(){
	for(i=0; i<shops.length; i++){
		if(currentDiagram.cells.length<=1){
			background(shops[0].color);
		}
		drawOneCellFill(currentDiagram, currentSites[i], shops[i].color);
		push()
		stroke('rgba(0, 0, 0, 0.5)');
		strokeWeight(2);
		fill(255);
		if(shops[i].touched){
			if(mode==2){
				ellipse(shops[i].x, shops[i].y, 15, 15);	
			}else if(mode==3){
				push();
				fill('rgba(255, 100, 100, 1)')
				ellipse(shops[i].x, shops[i].y, 15, 15);
				pop();
			}
		}else{
			ellipse(shops[i].x, shops[i].y, 10, 10);
		}
		pop();
	}
}

function mouseIsInCanvas(){
	if (mouseX >= 0 && mouseX < canvasW &&
	 mouseY >= 0 && mouseY < canvasH) return true;
	else return false;
}

function mylog(){
	console.log("!!!!!");
}