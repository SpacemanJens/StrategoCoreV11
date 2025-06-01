class BasicMinimap {
    constructor(xMinimap, yMinimap, diameterMinimap, colorMinimap, diameterPlanet) {
        this.xMinimap = xMinimap;
        this.yMinimap = yMinimap;
        this.diameterMinimap = diameterMinimap;
        this.colorMinimap = colorMinimap;
        this.diameterPlanet = diameterPlanet;
        
        // Offscreen buffer for static minimap elements
        this.minimapBuffer = null;
        this.staticElementsNeedUpdate = true;
        this.lastPlanetIndex = -1;
    }

    // Initialize or update the minimap buffer
    updateMinimapBuffer() {
        if (!this.minimapBuffer) {
            this.minimapBuffer = createGraphics(this.diameterMinimap + 50, this.diameterMinimap + 50);
        }
        
        this.minimapBuffer.clear();
        const bufferCenterX = (this.diameterMinimap + 50) / 2;
        const bufferCenterY = (this.diameterMinimap + 50) / 2;
        
        const colorScheme = planetColors[me.planetIndex];

        if (showGraphics && allImagesLoadedSuccessfully) {
            this.minimapBuffer.image(
                fixedMinimapImage[me.planetIndex], 
                bufferCenterX - this.diameterMinimap / 2, 
                bufferCenterY - this.diameterMinimap / 2, 
                this.diameterMinimap, 
                this.diameterMinimap
            );
        } else {
            // Draw the gradient to buffer
            this.drawMinimapGradientToBuffer(this.minimapBuffer, bufferCenterX, bufferCenterY, colorScheme.center, colorScheme.edge);
        }

        // Draw static warp gate indicators to buffer
        this.drawWarpGateIndicatorsToBuffer(this.minimapBuffer, bufferCenterX, bufferCenterY);
        
        this.staticElementsNeedUpdate = false;
        this.lastPlanetIndex = me.planetIndex;
    }

    draw() {
        // Update buffer if planet changed or first time
        if (this.staticElementsNeedUpdate || this.lastPlanetIndex !== me.planetIndex) {
            this.updateMinimapBuffer();
        }
        
        // Draw cached minimap background
        if (this.minimapBuffer) {
            const bufferX = this.xMinimap - (this.diameterMinimap + 50) / 2;
            const bufferY = this.yMinimap - (this.diameterMinimap + 50) / 2;
            image(this.minimapBuffer, bufferX, bufferY);
        }

        // Draw dynamic elements (spacecrafts) on top
        this.drawSpacecrafts();

        const colorScheme = planetColors[me.planetIndex];
        
        // Draw planet name
        push();
        fill('white');
        textAlign(CENTER, BOTTOM);
        textSize(14);
        text(colorScheme.name, this.xMinimap, this.yMinimap + this.diameterMinimap / 2 + 20);
        pop();
    }

    drawMinimapGradientToBuffer(buffer, centerX, centerY, colorCenter, colorEdge) {
        if (showBlurAndTintEffects) {
            buffer.push();
            buffer.noStroke();
            const radius = this.diameterMinimap / 2;
            const numSteps = 25; // Reduced steps for better performance

            for (let i = numSteps; i > 0; i--) {
                const step = i / numSteps;
                const currentRadius = radius * step;

                const r = lerp(colorCenter[0], colorEdge[0], 1 - step);
                const g = lerp(colorCenter[1], colorEdge[1], 1 - step);
                const b = lerp(colorCenter[2], colorEdge[2], 1 - step);

                buffer.fill(r, g, b);
                buffer.circle(centerX, centerY, currentRadius * 2);
            }
            buffer.pop();
        } else {
            buffer.push();
            buffer.noStroke();
            buffer.fill(colorCenter[0], colorCenter[1], colorCenter[2]);
            buffer.circle(centerX, centerY, this.diameterMinimap);
            buffer.pop();
        }
    }

    drawWarpGateIndicatorsToBuffer(buffer, centerX, centerY) {
        // Draw up gate to buffer
        const upGateX = centerX + map(this.xWarpGateUp, 0, this.diameterPlanet, -this.diameterMinimap / 2, this.diameterMinimap / 2);
        const upGateY = centerY + map(this.yWarpGateUp, 0, this.diameterPlanet, -this.diameterMinimap / 2, this.diameterMinimap / 2);
        
        buffer.push();
        buffer.fill('cyan');
        buffer.stroke('white');
        buffer.strokeWeight(1);
        buffer.circle(upGateX, upGateY, 10);
        buffer.pop();

        // Draw down gate to buffer
        const downGateX = centerX + map(this.xWarpGateDown, 0, this.diameterPlanet, -this.diameterMinimap / 2, this.diameterMinimap / 2);
        const downGateY = centerY + map(this.yWarpGateDown, 0, this.diameterPlanet, -this.diameterMinimap / 2, this.diameterMinimap / 2);
        
        buffer.push();
        buffer.fill('magenta');
        buffer.stroke('white');
        buffer.strokeWeight(1);
        buffer.circle(downGateX, downGateY, 10);
        buffer.pop();
    }
 
    drawSpacecrafts() {
        spacecrafts.forEach((spacecraft) => {
            if (!spacecraft.playerColor
                || !spacecraft.hasCharacter
                || spacecraft.status === 'lost'
                || spacecraft.planetIndex != me.planetIndex
                || spacecraft.isCloaked
            ) return;

            fixedMinimap.drawObject(spacecraft.xGlobal + spacecraft.xLocal, spacecraft.yGlobal + spacecraft.yLocal, 10, spacecraft.playerColor);
        });
    }

    update(diameterPlanet, xWarpGateUp, yWarpGateUp, xWarpGateDown, yWarpGateDown, diameterWarpGate) {
        // Check if warp gate positions changed
        const warpGatesChanged = (
            this.xWarpGateUp !== xWarpGateUp ||
            this.yWarpGateUp !== yWarpGateUp ||
            this.xWarpGateDown !== xWarpGateDown ||
            this.yWarpGateDown !== yWarpGateDown
        );
        
        this.diameterPlanet = diameterPlanet;
        this.xWarpGateUp = xWarpGateUp;
        this.yWarpGateUp = yWarpGateUp;
        this.xWarpGateDown = xWarpGateDown;
        this.yWarpGateDown = yWarpGateDown;
        this.diameterWarpGate = diameterWarpGate;
        
        // Mark for update if warp gates changed
        if (warpGatesChanged) {
            this.staticElementsNeedUpdate = true;
        }
    }
}