//===================================================
// CHARACTER MANAGEMENT
//===================================================

function initializeCharacterList() {
    if (partyIsHost()) {
        shared.characterList = [];
        const teams = ['blue', 'green'];

        teams.forEach(team => {
            CHARACTER_DEFINITIONS.forEach(def => {
                for (let i = 0; i < def.count; i++) {
                    shared.characterList.push({
                        // Core definition properties
                        ...def,
                        // Instance specific properties
                        team: team,
                        instanceId: `${team}_${def.id}_${i}`,
                        takenByPlayerName: null,
                        takenByPlayerId: null,
                        isPermanentlyLost: false,
                        // Battle/Status Fields
                        status: 'available',
                        inBattleWithInstanceId: null,
                        battleOutcomeResult: null,
                        battleInfo: null,
                        color: def.color,
                    });
                }
            });
        });
        console.log("HOST: Initialized shared.characterList with team assignments and status fields.");
    }
}

function drawCharacterList() {
   // console.log("drawCharacterList");
    const listX = 10;
    let listY = 80;
    const itemHeight = 25;
    const itemWidth = 220;

    fill(200);
    textSize(14);
    textAlign(LEFT, TOP);

    // Filter list for player's team only
    const myTeamCharacterList = shared.characterList?.filter(item => item.team === me.team) || [];

    // Determine selection conditions
    let myTeamFlagChosen = guests.some(p => p.team === me.team && p.characterId === 'C' && p.takenByPlayerId !== null);
    let canSelectAnyAvailable = me.isReady && !me.hasCharacter;

    // Find the player's current character data from shared list
    let myCharacterData = shared.characterList.find(c => c.instanceId === me.characterInstanceId);

    // Battle outcome message
    if (shared.gameState !== 'GAME-FINISHED' && me.hasCharacter &&
        myCharacterData && myCharacterData.isPermanentlyLost &&
        myCharacterData.battleOutcomeResult) {
        //console.log('drawCharacterList', myTeamFlagChosen, canSelectAnyAvailable)
        //console.log(me)
    }
    // Filter drawable characters
    const drawableCharacters = myTeamCharacterList.filter(item => !item.isPermanentlyLost);

    drawableCharacters.forEach((item, index) => {
        let displayY = listY + index * itemHeight;
        let isAvailable = !item.takenByPlayerName;
        let canSelectItem = false;

        // Determine selectability
        if (!shared.resetFlag && canSelectAnyAvailable && isAvailable) {
            if (item.isCoreCommand) {
                // Can select flag only if team flag isn't chosen 
                canSelectItem = !myTeamFlagChosen;
            } else {
                // Can select non-flag if team flag IS chosen OR game is already in progress
                canSelectItem = myTeamFlagChosen || shared.gameState !== 'GAME-SETUP';
            }
        }

        // Highlighting logic
        if (mouseX > listX && mouseX < listX + itemWidth &&
            mouseY > displayY && mouseY < displayY + itemHeight) { // Added !imagesStillLoading

            if (canSelectItem) {
                fill(0, 150, 200, 150); // Highlight selectable
                //                fill(133, 69, 196, 150);
                noStroke();
                rect(listX, displayY, itemWidth, itemHeight);
            } else if (isAvailable) {
                fill(100, 100, 100, 100); // Highlight available but not selectable
                noStroke();
                rect(listX, displayY, itemWidth, itemHeight);
            }
        }

        // Text color logic
        if (!isAvailable) fill(100); // Taken
        else if (canSelectItem) fill(255); // Selectable by me
        else fill(150); // Available but not selectable by me

        // Display text
        let displayText = `(${item.id}) ${item.name}`;

        let hitByOthers = numberOfTimesBeingHit(item.takenByPlayerId)

        if (!isAvailable) displayText += ` - ${item.takenByPlayerName} (${hitByOthers}/10)`;

        textAlign(LEFT, CENTER);
        text(displayText, listX + 5, displayY + itemHeight / 2);
    });

    textAlign(LEFT, TOP); // Reset alignment
}

function numberOfTimesBeingHit(takenByPlayerId) {
    let hitByOthers = 0;
    spacecrafts.forEach(spacecraft => {
        hitByOthers += spacecraft.hits[takenByPlayerId];
    })
    hitByOthers += shared.canonTowerHits[takenByPlayerId];

    return hitByOthers;
}
function handleCharacterSelection() {
    const listX = 10;
    let listY = 80;
    const itemHeight = 25;
    const itemWidth = 220;

    // Filter for player's team only
    const myTeamCharacterList = shared.characterList?.filter(item => item.team === me.team) || [];

    // Get team flag status
    let myTeamFlagChosen = guests.some(p => p.team === me.team && p.characterId === 'C' && p.takenByPlayerId !== null);

    const selectableCharacters = myTeamCharacterList.filter(item => !item.isPermanentlyLost);

    for (let index = 0; index < selectableCharacters.length; index++) {
        const item = selectableCharacters[index];
        let displayY = listY + index * itemHeight;
        let isAvailable = !item.takenByPlayerName;
        let canSelectItem = false;

        if (isAvailable) {
            if (item.isCoreCommand) {
                canSelectItem = !myTeamFlagChosen;
            } else {
                canSelectItem = myTeamFlagChosen || shared.gameState !== 'GAME-SETUP';
            }
        }

        if (canSelectItem &&
            mouseX > listX && mouseX < listX + itemWidth &&
            mouseY > displayY && mouseY < displayY + itemHeight) {

            // Assign character details to 'me'
            me.characterId = item.id;
            me.characterRank = item.rank;
            me.characterName = item.name;
            me.characterInstanceId = item.instanceId;
            me.hasCharacter = true;
            me.status = "available";
            me.playerColor = item.color;

            if (item.isCoreCommand) {
                setSpawnLocation();
            } else {
                spawnNextToCoreCommand();
            }

            console.log(`Selected: ${me.characterName} (${me.characterInstanceId}) for team ${me.team}`);
            break; // Exit loop once selection is made
        }
    }
}
