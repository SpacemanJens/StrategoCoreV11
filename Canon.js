class Canon {
    constructor(config) {
        this.objectNumber = config.objectNumber;
        this.objectName = config.objectName;
        this.xGlobal = config.xGlobal;
        this.yGlobal = config.yGlobal;
        this.diameter = config.diameter;
        this.xSpawnGlobal = config.xSpawnGlobal;
        this.ySpawnGlobal = config.ySpawnGlobal;
        this.color = config.color;
        this.type = config.type;
        this.bullets = config.bullets || [];
        this.hits = config.hits || Array(15).fill(0);
        this.planetIndex = config.planetIndex;
        this.angle = 0; // Add angle for movement
        this.amplitude = 50; // Movement range
        this.speed = 0.02; // Movement speed jens
        this.lastShotTime = 0;  // Add this line
        //        this.type = floor(random(0, 3));  // 0, 1 or 2 (randomly chosen)
    }

    draw() {
        this.drawCanonTower();
        this.drawBullets();
        //   this.drawScore();
    }

    move() {
        this.angle += this.speed;
        this.xGlobal = this.xSpawnGlobal + sin(this.angle) * this.amplitude;
        this.yGlobal = this.ySpawnGlobal + cos(this.angle * 0.7) * this.amplitude; // Different speed for y
    }

    drawCanonTower() {
        //   console.log('Canon drawCanonTower', this.xGlobal, this.yGlobal, this.diameter, this.xSpawnGlobal, this.ySpawnGlobal, this.color);
        let xLocal = this.xGlobal - me.xGlobal;
        let yLocal = this.yGlobal - me.yGlobal;

        if (onLocalScreenArea(xLocal, yLocal)) {

            push();
            imageMode(CENTER);
            // Adjust position to be relative to the game area and player's global position
            translate(GAME_AREA_X + xLocal, GAME_AREA_Y + yLocal);

            if (showGraphics && allImagesLoadedSuccessfully) {
                image(canonImages[this.type], 0, 0, this.diameter * 3, this.diameter * 3);
            } else {
                fill(this.color);
                // Draw the base
                noStroke();
                circle(0, 0, this.diameter);

                // Draw the cannon barrel
                fill(this.color);
                rect(-this.diameter / 2 - 20, -this.diameter / 3 - 30, this.diameter / 2 - 30, this.diameter / 3 - 30);
            }

            pop();
        }
    }

    drawBullets() {
        //        console.log('drawBullets', this.bullets)
        if (this.bullets) {
            this.bullets.forEach(bullet => {
                this.drawBullet(bullet);
            });
        }
    }

    drawBullet(bullet) {

        let xLocal = bullet.xGlobal - me.xGlobal;
        let yLocal = bullet.yGlobal - me.yGlobal;

        if (onLocalScreenArea(xLocal, yLocal)) {

            fill('yellow');
            push();
            imageMode(CENTER);
            // Adjust bullet position based on spacecraft's current global movement
            translate(GAME_AREA_X + xLocal, GAME_AREA_Y + yLocal);
            let head = createVector(
                bullet.xMouseStart - bullet.xStart,
                bullet.yMouseStart - bullet.yStart
            ).normalize().heading();
            rotate(head + 1.555);
            rect(-3, -3, 10, 10);
            pop();
        }
    }

    findNearestSpacecraft() {
        let nearestSpacecraft = null;
        let minDistance = Infinity;

        spacecrafts.forEach(spacecraft => {
            const distance = dist(this.xGlobal, this.yGlobal, spacecraft.xGlobal + spacecraft.xLocal, spacecraft.yGlobal + spacecraft.yLocal);
            if (distance < minDistance) {
                minDistance = distance;
                nearestSpacecraft = spacecraft;
            }
        });

        return nearestSpacecraft;
    }

    shoot(nearestSpacecraft) {
        if (!nearestSpacecraft) return;
        let bullet = {
            xStart: this.xGlobal,
            yStart: this.yGlobal,
            xMouseStart: nearestSpacecraft.xGlobal + nearestSpacecraft.xLocal,
            yMouseStart: nearestSpacecraft.yGlobal + nearestSpacecraft.yLocal,
            xGlobal: this.xGlobal,
            yGlobal: this.yGlobal
        };
        this.bullets.push(bullet);
    }

    moveBullets() {
        let planet = solarSystem.planets[this.planetIndex];
        if (!planet) return;

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            let bullet = this.bullets[i];
            let bulletVector = createVector(
                int(bullet.xMouseStart) - bullet.xStart,
                int(bullet.yMouseStart) - bullet.yStart,
            ).normalize();
            bullet.xGlobal += bulletVector.x * (parseInt(BULLET_SPEED) * 2);
            bullet.yGlobal += bulletVector.y * (parseInt(BULLET_SPEED) * 2);

            if (!planet.onPlanet(bullet.xGlobal, bullet.yGlobal) ||
                dist(bullet.xGlobal, bullet.yGlobal, this.xGlobal, this.yGlobal) > 500) {
                this.bullets.splice(i, 1);
            }
        }
    }

    checkCollisionsWithSpacecrafts() {

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            let bullet = this.bullets[i];

            spacecrafts.forEach((spacecraft) => {
                if (spacecraft.xLocal >= 0 && this.planetIndex === spacecraft.planetIndex) {  // Only check visible spacecrafts jens
                    let d = dist(spacecraft.xGlobal + spacecraft.xLocal, spacecraft.yGlobal + spacecraft.yLocal, bullet.xGlobal, bullet.yGlobal);
                    if (d < (spacecraft.diameter + BULLET_DIAMETER) / 2) {
                        shared.canonTowerHits[spacecraft.playerNumber]++;
                        this.hits[spacecraft.playerNumber]++; // Not used for anything
                        this.bullets.splice(i, 1);
                    }
                }
            });
        }
    }
}