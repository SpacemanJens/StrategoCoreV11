class Planet extends CelestialObject {
    constructor(angle, baseSpeed, distance, tiltEffect, diameterPlanet, color, startImageNumber, xWarpGateUp, yWarpGateUp, xWarpGateDown, yWarpGateDown, diameterWarpGate) {
        super(angle, distance, tiltEffect);
        this.baseSpeed = baseSpeed;
        this.baseSize = diameterPlanet / 30; 
        this.color = color;
        this.diameterPlanet = diameterPlanet;
        this.diameterMinimap = this.baseSize;
        this.i = startImageNumber;
        this.planetIndex = 0; // Will be set in SolarSystem constructor
        this.xWarpGateUp = xWarpGateUp
        this.yWarpGateUp = yWarpGateUp
        this.xWarpGateDown = xWarpGateDown
        this.yWarpGateDown = yWarpGateDown
        this.diameterWarpGate = diameterWarpGate;
        
        // Offscreen buffer for static planet elements
        this.planetBuffer = null;
        this.staticPlanetNeedsUpdate = true;
        this.lastDiameterMinimap = 0;
    }

    // Update planet buffer when size or other static properties change
    updatePlanetBuffer() {
        const bufferSize = Math.ceil(this.diameterMinimap + 50);
        
        if (!this.planetBuffer || this.lastDiameterMinimap !== this.diameterMinimap) {
            this.planetBuffer = createGraphics(bufferSize, bufferSize);
            this.staticPlanetNeedsUpdate = true;
            this.lastDiameterMinimap = this.diameterMinimap;
        }
        
        if (!this.staticPlanetNeedsUpdate) return;
        
        this.planetBuffer.clear();
        const centerX = bufferSize / 2;
        const centerY = bufferSize / 2;
        
        const colorScheme = planetColors[this.planetIndex];

        if (showGraphics && allImagesLoadedSuccessfully) {
            this.planetBuffer.image(
                fixedMinimapImage[this.planetIndex], 
                centerX - this.diameterMinimap / 2, 
                centerY - this.diameterMinimap / 2, 
                this.diameterMinimap, 
                this.diameterMinimap
            );
        } else {
            this.drawGradientToBuffer(this.planetBuffer, centerX, centerY, colorScheme.center, colorScheme.edge);
        }

        // Draw warp gate indicators to buffer
        this.drawWarpGateIndicatorsToBuffer(this.planetBuffer, centerX, centerY);
        
        this.staticPlanetNeedsUpdate = false;
    }

    draw() {
        // Update buffer if needed
        this.updatePlanetBuffer();
        
        // Draw cached planet background
        if (this.planetBuffer) {
            const bufferSize = this.planetBuffer.width;
            const bufferX = this.x + this.diameterMinimap / 2 - bufferSize / 2;
            const bufferY = this.y + this.diameterMinimap / 2 - bufferSize / 2;
            image(this.planetBuffer, bufferX, bufferY);
        }

        // Draw dynamic elements (spacecrafts) on top
        this.drawSpacecrafts();
        
        const colorScheme = planetColors[this.planetIndex];
        
        // Draw planet name
        push();
        fill('white');
        textAlign(CENTER, BOTTOM);
        textSize(14);
        text(colorScheme.name, this.x + this.diameterMinimap / 2, this.y + this.diameterMinimap + 20);
        pop();
    }

    drawGradientToBuffer(buffer, centerX, centerY, colorCenter, colorEdge) {
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
        // Draw warp gate indicators to buffer
        const upGateX = centerX + map(this.xWarpGateUp, 0, this.diameterPlanet, -this.diameterMinimap / 2, this.diameterMinimap / 2);
        const upGateY = centerY + map(this.yWarpGateUp, 0, this.diameterPlanet, -this.diameterMinimap / 2, this.diameterMinimap / 2);

        const downGateX = centerX + map(this.xWarpGateDown, 0, this.diameterPlanet, -this.diameterMinimap / 2, this.diameterMinimap / 2);
        const downGateY = centerY + map(this.yWarpGateDown, 0, this.diameterPlanet, -this.diameterMinimap / 2, this.diameterMinimap / 2);

        buffer.push();
        buffer.fill('cyan');
        buffer.stroke('white');
        buffer.strokeWeight(1);
        buffer.circle(upGateX, upGateY, 10);
        buffer.pop();

        buffer.push();
        buffer.fill('magenta');
        buffer.stroke('white');
        buffer.strokeWeight(1);
        buffer.circle(downGateX, downGateY, 10);
        buffer.pop();
    }

    update(speedMultiplier, planetSpeed, diameterMinimap) {
        this.angle += this.baseSpeed * speedMultiplier * planetSpeed;
        
        // Check if diameter changed
        if (this.diameterMinimap !== diameterMinimap) {
            this.staticPlanetNeedsUpdate = true;
        }
        
        this.diameterMinimap = diameterMinimap;
    }

    onPlanet(xF, yF) {
        let posX = map(this.diameterMinimap / 2, 0, this.diameterMinimap, 0, this.diameterPlanet);
        let posY = map(this.diameterMinimap / 2, 0, this.diameterMinimap, 0, this.diameterPlanet);

        let distance = dist(xF, yF, posX, posY);
        let dMapped = map(this.diameterMinimap, 0, this.diameterMinimap, 0, this.diameterPlanet);
        return distance < dMapped / 2;  // Return true if the point is inside the planet        
    }

    drawSpacecrafts() {
        spacecrafts.forEach(spacecraft => {

            if (!spacecraft.playerColor
                || !spacecraft.hasCharacter
                || spacecraft.status === 'lost'
                || spacecraft.planetIndex != this.planetIndex
                || spacecraft.isCloaked
            ) return;

            this.drawSpacecraft(spacecraft);
        });
    }


    drawSpacecraft(spacecraft) {
        //  fill('yellow')
        //    fill(spacecraft.color);

        let posX = this.x + map(spacecraft.xGlobal + spacecraft.xLocal, 0, this.diameterPlanet, 0, this.diameterMinimap);
        let posY = this.y + map(spacecraft.yGlobal + spacecraft.yLocal, 0, this.diameterPlanet, 0, this.diameterMinimap);
        push()
        if (this.playerNumber === me.playerNumber) {
            fill('red')
        } else {
            spacecraft.setSpacecraftColor()
        }
        circle(posX, posY, 18);
        pop()

    }

    drawWarpGateIndicators() {

        // When drawing the solar system we transform the coordinates to the solar system coordinates
        let upGateX = this.x + map(this.xWarpGateUp, 0, this.diameterPlanet, 0, this.diameterMinimap);
        let upGateY = this.y + map(this.yWarpGateUp, 0, this.diameterPlanet, 0, this.diameterMinimap);

        let downGateX = this.x + map(this.xWarpGateDown, 0, this.diameterPlanet, 0, this.diameterMinimap);
        let downGateY = this.y + map(this.yWarpGateDown, 0, this.diameterPlanet, 0, this.diameterMinimap);

        push();
        fill('cyan');
        stroke('white');
        strokeWeight(1);
        circle(upGateX, upGateY, 10);
        pop();

        // Draw down gate
        push();
        fill('magenta');
        stroke('white');
        strokeWeight(1);
        circle(downGateX, downGateY, 10);
        pop();
    }

}