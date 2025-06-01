class Spacecraft {
    constructor(config) {
        this.playerNumber = config.playerNumber;
        this.playerName = config.playerName || '';
        this.playerDisplayName = config.playerDisplayName || '';
        this.team = config.team || '';
        this.characterId = config.characterId;
        this.characterRank = config.characterRank;
        this.characterName = config.characterName;
        this.characterInstanceId = config.characterInstanceId;
        this.iAmHost = config.iAmHost;
        this.diameter = config.diameter; 
        this.size = this.diameter;
        this.isReady = config.isReady;
        this.hasCharacter = config.hasCharacter
        this.hasBattled = config.hasBattled;
        this.status = config.status
        this.lastProcessedResetFlag = config.lastProcessedResetFlag;
        this.xLocal = config.xLocal;
        this.yLocal = config.yLocal;
        this.xGlobal = config.xGlobal;
        this.yGlobal = config.yGlobal;
        this.xMouse = config.xMouse;
        this.yMouse = config.yMouse;
        this.playerColor = config.playerColor;
        this.bullets = config.bullets || [];
        this.hits = config.hits || Array(15).fill(0);
        this.planetIndex = config.planetIndex;
        this.fixedMinimapIndex = config.planetIndex;
    }

    setSpacecraftColor() {
        if (!this.playerColor) return;

        fill(this.playerColor);
        strokeWeight(3);
        if (this.team === 'blue') {
            stroke(133, 69, 196);
        } else {
            stroke(0, 200, 100);
        }
    }

    drawSpacecraft(characterData) {
        if (!this.hasCharacter || !this.characterId ||
            this.status === 'lost') {
            return;
        }

        if (!characterData || characterData.status === 'lost') {
            return;
        }
        let xLocal = this.xLocal - (me.xGlobal - this.xGlobal);
        let yLocal = this.yLocal - (me.yGlobal - this.yGlobal);

        if (onLocalScreenArea(xLocal, yLocal)) {
            const myCharacterData = shared.characterList.find(c => c.instanceId === this.characterInstanceId);
            if (!myCharacterData) return;

            if (showGraphics && allImagesLoadedSuccessfully) {
                push();
                angleMode(RADIANS);
                imageMode(CENTER);
                translate(GAME_AREA_X + xLocal, GAME_AREA_Y + yLocal);

                let head = createVector(
                    this.xMouse - this.xLocal,
                    this.yMouse - this.yLocal
                ).normalize().heading();
                rotate(head + 1.555);

                //console.log('drawSpacecraft', this.characterId, this.playerNumber, this.team, this.characterRank, this.characterName, this.characterInstanceId, this.xLocal, this.yLocal);
                if (myCharacterData.canCloake && this.isCloaked) {
                    // console.log('Cloaked'); // Consider removing if not needed for debugging
                    if (myCharacterData.imageId === 7) {
                        if (this.team === 'blue') {
                            image(cloakedPurpleSpacecraft7Image, 0, 0, this.diameter * 1.5, this.diameter * 1.2);
                        } else {
                            image(cloakedGreenSpacecraft7Image, 0, 0, this.diameter * 1.5, this.diameter * 1.2);
                        }
                    } else {
                        if (this.team === 'blue') {
                            image(cloakedPurpleSpacecraft10Image, 0, 0, this.diameter * 1.5, this.diameter * 1.2);
                        } else {
                            image(cloakedGreenSpacecraft10Image, 0, 0, this.diameter * 1.5, this.diameter * 1.2);
                        }
                    }
                } else {
                    let imageId = getImageId(this.characterId);

                    if (this.team === 'blue') {
                        image(spacecraftPurpleImages[imageId], 0, 0, this.diameter * 1.5, this.diameter * 1.2);
                    } else {
                        image(spacecraftGreenImages[imageId], 0, 0, this.diameter * 1.5, this.diameter * 1.2);
                    }
                }
                pop();
            } else {
                push();
                angleMode(RADIANS);
                imageMode(CENTER);
                translate(GAME_AREA_X + xLocal, GAME_AREA_Y + yLocal);

                let head = createVector(
                    this.xMouse - this.xLocal,
                    this.yMouse - this.yLocal
                ).normalize().heading();
                rotate(head + 1.555);

                this.setSpacecraftColor()
                ellipse(0, 0, this.diameter, this.diameter);
                rect(-this.diameter / 6, -this.diameter / 2 - this.diameter / 3, this.diameter / 3, this.diameter / 3);
                pop();

                push();
                noStroke();
                translate(GAME_AREA_X + xLocal, GAME_AREA_Y + yLocal);
                //                fill(200);

                if (!myCharacterData.canCloake || !this.isCloaked) {
                        textSize(this.diameter * 0.45);
                        textAlign(CENTER, CENTER);
                        text(this.characterId, 0, 0);
                }

                pop()
            }
            push()
            translate(GAME_AREA_X + xLocal, GAME_AREA_Y + yLocal);

            let hitByOthers = numberOfTimesBeingHit(this.playerNumber)

            let displayText = `${this.playerDisplayName} (${hitByOthers}/10)`
            fill(0)
            textSize(13);
            textAlign(CENTER, BOTTOM);
            text(displayText, 0, this.diameter / 2 + 28);

            if (showColorBlindText){
                if (this.team === 'blue') {
                    text('(Team Purple)', 0, this.diameter / 2 + 40);   
                } else {
                    text('(Team Green)', 0, this.diameter / 2 + 40);   
                }   
            }
            pop()
        }
    }

    drawBullets() {
        if (this.planetIndex < 0) { return; }
        if (this.bullets) {
            this.bullets.forEach(bullet => {
                this.drawBullet(bullet);
            });
        }
    }

    drawBullet(bullet) {
        if (this.planetIndex < 0) { return; }
        push();

        if (this.team === 'blue') {
            //            fill(0, 150, 255);
            fill(133, 69, 196);
        } else {
            fill(0, 200, 100);
        }

        imageMode(CENTER);
        // Adjust bullet position based on spacecraft's current global movement
        let posX = GAME_AREA_X + bullet.xLocal - (me.xGlobal - bullet.xGlobal);
        let posY = GAME_AREA_Y + bullet.yLocal - (me.yGlobal - bullet.yGlobal);
        translate(posX, posY);
        let head = createVector(
            bullet.xMouseStart - bullet.xStart,
            bullet.yMouseStart - bullet.yStart
        ).normalize().heading();
        rotate(head + 1.555);
        circle(0, 0, 10)
        pop();
    }

    syncFromShared(sharedSpacecraft) {
        Object.assign(this, sharedSpacecraft);
        // Ensure that this.diameter (used for drawing) is consistent with this.size 
        // (which should be the authoritative collision size from sharedSpacecraft, originating from me.size).
        // This allows character-specific sizes (if me.size is updated in main.js) to reflect in drawing.
        if (typeof this.size !== 'undefined') {
            this.diameter = this.size;
        }
    }
}