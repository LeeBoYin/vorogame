var canvasW = 800;
var canvasH = 600;
var voronoi = new Voronoi();
var currentDiagram;
var futureDiagram;
var bbox = {xl: 0, xr: canvasW, yt: 0, yb: canvasH};
var currentSites = [];
var futureSites = [];
var shops = [];

var date;
var beginTime;
var time;

// site of shops
function Site(_x, _y){
	this.x=_x;
	this.y=_y;
}

function preload() {

}

function setup(){
	createCanvas(canvasW, canvasH);
	frameRate(30);
	// initialize diagrams
	currentDiagram = voronoi.compute(currentSites, bbox);
	futureDiagram = voronoi.compute(futureSites, bbox);
	date = new Date();
	beginTime = date.getTime();
	//noLoop();

}

function draw(){
	date = new Date();
	time = (date.getTime() - beginTime)/1000;
	time = time.toFixed(0);
	background(75,119,232);
	//draw all shops
	for(i=0; i<shops.length; i++){
		fill(255);
		ellipse(shops[i].x, shops[i].y, 10, 10);
	}

	//draw voronoi diagram
	
	stroke(0,0,0,150);
	drawEdges(currentDiagram);

	if(mouseX<canvasW && mouseY<canvasH){
		push();
		stroke(255,0,0,125);
		ellipse(mouseX, mouseY, 5, 5);
		//drawEdges(futureDiagram);
		drawCell(futureDiagram, futureSites[futureSites.length-1]);
		pop();

	}



}

function mouseClicked() {
	if (mouseX>canvasW || mouseY>canvasH) return;
	//create new shop, new site
	var newShop = new Shop(mouseX, mouseY);
	var newSite = new Site(mouseX, mouseY);
	//update shop arrays and sites array
	shops[shops.length] = newShop;
	currentSites[currentSites.length] = newSite;
	futureSites[futureSites.length-1] = newSite;
  	//updateDiagram(currentDiagram, currentSites);
  	currentDiagram = voronoi.compute(currentSites, bbox);



  	//redraw();
  	  	

  	return false;
}

function mouseMoved(){
	if (mouseX>canvasW || mouseY>canvasH) return;
	var newSite = new Site(mouseX, mouseY);
	futureSites[currentSites.length] = newSite;
	//updateDiagram(futureDiagram, futureSites);
	futureDiagram = voronoi.compute(futureSites, bbox);

	//redraw();
	return false;
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

function drawCell(diagram, site){
	push();
	stroke(0,0,0,0);
	fill(255, 191, 187, 50);
	var cellKey;
	for(cellKey in diagram.cells){
		if(diagram.cells[cellKey].site.x == site.x &&
			diagram.cells[cellKey].site.y == site.y){
			console.log("the site found!");
			break;
		}
	}
	console.log(cellKey);
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