class SolarSystem {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.angleStars = 0;
        this.starSpeed = 0.5;
        this.planetSpeed = 0.2; // Add global planet speed control
        //   this.fixedPlanet = new FixedPlanet(300, 0, 200, [0, 0, 255]);
        // constructor(angle, baseSpeed, distance, tiltEffect, baseSize, color { 
        this.planets = [
            //      new Planet(10, 0.7, 400, 0.05, 40, [0, 102, 204]), xWarpGateUp, yWarpGateUp, xWarpGateDown, yWarpGateDown, diameterWarpGate
            new Planet(random(360), 0.7, 400, 0.05, 3000, [0, 102, 204], 69, 595, 555, 1881, 2512, 200),
            new Planet(random(360), 0.5, 700, 0.08, 3500, [0, 122, 174], 2000, 1554, 1819, 2156, 2590, 200),
            new Planet(random(360), 0.4, 1100, 0.04, 5000, [0, 142, 144], 284, 3225, 2809, 2176, 4643, 200),
            new Planet(random(360), 0.3, 1400, 0.06, 4000, [0, 162, 114], 1617, 1611, 2370, 1070, 2665, 200),
            new Planet(random(360), 0.25, 1800, 0.03, 3500, [0, 182, 84], 1660, 1893, 2933, 2878, 1913, 200)
        ];

        this.blackHole = new BlackHole(75, 5);
        this.yellowStar = new YellowStar(300, 1);

        // Assign planetIndex to each planet
        this.planets.forEach((planet, index) => {
            planet.planetIndex = index;
        });
    }

    update() {
        this.angleStars += this.starSpeed;
        let totalMass = this.blackHole.mass + this.yellowStar.mass;

        // Update stars
        this.blackHole.updatePosition(
            cos(this.angleStars) * this.blackHole.distance * (this.yellowStar.mass / totalMass),
            sin(this.angleStars) * this.blackHole.distance * this.blackHole.tiltEffect
        );

        this.yellowStar.updatePosition(
            -cos(this.angleStars) * this.yellowStar.distance * (this.blackHole.mass / totalMass),
            -sin(this.angleStars) * this.yellowStar.distance * this.yellowStar.tiltEffect
        );

        // Update planets
        this.planets.forEach(planet => {
            let planetX = cos(planet.angle) * planet.distance;
            let planetY = sin(planet.angle) * planet.distance * planet.tiltEffect;

            let distanceFactor = map(planetY, 0, planet.distance * planet.tiltEffect, 1.5, 0.5);
            //distanceFactor= 3
            let diameterMinimap = planet.baseSize * (4 - distanceFactor);
            let speedMultiplier = map(distanceFactor, 0.5, 1.5, 1.5, 0.8);

            planet.update(speedMultiplier, this.planetSpeed, diameterMinimap);
            planet.updatePosition(planetX, planetY);
        });
    }

    draw() {
        // background(20);
        //      translate(width / 2 - 600, height / 2);
        translate(this.x, this.y);

        // Draw orbits
        //    this.planets.forEach(planet => planet.drawOrbit());

        // Sort and draw planets based on y position
        const frontPlanets = this.planets.filter(p => p.y >= 0);
        const backPlanets = this.planets.filter(p => p.y < 0);

        backPlanets.forEach(planet => planet.draw());

        if (this.yellowStar.y > 0) {
            this.blackHole.draw(); 
            this.yellowStar.draw();
        } else {
            this.yellowStar.draw();
            this.blackHole.draw();
        }

        frontPlanets.forEach(planet => planet.draw());
        //this.fixedPlanet.draw();
    }
}