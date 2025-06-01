//===================================================
// To be refactored jens
//===================================================

function drawWarpGatesOnGameArea() { 
    let xLocalUp = selectedPlanet.xWarpGateUp - me.xGlobal;
    let yLocalUp = selectedPlanet.yWarpGateUp - me.yGlobal;

    let xLocalDown = selectedPlanet.xWarpGateDown - me.xGlobal;
    let yLocalDown = selectedPlanet.yWarpGateDown - me.yGlobal;

    const currentTime = millis();
    const isCooldown = currentTime - me.lastWarpTime < WARP_COOLDOWN_TIME;
    const cooldownRatio = isCooldown ?
        (currentTime - me.lastWarpTime) / WARP_COOLDOWN_TIME : 1;

    push();
    angleMode(RADIANS);
    if (onLocalScreenArea(xLocalUp, yLocalUp)) {
        if (isCooldown) {
            fill('darkblue');
            stroke('white');
            strokeWeight(2);
            circle(GAME_AREA_X + xLocalUp, GAME_AREA_Y + yLocalUp, selectedPlanet.diameterWarpGate);

            noFill();
            stroke('cyan');
            strokeWeight(4);

            arc(
                GAME_AREA_X + xLocalUp,
                GAME_AREA_Y + yLocalUp,
                selectedPlanet.diameterWarpGate * 0.8,
                selectedPlanet.diameterWarpGate * 0.8,
                0,
                cooldownRatio * TWO_PI
            );

        } else {
            fill('cyan');
            stroke('white');
            strokeWeight(2);
            circle(GAME_AREA_X + xLocalUp, GAME_AREA_Y + yLocalUp, selectedPlanet.diameterWarpGate);

        }
        noFill();
        stroke('white');
        circle(GAME_AREA_X + xLocalUp, GAME_AREA_Y + yLocalUp, selectedPlanet.diameterWarpGate * 0.7);

        fill('white');
        noStroke();

        triangle(
            GAME_AREA_X + xLocalUp, GAME_AREA_Y + yLocalUp - 15,
            GAME_AREA_X + xLocalUp - 10, GAME_AREA_Y + yLocalUp + 5,
            GAME_AREA_X + xLocalUp + 10, GAME_AREA_Y + yLocalUp + 5
        );
    }

    if (onLocalScreenArea(xLocalDown, yLocalDown)) {

        if (isCooldown) {
            fill('darkmagenta');
            stroke('white');
            strokeWeight(2);
            circle(GAME_AREA_X + xLocalDown, GAME_AREA_Y + yLocalDown, selectedPlanet.diameterWarpGate);

            noFill();
            stroke('magenta');
            strokeWeight(4);
            arc(
                GAME_AREA_X + xLocalDown,
                GAME_AREA_Y + yLocalDown,
                selectedPlanet.diameterWarpGate * 0.8,
                selectedPlanet.diameterWarpGate * 0.8,
                0,
                cooldownRatio * TWO_PI
            );


        } else {
            fill('magenta');
            stroke('white');
            strokeWeight(2);
            circle(GAME_AREA_X + xLocalDown, GAME_AREA_Y + yLocalDown, selectedPlanet.diameterWarpGate);
        }
        noFill();
        stroke('white');
        circle(GAME_AREA_X + xLocalDown, GAME_AREA_Y + yLocalDown, selectedPlanet.diameterWarpGate * 0.7);

        fill('white');
        noStroke();

        triangle(
            GAME_AREA_X + xLocalDown, GAME_AREA_Y + yLocalDown + 15,
            GAME_AREA_X + xLocalDown - 10, GAME_AREA_Y + yLocalDown - 5,
            GAME_AREA_X + xLocalDown + 10, GAME_AREA_Y + yLocalDown - 5
        );

    }
    pop();
}

function checkCollisionsWithWarpGate() {
    if (!selectedPlanet) {
        return;
    }

    const currentTime = millis(); 
    const isCooldown = currentTime - me.lastWarpTime < WARP_COOLDOWN_TIME;

    if (isCooldown) {
        return;
    }

    let di = dist(me.xGlobal + me.xLocal, me.yGlobal + me.yLocal, selectedPlanet.xWarpGateUp, selectedPlanet.yWarpGateUp);

    if (di < selectedPlanet.diameterWarpGate / 2) {
        console.log('Warping up');
        isWarpingUp = true;
        me.lastWarpTime = currentTime;

        if (me.planetIndex === 4) {
            me.planetIndex = 0;
        } else {
            me.planetIndex++;
        }
        console.log("me warping up to planet", me.planetIndex);
        me.xGlobal = solarSystem.planets[me.planetIndex].xWarpGateUp - me.xLocal;
        me.yGlobal = solarSystem.planets[me.planetIndex].yWarpGateUp - me.yLocal;

        return;
    }

    di = dist(me.xGlobal + me.xLocal, me.yGlobal + me.yLocal, selectedPlanet.xWarpGateDown, selectedPlanet.yWarpGateDown);

    if (di < selectedPlanet.diameterWarpGate / 2) {

        isWarpingUp = false;
        me.lastWarpTime = currentTime;

        if (me.planetIndex === 0) {
            me.planetIndex = 4;
        } else {
            me.planetIndex--;
        }
        me.xGlobal = solarSystem.planets[me.planetIndex].xWarpGateDown - me.xLocal;
        me.yGlobal = solarSystem.planets[me.planetIndex].yWarpGateDown - me.yLocal;
        return;
    }
}
// Generic function to draw warp gate animations
function drawWarpGateAnimation(warpGateGlobalX, warpGateGlobalY, localOffsetX, localOffsetY, imageFrames, frameWidth, frameHeight, speedDivisor, isPulsating, isCooldown = false) {
    if (!selectedPlanet) {
        return;
    }

    let xLocal = warpGateGlobalX - me.xGlobal + localOffsetX;
    let yLocal = warpGateGlobalY - me.yGlobal + localOffsetY;

    if (isWarpGateOnLocalScreenArea(xLocal, yLocal, 300)) {
        if (imageFrames && imageFrames.length > 0) {
            let frameIndexWarpgate;
            const totalFrames = imageFrames.length;

            if (isCooldown) {
                // Show first frame (index 0) as still image when in cooldown
                if (totalFrames > 0) {
                    frameIndexWarpgate = 0;
                } else {
                    // No frames to show
                    return;
                }
            } else {
                // Animate using frames from index 1 onwards
                if (totalFrames <= 1) {
                    // No animation frames available (frame 0 is for cooldown, need at least one more)
                    return;
                }

                const numAnimationFrames = totalFrames - 1; // Number of frames available for animation (frames 1 to totalFrames-1)

                if (isPulsating) {
                    if (numAnimationFrames === 1) { // Only one frame for animation (e.g., imageFrames = [cooldownImg, animImg1])
                        frameIndexWarpgate = 1; // Show that single animation frame
                    } else { // numAnimationFrames >= 2
                        const currentSpeedDivisor = speedDivisor > 0 ? speedDivisor : 9; // Default to 9 if invalid
                        // Period for 0-indexed animation frames (0 to numAnimationFrames-1)
                        const period = 2 * (numAnimationFrames - 1);
                        const valueInCycle = floor(frameCount / currentSpeedDivisor) % period;

                        let animationFrameIndex; // This will be 0-indexed relative to the animation frames sequence
                        if (valueInCycle < numAnimationFrames) {
                            animationFrameIndex = valueInCycle; // Moving forward
                        } else {
                            animationFrameIndex = period - valueInCycle; // Moving backward
                        }
                        frameIndexWarpgate = animationFrameIndex + 1; // Offset by 1 to map to original imageFrames index
                    }
                } else { // Looping
                    // numAnimationFrames will be at least 1 here because totalFrames > 1
                    const currentSpeedDivisor = speedDivisor > 0 ? speedDivisor : 6; // Default to 6 if invalid
                    let animationFrameIndex = floor(frameCount / currentSpeedDivisor) % numAnimationFrames; // 0-indexed for animation frames
                    frameIndexWarpgate = animationFrameIndex + 1; // Offset by 1 to map to original imageFrames index
                }
            }

            let imgWarpgate = imageFrames[frameIndexWarpgate];
            if (imgWarpgate) {
                push();
                imageMode(CENTER);
                image(imgWarpgate, GAME_AREA_X + xLocal, GAME_AREA_Y + yLocal, frameWidth, frameHeight);
                pop();
            }
        }
    }
}
function isWarpGateOnLocalScreenArea(xLocal, yLocal, diameter) {
    return xLocal >= - diameter && xLocal <= GAME_AREA_WIDTH + diameter && yLocal >= -diameter && yLocal <= GAME_AREA_HEIGHT + diameter;
}
 
 