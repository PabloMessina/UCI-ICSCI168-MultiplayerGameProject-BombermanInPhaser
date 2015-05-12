var Bomberman = Bomberman || {};

Bomberman.Lobby = function(){};

Bomberman.Lobby.prototype = {

	create: function() {  	

		console.log("--------------------------------");
		console.log("===> Lobby.create()");


		this.numPlayers = lobbyReceivedData.indices.length;

		//offsets
		this.startBtnOffsetX = 100;
		this.startBtnOffsetY = 390;
		this.leaveBtnOffsetX = 100;
		this.leaveBtnOffsetY = 430;
		this.characterSquaresOffsets = [
			{offsetX: 100, offsetY: 120}, 
			{offsetX: 205, offsetY: 120},
			{offsetX: 100, offsetY: 220},
			{offsetX: 205, offsetY: 220}
		];
		this.hostMessageOffsetX = 50;
		this.hostMessageOffsetY = 20;
		this.minPlayerMessageOffsetX = 100;
		this.minPlayerMessageOffsetY = 320;
		this.characterOffsetX = 3;
		this.characterOffsetY = 3;

		this.characterColors = ["blue", "black", "red", "white"];	
		this.characterHeadFrames = [
			"bomberman_head_blue.png", "bomberman_head_black.png", 
			"bomberman_head_red.png", "bomberman_head_white.png"
		];	

		//message telling us that we are the host
		this.youAreHostMessage = this.game.add.text(
			this.hostMessageOffsetX,
			this.hostMessageOffsetY, 
			"You are the Host"
		);
		this.youAreHostMessage.font = "Carter One";
		this.youAreHostMessage.fill = "black";
		this.youAreHostMessage.fontSize = 17;	

		//draw character squares
		this.characterSquares = this.drawCharacterSquares(playerNumber);

		//draw character heads of the players already in the lobby
		this.characterHeads = this.drawCharacterHeads();
		console.log("printing this.characterHeads on create()");
		console.log(this.characterHeads);

		//start button
		this.startGameButton = this.game.add.button(
			this.startBtnOffsetX, 
			this.startBtnOffsetY,
			"global_spritesheet", 
			null, this, 
			"button_start_game_locked.png",  
			"button_start_game_locked.png"
		);		

		//leave button
		this.leaveGameButton = this.game.add.button(
			this.leaveBtnOffsetX, 
			this.leaveBtnOffsetY, 
			"global_spritesheet",
			this.leaveGame,
			this,
			"button_leave_over.png",
			"button_leave_out.png");

		//minimum number of players message
		this.minPlayersMessage = this.game.add.text(
			this.minPlayerMessageOffsetX, 
			this.minPlayerMessageOffsetY, 
			"Cannot start the game without\nat least 2 players."
		);
		this.minPlayersMessage.font = "Carter One";
		this.minPlayersMessage.fill = "red";
		this.minPlayersMessage.fontSize = 17;

		//set visibilities of 3 elements based on whether we are the host or not
		this.youAreHostMessage.visible = IamHost;
		this.startGameButton.visible = IamHost;
		this.minPlayersMessage.visible = IamHost;

		//register call back functions
		socket.on("new user has joined the lobby", this.handle_newUserJoined.bind(this));
		socket.on("a user has left the lobby", this.handle_someUserHasLeft.bind(this));
		socket.on("gamelist", this.goBackToMultiplayerMenu);
		socket.on("you are the new host", this.enableHostMode.bind(this));

	},

	drawCharacterSquares: function(playerNumber) {
		var characterSquares = [];

		for(var i = 0; i < 4; i++) {

			characterSquares.push(
				this.game.add.sprite(
					this.characterSquaresOffsets[i].offsetX,
					this.characterSquaresOffsets[i].offsetY,
					"global_spritesheet",
					"character_square_darkgray.png")
			);

		}

		characterSquares[playerNumber].frameName = "character_square_lightgray.png";

		return characterSquares;
	},

	drawCharacterHeads: function() {
		var characterHeads = [];
		for(var i = 0; i < 4; ++i) {
			var image = this.game.add.image(
				this.characterSquares[i].position.x + this.characterOffsetX,
				this.characterSquares[i].position.y + this.characterOffsetY,
				"global_spritesheet", this.characterHeadFrames[i]);
			image.visible = false;
			characterHeads.push(image);
		}
		var indices = lobbyReceivedData.playerIndices;
		for(var i = 0; i < indices.length; ++i) {
			var index = indices[i];
			characterHeads[index].visible = true;
		}
		return characterHeads;
	},

	handle_someUserHasLeft: function(data) {
		console.log("-----------------------------");
		console.log("===> handle_someUserHasLeft()");
		var spotNumber = data.spotNumber;
		this.characterHeads[spotNumber].visible = false;
		this.numPlayers--;
		if(IamHost) {
			this.checkIfCanStartGame();
		}

	},

	handle_newUserJoined: function(data) {
		console.log("-----------------------------");
		console.log("===> handle_newUserJoined()");
		var spotNumber = data.spotNumber;
		this.characterHeads[spotNumber].visible = true;
		this.numPlayers++;
		if(IamHost) {
			this.checkIfCanStartGame();
		}
	},

	leaveGame: function() {
		socket.emit('leaving lobby', {game_id: gameID, spotNumber: playerNumber});
	},

	goBackToMultiplayerMenu: function(data) {
		gamelist = data;
		socket.removeAllListeners();
		Bomberman.game.state.start("MultiplayerMenu");
	},

	enableHostMode: function() {
		IamHost = true;
		this.youAreHostMessage.visible = IamHost;
		this.startGameButton.visible = IamHost;
		this.minPlayersMessage.visible = IamHost;
	},

	checkIfCanStartGame: function() {
		if(this.numPlayers >= 2) {
			//do something
		} else {
			//do something else
		}
	}


};