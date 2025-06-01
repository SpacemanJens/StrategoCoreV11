//===================================================
// USER INPUT AND INTERACTION
//===================================================

function mousePressed() {
    if (imagesStillLoading) return; // Prevent interaction while loading
 //   console.log("mousePressed", mouseX, mouseY, onLocalScreenArea(mouseX, mouseY));

    if (!me.isReady) {
        gameImageManager.checkImageClicks();
        return;
    }
    // Character Selection Logic
    if (me.isReady && !me.hasCharacter) {
        handleCharacterSelection();
    }

    const myCharacterData = shared.characterList.find(c => c.instanceId === me.characterInstanceId);
    if (!me.hasCharacter ||
        me.status !== 'available' ||
        !myCharacterData ||
        myCharacterData.status !== 'available' ||
        shared.coreCommandLost ||
        !onLocalScreenArea(mouseX - GAME_AREA_X, mouseY - GAME_AREA_Y) ||
        shared.gameState !== 'IN-GAME' 
    ) return;

    // Ensure the character has the canShoot flag
    if (!myCharacterData.canShoot || me.isCloaked) return;

    // Determine bullet limit
    let maxBullets = NUMBER_OF_BULLETS;
    if (myCharacterData.canSnipe) {
        maxBullets = 1;
    }

    console.log("before shoot", me.bullets.length, maxBullets)
    if (shared.gameState != "IN-GAME" || me.bullets.length >= maxBullets) return

    let bullet = {
        xLocal: me.xLocal,
        yLocal: me.yLocal,
        xStart: me.xLocal,
        yStart: me.yLocal,
        xMouseStart: me.xMouse,
        yMouseStart: me.yMouse,
        xGlobal: me.xGlobal,
        yGlobal: me.yGlobal,
    };
    me.bullets.push(bullet);
    console.log("After shoot", me.bullets.length, maxBullets)
}
function handlePlayerMovement() {
    // Check if player can move
    const myCharacterData = shared.characterList.find(c => c.instanceId === me.characterInstanceId);
    if (!me.hasCharacter ||
        me.status !== 'available' ||
        !myCharacterData ||
        myCharacterData.status !== 'available' ||
        shared.coreCommandLost) return;
    /*
        // Check if player is in post-collision cooldown period
        if (me.lastCollisionTime && (millis() - me.lastCollisionTime < 2000)) {
            // Player touched an opponent less than 2 seconds ago - can't move
            return;
        }
    
        // Check if player is in post-collision cooldown period
        if (me.lastBulletCollisionTime && (millis() - me.lastBulletCollisionTime < 2000)) {
            // Player touched an opponent less than 2 seconds ago - can't move
            return;
        }
    
        // Check for collisions with opponents
        const opponents = spacecrafts.filter(spacecraft =>
            spacecraft.planetIndex === me.planetIndex &&
            spacecraft.hasCharacter &&
            spacecraft.team !== me.team);
    
        for (const opponent of opponents) {
            // Calculate distance between player and opponent
            const d = dist(
                me.xGlobal + me.xLocal,
                me.yGlobal + me.yLocal,
                opponent.xGlobal + opponent.xLocal,
                opponent.yGlobal + opponent.yLocal
            );
    
            // If collision detected
            if (d < (me.diameter / 2 + opponent.diameter / 2)) {
                // Set collision timestamp
                me.lastCollisionTime = millis();
                // Exit function early - can't move after collision
                return;
            }
        }
    */
    // Local movement (game area)
    let localOffX = 0;
    let localOffY = 0;

    let localSpeed = SPACECRAFT_SPEED; // 6 or 3

    if (keyIsDown(70)) { localOffX = -localSpeed } // F
    if (keyIsDown(72)) { localOffX = localSpeed }  // H
    if (keyIsDown(84)) { localOffY = -localSpeed } // T
    if (keyIsDown(71)) { localOffY = localSpeed }  // G

    // Global movement (planet)
    let globalSpeed;
    if (myCharacterData.canMoveFast) {
        globalSpeed = SPACECRAFT_SPEED + 2; // 12 or 6
    } else {
        globalSpeed = SPACECRAFT_SPEED; // 6 or 3
    }
    if (me.planetIndex === 2) {
        globalSpeed--
        globalSpeed--
    }
    if (me.planetIndex === 3) {
        globalSpeed--
    }

    // Reduce speed if cloaked and character can cloak
    if (myCharacterData.canCloake && me.isCloaked) {
        globalSpeed = Math.max(1, globalSpeed * 2 / 3); // Reduce speed to 2/3, ensure it's at least 1
    }

    let gOffX = 0, gOffY = 0;
    if (keyIsDown(65)) { gOffX = -globalSpeed } // A
    if (keyIsDown(68)) { gOffX = globalSpeed }  // D
    if (keyIsDown(87)) { gOffY = -globalSpeed } // W
    if (keyIsDown(83)) { gOffY = globalSpeed }  // S

    let xTemp = me.xLocal + localOffX;
    let yTemp = me.yLocal + localOffY;
    let newxGlobal = me.xGlobal + gOffX;
    let newyGlobal = me.yGlobal + gOffY;

    // Keep local position within screen bounds
    xTemp = constrain(xTemp, 0, GAME_AREA_WIDTH);
    yTemp = constrain(yTemp, 0, GAME_AREA_HEIGHT);

    // Keep global position within planet bounds 
    newxGlobal = constrain(newxGlobal, 0, selectedPlanet.diameterPlanet);
    newyGlobal = constrain(newyGlobal, 0, selectedPlanet.diameterPlanet);

    if (selectedPlanet && selectedPlanet.onPlanet(xTemp + newxGlobal, yTemp + newyGlobal)) {
        me.xGlobal = newxGlobal;
        me.yGlobal = newyGlobal;
        me.xLocal = xTemp;
        me.yLocal = yTemp;
    }

    me.xMouse = mouseX - GAME_AREA_X;
    me.yMouse = mouseY - GAME_AREA_Y;

    //    console.log(me)
    //   console.log("me.xGlobal", me.xGlobal, "me.yGlobal", me.yGlobal);
    ///   console.log("me.xLocal", me.xLocal, "me.yLocal", me.yLocal); 2 4
}
//===================================================
// Lets have an easy way to turn of performance heavy graphics
//===================================================

function keyPressed() {

    // https://www.toptal.com/developers/keycode
    if (keyCode === 80) { // p 
        showGraphics = !showGraphics;
    }
    if (keyCode === 79) { // o
        showBlurAndTintEffects = !showBlurAndTintEffects;
    }
    if (keyCode === 73) { // i
        showStarSystem = !showStarSystem;
    }
    if (keyCode === 85) { // u
        showColorBlindText = !showColorBlindText;
    }

    const myCharacterData = shared.characterList.find(c => c.instanceId === me.characterInstanceId);
    if (!myCharacterData) return;

    console.log("keyPressed", keyCode, myCharacterData);
    if (myCharacterData.canCloake && keyCode === 67) { // c
        me.isCloaked = !me.isCloaked;
        console.log("Cloaked:", me.isCloaked);
    }

}