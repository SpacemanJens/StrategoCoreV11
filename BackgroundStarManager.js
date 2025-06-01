class BackgroundStarManager {
    constructor(starCount, xRange, yRange) {
        this.stars = [];
        for (let i = 0; i < starCount; i++) {
            this.stars.push(new BackgroundStar(random(xRange), random(yRange)));
        }
    }

    move() {
        for (let star of this.stars) {
            star.move();
        }
    }

    show() {
        stroke(255, this.alpha);
        fill(255, this.alpha);
        for (let star of this.stars) {
            star.show();
        }
        strokeWeight(0);
    }
}