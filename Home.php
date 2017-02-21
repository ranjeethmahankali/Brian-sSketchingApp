<?php
	print<<<END
			<!DOCTYPE html>
			<html>
				<head>
				<link rel = "stylesheet" type ="text/css" href= "index.css">
				<script>
				/*function columb(str) {
					if (str == "") {
						document.getElementById("").innerHTML = "";
						return;
					} else { 
						if (window.XMLHttpRequest) {
							// code for IE7+, Firefox, Chrome, Opera, Safari
							xmlhttp = new XMLHttpRequest();
						} else {
							// code for IE6, IE5
							xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
						}
						xmlhttp.onreadystatechange = function() {
							if (this.readyState == 4 && this.status == 200) {
								document.getElementById("txtHint").innerHTML = this.responseText;
							}
						};
						xmlhttp.open("GET","getuser.php?q="+str,true);
						xmlhttp.send();
					}
				}*/
				</script>
				</head>
			<body class = "home">
			
END;
//if(!isset($_POST[$toDraw])){
	print <<< EOB
		<div id="welcome">
			<h1>Welcome to Brian'sSketchPad</h1>
			<span id="welcomePara">Where you can start a new drawing or you can browse and add to an existing drawing</span>
			<form action = "Home.php" method = "post">
				<input type = "hidden" name="draw" value=0>
				<input type = "submit" value="Add" >
			</form>
			<form action="Home.php" method="post">
			<input type = "hidden" name="draw" value=0>
			<input type = "submit" value="Start New">
			</form>
		</div>
EOB;
	print <<< END
	<div>
		<table>
		  <tr>
			<td></td>
		  </tr>
		</table>
	</div>
END;
/*}elseif(isset($_POST[draw])){
	
	possibly login with uw net id
	setcookie(name, value, expire, path, domain, secure, httponly);
	
	session_start();
	
	$_SESSION['sesh1']="";
	
	require_once("dbconnect.php");
    $db = new mysqli($server,$user,$password,$database);
	if ($mylink->connect_errno) {
		die("Connection failed: " . $mylink->connect_error);
	}else {
		print"Connection successful.";
	}
	<div>

	</div>
}*/

	print"</body>";
	print"</html>";


?>