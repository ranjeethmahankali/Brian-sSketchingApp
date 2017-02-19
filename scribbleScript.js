//alert('testing');
var canvas1 = document.getElementById("canvas_1");
var canvas2 = document.getElementById("canvas_2");
var canvas3 = document.getElementById("canvas_3");
var c1 = canvas1.getContext("2d");
	c1.fillStyle = $('#fillColor').val();
	c1.strokeStyle =  $('#strokeColor').val();
	c1.font = "20px Arial";
	c1.lineJoin = 'round';
var c2 = canvas2.getContext("2d");
	c2.strokeStyle = "#000000";
	c2.fillStyle = "#b8b8b8"
	c2.lineJoin = 'round';
var c3 = canvas3.getContext("2d");
	c3.strokeStyle = 'green';
	c3.lineWidth = 3;

var mouse1X, mouse1Y, mouse2X, mouse2Y,mouse_ix,mouse_iy,mouseX,mouseY;
var centerX, centerY, radius, startAngle, stopAngle;

//this is to measure the position of the canvas and then use that to calculate
//the clicked coordinate
var bound = document.getElementById('canvas_1').getBoundingClientRect();

var penIsDown = false;
var centerSelected = false;
var curveStarted = false;
var myCanvas = $('#canvas_screen');
var toolList = document.getElementById('tool_list');
var helpText = $('p#help_text');
var imageData;
var eraserSize = 30;;

var currentTool = "none";
var curToolDOM;//this is the dom element of the tool icon

//variables for polygon tool<>
var polygonVert = new Array();
var sideNum;
var AngStep;
var startAng;
//variables for polygon tool</>
//variables for floofill tool<>
var pixelStack = new Array();
var startR,startG,startB,startA;//,startX,startY;
var fillR,fillG,fillB,fillA;
//variables for floofill tool</>

//variables for imageUpload tool<>
var imageUploaded;
var aspectRatio;
var imgUpload;
var imageIsLoaded = false;
//variables for imageUpload tool</>

//variables for ellipse tool<>
var axisAngle;
var axisLength;
var scaleFactor = 1;
//variables for ellipse tool</>

//default thumbnail size
var thumbnail_scale = 0.2;

curSketch = newSketch();
updatePen();

function newSketch(parentID, authorName, dateStamp){
	if(parentID === undefined){parentID = 'None';}
	if(authorName === undefined){authorName = 'None';}
	if(dateStamp === undefined){dateStamp = new Date();}

	var newSketch = {'name':'None', 
				'objects':new Array(),
				'tempObj': new Array(),
				'delObj': new Array(),//these are the undone objects ready to use for redo
				'author':'None', 
				'date':dateStamp, 
				'uid': uuid.v1(),
				'parent': 'None',
				'child':new Array(),
				'thumbnail':'',
			};
	
	return newSketch;
}

function cleanArray(ar){//cleans up a 2d array by deleting any duplicated elements
	for (var i = 0; i < ar.length; i++){
		var checkPt = ar.shift();
		if(!arr2dContains(ar, checkPt)){ar.push(checkPt);}
	}
}

function clearTempCanvases(){//clears all the temporary canvases that hold previews 
	c2.clearRect(0,0,canvas2.width,canvas2.height);
	c3.clearRect(0,0,canvas2.width,canvas2.height);
}
	
function floodFill(startX,startY,ctx){
	startX = Math.floor(startX);
	startY = Math.floor(startY);
	imageData = ctx.getImageData(0,0,canvas1.width,canvas1.height);
	
	startR = imageData.data[(startY*canvas1.width+startX)*4];
	startG = imageData.data[(startY*canvas1.width+startX)*4+1];
	startB = imageData.data[(startY*canvas1.width+startX)*4+2];
	startA = imageData.data[(startY*canvas1.width+startX)*4+3];
	
	pixelStack.push([startX,startY]);
	
	while(pixelStack.length){
		var newPos,x,y,pixelPos,reachLeft,reachRight;
		newPos = pixelStack.pop();
		x = newPos[0];
		y = newPos[1];
		
		pixelPos = (y*canvas1.width + x) * 4;
		
		while(y-- >= 0 && matchStartColor(pixelPos)){
			pixelPos -= canvas1.width * 4;
		}
		pixelPos += canvas1.width * 4;
		++y;
		reachLeft = false;
		reachRight = false;
		
		while(y++ < canvas1.height-1 && matchStartColor(pixelPos)){
			colorPixel(pixelPos);
			
			if(x > 0){
				if(matchStartColor(pixelPos - 4)){
					if(!reachLeft){
						pixelStack.push([x - 1, y]);
						reachLeft = true;
					}
				}
				else if(reachLeft){
					reachLeft = false;
				}
			}//boom
			
			if(x < canvas1.width-1){
				if(matchStartColor(pixelPos + 4)){
					if(!reachRight){
						pixelStack.push([x + 1, y]);
						reachRight = true;
					}
				}
				else if(reachRight){
					reachRight = false;
				}
			}
		
			pixelPos += canvas1.width * 4;
		}
	}
	ctx.putImageData(imageData,0,0);
}

function matchStartColor(pix){
	var r = imageData.data[pix];
	var g = imageData.data[pix+1];
	var b = imageData.data[pix+2];
	var a = imageData.data[pix+3];
	
	return(r==startR&&g==startG&&b==startB&&a==startA);
}

function colorPixel(pix){
	imageData.data[pix] = hexToRgb(c1.fillStyle).r;
	imageData.data[pix+1] = hexToRgb(c1.fillStyle).g;
	imageData.data[pix+2] = hexToRgb(c1.fillStyle).b;
	imageData.data[pix+3] = 255;
}

function renderObject(obj, rc){
	if(rc == typeof undefined) {
		rc = c1;
	}
	if(obj.type == "line"){
		rc.lineWidth = obj.strokeWidth;
		rc.strokeStyle = obj.strokeColor;
		rc.beginPath();
		rc.moveTo(obj.startPt[0], obj.startPt[1]);
		rc.lineTo(obj.endPt[0], obj.endPt[1]);
		rc.stroke();
	}else if(obj.type == "rectangle"){
		rc.lineWidth = obj.strokeWidth;
		rc.strokeStyle = obj.strokeColor;
		rc.beginPath();
		if(obj.tobeFilled){
			rc.fillStyle = obj.fillColor;
			rc.fillRect(obj.vert1[0],obj.vert1[1],obj.vert2[0]-obj.vert1[0],obj.vert2[1]-obj.vert1[1]);
		}
		rc.strokeRect(obj.vert1[0],obj.vert1[1],obj.vert2[0]-obj.vert1[0],obj.vert2[1]-obj.vert1[1]);
	}else if(obj.type == "circle"){
		rc.lineWidth = obj.strokeWidth;
		rc.strokeStyle = obj.strokeColor;
		rc.beginPath();
		rc.arc(obj.center[0], obj.center[1], obj.rad, obj.Ang1, obj.Ang2);
		rc.stroke();
	}
	else if(obj.type == "freehand"){
		rc.lineWidth = obj.strokeWidth;
		rc.strokeStyle = obj.strokeColor;
		rc.beginPath();
		rc.moveTo(obj.points[0][0], obj.points[0][1]);
		for(var i = 1; i < obj.points.length; i++){
			rc.lineTo(obj.points[i][0],obj.points[i][1]);
		}
		rc.stroke();
	}
	else if(obj.type == "curve"){
		rc.lineWidth = obj.strokeWidth;
		rc.strokeStyle = obj.strokeColor;
		rc.beginPath();
		rc.moveTo(obj.startPt[0], obj.startPt[1]);
		rc.quadraticCurveTo(obj.intPt[0],obj.intPt[1], obj.endPt[0], obj.endPt[1]);
		rc.stroke();
	}
	else if(obj.type == "flood"){
		rc.fillStyle = obj.floodColor;
		floodFill(obj.floodPt[0], obj.floodPt[1], rc);
	}
	else if(obj.type == "erase"){
		rc.clearRect(obj.vert1[0],obj.vert1[1],obj.vert2[0]-obj.vert1[0],obj.vert2[1]-obj.vert1[1]);
	}
	else if(obj.type == "image"){
		var img = new Image();
		img.src = obj.image;
		img.onload = function(){rc.drawImage(img,0,0,canvas1.width,canvas1.height);}
	}
	else if(obj.type == "text"){
		rc.font = obj.font;
		rc.fillStyle = obj.txtColor;
		rc.fillText(obj.value, obj.basePt[0], obj.basePt[1]);
	}
	else if(obj.type == 'ellipse'){
		rc.fillStyle = obj.fillColor;
		rc.strokeStyle = obj.strokeColor;
		rc.lineWidth = obj.strokeWidth;
		rc.save();
		
		axisAngle = lineAngle(obj.vert1[0],obj.vert1[1],obj.vert2[0],obj.vert2[1]);//console.log(axisAngle);
		axisLength = dist(obj.vert1[0],obj.vert1[1],obj.vert2[0],obj.vert2[1]);
		var minAxis = lineDist([obj.vert1[0],obj.vert1[1]],[obj.vert2[0],obj.vert2[1]],[obj.endPt[0],obj.endPt[1]]);
		scaleFactor = 2*mod(minAxis)/axisLength;
		
		rc.translate(obj.vert1[0],obj.vert1[1]);
		rc.rotate(axisAngle);
		rc.scale(1,scaleFactor);
		rc.beginPath();
		rc.arc(axisLength/2,0,axisLength/2,0,2*Math.PI);
		rc.restore();
		if(obj.tobeFilled){rc.fill();}
		rc.stroke(); 
		var ellipseCenter = [(obj.vert1[0]+obj.vert2[0])/2, (obj.vert1[1]+obj.vert2[1])/2];
		var end1 = vSum(ellipseCenter,minAxis);
		var end2 = vDiff(ellipseCenter,minAxis);
	}
	else if(obj.type = 'polygon'){
		rc.strokeStyle = obj.strokeColor;
		rc.fillStyle = obj.fillColor;
		rc.lineWidth = obj.strokeWidth;
		rc.beginPath();
		rc.moveTo(obj.vertAr[0][0], obj.vertAr[0][1]);
		for(var x = 1; x < obj.vertAr.length; x++){
			rc.lineTo(obj.vertAr[x][0], obj.vertAr[x][1]);
		}
		rc.lineTo(obj.vertAr[0][0], obj.vertAr[0][1]);
		rc.closePath();
		if(obj.toBeFilled){rc.fill();}
		rc.stroke();
	}
}

//click events for all kinds of tools
$('.scribblePad').click(function(e){
	if(currentTool == "line"){
	//without the chain option checked
		if(!chainCheckbox.checked){
		if(!penIsDown){
			// console.log(e.pageX, e.pageY, bound.left, bound.top);
			mouse1X = e.pageX - bound.left;
			mouse1Y = e.pageY - bound.top;
			
			penIsDown = true;
			helpText.text('Pick the ending point or Hit Esc to stop drawing');
		}
		else if(penIsDown){
			mouse2X = e.pageX - bound.left;
			mouse2Y = e.pageY - bound.top;
			
			penIsDown = false;
			//console.log(mouse2X+", "+mouse2Y);
			clearTempCanvases()
			c1.beginPath();
			c1.moveTo(mouse1X,mouse1Y);
			c1.lineTo(mouse2X,mouse2Y);
			
			updatePen();
			c1.stroke();
			helpText.text('Pick the starting point');
			
			var lineObj = {type : "line", startPt : new Array(mouse1X,mouse1Y), endPt : new Array(mouse2X,mouse2Y),
							strokeColor: c1.strokeStyle, strokeWidth: c1.lineWidth};
			addObject(lineObj);
		}
		}
		//with the chain option checked
		else if(chainCheckbox.checked){
		if(!penIsDown){
			mouse1X = e.pageX - bound.left;
			mouse1Y = e.pageY - bound.top;
			
			penIsDown = true;
			helpText.text('Continue picking points. Hit Esc to stop drawing');
			//console.log(mouse1X+", "+mouse1Y);
		}
		else if(penIsDown){
			mouse2X = e.pageX - bound.left;
			mouse2Y = e.pageY - bound.top;
			
			c1.beginPath();
			c1.moveTo(mouse1X,mouse1Y);
			c1.lineTo(mouse2X,mouse2Y);
			
			updatePen();
			c1.stroke();
			
			var lineObj = {type : "line", startPt : new Array(mouse1X,mouse1Y), endPt : new Array(mouse2X,mouse2Y),
							strokeColor: c1.strokeStyle, strokeWidth: c1.lineWidth};
			mouse1X = mouse2X; mouse1Y = mouse2Y;
			addObject(lineObj);
		}
		}
	}
	else if(currentTool == "rectangle"){
		if(!penIsDown){
			mouse1X = e.pageX - bound.left;
			mouse1Y = e.pageY - bound.top;
			
			//console.log(mouse1X+", "+mouse1Y);
			penIsDown = true;
			helpText.text('Pick the second corner or Hit Esc to stop drawing');
		}
		else if(penIsDown){
			mouse2X = e.pageX - bound.left;
			mouse2Y = e.pageY - bound.top;
			
			penIsDown = false;
			
			updatePen();
			c1.beginPath();
			if(fillCheckbox.checked){
				c1.fillRect(mouse1X,mouse1Y,mouse2X-mouse1X,mouse2Y-mouse1Y);
			}
			c1.strokeRect(mouse1X,mouse1Y,mouse2X-mouse1X,mouse2Y-mouse1Y);
			
			helpText.text('Pick first corner of the rectangle');
			//pushing the corner coordinates to the array - last element is a bool whether the rectangle should be filled or not.
			
			var recObj = {type: "rectangle", vert1: new Array(mouse1X,mouse1Y), vert2: new Array(mouse2X,mouse2Y), 
							tobeFilled: fillCheckbox.checked, fillColor: c1.fillStyle, strokeColor: c1.strokeStyle,
							strokeWidth: c1.lineWidth};
			addObject(recObj);
		}
		
	}
	else if(currentTool == 'polygon'){
		if(!penIsDown){
			mouse1X = e.pageX - bound.left;
			mouse1Y = e.pageY - bound.top;

			penIsDown = true;
			helpText.text('Finish drawing the polygon');
		}else{
			mouse2X = e.pageX - bound.left;
			mouse2Y = e.pageY - bound.top;
			
			polygonVert = [];
			polygonVert.push([mouse2X,mouse2Y]);
			startAng = lineAngle(mouse1X,mouse1Y,mouse2X,mouse2Y);
			var polyRad = dist(mouse1X,mouse1Y,mouse2X,mouse2Y);
			var angle = startAng;
			var radVec;
			for(var v = 1; v < sideNum; v++){
				angle = startAng+(v*AngStep);
				radVec = vPrd([Math.cos(angle), Math.sin(angle)],polyRad);
				polygonVert.push(vSum([mouse1X,mouse1Y],radVec));
			}
			
			c1.beginPath();
			c1.moveTo(polygonVert[0][0], polygonVert[0][1]);
			for(var x = 1; x < polygonVert.length; x++){
				c1.lineTo(polygonVert[x][0], polygonVert[x][1]);
			}
			c1.lineTo(polygonVert[0][0], polygonVert[0][1]);
			c1.closePath();
			updatePen();
			if(fillCheckbox.checked){c1.fill();}
			c1.stroke();
			
			var polygonObj = {type: 'polygon', vertAr: polygonVert, strokeColor: c1.strokeStyle, fillColor: c1.fillStyle, toBeFilled: fillCheckbox.checked, strokeWidth: c1.lineWidth};
			penIsDown = false;
			helpText.text('Pick the center of the polygon');
			clearTempCanvases();
			addObject(polygonObj);
		}
	}
	else if(currentTool == "circle"){
		if(!centerSelected){
			centerX = e.pageX - bound.left;
			centerY = e.pageY - bound.top;
			
			centerSelected = true;
			helpText.text('Pick the starting point of the arc/circle');
			//console.log(centerX + ", " + centerY);
		}
		else if(centerSelected){
			if(!penIsDown){
				mouse1X = e.pageX - bound.left;
				mouse1Y = e.pageY - bound.top;
				
				penIsDown = true;
				
				radius = dist(centerX,centerY,mouse1X,mouse1Y);
				startAngle = lineAngle(centerX,centerY,mouse1X,mouse1Y);
				helpText.text('Pick the ending point');
			}
			else if(penIsDown){
				mouse2X = e.pageX - bound.left;
				mouse2Y = e.pageY - bound.top;
				
				penIsDown = false;
				centerSelected = false;
				
				stopAngle = lineAngle(centerX,centerY,mouse2X,mouse2Y);
				if(Math.abs(startAngle-stopAngle)<(Math.PI/60)){
						if(reverseCheckbox.checked){stopAngle = startAngle + 2*Math.PI}
						else if(!reverseCheckbox.checked){stopAngle = startAngle - 2*Math.PI}
				}
				
				var cirObj;//the object to be sent to the server representing this circle
				var othPt = vSum([centerX,centerY],vPrd(unitV(vDiff([mouse2X,mouse2Y],[centerX,centerY])),radius));
				
				updatePen();
				c1.beginPath();
				if(reverseCheckbox.checked){
					c1.arc(centerX,centerY,radius,startAngle,stopAngle);
					cirObj = {type: "circle", center: new Array(centerX, centerY), rad: radius, Ang1: startAngle, 
									Ang2: stopAngle, vert1: new Array(mouse1X, mouse1Y), vert2: othPt, strokeColor: c1.strokeStyle,
									strokeWidth: c1.lineWidth};
				}else{
					c1.arc(centerX,centerY,radius,stopAngle,startAngle);//console.log('here');
					
					cirObj = {type: "circle", center: new Array(centerX, centerY), rad: radius, Ang1: stopAngle, 
									Ang2: startAngle, vert1: new Array(mouse1X, mouse1Y), vert2: othPt, strokeColor: c1.strokeStyle,
									strokeWidth: c1.lineWidth};
				}
				
				c1.stroke();
				helpText.text('Select the centre of the arc/circle');
				addObject(cirObj);
			}
		}
	}
	else if(currentTool == "ellipse"){
		if(!penIsDown){
			if(!curveStarted){
				mouse1X = e.pageX - bound.left;
				mouse1Y = e.pageY - bound.top;
				
				curveStarted = true;
				helpText.text('Select the Ending point of the axis');
			}else{
				mouse_ix = e.pageX - bound.left;
				mouse_iy = e.pageY - bound.top;

				//console.log(mouse1X,mouse1Y,mouse_ix,mouse_iy);
				axisAngle = lineAngle(mouse1X,mouse1Y,mouse_ix,mouse_iy);//console.log(axisAngle);
				axisLength = dist(mouse1X,mouse1Y,mouse_ix,mouse_iy);
				clearTempCanvases();
				c1.save();
				c2.save();
				c1.translate(mouse1X,mouse1Y);
				c2.translate(mouse1X,mouse1Y);
				c1.rotate(axisAngle);
				c2.rotate(axisAngle);
				c2.save();
				//c1.strokeRect(0,0,30,20);
				penIsDown = true;//console.log('penIsDown = '+penIsDown);
				helpText.text('Draw the Ellipse');
			}
		}else{
			if(curveStarted){
				mouse2X = e.pageX - bound.left;
				mouse2Y = e.pageY - bound.top;
				
				var minAxis = lineDist([mouse1X,mouse1Y],[mouse_ix,mouse_iy],[mouse2X,mouse2Y]);
				scaleFactor = 2*mod(minAxis)/axisLength;
				c1.scale(1,scaleFactor);
				c1.beginPath();
				c1.arc(axisLength/2,0,axisLength/2,0,2*Math.PI);
				c2.clearRect(-5,-((axisLength/2)+5),axisLength+10,axisLength+10);
				c1.restore();
				c2.restore();c2.restore();//have to restore twice
				updatePen();
				if(fillCheckbox.checked){c1.fill();}
				c1.stroke();
				c1.restore();
				//sending the data over to the server
				var ellipseCenter = [(mouse1X+mouse_ix)/2, (mouse1Y+mouse_iy)/2];
				var end1 = vSum(ellipseCenter,minAxis);
				var end2 = vDiff(ellipseCenter,minAxis);
				var ellObj = {type: 'ellipse', vert1: [mouse1X,mouse1Y], vert2: [mouse_ix,mouse_iy], endPt: [mouse2X,mouse2Y],
								vert3: end1, vert4: end2, tobeFilled: fillCheckbox.checked, strokeColor:c1.strokeStyle,
								strokeWidth: c1.lineWidth,fillColor: c1.fillStyle};
				penIsDown = false;
				curveStarted = false;
				helpText.text('Select the starting point of the first axis');
				addObject(ellObj);
			}
		}
	}
	else if(currentTool == "freehand"){
		if(!penIsDown){
			penIsDown = true;
			updatePen();
			freeHand = [];
			mouse1X = e.pageX - bound.left;
			mouse1Y = e.pageY - bound.top;
			mouse2X = e.pageX - bound.left;
			mouse2Y = e.pageY - bound.top;
			freeHand.push(new Array(mouse1X,mouse1Y));
			//console.log(mouse1X,mouse1Y);
			helpText.text('Click to stop drawing');
		}
		else if(penIsDown){
			clearTempCanvases();
			c1.beginPath();
			c1.moveTo(freeHand[0][0], freeHand[0][1]);
			for(var i=1; i < freeHand.length; i++){
				c1.lineTo(freeHand[i][0], freeHand[i][1]);
			}
			updatePen();
			c1.stroke();
			penIsDown = false;
			
			var frObj = {type: "freehand", points: freeHand, strokeColor: c1.strokeStyle, strokeWidth: c1.lineWidth}
			
			helpText.text('Click to start drawing free hand');
			addObject(frObj);
		}
	}
	else if(currentTool == "curve"){
		if(!penIsDown){
			penIsDown = true;//console.log('penIsDown = '+penIsDown);
			mouse1X = e.pageX - bound.left;
			mouse1Y = e.pageY - bound.top;

			helpText.text('continue selecting control points or hit Esc to stop');
		}
		else if(penIsDown){
			if(!curveStarted){
				curveStarted = true;
				mouse_ix = e.pageX - bound.left;
				mouse_iy = e.pageY - bound.top;
			}
			else if(curveStarted){
				mouse2X = e.pageX - bound.left;
				mouse2Y = e.pageY - bound.top;
				
				updatePen();
				c1.beginPath();
				c1.moveTo(mouse1X,mouse1Y);
				c1.quadraticCurveTo(mouse_ix,mouse_iy,(mouse_ix+mouse2X)/2,(mouse_iy+mouse2Y)/2);
				c1.stroke();
				
				var curObj = {type: "curve", startPt: new Array(mouse1X, mouse1Y), intPt: new Array(mouse_ix,mouse_iy),
								endPt: new Array((mouse_ix+mouse2X)/2,(mouse_iy+mouse2Y)/2), strokeColor: c1.strokeStyle,
								strokeWidth: c1.lineWidth};
				//console.log(mouse_ix,mouse_iy);
				//console.log(mouse1X+" "+mouse1Y+" "+mouse_ix+" "+mouse_iy+" "+(mouse_ix+mouse2X)/2+" "+(mouse_iy+mouse2Y)/2);
				mouse1X = (mouse_ix+mouse2X)/2;mouse1Y = (mouse_iy+mouse2Y)/2;
				mouse_ix = mouse2X;mouse_iy = mouse2Y;
				
				addObject(curObj);
			}
		}
	}
	else if(currentTool == "floodFill"){
		var startX = e.pageX - bound.left;
		var startY = e.pageY - bound.top;
		
		updatePen();//updates the canvas fillStyle to the selected in the colour selector tool
		// console.log(startX, startY);
		floodFill(startX,startY,c1);
		
		var floodObj = {type: "flood", floodPt: new Array(startX,startY), floodColor: c1.fillStyle};
		addObject(floodObj);
	}
	else if(currentTool == "eraser"){
		if(!penIsDown){
			mouse1X = e.pageX - bound.left;
			mouse1Y = e.pageY - bound.top;
			//console.log(mouse1X+", "+mouse1Y);
			penIsDown = true;
			helpText.text('Pick the second corner of the area to be cleared or hit esc to abort');
		}
		else if(penIsDown){
			mouse2X = e.pageX - bound.left;
			mouse2Y = e.pageY - bound.top;
			penIsDown = false;
			c1.beginPath();
			c1.clearRect(mouse1X,mouse1Y,mouse2X-mouse1X,mouse2Y-mouse1Y);
			
			helpText.text('Pick first corner of the area to be cleared');
			//pushing the corner coordinates to the array - last element is a bool whether the rectangle should be filled or not.
			
			var erObj = {type: "erase", vert1: new Array(mouse1X,mouse1Y), vert2: new Array(mouse2X,mouse2Y)};
			addObject(erObj);
		}
		
	}
	else if(currentTool == "image"){
		imgUpload = $('#imgUpload');
		if(!penIsDown){
			if(imageIsLoaded){
				aspectRatio = $('#imageUploaded').height()/$('#imageUploaded').width();//defining the aspect ratio of the image
			
				mouse1X = e.pageX - bound.left;
				mouse1Y = e.pageY - bound.top;
				imageUploaded = document.getElementById('imageUploaded');
				//c2.drawImage(imageUploaded,mouse1X,mouse1Y);
				penIsDown = true;//console.log(penIsDown);
				helpText.text('Resize the image to the wanted size and click to draw the image');
			}
			else if(!imageIsLoaded){
				alert('No image selected');
			}
		}
		else if(penIsDown){
			clearTempCanvases()
			
			mouse2X = e.pageX - bound.left;
			mouse2Y = e.pageY - bound.top;
			
			c3.drawImage(imageUploaded,mouse1X,mouse1Y,mouse2X-mouse1X,(mouse2X-mouse1X)*aspectRatio);
			
			var encImg = canvas3.toDataURL();
			var imgObj = {type: "image", image: encImg};
			c3.clearRect(0,0,canvas1.width,canvas1.height);
			
			c1.drawImage(imageUploaded,mouse1X,mouse1Y,mouse2X-mouse1X,(mouse2X-mouse1X)*aspectRatio);
			// var testImg = new Image();
			// testImg.src = encImg;
			// c1.drawImage(testImg,0,0,canvas1.width, canvas1.height);
		
			penIsDown = false;//console.log(penIsDown);
			//$('#imageUploaded').remove();removing the image division which was hidden
			//imgUpload.replaceWith( imgUpload = imgUpload.clone( true ) );//resetting the input file element
			//imageIsLoaded = false;
			helpText.text('Choose an image file to upload and draw');			
			addObject(imgObj);
		}
	}
	else if(currentTool == "text"){
		var txt = $('#text_input').val();
		var txtSize = $('#textSize').val();
		if(txt == ''){alert('No Text to Write');}
		else{
			mouse1X = e.pageX - bound.left;
			mouse1Y = e.pageY - bound.top;
			
			c1.fillStyle = $('#fillColor').val();
			c1.font = txtSize+"px Arial";
			c1.fillText(txt,mouse1X,mouse1Y);
			
			var txtObj = {type: "text", font: c1.font, value: txt, basePt : new Array(mouse1X, mouse1Y), txtColor: c1.fillStyle};
			addObject(txtObj);
		}
	}
	else if(currentTool == "none"){
		alert('please select a tool ot start drawing');
	}
});
	
$('.scribblePad').mousemove(function(e){
	if(currentTool == "line"){
		if(penIsDown){
			clearTempCanvases()
			mouse2X = e.pageX - bound.left;
			mouse2Y = e.pageY - bound.top;
			c2.beginPath();
			c2.moveTo(mouse1X,mouse1Y);
			c2.lineTo(mouse2X,mouse2Y);
			c2.stroke();
			//console.log(mouse2X+", "+mouse2Y);
		}
		else if(!penIsDown){clearTempCanvases()}
	}
	else if(currentTool == "rectangle"){
		if(penIsDown){
			clearTempCanvases()
			mouse2X = e.pageX - bound.left;
			mouse2Y = e.pageY - bound.top;
			c2.beginPath();
			c2.strokeRect(mouse1X,mouse1Y,mouse2X-mouse1X,mouse2Y-mouse1Y);
		}
		else if(!penIsDown){clearTempCanvases()}
	}
	else if(currentTool == 'polygon'){
		clearTempCanvases();
		if(penIsDown){
			mouse2X = e.pageX - bound.left;
			mouse2Y = e.pageY - bound.top;

			c2.beginPath();
			c2.moveTo(mouse1X,mouse1Y);
			c2.lineTo(mouse2X,mouse2Y);
			c2.stroke();
			polygonVert = [];
			polygonVert.push([mouse2X,mouse2Y]);
			startAng = lineAngle(mouse1X,mouse1Y,mouse2X,mouse2Y);
			var polyRad = dist(mouse1X,mouse1Y,mouse2X,mouse2Y);
			var angle = startAng;
			var radVec;
			for(var v = 1; v < sideNum; v++){
				angle = startAng+(v*AngStep);
				radVec = vPrd([Math.cos(angle), Math.sin(angle)],polyRad);
				polygonVert.push(vSum([mouse1X,mouse1Y],radVec));
			}
			
			c2.beginPath();
			c2.moveTo(polygonVert[0][0], polygonVert[0][1]);
			for(var x = 1; x < polygonVert.length; x++){
				c2.lineTo(polygonVert[x][0], polygonVert[x][1]);
			}
			c2.lineTo(polygonVert[0][0], polygonVert[0][1]);
			c2.closePath();
			updatePen();
			c2.stroke();				
		}
	}
	else if(currentTool == "circle"){
		if(!centerSelected){clearTempCanvases()}
		else if(centerSelected){
			if(!penIsDown){
				clearTempCanvases()
				mouse_ix = e.pageX - bound.left;
				mouse_iy = e.pageY - bound.top;
				c2.beginPath();
				c2.moveTo(centerX,centerY);
				c2.lineTo(mouse_ix,mouse_iy);
				c2.stroke();
			}
			else if(penIsDown){
				clearTempCanvases()
				mouse_ix = e.pageX - bound.left;
				mouse_iy = e.pageY - bound.top;
				
				stopAngle = lineAngle(centerX,centerY,mouse_ix,mouse_iy);
				if(Math.abs(startAngle-stopAngle)<(Math.PI/60)){
						if(reverseCheckbox.checked){stopAngle = startAngle + 2*Math.PI}
						else if(!reverseCheckbox.checked){stopAngle = startAngle - 2*Math.PI}
				}
				
				c2.beginPath();
				if(reverseCheckbox.checked){c2.arc(centerX,centerY,radius,startAngle,stopAngle);}
				else{c2.arc(centerX,centerY,radius,stopAngle,startAngle);}
				c2.stroke();
			}
		}
	}
	else if(currentTool == "ellipse"){
		clearTempCanvases();
		if(!penIsDown){
			if(curveStarted){
				//clearTempCanvases();
				mouse_ix = e.pageX - bound.left;
				mouse_iy = e.pageY - bound.top;
				
				c2.beginPath();
				c2.moveTo(mouse1X,mouse1Y);
				c2.lineTo(mouse_ix,mouse_iy);
				c2.stroke();
			}
		}else{
			if(curveStarted){
				c2.clearRect(-5,-((axisLength/2)+5),axisLength+10,axisLength+10);
				//c2.strokeRectRect(-5,-((axisLength/2)+5),axisLength+10,axisLength+10);
			
				c2.beginPath();
				c2.moveTo(0,0);
				c2.lineTo(axisLength,0);
				c2.stroke();
				
				mouse2X = e.pageX - bound.left;
				mouse2Y = e.pageY - bound.top;
				
				c2.restore();
				c2.save();
				scaleFactor = 2*mod(lineDist([mouse1X,mouse1Y],[mouse_ix,mouse_iy],[mouse2X,mouse2Y]))/axisLength;
				
				c2.scale(1, scaleFactor);
				c2.beginPath();
				c2.arc(axisLength/2,0,axisLength/2,0,2*Math.PI);
				c2.stroke();
			}
		}
	}
	else if(currentTool == "freehand"){
		if(penIsDown){
			mouse1X = mouse2X;
			mouse1Y = mouse2Y;
			mouse2X = e.pageX - bound.left;
			mouse2Y = e.pageY - bound.top;
			c2.beginPath();
			c2.moveTo(mouse1X,mouse1Y);
			c2.lineTo(mouse2X,mouse2Y);
			c2.stroke();
			freeHand.push(new Array(mouse2X,mouse2Y));
		}else{
			clearTempCanvases();
		}
	}
	else if(currentTool == "curve"){
		if(penIsDown){
			if(!curveStarted){
				clearTempCanvases()
				mouse2X = e.pageX - bound.left;
				mouse2Y = e.pageY - bound.top;
				c2.beginPath();
				c2.moveTo(mouse1X,mouse1Y);
				c2.lineTo(mouse2X,mouse2Y);
				c2.stroke();
				//console.log(mouse2X+", "+mouse2Y);
			}
			else if(curveStarted){
				clearTempCanvases()
				mouse2X = e.pageX - bound.left;
				mouse2Y = e.pageY - bound.top;
				c2.beginPath();
				c2.moveTo(mouse_ix,mouse_iy);
				c2.lineTo(mouse2X,mouse2Y);
				c2.stroke();
				c2.beginPath();
				c2.moveTo(mouse1X,mouse1Y);
				c2.quadraticCurveTo(mouse_ix,mouse_iy,(mouse_ix+mouse2X)/2,(mouse_iy+mouse2Y)/2);
				c2.stroke();
				//console.log(mouse2X+", "+mouse2Y);
			}
		}
		else if(!penIsDown){clearTempCanvases()}
	}
	else if(currentTool == "floodFill"){
		clearTempCanvases();
	}
	else if(currentTool == "eraser"){
		if(penIsDown){
			clearTempCanvases()
			mouse2X = e.pageX - bound.left;
			mouse2Y = e.pageY - bound.top;
			c2.beginPath();
			c2.strokeRect(mouse1X,mouse1Y,mouse2X-mouse1X,mouse2Y-mouse1Y);
		}
		else if(!penIsDown){clearTempCanvases()}
	}
	else if(currentTool == "image"){
		if(penIsDown){
			clearTempCanvases()
			
			mouse2X = e.pageX - bound.left;
			mouse2Y = e.pageY - bound.top;
			// console.log('drawing on c2');
			c2.drawImage(imageUploaded,mouse1X,mouse1Y,mouse2X-mouse1X,(mouse2X-mouse1X)*aspectRatio);
			//c2.strokeRect(mouse1X,mouse1Y,mouse2X-mouse1X,(mouse2X-mouse1X)*aspectRatio);
		}
		else if(!penIsDown){
			clearTempCanvases()
		}
	}
	else if(currentTool == "text"){
		clearTempCanvases()
		mouse1X = e.pageX - bound.left;
		mouse1Y = e.pageY - bound.top;
		
		var txt = $('#text_input').val();
		var txtSize = $('#textSize').val();
		if(txt != ""){
			c2.font = txtSize+"px Arial";
			c2.fillText(txt, mouse1X, mouse1Y);
		}
	}
});

//keyboard listener behavior	
window.addEventListener("keydown",press_btn,false);
function press_btn(e){
	if(e.keyCode == 27){
		if(currentTool == "freehand"){
			freeHand[freeHand.length-1][2] = false;
		}
		penIsDown = false;
		centerSelected = false;
		curveStarted = false;
		if(currentTool == 'ellipse'){
			c1.restore();
			c2.restore();c2.restore();//have to restore two times
		}
		$('#text_input').val('');
		clearTempCanvases()
		loadTool(curToolDOM);
	}else if(e.keyCode == 90 && e.ctrlKey){//this is ctrl+z - undo
		if(curSketch.tempObj.length == 0){
			return;//because nothing to undo
		}
		clearTempCanvases();
		c1.clearRect(0,0,canvas1.width,canvas1.height);

		deleted = curSketch.tempObj.pop();
		curSketch.delObj.push(deleted);

		renderSketch(curSketch);
	}else if(e.keyCode == 89 && e.ctrlKey){//this is ctrl+y - redo
		if(curSketch.delObj.length == 0){
			return;//because nothing to redo
		}
		clearTempCanvases();
		c1.clearRect(0,0,canvas1.width,canvas1.height);

		toAdd = curSketch.delObj.pop();
		curSketch.tempObj.push(toAdd);

		renderSketch(curSketch);
	}
}

function resetApp(){
	clearTempCanvases()
	c1.clearRect(0,0,canvas1.width,canvas1.height);
	penIsDown = false;

	curSketch = newSketch();
}
$('#clear_btn').click(function(){resetApp();});

function renderSketch(sketch){
	for(var i = 0; i < sketch.objects.length; i++){
		renderObject(sketch.objects[i],c1);
	}

	for(var i = 0; i < sketch.tempObj.length; i++){
		renderObject(sketch.tempObj[i],c1);
	}
}

$('#render_btn').click(function(){renderSketch(curSketch)});

function loadTool(toolIcon){
	currentTool = toolIcon.getElementsByTagName('img')[0].alt;
	curToolDOM = toolIcon;
	// console.log(curToolDOM, currentTool);
	//now updating the UI
	$('.tool').css('border', 'solid 1px #efefef');
	curToolDOM.style.border = 'solid 1px #888888';
	//loading different UI
	if(currentTool=="line"){
		$('#chain_box').show();
		$('#fill_box').hide();
		$('#reverse_box').hide();
		$('#text_inputBox').hide();
		$('#imgUpload_box').hide();
		$('#polygonToolBox').hide();
		helpText.text('Pick starting point of the line');
	}
	else if(currentTool=="rectangle"){
		$('#chain_box').hide();
		$('#imgUpload_box').hide();
		$('#fill_box').show();
		$('#reverse_box').hide();
		$('#text_inputBox').hide();
		$('#polygonToolBox').hide();
		helpText.text('Pick first corner of the rectangle');
	}
	else if(currentTool=="circle"){
		$('#chain_box').hide();
		$('#fill_box').hide();
		$('#imgUpload_box').hide();
		$('#reverse_box').show();
		$('#text_inputBox').hide();
		$('#polygonToolBox').hide();
		helpText.text('Select the centre of the arc/circle');
	}
	else if(currentTool == "freehand"){
		$('#chain_box').hide();
		$('#fill_box').hide();
		$('#reverse_box').hide();
		$('#imgUpload_box').hide();
		$('#text_inputBox').hide();
		$('#polygonToolBox').hide();
		helpText.text('Click to start drawing free hand');
	}
	else if(currentTool == "curve"){
		$('#chain_box').hide();
		$('#fill_box').hide();
		$('#reverse_box').hide();
		$('#imgUpload_box').hide();
		$('#text_inputBox').hide();
		$('#polygonToolBox').hide();
		helpText.text('Pick the starting point of the curve');
	}
	else if(currentTool == "floodFill"){
		$('#chain_box').hide();
		$('#fill_box').hide();
		$('#reverse_box').hide();
		$('#imgUpload_box').hide();
		$('#text_inputBox').hide();
		$('#polygonToolBox').hide();
		helpText.text('Pick an Internal point to fill');
	}
	else if(currentTool == "eraser"){
		$('#chain_box').hide();
		$('#fill_box').hide();
		$('#reverse_box').hide();
		$('#imgUpload_box').hide();
		$('#text_inputBox').hide();
		$('#polygonToolBox').hide();
		helpText.text('Pick first corner of the area to be cleared');
	}
	else if(currentTool == "image"){
		$('#chain_box').hide();
		$('#fill_box').hide();
		$('#reverse_box').hide();
		$('#imgUpload_box').show();
		$('#text_inputBox').hide();
		$('#polygonToolBox').hide();
		helpText.text('Choose an image file to upload and draw');
	}
	else if(currentTool == "text"){
		$('#chain_box').hide();
		$('#fill_box').hide();
		$('#reverse_box').hide();
		$('#imgUpload_box').hide();
		$('#text_inputBox').show();
		$('#polygonToolBox').hide();
		helpText.text('Type the text in the field');
	}
	else if(currentTool == "ellipse"){
		$('#chain_box').hide();
		$('#fill_box').show();
		$('#reverse_box').hide();
		$('#imgUpload_box').hide();
		$('#text_inputBox').hide();
		$('#polygonToolBox').hide();
		helpText.text('Select the starting point of the first axis');
	}
	else if(currentTool == "polygon"){
		$('#chain_box').hide();
		$('#fill_box').show();
		$('#reverse_box').hide();
		$('#imgUpload_box').hide();
		$('#text_inputBox').hide();
		$('#polygonToolBox').show();
		helpText.text('Pick the center of the polygon');
		updateSides();
	}
}

function loadImage() {
	var input = document.getElementById('imgUpload');
	if (input.files && input.files[0]) {
		var reader = new FileReader();
		
		reader.onload = function (e) {
			//$('#imageUploaded').attr('src', e.target.result);
			$('#imageUploaded').remove();
			$('<img src="'+e.target.result+'" id="imageUploaded" height="100px" style="visibility:hidden"/>').appendTo('#bottomBar');
			//imageUploaded.src = e.target.result;
		}
		
		reader.readAsDataURL(input.files[0]);
		imageIsLoaded = true;
		helpText.text('Click where you want to place the image\n on the canvas');
	}
}

function updatePen(){//updates stroke, fill, lineWidths etc.
	c1.fillStyle = $('#fillColor').val();
	c2.fillStyle = $('#fillColor').val();
	
	c1.strokeStyle =  $('#strokeColor').val();
	
	if($('#lineWidth').val() > 20){$('#lineWidth').val(20);}
	if($('#lineWidth').val() <1){$('#lineWidth').val(1);}
	c1.lineWidth = $('#lineWidth').val();
	c2.lineWidth = $('#lineWidth').val();
}

function updateSides(){
	var num = $('#numOfSides').val();
	sideNum = num;
	if(num < 3){
		$('#numOfSides').val(3);
		sideNum = 3;
	}else if(num > 30){
		$('#numOfSides').val(30);
		sideNum = 30;
	}
	AngStep = 2*Math.PI/sideNum;
}

function saveImage(){
	//window.location.href = canvas1.toDataURL('image/png')//.replace('image/png','image/octet-stream');
	//console.log(canvas1.toDataURL('image/png'));
	window.win = open(canvas1.toDataURL('image/png'));
	setTimeout('win.document.execCommand("SaveAs")', 0);
	//alert('yo');
	//console.log(dataURL);
}
$('#save_btn').click(function(){
	//this callback format is needed because onload takes time sometimes.
	//to update the thumbnail
	update_thumb(curSketch, saveSketch);
});

//adds the dawing object to the curSketch.tempObj list
function addObject(obj){
	curSketch.tempObj.push(obj);
}

function getNewName(){
	newName = prompt('Give a name to this sketch (max 20 characters)');
	while(newName.length > 20 || newName == 'None'){
		newName = prompt('Name is either too long or invalid, try again(max 20 characters)');
	}
	return newName;
}

//this reports the error in the datapacket as alert, if any.
function reportError(data_packet){
	if(data_packet.error != ""){
		alert('Error: '+data_packet.error);
	}
}

//this function saves the current sketch to the server
function saveSketch(){
	//code to save the above object somewhere
	// console.log(curSketch.thumbnail);
	var sk =  cloneObject(curSketch);
	sk.objects = sk.objects.concat(sk.tempObj);
	sk.tempObj = new Array();
	sk.delObjects = new Array();
	if(sk.name == "None"){
		sk.name = getNewName();
		curSketch.name = sk.name;
	}
	
	strSketch = JSON.stringify(sk);
	
	$.post("actions.php",
    {
        action: "save",
        sketch: strSketch
    },
    function(data, status){
		var data_packet = null;
		try{
			data_packet = JSON.parse(data);
			reportError(data_packet);
			helpText.html(data_packet.message + '"'+data_packet.sketch_name+'"');

			//now printing debug messages if any
			// console.log(data_packet.debug);
		}catch(e){
			console.log(e);
			console.log(data);
		}
    });
}

//this function loads the sketch with the given id into the app.
function loadSketch(sketchID){
	$.post("actions.php",
    {
        action: "load",
        sketch_id: sketchID
    },
    function(data, status){
		var data_packet = null;
		try{
			data_packet = JSON.parse(data);
			reportError(data_packet);
			// console.log(data_packet);

			skObj = JSON.parse(data_packet.sketch);
			//now updating the helpText that loading is finished
			//loading the sketch itself into the document
			skObj.parent = skObj.uid;
			skObj.uid  = uuid.v1();
			skObj.name = "None";
			
			//clearing any prevous sketches
			resetApp();
			renderSketch(skObj);
			curSketch = skObj;
			helpText.text(data_packet.message +'"'+data_packet.sketch_name+'"');
			//printing debug messages if any
			console.log(data_packet.debug);
		}catch(e){
			console.log(e);
			console.log(data);
		}
		// console.log(data_packet);
		//this is the sketch object
    });
}

//this function updates the thumbnail
function update_thumb(sketchObj, callback, size){
	if(size === undefined){
		size = vPrd([canvas1.width, canvas1.height], thumbnail_scale);
	}
	// console.log(size);

	steps = Math.ceil(Math.log(10) / Math.log(2));

	img_data = canvas1.toDataURL();

	var img = new Image();
	img.src = img_data;

	img.onload = function(){
		var canvas = document.createElement('canvas');
		var ctx = canvas.getContext('2d');
		canvas.width = size[0];
		canvas.height = size[1];

		var oc   = document.createElement('canvas'),
		octx = oc.getContext('2d');

		oc.width  = img.width  * 0.5;
		oc.height = img.height * 0.5;
		//making it a white background
		octx.fillStyle = '#ffffff';
		octx.fillRect(0,0,oc.width, oc.height);

		octx.drawImage(img, 0, 0, oc.width, oc.height);
		//2
		octx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5);
		//3
		ctx.drawImage(oc, 0, 0, oc.width * 0.5, oc.height * 0.5,
                  0, 0, canvas.width,   canvas.height);
		// console.log(canvas.toDataURL());
		
		sketchObj.thumbnail = canvas.toDataURL();
		callback();
	}
}