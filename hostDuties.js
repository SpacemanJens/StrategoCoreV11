//===================================================
// HOST FUNCTIONS
//===================================================

function handleHostDuties() {
    if (!partyIsHost()) return;

    shared.currentTime = millis();

    // Mark characters as permanently lost if their player disconnected
    handleDisconnectedPlayers();

    // Update shared.characterList 'takenBy' info
    updateCharacterAssignments();

    // State machine for game phases
    //console.log("HOST: Current game state:", shared.gameState);
    //    console.log(shared.gameState);
    switch (shared.gameState) {
        case "GAME-SETUP":
            handleGameSetupHost();
            break;
        case "IN-GAME":
            //console.log("HOST: Game is in progress.");

            if (!shared.coreCommandLost) {
                handleGameInProgressHost();
            }
            break;
        case "GAME-FINISHED":
            handleGameFinishedHost();
            break;
    }
}

// Add this function if not present:
function handleDisconnectedPlayers() {
    if (!shared.characterList) return;

    const connectedPlayerIds = new Set(guests.map(p => p.playerNumber));

    shared.characterList.forEach(character => {
        // Only process characters that are assigned and not already lost
        if (character.takenByPlayerId && !character.isPermanentlyLost) {
            if (!connectedPlayerIds.has(character.takenByPlayerId)) {
                character.isPermanentlyLost = true;
                character.takenByPlayerId = null;
                character.takenByPlayerName = null;
                character.status = 'lost';
                character.inBattleWithInstanceId = null;
                character.battleOutcomeResult = null;
                character.battleInfo = null;
            }
        }
    });
}
function updateCharacterAssignments() {
    if (!shared.characterList) return;

    // Build map of current assignments
    let currentAssignments = new Map();
    guests.forEach(p => {
        if (p.hasCharacter && p.characterInstanceId) {
            currentAssignments.set(p.characterInstanceId, {
                name: p.playerDisplayName,
                playerNumber: p.playerNumber
            });
        }
    });

    // Update assignments in shared list
    shared.characterList.forEach(item => {
        if (!item.isPermanentlyLost) {
            const assignment = currentAssignments.get(item.instanceId);
            if (assignment) {
                if (item.takenByPlayerId !== assignment.playerNumber) {
                    item.takenByPlayerName = assignment.name;
                    item.takenByPlayerId = assignment.playerNumber;
                }
            } else if (item.takenByPlayerId !== null) {
                // Clear assignment if no longer owned
                item.takenByPlayerName = null;
                item.takenByPlayerId = null;
            }
        } else {
            // Ensure lost pieces have no owner
            if (item.takenByPlayerId !== null) {
                item.takenByPlayerName = null;
                item.takenByPlayerId = null;
            }
        }
    });
}

function handleGameSetupHost() {
    // Check if flags are selected
    let blueFlagSelected = shared.characterList.some(c => c.team === 'blue' && c.id === 'C' && c.takenByPlayerId !== null);
    let greenFlagSelected = shared.characterList.some(c => c.team === 'green' && c.id === 'C' && c.takenByPlayerId !== null);

    const conditionsMet = blueFlagSelected && greenFlagSelected;

    // Start countdown if conditions met
    if (conditionsMet && shared.gameStartTimerStartTime === null) {
        console.log("HOST: Both flags selected. Starting game start countdown timer.");
        shared.gameStartTimerStartTime = shared.currentTime;
        shared.gameStartTimerSeconds = Math.floor(GAME_TRANSITION_TIME / 1000); // Initialize with full seconds
    }

    // Cancel countdown if conditions no longer met
    if (!conditionsMet && shared.gameStartTimerStartTime !== null) {
        console.log("HOST: Flag selection condition no longer met. Cancelling game start countdown timer.");
        shared.gameStartTimerStartTime = null;
        shared.gameStartTimerSeconds = null; // Clear the seconds as well
    }

    // Update timer only if it's active
    if (shared.gameStartTimerStartTime !== null) {
        const elapsedSeconds = Math.floor((shared.currentTime - shared.gameStartTimerStartTime) / 1000);
        const remainingSeconds = Math.floor(GAME_TRANSITION_TIME / 1000) - elapsedSeconds;

        // Only update if it's a valid positive number and has changed
        if (remainingSeconds >= 0 && shared.gameStartTimerSeconds !== remainingSeconds) {
            shared.gameStartTimerSeconds = remainingSeconds;
        }

        // Start game when countdown finishes
        if (shared.currentTime - shared.gameStartTimerStartTime >= GAME_TRANSITION_TIME) {
            console.log("HOST: Game start timer finished. Starting game.");
            shared.gameState = "IN-GAME";
            shared.gameStartTimerStartTime = null; // Reset timer
            shared.gameStartTimerSeconds = null; // Clear the seconds too
        }
    }
}

function handleGameInProgressHost() {
    // Reset canon tower hits
    resetCanonTowerHitsForPlayersWithoutCharacters();

    // Move canon towers, bullets, check collisions and sync to shared object 
    updateCanonTowers()

    // Check for disconnected Core Command
    checkIfCoreCommandDisconnected()

    // Detect collisions and initiate battles
    detectCollisionsAndInitiateBattles();

    // Check win conditions
    checkWinConditions();
}

function updateCanonTowers() {
    if (!gameObjects || gameObjects.length === 0) return;

    // Only process canon logic if on planet 3

    gameObjects.forEach((canon, index) => {
        canon.move();
        const currentTime = millis();
        if (currentTime - canon.lastShotTime > TOWER_SHOOTING_INTERVAL) {
            if (spacecrafts.length > 0) {
                // Only target spacecrafts that are on planet 3
                const spacecraftsOnPlanet3 = spacecrafts.filter(f => f.planetIndex === canon.planetIndex && f.hasCharacter);
                if (spacecraftsOnPlanet3.length > 0) {
                    const nearestSpacecraft = canon.findNearestSpacecraft(spacecraftsOnPlanet3);

                    if (nearestSpacecraft) {
                        canon.shoot(nearestSpacecraft);
                        canon.lastShotTime = currentTime;
                    }
                }
            }
        }

        canon.moveBullets(); // Move bullets before drawing
        canon.checkCollisionsWithSpacecrafts();  // Add this line

        // Sync to shared state
        shared.gameObjects[index] = {
            ...shared.gameObjects[index],
            xGlobal: canon.xGlobal,
            yGlobal: canon.yGlobal,
            bullets: canon.bullets,
            angle: canon.angle,
            lastShotTime: canon.lastShotTime,
            hits: canon.hits,
        };
    });
    console.log("HOST: Updated canon towers and bullets in shared state.");
    /*
        // Calculate total hits from canon towers for each player
        let totalHits = Array(15).fill(0);
        gameObjects.forEach(canon => {
            for (let i = 0; i < totalHits.length; i++) {
                totalHits[i] += canon.hits[i];
            }
        });
        shared.canonTowerHits = totalHits;
        */
    //jens 
}
function resetCanonTowerHitsForPlayersWithoutCharacters() {
    spacecrafts.forEach((spacecraft, index) => {

        if (!spacecraft.hasCharacter) {
            // Reset hits for players who have characters
            shared.canonTowerHits[spacecraft.playerNumber] = 0;
        }
    })
}

function checkIfCoreCommandDisconnected() {
    let blueFlagSelected = shared.characterList.some(c => c.team === 'blue' && c.id === 'C' && c.takenByPlayerId !== null);
    let greenFlagSelected = shared.characterList.some(c => c.team === 'green' && c.id === 'C' && c.takenByPlayerId !== null);

    if (!blueFlagSelected) {
        console.log(`HOST: GAME OVER! Green team wins as blue teams Core Command disconnected`);
        shared.winningTeam = 'green';
        shared.greenWins = (shared.greenWins || 0) + 1;
        shared.coreCommandDisconnected = true;
        shared.gameState = "GAME-FINISHED";
        return;
    }
    if (!greenFlagSelected) {
        console.log(`HOST: GAME OVER! Purple team wins as blue teams Core Command disconnected`);
        shared.winningTeam = 'blue';
        shared.blueWins = (shared.blueWins || 0) + 1;
        shared.coreCommandDisconnected = true;
        shared.gameState = "GAME-FINISHED";
        return;
    }
}

function detectCollisionsAndInitiateBattles() {
    // Only process available characters
    let activeCharacters = shared.characterList.filter(c =>
        c.takenByPlayerId !== null && c.status === 'available' && !c.isPermanentlyLost);

    // Check each pair of characters
    for (let i = 0; i < activeCharacters.length; i++) {
        let char1 = activeCharacters[i];
        let player1 = guests.find(p => p.playerNumber === char1.takenByPlayerId);
        //        let player1 = spacecrafts.find(p => p.playerNumber === char1.takenByPlayerId); jens

        if (!player1) {
            console.warn(`HOST: Player not found for active character ${char1.instanceId}`);
            continue;
        }

        // Check for loss due to hits ONLY if the character is currently 'available'
        // This prevents resetting the battle timer if already 'inBattle' waiting for resolution.
        if (char1.status === 'available') {
            let numberOfHits = numberOfTimesBeingHit(player1.playerNumber);

            if (numberOfHits >= 10) {
                const char1Def = CHARACTER_DEFINITIONS.find(c => c.id === char1.id);

                if (char1Def.isCoreCommand) {
                    console.log('flag hit too many times');
                    char1.battleOutcomeResult = 'You lost because you got hit by too many bullets!'
                    char1.status = 'noMoreLives';
                    char1.isPermanentlyLost = true;
                    char1.takenByPlayerId = null;
                    char1.takenByPlayerName = null;

                    // Clear battle fields
                    char1.inBattleWithInstanceId = null;
                    char1.battleOutcomeResult = null;
                    char1.battleInfo = null;
                    return;
                }
                let char1Index = shared.characterList.findIndex(c => c.instanceId === char1.instanceId);

                if (char1Index === -1) {
                    console.error("HOST: Could not find character in shared list for hit limit loss!");
                    continue; // Skip this character
                }

                console.log(`HOST: Initiating 'lost by hits' battle state for ${char1.instanceId}`);
                shared.characterList[char1Index].status = 'lost'; // Set status to start resolution timer
                shared.characterList[char1Index].inBattleWithInstanceId = null; // No opponent
                shared.characterList[char1Index].battleOutcomeResult = 'You lost by being hit too many times'; // Set outcome message
                shared.characterList[char1Index].battleInfo = null; // No opponent info
                shared.characterList[char1Index].isPermanentlyLost = true; // Mark as permanently lost

                // Skip regular collision checks for this character this frame as it's now 'inBattle'
                continue; // Move to the next character in the outer loop
            }
        }

        // If the character wasn't lost by hits, proceed with collision checks
        for (let j = i + 1; j < activeCharacters.length; j++) {
            let char2 = activeCharacters[j];
            let player2 = guests.find(p => p.playerNumber === char2.takenByPlayerId);
            //            let player2 = spacecrafts.find(p => p.playerNumber === char2.takenByPlayerId);

            if (!player2) {
                //console.warn(`HOST: Player not found for active character ${char2.instanceId}`);
                continue;
            }

            // Must be different teams and on the same planet
            if (player1.team === player2.team || player1.planetIndex != player2.planetIndex) continue;

            // Check collision distance using player positions
            let d = dist(player1.xGlobal + player1.xLocal, player1.yGlobal + player1.yLocal, player2.xGlobal + player2.xLocal, player2.yGlobal + player2.yLocal);
            if (d < (player1.size / 2 + player2.size / 2)) {
                //     console.log(`HOST: Collision detected between ${char1.instanceId} (${player1.playerName}) and ${char2.instanceId} (${char2.playerName}) at distance ${d.toFixed(2)}`);

                // Calculate battle outcome
                const outcome = calculateBattleOutcome(char1, char2);
                //    console.log(`HOST: Battle Outcome: ${char1.instanceId} (${outcome.char1Result}), ${char2.instanceId} (${outcome.char2Result})`);

                // Handle immediate game win (flag capture)
                if (outcome.gameWonByTeam && !outcome.coreCommandBattleDraw) {
                    //        console.log(`HOST: GAME OVER! Flag captured. Winner: ${outcome.gameWonByTeam} team by ${outcome.winningPlayerName}.`);
                    shared.gameState = "GAME-FINISHED";
                    shared.winningTeam = outcome.gameWonByTeam;
                    shared.winningPlayerName = outcome.winningPlayerName;
                    console.log("HOST: GAME OVER! Flag captured.");
                    // Update statistics
                    if (shared.winningTeam === 'blue') {
                        shared.blueWins = (shared.blueWins || 0) + 1;
                    } else if (shared.winningTeam === 'green') {
                        shared.greenWins = (shared.greenWins || 0) + 1;
                    } else if (shared.winningTeam === 'draw') {
                        shared.draws = (shared.draws || 0) + 1;
                    }
                    return;
                }

                // Find characters in shared list
                let char1Index = shared.characterList.findIndex(c => c.instanceId === char1.instanceId);
                let char2Index = shared.characterList.findIndex(c => c.instanceId === char2.instanceId);

                if (char1Index === -1 || char2Index === -1) {
                    console.error("HOST: Could not find battling characters in shared list!");
                    continue;
                }

                // Check for Core Command loss
                const char1IsFlag = CHARACTER_DEFINITIONS.find(c => c.id === char1.id)?.isCoreCommand;
                const char2IsFlag = CHARACTER_DEFINITIONS.find(c => c.id === char2.id)?.isCoreCommand;

                if (outcome.coreCommandBattleDraw ||
                    (char1IsFlag && outcome.char1Result !== 'won') ||
                    (char2IsFlag && outcome.char2Result !== 'won')) {

                    if (outcome.coreCommandBattleDraw) {
                        console.log("HOST: Core Command vs Core Command battle! Both lost.");
                    } else {
                        console.log("HOST: Core Command lost or drawn in battle!");
                    }
                    shared.coreCommandLost = true;
                }

                // Set up battle in shared list for char1
                if (outcome.char1Result === 'lost' || outcome.char1Result === 'had draw in') {
                    shared.characterList[char1Index].inBattleWithInstanceId = char2.instanceId;
                    shared.characterList[char1Index].battleOutcomeResult = outcome.char1Result;
                    shared.characterList[char1Index].isPermanentlyLost = true; // Mark as permanently lost
                    // Include opponent player name
                    shared.characterList[char1Index].battleInfo = { name: char2.name, rank: char2.rank, playerName: player2.playerDisplayName, myName: char1.name, myRank: char1.rank };
                }

                // Set up battle in shared list for char2
                if (outcome.char2Result === 'lost' || outcome.char2Result === 'had draw in') {
                    shared.characterList[char2Index].inBattleWithInstanceId = char1.instanceId;
                    shared.characterList[char2Index].battleOutcomeResult = outcome.char2Result;
                    shared.characterList[char2Index].isPermanentlyLost = true; // Mark as permanently lost
                    // Include opponent player name
                    shared.characterList[char2Index].battleInfo = { name: char1.name, rank: char1.rank, playerName: player1.playerDisplayName, myName: char2.name, myRank: char2.rank };
                }

                // Set up battle in shared list for char1
                if (outcome.char1Result === 'won') {
                    shared.characterList[char1Index].inBattleWithInstanceId = char2.instanceId;
                    shared.characterList[char1Index].battleOutcomeResult = outcome.char1Result;
                    // Include opponent player name
                    shared.characterList[char1Index].battleInfo = { name: char2.name, rank: char2.rank, playerName: player2.playerDisplayName, myName: char1.name, myRank: char1.rank };
                }

                // Set up battle in shared list for char2
                if (outcome.char2Result === 'won') {
                    shared.characterList[char2Index].inBattleWithInstanceId = char1.instanceId;
                    shared.characterList[char2Index].battleOutcomeResult = outcome.char2Result;
                    // Include opponent player name
                    shared.characterList[char2Index].battleInfo = { name: char1.name, rank: char1.rank, playerName: player1.playerDisplayName, myName: char2.name, myRank: char2.rank };
                }

                // Skip to next character
                break;
            }
        }
    }
}

function calculateBattleOutcome(char1, char2) {
    // Get character definitions
    const char1Def = CHARACTER_DEFINITIONS.find(c => c.id === char1.id);
    const char2Def = CHARACTER_DEFINITIONS.find(c => c.id === char2.id);

    // Initialize variables
    let gameWonByTeam = null;
    let winningPlayerName = null;
    let coreCommandBattleDraw = false;

    if (!char1Def || !char2Def) {
        console.error("HOST: Missing character definition during battle calculation!", char1.id, char2.id);
        return {
            char1Result: 'had draw in',
            char2Result: 'had draw in',
            gameWonByTeam,
            winningPlayerName,
            coreCommandBattleDraw
        };
    }

    let char1Result = 'pending';
    let char2Result = 'pending';

    // Handle Flag vs Flag specially
    if (char1Def.isCoreCommand && char2Def.isCoreCommand) {
        char1Result = 'had draw in';
        char2Result = 'had draw in';
        coreCommandBattleDraw = true;
    }
    // Handle Flag vs non-Flag
    else if (char1Def.isCoreCommand) {
        char1Result = 'lost';
        char2Result = 'won';
        gameWonByTeam = char2.team;
        winningPlayerName = char2.takenByPlayerName;
    }
    else if (char2Def.isCoreCommand) {
        char1Result = 'won';
        char2Result = 'lost';
        gameWonByTeam = char1.team;
        winningPlayerName = char1.takenByPlayerName;
    }
    // Handle special cases
    else if (char1Def.isEngineer && char2Def.isReconDrone) {
        char1Result = 'won';
        char2Result = 'lost';
    }
    else if (char1Def.isReconDrone && char2Def.isEngineer) {
        char1Result = 'lost';
        char2Result = 'won';
    }
    else if (char1Def.isReconDrone || char2Def.isReconDrone) {
        char1Result = 'had draw in';
        char2Result = 'had draw in';
    }
    else if (char1Def.isStealthSquad && char2Def.isStarCommand) {
        char1Result = 'won';
        char2Result = 'lost';
    }
    else if (char1Def.isStarCommand && char2Def.isStealthSquad) {
        char1Result = 'lost';
        char2Result = 'won';
    }
    // Standard rank comparison
    else if (char1.rank === char2.rank) {
        char1Result = 'had draw in';
        char2Result = 'had draw in';
    }
    else if (char1.rank > char2.rank) {
        char1Result = 'won';
        char2Result = 'lost';
    }
    else {
        char1Result = 'lost';
        char2Result = 'won';
    }

    return {
        char1Result,
        char2Result,
        gameWonByTeam,
        winningPlayerName,
        coreCommandBattleDraw
    };
}


function resetCanonTowerHits(playerNumber) {
    // Reset hit counters for each individual tower
    if (gameObjects && gameObjects.length > 0) {
        gameObjects.forEach(tower => {
            tower.hits[playerNumber] = 0;
        });
    }

    // Also reset hit counters in shared gameObjects for clients
    if (shared.gameObjects && shared.gameObjects.length > 0) {
        shared.gameObjects.forEach(tower => {
            tower.hits[playerNumber] = 0;
        });
    }
}

function checkWinConditions() {
    if (shared.gameState !== "GAME-FINISHED") {
        let blueFlagExists = false;
        let greenFlagExists = false;

        // Check flags based on shared list status
        shared.characterList.forEach(c => {
            if (c.id === 'C' && !c.isPermanentlyLost && c.status !== 'lost') {
                if (c.team === 'blue') blueFlagExists = true;
                if (c.team === 'green') greenFlagExists = true;
            }
        });

        let newGameState = null;
        let newWinningTeam = null;
        shared.winningPlayerName = null;

        // Check win conditions
        if (!shared.coreCommandLost) { // Only check elimination if Core Command wasn't lost in battle
            if (!blueFlagExists && !greenFlagExists) {
                newGameState = "GAME-FINISHED";
                newWinningTeam = "draw";
                console.log("HOST: Both flags eliminated. Draw.");
            } else if (!blueFlagExists) {
                newGameState = "GAME-FINISHED";
                newWinningTeam = "green";
                console.log("HOST: Purple flag eliminated. Green wins.");
            } else if (!greenFlagExists) {
                newGameState = "GAME-FINISHED";
                newWinningTeam = "blue";
                console.log("HOST: Green flag eliminated. Purple wins.");
            }
        } else if (shared.coreCommandLost) {
            newGameState = "GAME-FINISHED";
            newWinningTeam = "draw";
            shared.winningPlayerName = "Both Core Commands Lost";
            console.log("HOST: Game ended due to Core Command loss/draw.");
        }

        // Update game state if changed
        if (newGameState && shared.gameState !== newGameState) {
            console.log(`HOST: Setting game state to ${newGameState}, Winning Team: ${newWinningTeam}, Winning Player: ${shared.winningPlayerName || 'N/A'}`);
            shared.gameState = newGameState;
            shared.winningTeam = newWinningTeam;

            // Update statistics
            if (newWinningTeam === 'blue') {
                shared.blueWins = (shared.blueWins || 0) + 1;
            } else if (newWinningTeam === 'green') {
                shared.greenWins = (shared.greenWins || 0) + 1;
            } else if (newWinningTeam === 'draw') {
                shared.draws = (shared.draws || 0) + 1;
            }
        }
    }
}

function handleGameFinishedHost() {
    // Start reset countdown if not started and reset isn't flagged
    if (shared.resetTimerStartTime === null && !shared.resetFlag) {
        console.log("HOST: Starting reset countdown timer.");
        shared.resetTimerStartTime = shared.currentTime;
        shared.resetTimerSeconds = Math.floor(GAME_TRANSITION_TIME / 1000); // Initialize with full seconds
    }

    // Update timer only if it's active
    if (shared.resetTimerStartTime !== null && !shared.resetFlag) {
        const elapsedSeconds = Math.floor((shared.currentTime - shared.resetTimerStartTime) / 1000);
        const remainingSeconds = Math.floor(GAME_TRANSITION_TIME / 1000) - elapsedSeconds;

        // Only update if it's a valid positive number and has changed
        if (remainingSeconds >= 0 && shared.resetTimerSeconds !== remainingSeconds) {
            shared.resetTimerSeconds = remainingSeconds;
        }

        // Trigger reset when countdown finishes
        if (shared.currentTime - shared.resetTimerStartTime >= GAME_TRANSITION_TIME && !shared.resetFlag) {
            console.log("HOST: Reset timer finished. Setting reset flag.");
            shared.resetFlag = true;
            shared.resetTimerStartTime = null;
            shared.resetTimerSeconds = null; // Clear the seconds too
        }
    }

    shared.resetTimerSeconds = Math.floor(GAME_TRANSITION_TIME / 1000) - Math.floor((shared.currentTime - shared.resetTimerStartTime) / 1000)

    // Process reset
    if (shared.resetFlag) {
        console.log("HOST: Processing reset flag...");
        shared.gameState = "GAME-SETUP";
        shared.winningTeam = null;
        shared.winningPlayerName = null;
        shared.coreCommandLost = false;
        shared.resetTimerStartTime = null;
        shared.canonTowerHits = Array(15).fill(0);

        // Reset hit counters for each individual tower
        if (gameObjects && gameObjects.length > 0) {
            gameObjects.forEach(tower => {
                tower.hits = Array(15).fill(0);
            });
        }

        // Also reset hit counters in shared gameObjects for clients
        if (shared.gameObjects && shared.gameObjects.length > 0) {
            shared.gameObjects.forEach(tower => {
                tower.hits = Array(15).fill(0);
            });
        }

        initializeCharacterList();

        // Clear reset flag after delay
        setTimeout(() => {
            if (partyIsHost()) {
                shared.resetFlag = false;
                console.log("HOST: Reset flag set back to false.");
            }
        }, 3000);
    }
} 