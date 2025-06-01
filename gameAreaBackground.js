function drawGameAreaBackground() {
    if (showGraphics && allImagesLoadedSuccessfully) {

        let cropX = me.xGlobal;
        let cropY = me.yGlobal;

        // Use the planet background image that corresponds to the current planet index
        let currentBackgroundImage = planetBackgroundImages[me.planetIndex];

        // Scale the background image to match planet size
        image(currentBackgroundImage,
            GAME_AREA_X,
            GAME_AREA_Y,
            GAME_AREA_WIDTH,
            GAME_AREA_HEIGHT,
            cropX,
            cropY,
            GAME_AREA_WIDTH,
            GAME_AREA_HEIGHT
        );

        // Check if warp gate is in cooldown

        if (showBlurAndTintEffects && !imagesStillLoading) {
            const currentTime = millis();
            const isCooldown = currentTime - me.lastWarpTime < WARP_COOLDOWN_TIME;

            // Draw the animation for planet 0's down warp gate
            if (me.planetIndex === 0) {
                drawWarpGateAnimation(selectedPlanet.xWarpGateUp, selectedPlanet.yWarpGateUp, 0, 0, warpGateUpImages[me.planetIndex], 284, 226, 9, true, isCooldown);
                drawWarpGateAnimation(selectedPlanet.xWarpGateDown, selectedPlanet.yWarpGateDown, 0, 0, warpGateDownImages[me.planetIndex], 170, 150, 6, false, isCooldown);
            }
            if (me.planetIndex === 1) {
                drawWarpGateAnimation(selectedPlanet.xWarpGateUp, selectedPlanet.yWarpGateUp, -13, -40, warpGateUpImages[me.planetIndex], 396, 306, 9, true, isCooldown);
                drawWarpGateAnimation(selectedPlanet.xWarpGateDown, selectedPlanet.yWarpGateDown, -10, -20, warpGateDownImages[me.planetIndex], 479, 433, 9, true, isCooldown);
            }
            if (me.planetIndex === 2) {
                drawWarpGateAnimation(selectedPlanet.xWarpGateUp, selectedPlanet.yWarpGateUp, 0, 0, warpGateUpImages[me.planetIndex], 284, 226, 9, true, isCooldown);
                drawWarpGateAnimation(selectedPlanet.xWarpGateDown, selectedPlanet.yWarpGateDown, 0, 0, warpGateDownImages[me.planetIndex], 200, 180, 3, false, isCooldown);
            }
            // Draw the animation for planet 0's down warp gate
            if (me.planetIndex === 3) {
                drawWarpGateAnimation(selectedPlanet.xWarpGateUp, selectedPlanet.yWarpGateUp, 10, -50, warpGateUpImages[me.planetIndex], 207 * 2, 161 * 2, 9, true, isCooldown);
                drawWarpGateAnimation(selectedPlanet.xWarpGateDown, selectedPlanet.yWarpGateDown, 0, 0, warpGateDownImages[me.planetIndex], 206, 192, 8, false, isCooldown);
            }
            if (me.planetIndex === 4) {
                drawWarpGateAnimation(selectedPlanet.xWarpGateUp, selectedPlanet.yWarpGateUp, 0, 0, warpGateUpImages[me.planetIndex], 192 * 1.6, 150 * 1.6, 9, true, isCooldown);
                drawWarpGateAnimation(selectedPlanet.xWarpGateDown, selectedPlanet.yWarpGateDown, -10, -30, warpGateDownImages[me.planetIndex], 254, 186, 9, true, isCooldown);
            }
        } else {
            // Draw the warp gates on top of the background
            drawWarpGateCountDownOnGameArea();
        }
    } else {
        // Get colors consistent with the planet type
        const colorScheme = planetColors[me.planetIndex];

        // Draw the planet with a radial gradient
        drawRadialGradient(
            GAME_AREA_X - me.xGlobal + selectedPlanet.diameterPlanet / 2,
            GAME_AREA_Y - me.yGlobal + selectedPlanet.diameterPlanet / 2,
            selectedPlanet.diameterPlanet,
            colorScheme.center,
            colorScheme.edge
        );

        // Also draw warp gates in non-image mode
        drawWarpGatesOnGameArea();
    }
    // Draw planet name in the bottom right of the game area

    const colorScheme = planetColors[me.planetIndex];

    push();
    fill('white');
    textAlign(RIGHT, BOTTOM);
    textSize(16);
    text(`${colorScheme.name}`,
        //            GAME_AREA_X + GAME_AREA_WIDTH - 20,
        //            GAME_AREA_Y + GAME_AREA_HEIGHT - 10);
        GAME_AREA_X + GAME_AREA_WIDTH - 20,
        GAME_AREA_Y + GAME_AREA_HEIGHT - 10);
    pop();
}

function drawBlackBackground() {
    // Black out areas outside the game area
    //fill('black');
    fill(backgroundColor[0], backgroundColor[1], backgroundColor[2])
    rect(0, 0, GAME_AREA_X, SCREEN_HEIGHT); // Black out left side
    rect(0, 0, SCREEN_WIDTH, GAME_AREA_Y); // Black out top side
    rect(GAME_AREA_RIGHT, 0, SCREEN_WIDTH, SCREEN_HEIGHT); // Black out right side
    rect(0, GAME_AREA_BOTTOM, SCREEN_WIDTH, SCREEN_HEIGHT); // Black out bottom side
}
 
// Helper function to draw a radial gradient with array colors instead of color() objects
function drawRadialGradient(x, y, diameter, colorCenterArray, colorEdgeArray) {
    if (showBlurAndTintEffects) {
        push();
        noStroke();
        const radius = diameter / 2;
        const numSteps = 50; // More steps = smoother gradient

        for (let i = numSteps; i > 0; i--) {
            const step = i / numSteps;
            const currentRadius = radius * step;

            // Interpolate between the two colors using arrays instead of color objects
            const r = lerp(colorCenterArray[0], colorEdgeArray[0], 1 - step);
            const g = lerp(colorCenterArray[1], colorEdgeArray[1], 1 - step);
            const b = lerp(colorCenterArray[2], colorEdgeArray[2], 1 - step);

            fill(r, g, b);
            circle(x, y, currentRadius * 2);
        }
        pop();
    } else {
        // Fallback to a solid color if the effect is disabled
        fill(colorCenterArray[0], colorCenterArray[1], colorCenterArray[2]);
        circle(x, y, diameter);
    }
}
function drawMinimap() {
    if (showStarSystem) {
        push();
        angleMode(DEGREES);

        solarSystem.update();
        solarSystem.draw();
        pop()
    } else {
        fixedMinimap.draw();

    }
}
function drawSpacecraftOnMinimap() {
    if (!showStarSystem) {
        fixedMinimap.drawSpacecrafts();
    }
}
 
 