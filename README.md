# BriansSketchingApp

style1.css - styling for the mainpage where you can browse the sketch tree;
scribbleCss.css - styling for the scribble app;

common.php - this file contains all the common php functions used in other php file;
index.php - main page where you can browse the sketch tree;
scribble.php - this is the app with which you can scribble;
actions.php - the scribble app talks to this file through ajax and either saves a sketch or loads a saved sketch when needed;
fb-callbacl.php - this is where we are redirecting the user to our mainpage after he/she logged into facebook;
login.php - this is where we send the user to facebook login page;

scribbleScript.js - this is the JS file which has the code, to capture, click coordinates and draw stuff to the canvas. And also functions to talk to 'actions.php';
funcLibrary.js - funcLibrary has the function definitions for all the 2d vector math that is used in scribbleScript.js. I wrote them all and use them for all 2d JS apps.

src/Facebook/ - this folder contains facebook stuff.. I donno about this one, vicente did this.
icons/ - this folder has the icons for the UI of the scribble app.