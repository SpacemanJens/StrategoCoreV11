function joinGame() {
    // don't let current players double join
    if (me.playerName.startsWith("player")) return;

    for (let spacecraft of spacecrafts) {
        console.log("Checking spacecraft:", spacecraft.playerName);
        if (!guests.find((p) => p.playerName === spacecraft.playerName)) {
            spawn(spacecraft);
            return;
        }
    }
}

function spawn(spacecraft) {
    console.log("Spawning spacecraft:", spacecraft.playerName);
    me.playerNumber = spacecraft.playerNumber;
    me.playerName = spacecraft.playerName;
    me.playerDisplayName = spacecraft.playerDisplayName;
    me.team = spacecraft.team;
    me.characterId = spacecraft.characterId;
    me.characterRank = spacecraft.characterRank;
    me.characterName = spacecraft.characterName;
    me.characterInstanceId = spacecraft.characterInstanceId;
    me.size = spacecraft.size;
    me.isReady = spacecraft.isReady;
    me.hasCharacter = spacecraft.hasCharacter;
    me.status = spacecraft.status;
    me.lastProcessedResetFlag = spacecraft.lastProcessedResetFlag;
    me.xLocal = spacecraft.xLocal;
    me.yLocal = spacecraft.yLocal;
    me.xGlobal = spacecraft.xGlobal;
    me.yGlobal = spacecraft.yGlobal;
    me.diameter = spacecraft.diameter;
    me.color = spacecraft.color;
    me.bullets = [];
    me.hits = Array(15).fill(0);
    me.planetIndex = -1;
    me.lastWarpTime = 0; // Reset warp cooldown when spawning
}

function createSpacecrafts() {
    for (let i = 0; i < TOTAL_NUMBER_OF_PLAYERS; i++) {

        let teamName;
        if (i <= TOTAL_NUMBER_OF_PLAYERS / 2) {
            teamName = 'blue';
        } else {
            teamName = 'green';
        }
        playerName = "player" + i;
        playerDisplayName = playerName;

        spacecrafts.push(new Spacecraft({
            playerNumber: i,
            playerName: "player" + i,
            playerDisplayName: playerDisplayName,
            team: teamName,
            characterId: null,
            characterRank: null,
            characterName: null,
            characterInstanceId: null,
            iAmHost: null,
            isReady: false,
            hasCharacter: false,
            status: "available",
            lastProcessedResetFlag: false,
            xLocal: GAME_AREA_WIDTH / 2 + 100,
            yLocal: GAME_AREA_HEIGHT / 2,
            xGlobal: 3000 / 2 - GAME_AREA_WIDTH / 2 + 400,
            yGlobal: 3500 / 2 - GAME_AREA_HEIGHT / 2,
            diameter: SPACECRAFT_SIZE,
            size: SPACECRAFT_SIZE,
            xMouse: 0,
            yMouse: 0,
            color: "",
            bullets: [],
            hits: Array(15).fill(0),
            planetIndex: -1,
        }));
    }
}

function drawGameSetup() {
    if (!me.isReady) {
        const centerX = IMAGE_RING_X + CIRCLE_RADIUS + 90;
        const centerY = IMAGE_RING_Y + CIRCLE_RADIUS + 290;

        if (imagesStillLoading) {

            // Draw progress bar
            const barX = chooseTeamBlueButton.x - 7;
            const barY = chooseTeamBlueButton.x + chooseTeamBlueButton.height + 5;
            const barWidth = chooseTeamBlueButton.width * 2 + 15;
            const barHeight = 2; // Thin rectangle

            let progress = 0;
                       if (totalImagesToLoadForPrepareImages > 0) {
                progress = imagesLoadedCount / totalImagesToLoadForPrepareImages;
            } else if (!imagesStillLoading) {
                progress = 1; // If no images to load and loading is marked as finished 2 3
            }
            progress = constrain(progress, 0, 1);

            fill(0, 255, 0);
            rect(barX, barY, barWidth * progress, barHeight);
        }

        // Show name input elements 
        fill(255);
        textSize(20);
        textAlign(CENTER, CENTER);
        text("Enter your player name and choose a team:", centerX, centerY);

        // Calculate team counts
        let blueTeamCount = guests.filter(p => p.isReady && p.team === 'blue').length;
        let greenTeamCount = guests.filter(p => p.isReady && p.team === 'green').length;

        // Conditionally show buttons or full message
        if (blueTeamCount >= MAX_PLAYERS_PER_TEAM && greenTeamCount >= MAX_PLAYERS_PER_TEAM) {
            // Both teams full
            if (nameInput) nameInput.show();
            if (chooseTeamBlueButton) chooseTeamBlueButton.hide();
            if (chooseTeamGreenButton) chooseTeamGreenButton.hide();
            fill(255, 100, 100);
            textSize(18);
            textAlign(CENTER, CENTER);
            text("New players cannot join because both teams are full.", centerX, centerY);
        } else {
            // At least one team has space
            if (nameInput) nameInput.show();
            if (chooseTeamBlueButton) {
                if (blueTeamCount < MAX_PLAYERS_PER_TEAM) chooseTeamBlueButton.show();
                else {
                    chooseTeamBlueButton.hide();
                    fill(150); textSize(14); textAlign(CENTER, CENTER);
                    text("Purple Team Full", chooseTeamBlueButton.x + chooseTeamBlueButton.width / 2,
                        chooseTeamBlueButton.y + chooseTeamBlueButton.height + 10);
                }
            }
            if (chooseTeamGreenButton) {
                if (greenTeamCount < MAX_PLAYERS_PER_TEAM) chooseTeamGreenButton.show();
                else {
                    chooseTeamGreenButton.hide();
                    fill(150); textSize(14); textAlign(CENTER, CENTER);
                    text("Green Team Full", chooseTeamGreenButton.x + chooseTeamGreenButton.width / 2,
                        chooseTeamGreenButton.y + chooseTeamGreenButton.height + 10);
                }
            }
        }
    } else {
        // Hide initial setup UI
        if (nameInput) nameInput.hide();
        if (chooseTeamBlueButton) chooseTeamBlueButton.hide();
        if (chooseTeamGreenButton) chooseTeamGreenButton.hide();

        // Draw welcome text and character list
        drawTopLeftInfo();
        drawCharacterList();

        // Display setup messages if countdown hasn't started
        if (!shared.gameStartTimerStartTime) {
            const statusMsgX = GAME_AREA_X + GAME_AREA_WIDTH / 2;
            const statusMsgY = GAME_AREA_Y - 30;

            let blueFlagSelected = shared.characterList.some(c => c.team === 'blue' && c.id === 'C' && c.takenByPlayerId !== null);
            let greenFlagSelected = shared.characterList.some(c => c.team === 'green' && c.id === 'C' && c.takenByPlayerId !== null);

            fill(255, 100, 100);
            textAlign(CENTER, CENTER);
            textSize(20);

            let statusText = "";

            if (!blueFlagSelected || !greenFlagSelected) {
                if ((me.team === 'blue' && !blueFlagSelected) ||
                    (me.team === 'green' && !greenFlagSelected)) {
                    statusText = "A player from your team must select a Core Command...";
                    //console.log({ guests })
                    //console.log()
                } else {
                    statusText = "Waiting for the other team to choose a Core Command...";
                }
            }

            if (statusText) {
                text(statusText, statusMsgX, statusMsgY);
            }
        }
    }
}
function displayTwoPlayersWithTheSamePlayerNumber() {

    let samePlayerNumber = false
    const playerNumbers = Array(guests.length).fill(0)
    guests.forEach(p => {
        playerNumbers[p.playerNumber]++
    });

    let twoPlayersWithTheSamePlayerNumber = false
    playerNumbers.forEach((count, index) => {
        if (count > 1) {
            twoPlayersWithTheSamePlayerNumber = true

        }
    });
    if (twoPlayersWithTheSamePlayerNumber) {
        samePlayerNumber = true
    }

    if (samePlayerNumber) {
        fill(255, 0, 0); // Red color
        textAlign(LEFT, TOP);
        textSize(12);
        let displayPlayerNumberIssueText = "Two players have the same playerNumber. One must refresh the browser."
        text(displayPlayerNumberIssueText, GAME_AREA_X + 40, 35);
    }
}

function playerWithDuplicateNumber(playerNumber) {
    const playerNumbers = guests.map(p => p.playerNumber);
    return playerNumbers.filter(num => num === playerNumber).length > 1;
}
function displayHostName() {
    fill(255, 223, 0);
    textSize(16);
    textAlign(LEFT, TOP);
    const infoX = SCREEN_WIDTH - 180; // Position from the right edge of the screen
    const infoY = 20;

    if (partyIsHost()) {
        text("HOST: Me", infoX, infoY);
    } else {
        const hostPlayers = guests.filter(p => p.iAmHost === true); // Ensure we check the boolean property
        if (hostPlayers.length > 0) {
            const hostPlayer = hostPlayers[0]; // Get the first host found
            const hostDisplayName = hostPlayer.playerDisplayName || `Player ${hostPlayer.playerNumber}`; // Fallback
            text(`HOST: ${hostDisplayName}`, infoX, infoY);
        } else {
            text("Host client not identified", infoX, infoY); // Fallback if no host is found in guests
        }
    } 
}
function setPlayerInfo(team) {
    const playerDisplayName = nameInput.value().trim();
    message = ""; // Clear previous messages

    if (playerDisplayName.length > 0) {
        // Check team count before joining
        let blueTeamCount = guests.filter(p => p.isReady && p.team === 'blue').length;
        let greenTeamCount = guests.filter(p => p.isReady && p.team === 'green').length;

        if (team === 'blue' && blueTeamCount >= MAX_PLAYERS_PER_TEAM) {
            // alert("Cannot join Blue Team, it is full (max 3 players).");
            message = "Cannot join Purple Team, it is full.";
            return;
        }

        if (team === 'green' && greenTeamCount >= MAX_PLAYERS_PER_TEAM) {
            // alert("Cannot join Green Team, it is full (max 3 players).");
            message = "Cannot join Green Team, it is full.";
            return;
        }
        setSpawnLocation();

        me.playerDisplayName = playerDisplayName;
        me.team = team;
        me.isReady = true;
        nameInput.hide();
        chooseTeamBlueButton.hide();
        chooseTeamGreenButton.hide();
    } else {
        // alert("Please enter a player name.");
        message = "Please enter a player name.";
    }
}
function updateTowerCount() {
    gameObjects = generateTowers();
    // Set planetIndex to 3 for all towers
    shared.gameObjects = gameObjects.map(tower => ({
        xGlobal: tower.xGlobal,
        yGlobal: tower.yGlobal,
        diameter: tower.diameter,
        color: tower.color,
        type: tower.type,
        bullets: [],
        angle: 0,
        hits: Array(15).fill(0),
        planetIndex: 3, // Set to planet 3 specifically
        lastShotTime: 0,
        xSpawnGlobal: tower.xSpawnGlobal,
        ySpawnGlobal: tower.ySpawnGlobal,
    }));
}

function generateTowers() {
    const towers = [];

    // Table of predefined tower locations
    const towerTable = [
        { x: 2000, y: 1000, color: 'red', type: 0 },
        { x: 1750, y: 1200, color: 'blue', type: 1 },
        { x: 1500, y: 1500, color: 'green', type: 2 },
    ];
  
    for (let i = 0; i < towerTable.length; i++) {
        const tower = towerTable[i];
/*
        towers.push(new Canon({
            objectNumber: i,
            objectName: `canon${i}`,
            xGlobal: tower.x,
            yGlobal: tower.y,
            diameter: 60,
            xSpawnGlobal: tower.x,
            ySpawnGlobal: tower.y,
            color: tower.color,
            type: tower.type,
            planetIndex: 3,
        }));
        */
    }

    return towers;
}
function resolvePlayerNumberConflicts() {
    const conflictMessage = "Another player has the same playerNumber. Please refresh the browser window";

    if (playerWithTheSamePlayerNumberAsMeExist()) {
        // Only set the message if it's not already set to avoid flickering
        if (message !== conflictMessage) {
            message = conflictMessage;
        }
    } else {
        // Clear the message ONLY if it's the specific conflict message
        if (message === conflictMessage) {
            message = ""; // Clear the message
        }
    }
}
function playerWithTheSamePlayerNumberAsMeExist() {
    const playerNumbers = Array(guests.length).fill(0)
    guests.forEach(p => {
        playerNumbers[p.playerNumber]++
    });

    if (playerNumbers[me.playerNumber] > 1) {
        return true
    }
    return false
}
function twoPlayersWithTheSamePlayerNumberExist() {
    const playerNumbers = Array(guests.length).fill(0)
    guests.forEach(p => {
        playerNumbers[p.playerNumber]++
    });

    let twoPlayersWithTheSamePlayerNumber = false
    playerNumbers.forEach((count, index) => {
        if (count > 1) {
            twoPlayersWithTheSamePlayerNumber = true

        }
    });
    if (twoPlayersWithTheSamePlayerNumber) {
        return true
    }
    return false
}