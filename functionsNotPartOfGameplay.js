function drawHowToPlay() {

    push();
    textAlign(LEFT, TOP); // Changed from textAlign(TOP, LEFT)
    textSize(16);
    fill(200);

    const textOffsetX = 5; // Offset for the text above the image
    const textOffsetY = -20; // Offset for the text above the image
    const imageYPosition = GAME_AREA_BOTTOM + 100;
    const imageHeight = 300; // Assuming all images have the same height for simplicity in text placement

    const spacecraftsImageDrawWidth = 1043;
    const wasdImageDrawWidth = 539;
    const tfghImageDrawWidth = 368;

    // Display howtoPlaySpacecrafts image and text
    if (howtoPlaySpacecrafts) {
        const imageX = GAME_AREA_X;
        image(howtoPlaySpacecrafts, imageX, imageYPosition, spacecraftsImageDrawWidth, imageHeight);
        text("Fleed Admiral from team PURPLE chasing Core Commander from team GREEN", imageX + textOffsetX, imageYPosition + textOffsetY);
    }

    // Display WASD keys image and text
    // Ensure howtoPlaySpacecrafts loaded to use its drawn width for positioning
    if (WASDkeyImage && howtoPlaySpacecrafts) {
        const imageX = GAME_AREA_X + spacecraftsImageDrawWidth + 30; // Use the drawn width of the previous image
        image(WASDkeyImage, imageX, imageYPosition, wasdImageDrawWidth, imageHeight);
        text("Use keys WASD to move your spacecraft around on the planet", imageX + textOffsetX, imageYPosition + textOffsetY);
    }

    // Display TFGH keys image and text
    // Ensure previous images loaded for correct positioning using their drawn widths
    if (TFGHkeyImage && howtoPlaySpacecrafts && WASDkeyImage) {
        const imageX = GAME_AREA_X + spacecraftsImageDrawWidth + 30 + wasdImageDrawWidth + 30; // Use drawn widths of previous images
        image(TFGHkeyImage, imageX, imageYPosition, tfghImageDrawWidth, imageHeight);
        text("Use keys TFGH to move around in the visible game area", imageX + textOffsetX, imageYPosition + textOffsetY);
    }

    pop();
}

function drawInteractiveHowToPlay() {
    if (!howToPlayButtonRect) return; // Ensure rect is initialized

    push();
    // Check Hover state first to apply styles accordingly
    let isHoveringButton = mouseX > howToPlayButtonRect.x && mouseX < howToPlayButtonRect.x + howToPlayButtonRect.w &&
        mouseY > howToPlayButtonRect.y && mouseY < howToPlayButtonRect.y + howToPlayButtonRect.h;

    // Draw Button with improved styling
    if (isHoveringButton) {
        fill(130, 130, 230); // Lighter color on hover 2 3
        stroke(255); // Brighter stroke on hover
        strokeWeight(2);
    } else {
        fill(100, 100, 200); // Default button color
        stroke(200);
        strokeWeight(1);
    }
    rect(howToPlayButtonRect.x, howToPlayButtonRect.y, howToPlayButtonRect.w, howToPlayButtonRect.h, 10); // Rounded corners

    // Button Text - properly centered
    fill(255); // Text color
    noStroke();
    textAlign(CENTER, CENTER); // Center text on the button
    textSize(18);
    text("How to Play", howToPlayButtonRect.x + howToPlayButtonRect.w / 2, howToPlayButtonRect.y + howToPlayButtonRect.h / 2);

    // Check Hover and Draw Detailed Text
    if (isHoveringButton) {
        drawHowToPlayInstructions()
    }
    pop();
}

function drawHowToPlayInstructions() {
    push();
    fill(230, 230, 250); // Light background for the text box
    stroke(50);
    strokeWeight(1);
    // Position the text box. Adjust x, y, width, height as needed.
    const textBoxX = GAME_AREA_X - 30;
    const textBoxY = GAME_AREA_Y + 60; // Below the button
    const textBoxWidth = GAME_AREA_WIDTH - 20;
    const textBoxHeight = SCREEN_HEIGHT - 125; // Adjust to fit content
    rect(textBoxX, textBoxY, textBoxWidth, textBoxHeight, 10); // Rounded corners

    fill(0); // Black text color
    noStroke();
    textSize(14); // Adjust for readability
    textAlign(LEFT, TOP);

    const textPadding = 20;
    const textContentX = textBoxX + textPadding;
    const textContentY = textBoxY + textPadding;
    const textContentWidth = textBoxWidth - 2 * textPadding;

    const instructions = `How to play:
Two teams PURPLE and GREEN team are playing against each other. The aim of the game is to have fun and work together to eliminate the opponent teams Core Commander. This will finish a round and the winning team will get one win. The two teams must agree how long time to play for and when time’s up the squad with the most wins takes the dub.

Pro tip: Hop on a voice call with your crew before the match. Go over the rules, plan your moves, and get hyped.

⸻

🚀 Game Start:

Game kicks off when both teams lock in their Core Commander. After that, the rest of the players pick their roles. Each character’s got a name, rank, size, team color, and maybe a special power. You’ll see the details in the right of your screen.

⸻

⚔️ How Battles Work:
	•	When two characters from different teams touch = battle time.
	•	Higher rank usually wins… BUT there are some twists:
	•	Star Commander (10) loses to Stealth Squad (1)
	•	Recon Drone (D) draws with everybody except the Core Commander (C) and Engineer (3)
	•	Engineer (3) beats the Recon Drone (D)
	•	Core Commander (C) loses to everyone
	•	If two Core Commanders clash = draw

Oh, and some characters pack heat—they can shoot. Take 10 hits and you’re out.

⸻

🕹 Controls:
	•	WASD = Move around the planet
	•	TFGH = Move around in the visible game area
	•	Mouse click = Shoot
	•	P = Toggle graphics off if the game’s lagging
    •	C = Toggle cloak for characters that can cloak

⸻

🌌 Warp & Map Tips:
	•	Use Warp Gates to jump to other planets. After use they need a little cooldown.
	•	Watch out for canons on planet Ice Cube — they ain’t friendly.
	•	GREEN team ships leave green exhaust, PURPLE team ships leave purple.
	•	On the minimap, you’ll see a little circle with a green border = GREEN ship. The middle symbol shows the ship’s type.
	•	Cloaked ships = invisible on the minimap 👀

⸻

🪐 Planet and Minimap Stuff:
	•	There are 5 planets of different sizes you can warp between. The ships move a bit slower on the bigger planets.
	•	The planets orbit locations are different for each player, so what you see isn’t what your team mates sees.
	•	From the screenshot of the minimap (to the right): You’re a Star Commander on team PURPLE. An Engineer from team GREEN is on the center of the planet. There’s a down warp gate (pink) bottom-right, and an up warp gate (light blue) top-left.

⸻

💡 Final Tips:
	•	Get to know how each ship looks — split-second decisions can win or lose the game. Hover the characters in the character list to see them in detail.
    •	Technical important stuff: One of the clients (browsers) acts as a HOST. This browser must be an active player (and not minimized). 
	•	Keep it smooth, play smart, and most importantly…

🔥 Have fun & good luck, Commander. 🔥`;

    text(instructions, textContentX, textContentY, textContentWidth);
    pop();
}  
function drawPerformanceSettings() {
    fill(200);
    let x = 20
    let y = SCREEN_HEIGHT - 120
    textSize(14);
    textAlign(LEFT, TOP);

    // Update frame rate history
    let instantFrameRate = frameRate();
    frameRateHistory.push(instantFrameRate);
    
    // Keep only the last 2 seconds of data
    if (frameRateHistory.length > frameRateHistorySize) {
        frameRateHistory.shift();
    }
    
    // Calculate running average
    if (frameRateHistory.length > 0) {
        let sum = frameRateHistory.reduce((a, b) => a + b, 0);
        averageFrameRate = sum / frameRateHistory.length;
    }

    if (averageFrameRate < minimumFrameRate) { 
       minimumFrameRate = averageFrameRate;
    }

    text(`FPS: ${averageFrameRate.toFixed(1)}, Smallest FPS: ${minimumFrameRate.toFixed(1)}`, x, y);


    text(`Change performance settings:`, x, y + 20);
    text(`Show graphics (Key: p): ${showGraphics}`, x, y + 40);
    text(`Show effects (Key: o): ${showBlurAndTintEffects}`, x, y + 60);
    text(`Show star system (Key: i): ${showStarSystem}`, x, y + 80);
    text(`I am color blind (Key: u): ${showColorBlindText}`, x, y + 100);
}

function drawCharacterLegend() {
    const legendX = GAME_AREA_RIGHT + 50; // Position where stats used to be
    const legendTitleY = 10; // Position at the top of this panel area 

    // Title
    fill(200);
    textSize(16); // Title text size jens 2 3 
    textAlign(LEFT, TOP);
    text("Eliminate the opponents Core Command to win a game!", legendX, legendTitleY);
    text("In general characters looses to higher rank characters", legendX, legendTitleY + 20);

    textSize(20); // Title text size jens
    text("Characters:!", legendX, legendTitleY + 50);
    text("Battle outcomes!", legendX + 300, legendTitleY + 50);
    text("Special Ability", legendX + 500, legendTitleY + 50);

    const circleDiameter = 50; // 96px
    const itemVerticalPadding = 4;
    const itemHeight = circleDiameter + itemVerticalPadding;
    const textOffsetX = circleDiameter + 20;
    const specialRuleTextStartX = legendX + textOffsetX + 230;

    let currentItemContentStartY = legendTitleY + 80; // Y for the top of the first item's content area (after title + some padding) 2 3

    let itemCount = 0;
    CHARACTER_DEFINITIONS.forEach(def => {
        // Draw colored circle
        if (showGraphics && allImagesLoadedSuccessfully) {

            fill(def.color);
            ellipse(legendX + circleDiameter / 2, currentItemContentStartY + circleDiameter / 2, circleDiameter, circleDiameter);

            let imageId = getImageId(def.id); // jens 3 

            image(spacecraftBlueImages[imageId], legendX, currentItemContentStartY, circleDiameter, circleDiameter);

            if (dist(mouseX, mouseY, legendX + circleDiameter / 2, currentItemContentStartY + circleDiameter / 2) < circleDiameter / 2) {

                let imageId = getImageId(def.id); // jens
                fill(255)
                ellipse(legendX + circleDiameter / 2 + 370, legendTitleY + circleDiameter / 2 + 250, circleDiameter * 3.5, circleDiameter * 3.5);

                image(spacecraftBlueImages[imageId], legendX + 320, legendTitleY + 200, circleDiameter * 3, circleDiameter * 3);
            }
        } else {
            fill(def.color);
            noStroke();
            ellipse(legendX + circleDiameter / 2, currentItemContentStartY + circleDiameter / 2, circleDiameter, circleDiameter);
        }

        itemCount++;

        // Text for name and rank 2 3
        fill(220);
        textSize(14);
        textAlign(LEFT, CENTER);

        const textBlockCenterY = currentItemContentStartY + circleDiameter / 2;

        let rankText = def.rank === -1 ? "C" : def.rank;
        text(`(${def.id}) ${def.name} (Rank: ${rankText})`, legendX + textOffsetX, textBlockCenterY);

        // Add special rules descriptions 2 4
        let specialRuleText = "";
        if (def.isEngineer && def.id === "3") {
            specialRuleText = "Wins vs Recon Drone";
        } else if (def.isReconDrone && def.id === "D") {
            specialRuleText = "Draws vs all except Engineer";
        } else if (def.isStealthSquad && def.id === "S") {
            specialRuleText = "Wins vs Star Commander";
        } else if (def.isCoreCommand && def.id === "C") {
            specialRuleText = "Loses to any attacker";
        } else if (def.isStarCommand && def.id === "10") {
            specialRuleText = "Loses to Stealth Squad";
        }

        if (specialRuleText) {
            fill(180);
            //            textSize(11); 
            textAlign(LEFT, CENTER);
            text(specialRuleText, specialRuleTextStartX, textBlockCenterY);
        }

        // Add special rules descriptions 2 4
        specialRuleText = "";
        if (def.canMoveFast) {
            specialRuleText = "Moves fast";
        } else if (def.canCloake && def.canSnipe) {
            specialRuleText = "Can cloak by pressing 'c' and snipe when not cloaked";
        } else if (def.canShoot) {
            specialRuleText = "Can shoot";
        } else if (def.canCloake) {
            specialRuleText = "Can cloak by pressing 'c'";
        }

        if (specialRuleText) {
            fill(180);
            //            textSize(11); 
            textAlign(LEFT, CENTER);
            text(specialRuleText, specialRuleTextStartX + 200, textBlockCenterY);
        }

        currentItemContentStartY += itemHeight;
    });
    textSize(14);
}
function drawTopLeftInfo() {
    if (me.isReady) {
        fill(255);
        textSize(18);
        textAlign(LEFT, TOP);
        text(`Welcome, ${me.playerDisplayName}! Team: ${me.team === 'blue' ? 'Purple' : 'Green'}.`, 10, 20);
        if (me.hasCharacter) {
            text(`You are a: ${me.characterName}`, 10, 50);
        } else {
            text("Choose your Spacecraft:", 10, 50);
        }
    }
}

function drawNavigationInstruction() {

    // Draw timer with larger text 
    push();
    textSize(12);
    // Change color to red if less than 1 minute remains
    fill(200);
    textAlign(LEFT, TOP);
    text(`Global movement Keys: WASD `, GAME_AREA_RIGHT - 180, 10);
    text(`Local movement Keys: TFGH `, GAME_AREA_RIGHT - 180, 30);
    pop();
}
// Function to draw the game timer at the top of the screen
function drawGameTimer() {
    const elapsedTime = Math.max(0, shared.currentTime);

    // Convert to minutes and seconds
    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);

    // Format time string with leading zeros
    const timeString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    // Position in the center top of the screen
    const timerX = SCREEN_WIDTH - 100; // Adjust as needed
    const timerY = 30;

    // Draw timer with larger text
    push();
    textAlign(CENTER, CENTER);
    textSize(18);

    // Change color to red if less than 1 minute remains
    fill(200);

    const statsWidth = 300; // Approximate width for the stats box
    const infoX = GAME_AREA_RIGHT + 550; // Position from the right edge of the screen
    const infoY = 20;
    //    const lineHeight = 20;

    textAlign(LEFT, TOP);
    text(`Match Time: ${timeString}`, infoX, infoY);
    pop();
}  