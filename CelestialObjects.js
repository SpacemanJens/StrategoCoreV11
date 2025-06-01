class CelestialObject {
    constructor(angle, distance, tiltEffect) {
        this.angle = angle;
        this.distance = distance;
        this.tiltEffect = tiltEffect;
    }

    updatePosition(x, y) {
        this.x = x;
        this.y = y;
    }

    drawOrbit() {
        stroke(100);
        noFill();
        beginShape();
        for (let a = 0; a < 360; a++) {
            let x = cos(a) * this.distance;
            let y = sin(a) * this.distance * this.tiltEffect;
            vertex(x, y);
        }
        endShape(CLOSE);
    }
}
class Star extends CelestialObject {
    constructor(orbit, mass) {
        super(0, orbit, 0.15);
        this.mass = mass;
    }

    drawStarEffect(x, y, hsb2, hsb3, hsb4, hsb5, fill1, fill2, fill3, fill4, cr, coronaEffect) {

        if (showBlurAndTintEffects) {
            push();
            blendMode(BLEND);
            colorMode(HSB, hsb2, hsb3, hsb4, hsb5);
            blendMode(ADD);
            for (let d = 0; d < 1; d += 0.01) {
                fill(fill1, fill2, fill3, (1.1 - d * 1.2) * fill4);
                circle(x, y, cr * d + random(0, coronaEffect));
            }
            pop();
        } else {
            push();
            fill(255, 0, 0);
            stroke(255, 0, 0);
            strokeWeight(2);
            circle(x, y, cr / 3);
            pop();
        }
    }
}

class BlackHole extends Star {
    draw() {
        this.drawStarEffect(this.x, this.y, 1000, 100, 100, 710, 50, 100, 100, 30, 150, 10);
        fill(0);
        circle(this.x, this.y, 30);
    }
}

class YellowStar extends Star {
    draw() {
        fill(0);
        circle(this.x, this.y, 110);
        this.drawStarEffect(this.x, this.y, 430, 800, 1500, 1010, 50, 550, 300, 400, 300, 0);
    }
}
