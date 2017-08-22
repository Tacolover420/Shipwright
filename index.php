<?php include("../../utilities.php"); ?>
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		<meta name="description" content="">
		<meta name="author" content="Ben Sergent V">
		<link rel="icon" href="../../favicon.ico">

		<title>BFSV-Coding | Shipwright</title>

		<!-- Bootstrap core CSS -->
		<link href="../../bootstrap/dist/css/bootstrap.min.css" rel="stylesheet">

		<!-- Custom styles for this template -->
		<link href="../../stylesheets/theme.css" rel="stylesheet">
		<link href="css/uiskin.css" rel="stylesheet">

		<script src="https://oss.maxcdn.com/html5shiv/3.7.2/html5shiv.min.js"></script>
		<script src="https://oss.maxcdn.com/respond/1.4.2/respond.min.js"></script>
		<script data-main="js/main.js" src="js/lib/require.js"></script>
	</head>

	<body>

		<?php include "../../menu-src.php"; ?>

		<span id="sessionId" style="display:none;"><?php echo $_SESSION['sessionId']; ?></span>
		<span id="username" style="display:none;"><?php echo $_SESSION['username']; ?></span>

		<div class="container" style="width:95%; max-width:1200px;">

			<div class="blog-header">
				<h1 class="blog-title"><img src="../../images/ha1fBitLogo.png" class="img-rounded" style="margin-right: 5px; width: 50px; height: 50px; vertical-align:middle">BFSV Coding</h1>
				<p class="lead blog-description">Ben Sergent V's application and game development blog.</p>
			</div>

			<div class="row">
				<div class="col-xs-12 col-xs-offset-0 col-sm-10 col-sm-offset-1" style="text-align:center; margin-top:-30px; margin-bottom:15px;">
					<h1 class="blog-title">Shipwright</h1>
				</div>
			</div>

			<div class="row">
				<div class="col-sm-12 col-md-10 col-lg-9">
					<div id="game-container">
						<canvas id="game" width="800" height="600" tabfocus="1" style=""></canvas>
						<canvas id="buffer" width="800" height="600" tabfocus="1" style="visibility:hidden; display:none;"></canvas>
					</div>
				</div>
				<div class="col-sm-8 col-md-2 col-lg-3" style="padding:5px;">
					<table>
						<tbody id="fpsBody">
						</tbody>
					</table>
				</div>
				<div class="col-sm-8 col-md-2 col-lg-3" style="padding:5px;">
					<table>
						<tr><th colspan="3">Crew</th></tr>
						<tbody id="inventoryBody">
							<tr><td>None</td></tr>
						</tbody>
					</table>
				</div>
				<div class="col-sm-4 col-md-2 col-lg-3" style="padding:5px;">
					<table>
						<tr><th id="hoveredStructuresHeader">Affiliations</th></tr>
						<tbody id="hoveredStructuresBody">
							<tr><td>None</td></tr>
						</tbody>
					</table>
				</div>
			</div>

			<!--<div style="text-align:center;">
				<input type="text" id="red" size="3" placeholder="r"></input>
				<input type="text" id="green" size="3" placeholder="g"></input>
				<input type="text" id="blue" size="3" placeholder="b"></input>
				<input type="text" id="strength" size="1" placeholder="a"></input>
			</div>-->

			<div id="instr">
				<div>
				<h2>How to Play</h2>
					<table>
					<tr><th>Key</th><th>Action</th></tr>
					<tr><td>W</td><td>Unfurl sails</td></tr>
					<tr><td>S</td><td>Furl sails</td></tr>
					<tr><td>A/D</td><td>Rudder to port/starboard</td></tr>
					<tr><td>R</td><td>Drop/raise anchor</td></tr>
					<tr><td>P</td><td>Cycle ship type</td></tr>
					<tr class="disabled"><td>M</td><td>View sea charts</td></tr>
					<tr class="disabled"><td>Q/E</td><td>Fire port/starboard cannons</td></tr>
					<tr class="disabled"><td>Shift</td><td>Fire bow cannon</td></tr>
					<tr class="disabled"><td>Space</td><td>Row</td></tr>
					</table>
				</div>
			</div>

		</div><!-- /.container -->

		<?php include "../../footer-src.php"; ?>
	</body>
</html>
