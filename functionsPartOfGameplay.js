function drawGameStats() {
    const statsX = GAME_AREA_X + 50;
    const statsY = GAME_AREA_Y + 70;
    const sectionSpacing = 30;
    const lineHeight = 20;
    const headerSize = 18;
    const textSizeNormal = 14;

    push();
    textAlign(LEFT, TOP);
    fill(255);

    // Section 1: Title
    textSize(headerSize);
    text("Game Statistics", statsX, statsY);

    // Section 2: Team Scores
    const scoresY = statsY + sectionSpacing;
    textSize(textSizeNormal);
    fill(133, 69, 196); // Purple
    text(`Team PURPLE Wins: ${shared.blueWins || 0}`, statsX, scoresY);
    fill(0, 200, 100); // Green
    text(`Team GREEN Wins: ${shared.greenWins || 0}`, statsX, scoresY + lineHeight);
    fill(200); // Gray
    text(`Draws: ${shared.draws || 0}`, statsX, scoresY + lineHeight * 2);

    // Section 3: Players
    const playersY = scoresY + lineHeight * 3 + sectionSpacing;

    // Headers for teams
    textSize(headerSize);
    fill(133, 69, 196); // Purple 2 
    text("Team PURPLE", statsX, playersY);
    fill(0, 200, 100); // Green
    text("Team GREEN", statsX + 300, playersY);
    fill(200); // Gray
    text("No Team", statsX + 600, playersY);

    // List players
    textSize(textSizeNormal);
    const purplePlayers = guests.filter(p => p.isReady && p.team === 'blue');
    const greenPlayers = guests.filter(p => p.isReady && p.team === 'green');
    const noTeamPlayers = guests.filter(p => !p.isReady);

    const maxRows = Math.max(purplePlayers.length, greenPlayers.length, noTeamPlayers.length);

    for (let i = 0; i < maxRows; i++) {
        if (i < purplePlayers.length) {
            fill(133, 69, 196); // Purple
            const p = purplePlayers[i];
            let displayText = `- ${p.playerDisplayName || p.playerName} (#${p.playerNumber})`
            text(`- ${p.playerDisplayName || p.playerName} (#${p.playerNumber})`, statsX + 20, playersY + lineHeight * (i + 1));
            if (playerWithDuplicateNumber(p.playerNumber)) {
                fill(255, 0, 0); // Red
                displayText += " - Refresh Browser"
            }
            text(displayText, statsX + 20, playersY + lineHeight * (i + 1));
        }
        if (i < greenPlayers.length) {
            fill(0, 200, 100); // Green
            const p = greenPlayers[i];
            let displayText = `- ${p.playerDisplayName || p.playerName} (#${p.playerNumber})`
            if (playerWithDuplicateNumber(p.playerNumber)) {
                fill(255, 0, 0); // Red
                displayText += " - Refresh Browser"
            }
            text(displayText, statsX + 320, playersY + lineHeight * (i + 1));
        }
        if (i < noTeamPlayers.length) {
            fill(200); // Gray
            const p = noTeamPlayers[i];
            let displayText = `- ${p.playerDisplayName || p.playerName} (#${p.playerNumber})`
            if (playerWithDuplicateNumber(p.playerNumber)) {
                fill(255, 0, 0); // Red
                displayText += " - Refresh Browser"
            }
            text(displayText, statsX + 620, playersY + lineHeight * (i + 1));
        }
    }

    pop();
}
function numberOfBullets() {
    gameObjects.forEach(canon => {
        numberOfBullets += canon.bullets.length;
        // Count visible bullets
        canon.bullets.forEach(bullet => {
            let xLocal = bullet.xGlobal - me.xGlobal;
            let yLocal = bullet.yGlobal - me.yGlobal;
            if (onLocalScreenArea(xLocal, yLocal)) {
                totalNumberOfVisualBullets++;
            }
            totalNumberOfBullets++;
        });
    });
}


function drawSpacecraft(playerData, characterData) {
    // Skip drawing if not valid or lost
    if (!playerData || !playerData.hasCharacter ||
        playerData.status === 'lost' ||
        playerData.x < -playerData.size ||
        playerData.y < -playerData.size) {
        return;
    }

    // Use characterData from shared list to check status
    if (!characterData || characterData.status === 'lost') {
        return;
    }

    let drawX = constrain(playerData.x, GAME_AREA_X + playerData.size / 2, GAME_AREA_RIGHT - playerData.size / 2);
    let drawY = constrain(playerData.y, GAME_AREA_Y + playerData.size / 2, GAME_AREA_BOTTOM - playerData.size / 2);

    // Define RGB values directly instead of using color()
    let r, g, b;
    if (playerData.team === 'blue') {
        //        r = 0; g = 150; b = 255;
        r = 133; g = 69; b = 196;

    } else if (playerData.team === 'green') {
        r = 0; g = 200; b = 100;
    } else {
        r = 150; g = 150; b = 150;
    }

    // Apply appropriate stroke style
    if (playerData.playerNumber === me.playerNumber) {
        stroke(255, 255, 0);
        strokeWeight(2);
    } else {
        noStroke();
    }

    fill(r, g, b);
    ellipse(drawX, drawY, playerData.size, playerData.size);
    noStroke();

    // Reveal rank if appropriate
    const shouldRevealRank = true

    if (shouldRevealRank && playerData.characterId) {
        // Calculate brightness directly from RGB values
        let brightness = (r * 299 + g * 587 + b * 114) / 1000;
        fill(brightness > 125 ? 0 : 255);
        textSize(playerData.size * 0.45);
        textAlign(CENTER, CENTER);
        text(playerData.characterId, drawX, drawY + 1);
    }

    fill(200);
    textSize(10);
    textAlign(CENTER, BOTTOM);
    text(playerData.playerDisplayName || '?', drawX, drawY + playerData.size / 2 + 12);
} 
function drawStatusMessages() {
    const statusMsgX = GAME_AREA_X + GAME_AREA_WIDTH / 2;
    const statusMsgY = GAME_AREA_Y - 30;

    // Find the player's current character data from shared list
    let myCharacterData = shared.characterList.find(c => c.instanceId === me.characterInstanceId);

    // Battle outcome message
    if (shared.gameState !== 'GAME-FINISHED' &&
        myCharacterData && // myCharacterData.isPermanentlyLost &&
        myCharacterData.battleOutcomeResult) {

        fill(255, 0, 0);
        textAlign(CENTER, CENTER);
        textSize(20);

        let outcomeMsg = "";

        if (myCharacterData.battleInfo) {
            // Include opponent player name in the message
            const opponentPlayerName = myCharacterData.battleInfo?.playerName || 'Unknown Player';
            const opponentCharacterName = myCharacterData.battleInfo?.name || '??';
            const opponentCharacterRank = myCharacterData.battleInfo?.rank || '??';
            const myCharacterName = myCharacterData.battleInfo?.myName || '??';
            const myCharacterRank = myCharacterData.battleInfo?.myRank || '??';
            outcomeMsg = `You were a ${myCharacterName}(${myCharacterRank}) and ${myCharacterData.battleOutcomeResult} a battle vs a ${opponentCharacterName}(${opponentCharacterRank}) - ${opponentPlayerName})`;
        } else {
            outcomeMsg = `${myCharacterData.battleOutcomeResult}`;
        }
        text(outcomeMsg, statusMsgX, statusMsgY);
    }    // General game message (including team full messages) 
    else if (message) {
        fill(255);
        textAlign(CENTER, CENTER);
        textSize(24);
        text(message, statusMsgX, statusMsgY);
        // Clear message after displaying once to avoid persistence
        // Consider a timed clear if needed
        // message = ""; // Optional: Clear immediately
    }
    // Game start countdown
    else if (shared.gameState === 'GAME-SETUP' && shared.gameStartTimerStartTime) {
        fill(200);
        textSize(18);
        textAlign(CENTER, CENTER);
        text(`A new game is starting in ${shared.gameStartTimerSeconds} seconds...`, statusMsgX, statusMsgY);
    }
    // Game reset countdown
    else if (shared.gameState === 'GAME-FINISHED' && shared.resetTimerStartTime) {
        fill(200);
        textSize(18);
        textAlign(CENTER, CENTER);
        text(`A new game will be setup in ${shared.resetTimerSeconds} seconds...`, statusMsgX, statusMsgY);
    }
}
function onLocalScreenArea(xLocal, yLocal) {
    return xLocal >= 0 && xLocal <= GAME_AREA_WIDTH && yLocal >= 0 && yLocal <= GAME_AREA_HEIGHT;
}

// Draw warp gates count down on the game area with cooldown visualization
function drawWarpGateCountDownOnGameArea() {
    // Calculate relative position for up warp gate based on global coordinates
    let xLocalUp = selectedPlanet.xWarpGateUp - me.xGlobal;
    let yLocalUp = selectedPlanet.yWarpGateUp - me.yGlobal;

    // Calculate relative position for down warp gate based on global coordinates  
    let xLocalDown = selectedPlanet.xWarpGateDown - me.xGlobal;
    let yLocalDown = selectedPlanet.yWarpGateDown - me.yGlobal;

    // Check if warp gate is in cooldown
    const currentTime = millis();
    const isCooldown = currentTime - me.lastWarpTime < WARP_COOLDOWN_TIME;
    const cooldownRatio = isCooldown ?
        (currentTime - me.lastWarpTime) / WARP_COOLDOWN_TIME : 1;

    // Draw the "up" warp gate if it's visible on screen
    if (onLocalScreenArea(xLocalUp, yLocalUp)) {
        push();
        if (isCooldown) {

            // Draw cooldown progress arc
            noFill();
            stroke('cyan');
            strokeWeight(10);

            let diameterCountdown = 30
            arc(
                GAME_AREA_X + xLocalUp,
                GAME_AREA_Y + yLocalUp,
                diameterCountdown * 0.8,
                diameterCountdown * 0.8,
                0,
                cooldownRatio * TWO_PI
            );
            pop();
        }
    }

    // Draw the "down" warp gate if it's visible on screen
    if (onLocalScreenArea(xLocalDown, yLocalDown)) {
        push();
        if (isCooldown) {
            // Draw cooldown progress arc
            noFill();
            stroke('magenta');
            strokeWeight(10);

            let diameterCountdown = 30
            arc(
                GAME_AREA_X + xLocalDown,
                GAME_AREA_Y + yLocalDown,
                diameterCountdown * 0.8,
                diameterCountdown * 0.8,
                0,
                cooldownRatio * TWO_PI
            );
        }
        pop();
    }
}
  

function drawCharacterListAndInfo() {
    //console.log("drawCharacterListAndInfo");
    // Draw welcome text and character list
    if (me.isReady) {
        drawTopLeftInfo();
        drawCharacterList();
    }
}

function drawCanonTowers() {
    if (!gameObjects) return;

    // Draw Canon Towers for all players - only on planet 3
    if (me.planetIndex === 3) {
        gameObjects.forEach(canon => {
            canon.drawCanonTower();
            canon.drawBullets();
        });
    }
}

function drawSpacecrafts() {
    // Draw all active spacecraft 
    /*
        guests.forEach(p => {
            const characterData = shared.characterList.find(c => c.instanceId === p.characterInstanceId);
            if (p.hasCharacter && characterData && characterData.status !== 'lost') {
                let spacecraft = spacecrafts.find(s => s.playerNumber === p.playerNumber);
                drawSpacecraft(p, characterData);
            }
        }); 
    */
    spacecrafts.forEach((spacecraft) => {
        //        console.log({spacecraft})
        //        console.log(me) 

        if (spacecraft.planetIndex === me.planetIndex) {
            const characterData = shared.characterList.find(c => c.instanceId === spacecraft.characterInstanceId);
            //console.log("CharacterData:", characterData);
            if (spacecraft.hasCharacter && characterData && characterData.status !== 'lost') {
                //console.log("Drawing spacecraft:", spacecraft.playerName);

                spacecraft.drawBullets();
                spacecraft.drawSpacecraft(characterData);
            }
        }
    });
}

function drawGameFinished() {
    // Draw welcome text and character list
    if (me.isReady) {
        drawTopLeftInfo();
        drawCharacterList();
    }

    // Draw all remaining spacecraft (revealed)
    guests.forEach(p => {
        const characterData = shared.characterList.find(c => c.instanceId === p.characterInstanceId);
        if (characterData && !characterData.isPermanentlyLost) {
            let tempData = { ...p };
            drawSpacecraft(tempData, characterData);
        }
    });

    // Display Winner Message
    const winMsgX = GAME_AREA_X + GAME_AREA_WIDTH / 2;
    const winMsgY = GAME_AREA_Y + GAME_AREA_HEIGHT / 2;
    fill(255, 223, 0);
    textSize(36);
    textAlign(CENTER, CENTER);

    let winText = "Game Over!";
    if (shared.coreCommandDisconnected) {
        if (shared.winningTeam === "blue") {
            winText = `PURPLE TEAM WINS! (because Core Command disconnected)`;
        } else {
            winText = `GREEN TEAM WINS! (because Core Command disconnected)`;
        }
    } else if (shared.winningTeam === "draw") {
        winText = `DRAW as the two Core Commanders were in battle! `;
    } else if (shared.winningTeam) {
        if (shared.winningTeam === "blue") {
            winText = `PURPLE TEAM WINS! `;
        } else {
            winText = `GREEN TEAM WINS! `;
        }
        if (shared.winningPlayerName && !shared.winningPlayerName.includes("Time's up")) {
            winText += `\n(Core Command captured by ${shared.winningPlayerName})`;
            textSize(24);
        } else {
            winText += `\n(Core Command was hit too many times)`;
        }
    }
    text(winText, winMsgX, winMsgY - 20);
}
function spawnNextToCoreCommand() {
    // Find the Core Command character for the same team that is currently taken
    const coreCommandCharacter = shared.characterList.find(c =>
        c.team === me.team &&
        c.id === 'C' &&
        c.takenByPlayerId !== null
    );

    if (coreCommandCharacter && coreCommandCharacter.takenByPlayerId !== null) {
        // Find the player object (from guests) who is the Core Command
        const coreCommandPlayer = guests.find(p => p.playerNumber === coreCommandCharacter.takenByPlayerId);

        if (coreCommandPlayer) {
            // Spawn 'me' at the exact same location as the Core Command player
            me.planetIndex = coreCommandPlayer.planetIndex;
            me.xGlobal = coreCommandPlayer.xGlobal;
            me.yGlobal = coreCommandPlayer.yGlobal;
            me.xLocal = coreCommandPlayer.xLocal;
            me.yLocal = coreCommandPlayer.yLocal;

            if (me.planetIndex !== -1 && solarSystem && solarSystem.planets[me.planetIndex]) {
                selectedPlanet = solarSystem.planets[me.planetIndex];
            } else {
                console.warn(`SpawnNextToCoreCommand: Core Command player ${coreCommandPlayer.playerName} has invalid planetIndex ${me.planetIndex}. Falling back to default spawn.`);
                setSpawnLocation(); // Fallback if planetIndex is invalid
            }
            console.log(`Player ${me.playerName} spawning at Core Command ${coreCommandPlayer.playerName}'s location on planet ${me.planetIndex}.`);
        } else {
            console.warn(`SpawnNextToCoreCommand: Core Command player (ID: ${coreCommandCharacter.takenByPlayerId}) not found in guests. Falling back to default spawn.`);
            setSpawnLocation(); // Fallback if Core Command player not found
        }
    } else {
        console.warn(`SpawnNextToCoreCommand: Core Command for team ${me.team} not found or not taken. Falling back to default spawn.`);
        setSpawnLocation(); // Fallback if Core Command character not found/taken 
    }
}

function setSpawnLocation() {
    if (me.team === 'blue') {
        me.planetIndex = planetIndexBlue;
    } else {
        me.planetIndex = planetIndexGreen;
    }
    selectedPlanet = solarSystem.planets[me.planetIndex];

    if (!selectedPlanet) {
        console.error("Selected planet is undefined in setSpawnLocation. Defaulting to center.");
        // Default spawn if planet data is missing
        me.xGlobal = SCREEN_WIDTH / 2; // Or some other sensible default 2
        me.yGlobal = SCREEN_HEIGHT / 2;
        me.xLocal = GAME_AREA_WIDTH / 2;
        me.yLocal = GAME_AREA_HEIGHT / 2;
        return;
    }

    if (me.planetIndex === 1) {
        if (me.team === 'blue') {
            // Blue team spawns 100 pixels to the right of the 'up' warp gate
            me.xGlobal = selectedPlanet.xWarpGateDown - 400;
            me.yGlobal = selectedPlanet.yWarpGateDown - 200;
            me.xLocal = GAME_AREA_WIDTH / 2 + 200;
            me.yLocal = GAME_AREA_HEIGHT / 2 + 100;

        } else { // Green team        
            // Preserve existing local coordinate setup for green team
            me.xGlobal = selectedPlanet.xWarpGateUp - GAME_AREA_WIDTH / 2 - 200;
            me.yGlobal = selectedPlanet.yWarpGateUp - GAME_AREA_HEIGHT / 2 - 100;
            me.xLocal = GAME_AREA_WIDTH / 2 - 200;
            me.yLocal = GAME_AREA_HEIGHT / 2 - 100;
        }
    } else if (me.planetIndex === 4) {
        if (me.team === 'blue') {
            // Blue team spawns 100 pixels to the right of the 'up' warp gate
            // Preserve existing local coordinate setup for green team
            me.xGlobal = selectedPlanet.xWarpGateUp - GAME_AREA_WIDTH / 2 - 200;
            me.yGlobal = selectedPlanet.yWarpGateUp - GAME_AREA_HEIGHT / 2 - 100;
            me.xLocal = GAME_AREA_WIDTH / 2 - 200;
            me.yLocal = GAME_AREA_HEIGHT / 2 - 100;

        } else { // Green team        
            // Preserve existing local coordinate setup for green team
            me.xGlobal = selectedPlanet.xWarpGateDown - GAME_AREA_WIDTH / 2 - 200;
            me.yGlobal = selectedPlanet.yWarpGateDown - GAME_AREA_HEIGHT / 2 - 100;
            me.xLocal = GAME_AREA_WIDTH / 2 - 200;
            me.yLocal = GAME_AREA_HEIGHT / 2 - 100;
        }
    } else {
        if (me.team === 'blue') {
            // Blue team spawns 100 pixels to the right of the 'up' warp gate
            me.xGlobal = selectedPlanet.xWarpGateUp - 400;
            me.yGlobal = selectedPlanet.yWarpGateUp - 200;
            me.xLocal = GAME_AREA_WIDTH / 2 + 200;
            me.yLocal = GAME_AREA_HEIGHT / 2 + 100;

        } else { // Green team        
            // Preserve existing local coordinate setup for green team
            me.xGlobal = selectedPlanet.xWarpGateDown - GAME_AREA_WIDTH / 2 - 200;
            me.yGlobal = selectedPlanet.yWarpGateDown - GAME_AREA_HEIGHT / 2 - 100;
            me.xLocal = GAME_AREA_WIDTH / 2 - 200;
            me.yLocal = GAME_AREA_HEIGHT / 2 - 100;
        }
    }
}
function handleBulletMovement() {
    const myCharacterData = shared.characterList.find(c => c.instanceId === me.characterInstanceId);

    for (let i = me.bullets.length - 1; i >= 0; i--) {
        let bullet = me.bullets[i];
        let bulletVector = createVector(
            int(bullet.xMouseStart) - bullet.xStart,
            int(bullet.yMouseStart) - bullet.yStart,
        ).normalize();

        let currentBulletSpeed = parseInt(BULLET_SPEED);
        if (myCharacterData && myCharacterData.canSnipe) {
            currentBulletSpeed *= 2; // Sniper bullets are twice as fast
        }

        bullet.xLocal += bulletVector.x * currentBulletSpeed;
        bullet.yLocal += bulletVector.y * currentBulletSpeed;

        // Update global coordinates
        bullet.xGlobal += bulletVector.x * currentBulletSpeed;
        bullet.yGlobal += bulletVector.y * currentBulletSpeed;

        let xLocalTemp = bullet.xLocal - (me.xGlobal - bullet.xGlobal);
        let yLocalTemp = bullet.yLocal - (me.yGlobal - bullet.yGlobal);

        // Remove bullet if it's not on the screen seen from the spacecraft shooting it
        if (!selectedPlanet.onPlanet(bullet.xLocal + bullet.xGlobal, bullet.yLocal + bullet.yGlobal)
            || !onLocalScreenArea(xLocalTemp, yLocalTemp)) {
            me.bullets.splice(i, 1);
        }
    }
}
 function handlePlayerLoss() {
    if (!me.hasCharacter) return;

    console.log(`Player ${me.playerName} processing loss of ${me.characterName} (${me.characterInstanceId}) locally.`);

    // Reset player state
    me.hasCharacter = false;
    me.characterId = null;
    me.characterRank = null;
    me.characterName = null;
    me.planetIndex = -1;
    me.status = 'lost'; // Intermediate status
    if (me.team === 'blue') {
        me.planetIndex = planetIndexBlue;
    } else {
        me.planetIndex = planetIndexGreen;
    }
}


