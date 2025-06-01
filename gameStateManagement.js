//===================================================
// STATE SYNCHRONIZATION
//===================================================

function receiveNewDataFromHost() {
    // Ensure client has same number of towers as host
    while (gameObjects.length < shared.gameObjects.length) {
        const i = gameObjects.length;
        gameObjects.push(new Canon({
            objectNumber: i,
            objectName: `canon${i}`,
            xGlobal: shared.gameObjects[i].xGlobal,
            yGlobal: shared.gameObjects[i].yGlobal,
            diamter: 60,
            color: 'grey',
            xSpawnGlobal: shared.gameObjects[i].xSpawnGlobal,
            ySpawnGlobal: shared.gameObjects[i].ySpawnGlobal,
            planetIndex: shared.gameObjects[i].planetIndex,

        }));
    } 
    // Remove extra towers if host has fewer
    while (gameObjects.length > shared.gameObjects.length) {
        gameObjects.pop();
    }
    // Update existing towers
    gameObjects.forEach((canon, index) => {
        canon.diameter = shared.gameObjects[index].diameter;
        canon.color = shared.gameObjects[index].color;
        canon.type = shared.gameObjects[index].type;

        canon.xGlobal = shared.gameObjects[index].xGlobal;
        canon.yGlobal = shared.gameObjects[index].yGlobal;
        canon.bullets = shared.gameObjects[index].bullets;
        canon.angle = shared.gameObjects[index].angle;
        canon.lastShotTime = shared.gameObjects[index].lastShotTime; // Sync lastShotTime
        canon.hits = shared.gameObjects[index].hits || Array(15).fill(0);
        canon.planetIndex = shared.gameObjects[index].planetIndex;
    });
}

function stepLocal() {
    spacecrafts.forEach(spacecraft => {
        const guest = guests.find((p) => p.playerName === spacecraft.playerName);
        if (guest) {
            spacecraft.syncFromShared(guest);
        } else {
            spacecraft.planetIndex = -1;
        }
    });

}

function updateLocalStateFromSharedList() {
    if (!shared.characterList || shared.characterList.length === 0) return;

    // Find the player's current character data from shared list
    let myCharacterData = shared.characterList.find(c => c.instanceId === me.characterInstanceId);

    // Battle outcome message
    if (shared.gameState !== 'GAME-FINISHED' && me.hasCharacter &&
        myCharacterData && myCharacterData.isPermanentlyLost &&
        myCharacterData.battleOutcomeResult) {
        handlePlayerLoss();
    }
    // --- Reset Hit Counts for Lost Opponents ---
    if (me.hits && me.hits.length > 0) {
        for (let playerId = 0; playerId < me.hits.length; playerId++) {
            // Skip self and skip if already zero
            if (playerId === me.playerNumber || me.hits[playerId] === 0) {
                continue;
            }

            // Only reset hit counts for players that are PERMANENTLY lost
            // This ensures that players in battle or temporarily without characters still maintain their hit count
            const playerIsPermanentlyLost = !shared.characterList.some(character =>
                character.takenByPlayerId === playerId &&
                !character.isPermanentlyLost
            );

            if (playerIsPermanentlyLost) {
                console.log(`Client ${me.playerName}: Resetting hits for player ${playerId} as they are permanently lost.`);
                me.hits[playerId] = 0;
            }
        }
    }
}
function resetClientState() {
    console.log(`Client Resetting State for ${me.playerName || 'New Player'}...`);

    // Save important state to preserve - jens
    let savedPlayerNumber = me.playerNumber;
    let savedPlayerName = me.playerName;
    let savedPlayerDisplayName = me.playerDisplayName;
    let savedTeam = me.team;
    let savedIsReady = me.isReady;
    let savedPlanetIndex;

    if (me.team === 'blue') {
        savedPlanetIndex = planetIndexBlue;
    } else {
        savedPlanetIndex = planetIndexGreen;
    }

    // Reset player state jens
    Object.assign(me, {
        playerNumber: savedPlayerNumber,
        playerName: savedPlayerName,
        playerDisplayName: savedPlayerDisplayName,
        team: savedTeam,
        isReady: savedIsReady,
        characterId: null,
        characterRank: null,
        characterName: null,
        characterInstanceId: null,
        planetIndex: savedPlanetIndex,
        hasCharacter: false,
        status: "available",
        hits: Array(15).fill(0),
    });

    message = "";

    // Reset UI elements
    if (!nameInput || !nameInput.elt) createNameInput();
    if (!chooseTeamBlueButton || !chooseTeamBlueButton.elt) createNameInput();
    if (!chooseTeamGreenButton || !chooseTeamGreenButton.elt) createNameInput();

    // Show/Hide UI based on player setup state
    if (me.isReady) {
        nameInput.hide();
        chooseTeamBlueButton.hide();
        chooseTeamGreenButton.hide();
    } else {
        nameInput.show();
        chooseTeamBlueButton.show();
        chooseTeamGreenButton.show();
    }

    console.log("Client state reset complete.");
}

