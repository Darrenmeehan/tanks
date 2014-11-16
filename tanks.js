$(document).ready(function() { // Ensuring document has fully loaded

	// Global variables
	var GAME_FONTS = "bold 20px sans-serif";
	var direction = "up"; // direction the tank is facing. Can be up,down,left,right
	window.onkeydown = keypress; // Call to function keypress when a key on the keyboard is pressed

	// Scoring system
	var header = document.getElementById("header");
	header.width = 600;
	header.height = 50;

	// Setting up canvas
	var canvas = document.getElementById("canvas");
	canvas.width = 600;
	canvas.height = 600;
	var tile_size = 50;
	var column_count = 12; // number of tiles in a single column
	var row_count = 12; // number of tiles in a single row
	// Tank
	var tank_r = 11;
	var tank_c = 3;


	var ctx = canvas.getContext("2d");
	ctx.font = GAME_FONTS;
	ctx.save();
	var TIME_PER_FRAME = 30;
	var gameloop = setInterval(update, TIME_PER_FRAME);
	var refresh = 0; // number of game refreshes

	// Mapping
	// 0 == no obstacles
	// 1 == wall
	// Row 0, Column 0 deals with 50 * 50 pixels
	// Row 1, Column 1 deals with 
	var map = [
		//['0','1','2','3','4','5','6','7','8','9',10',11',]
		['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'], // Row 0
		['0', '1', '0', '1', '0', '1', '0', '0', '0', '0', '0', '1'], // Row 1
		['0', '1', '0', '1', '0', '1', '0', '1', '0', '0', '0', '1'], // Row 2
		['0', '1', '0', '1', '0', '1', '0', '1', '0', '0', '0', '1'], // Row 3
		['0', '0', '0', '1', '0', '1', '0', '1', '0', '0', '0', '1'], // Row 4
		['0', '1', '1', '1', '0', '0', '0', '1', '0', '0', '0', '0'], // Row 5
		['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'], // Row 6
		['0', '1', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0'], // Row 7
		['0', '1', '0', '1', '0', '0', '1', '0', '0', '0', '0', '0'], // Row 8
		['0', '1', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0'], // Row 9
		['0', '1', '0', '1', '0', '0', '0', '0', '0', '0', '0', '0'], // Row 10
		['0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0', '0'] // Row 11
	];

	function createMap() {
		for (var r = 0; r < column_count; r++) {
			for (var c = 0; c < row_count; c++) {
				// other colours to use
				//#0E5144
				//#44887B
				//#6DA398
				// Getting colours from http://paletton.com/#uid=13+0u0kllllaFw0g0qFqFg0w0aF
				//console.log("Column: " + c  + " Row: " + r);
				if (map[r][c] === "1") {
					//var tile = map[ r ][ c ];
					drawBlock("#00362B", c, r);
					//console.log("Drawing block at col: " + c + ", row: " + r);
				}
				else if (map[r][c] == "0") {
					drawBlock("#6DA398", c, r);
				}
			}
		}
	}

	function drawBlock(colour, row, column) {
		var x = row * 50;
		var y = column * 50;
		ctx.fillStyle = colour;
		ctx.fillRect(x, y, tile_size, tile_size);
	}

	/* Tank object to be used by player and AI 
	 * If the tank is AI then it only has 1 life.
	 * If Tank is a player it has mulitpule lives, and a score
	 */
	var Tank =function(playable) {
		this.column = 3;
		this.row = 11;
		this.direction = "up";
		this.x = this.column * 50;
		this.y = this.row * 50;
		this.colour = "green";
		this.firing = false;
		this.bulletX = 0; //origin for bullet to start at
		this.bulletY = 0;
		this.playable = playable;
		this.lives = 1;
		if (this.playable) {
			this.score = 0;
			this.lives = 3;
		}
	}

	// Creating a new instance of Tank() for the player
	var player = new Tank(true);
	//console.log(player.colour);
	//console.log("player column " + player.column);

	Object.observe(player, shootBullet);

	function drawTank(Tank) {
		var tank_x = tank_c * 50; // row
		var tank_y = tank_r * 50; // location
		var barrel_x = 0;
		var barrel_y = 0;

		if (direction == "up") {
			ctx.fillStyle = "#343477";
			ctx.fillRect(tank_x + 10, tank_y + 5, 30, 40);
			// Tank tracks
			ctx.fillStyle = "#09093B";
			ctx.fillRect(tank_x, tank_y, 10, 50); // left tank track
			ctx.fillRect(tank_x + 40, tank_y, 10, 50); // right tank track
			ctx.strokeRect(tank_x + 20, tank_y, 10, 30);
			ctx.fillStyle = "#09093B";
			ctx.fillRect(tank_x + 20, tank_y, 10, 30); // tank barrel
			barrel_x = tank_x + 20;
			barrel_y = tank_y;
		}
		else if (direction == "right") {
			ctx.fillStyle = "#343477"; // main tank body
			ctx.fillRect(tank_x + 10, tank_y + 5, 30, 40); // main tank body
			// Tank tracks
			ctx.fillStyle = "#09093B";
			ctx.fillRect(tank_x, tank_y + 0, 50, 10); // left tank track
			ctx.fillRect(tank_x, tank_y + 40, 50, 10); // right tank track
			ctx.strokeRect(tank_x + 20, tank_y + 20, 30, 10);
			ctx.fillStyle = "#09093B"; // tank barrel colour
			ctx.fillRect(tank_x + 20, tank_y + 20, 30, 10); // tank barrel

		}
		else if (direction == "left") {
			ctx.fillStyle = "#343477"; // main tank body
			ctx.fillRect(tank_x + 10, tank_y + 5, 30, 40); // main tank body
			// Tank tracks
			ctx.fillStyle = "#09093B";
			ctx.fillRect(tank_x, tank_y, 50, 10); // left tank track
			ctx.fillRect(tank_x, tank_y + 40, 50, 10); // right tank track
			ctx.strokeRect(tank_x, tank_y + 20, 30, 10);
			ctx.fillStyle = "#09093B"; // tank barrel colour
			ctx.fillRect(tank_x, tank_y + 20, 30, 10); // tank barrel

		}
		else if (direction == "down") {
			ctx.fillStyle = "#343477";
			ctx.fillRect(tank_x + 10, tank_y + 5, 30, 40);
			// Tank tracks
			ctx.fillStyle = "#09093B";
			ctx.fillRect(tank_x, tank_y, 10, 50); // left tank track
			ctx.fillRect(tank_x + 40, tank_y, 10, 50); // right tank track
			ctx.strokeRect(tank_x + 20, tank_y + 20, 10, 30);
			ctx.fillStyle = "#09093B";
			ctx.fillRect(tank_x + 20, tank_y + 20, 10, 30); // tank barrel
		}

	}

	function Bullet() {
		this.x = tank_c * 50;
		this.y = tank_r * 50;
		this.radius = 7;
		this.speed = 10;
		this.direction = direction;
		this.fired = false;
	}

	function shootBullet() {
		var playerBullet = new Bullet();
		playerBullet = true;
		playerBullet.direction = direction;
		var bulletUpdate = setInterval(drawBullet(playerBullet), 300);
	}

	function drawBullet(playerBullet) {
		// need to get location of tank barrel
		if (playerBullet.direction === "up") {
			playerBullet.y = playerBullet.y + 10;
		}
		else if (playerBullet.direction === "right") {
			playerBullet.x = playerBullet.x + 10;
		}
		else if (playerBullet.direction === "down") {
			playerBullet.y = playerBullet.y + 10;
		}
		else if (playerBullet.direction === "left") {
			playerBullet.y = playerBullet.y + 10;
		}

		console.log("Shots fired!! at " + playerBullet.x);
		ctx.fillStyle = "black";
		//console.log(barrel_x);
		ctx.arc(playerBullet.x, playerBullet.y, 7, 0, 2 * Math.PI, false);
		ctx.fill();
	}

	function update() {
		refresh++;
		ctx.restore();
		createMap();
		drawTank();
		ctx.fillStyle = "white";
	}

	/* Handles keyboard inputs */
	function keypress(event) {
		//console.log(map[tank_r][tank_c + 1]);
		if (event.keyCode === 38) { // if up arrow is pressed
			direction = "up";
			if (map[tank_r - 1][tank_c] === "0") {
				tank_r = tank_r - 1;
			}
			else {
				tank_r = tank_r;
			}
		}
		else if (event.keyCode === 39) { // if right arrow is pressed
			direction = "right";

			if (map[tank_r][tank_c + 1] === "0") {
				tank_c = tank_c + 1;
			}
			else {
				tank_c = tank_c;
			}
		}
		else if (event.keyCode === 37) { // if left arrow is pressed
			direction = "left";

			if (map[tank_r][tank_c - 1] === "0") {
				tank_c = tank_c - 1;
			}
			else {
				tank_c = tank_c;
			}
		}
		else if (event.keyCode === 40) { // if down arrow is pressed
			direction = "down";

			if (map[tank_r + 1][tank_c] === "0") {
				tank_r = tank_r + 1;
			}
			else {
				tank_r = tank_r;
			}
		}
		else if (event.keyCode === 32) { // if space bar is pressed
			player.firing = true;
			//shootBullet();
		}
		else {
			console.log(event.keyCode);

		}
		drawTank(tank_r, tank_c, direction);

	}
});