// Callback for successful image load
function imageLoadedCallback() {
    imagesLoadedCount++;
    if (imagesLoadedCount >= totalImagesToLoadForPrepareImages) {
        imagesStillLoading = false;
        if (allImagesLoadedSuccessfully) {
            console.log("All images from prepareImages loaded successfully.");
        } else {
            console.log("Finished loading images from prepareImages, but some failed.");
        }
    }
}

// Callback for failed image load
function imageLoadErrorCallback(errorData) {
    imagesLoadedCount++;
    allImagesLoadedSuccessfully = false;
    console.error(`Error loading image: ${errorData.path}`, errorData.event);
    if (imagesLoadedCount >= totalImagesToLoadForPrepareImages) {
        imagesStillLoading = false;
        console.log("Finished loading images from prepareImages, but some failed.");
    }
}

//=================================================== 
// SETUP AND INITIALIZATION
//=================================================== 2 3
function prepareImages() {
    imagesStillLoading = true;
    imagesLoadedCount = 0;
    totalImagesToLoadForPrepareImages = 0;
    allImagesLoadedSuccessfully = true;

    const wrappedErrorCb = (path, event) => imageLoadErrorCallback({ path, event });

    // ImageIndex16Manager
    // Planet 0
    // Load warpgate images
    for (let i = 1; i <= 10; i++) {
        const frameName = `p0warpgateA${i}`;
        const path = `images/startpage/p0warpgateA/${frameName}.png`;
        totalImagesToLoadForPrepareImages++;
        warpgateImages16.push(loadImage(path, imageLoadedCallback, (e) => wrappedErrorCb(path, e)));
    }

    // Load water images
    for (let i = 1; i <= 6; i++) {
        const frameName = `p0water${i}`;
        const path = `images/startpage/p0water/${frameName}.png`;
        totalImagesToLoadForPrepareImages++;
        waterImages.push(loadImage(path, imageLoadedCallback, (e) => wrappedErrorCb(path, e)));
    }

    // ImageIndex8Manager
    // Load warpgate A images
    for (let i = 1; i <= 6; i++) {
        const frameName = `p3warpgateA${i}`;
        const path = `images/startpage/p3warpgateA/${frameName}.png`;
        totalImagesToLoadForPrepareImages++;
        warpgateAImages.push(loadImage(path, imageLoadedCallback, (e) => wrappedErrorCb(path, e)));
    }

    // Load warpgate B images
    for (let i = 1; i <= 13; i++) {
        const frameName = `p3warpgateB${i}`;
        const path = `images/startpage/p3warpgateB/${frameName}.png`;
        totalImagesToLoadForPrepareImages++;
        warpgateBImages.push(loadImage(path, imageLoadedCallback, (e) => wrappedErrorCb(path, e)));
    }

    // ImageIndex10Manager
    // Load background image
    let path = "images/startpage/hangerTeamBlueEffect/hangerTeamBlueEmpty1.png";
    totalImagesToLoadForPrepareImages++;
    backgroundImage = loadImage(path, imageLoadedCallback, (e) => wrappedErrorCb(path, e));

    // Load spacecraft images
    path = "images/startpage/hangerTeamBlueEffect/blackCircleDownLeft1.png";
    totalImagesToLoadForPrepareImages++;
    blackCircleImg = loadImage(path, imageLoadedCallback, (e) => wrappedErrorCb(path, e));
    path = "images/startpage/hangerTeamBlueEffect/spaceCraftUpperLeft.png";
    totalImagesToLoadForPrepareImages++;
    upperLeftImg = loadImage(path, imageLoadedCallback, (e) => wrappedErrorCb(path, e));
    path = "images/startpage/hangerTeamBlueEffect/spaceCraftUpperRight.png";
    totalImagesToLoadForPrepareImages++;
    upperRightImg = loadImage(path, imageLoadedCallback, (e) => wrappedErrorCb(path, e));
    path = "images/startpage/hangerTeamBlueEffect/spaceCraftLowerLeft.png";
    totalImagesToLoadForPrepareImages++;
    lowerLeftImg = loadImage(path, imageLoadedCallback, (e) => wrappedErrorCb(path, e));
    path = "images/startpage/hangerTeamBlueEffect/spaceCraftLowerRight.png";
    totalImagesToLoadForPrepareImages++;
    lowerRightImg = loadImage(path, imageLoadedCallback, (e) => wrappedErrorCb(path, e));

    // ImageIndex11Manager 
    // Load left-facing frames
    for (let i = 1; i <= 24; i++) {
        const frameName = `p4spejderL${i}`;
        const path = `images/startpage/p4spider/${frameName}.png`;
        totalImagesToLoadForPrepareImages++;
        framesLeft.push(loadImage(path, imageLoadedCallback, (e) => wrappedErrorCb(path, e)));
    }

    // Load right-facing frames
    for (let i = 1; i <= 24; i++) {
        const frameName = `p4spejderR${i}`;
        const path = `images/startpage/p4spider/${frameName}.png`;
        totalImagesToLoadForPrepareImages++;
        framesRight.push(loadImage(path, imageLoadedCallback, (e) => wrappedErrorCb(path, e)));
    }

    // Planet 4
    // Load warpgate images
    for (let i = 1; i <= 13; i++) {
        const frameName = `p4warpgateA${i}`;
        const path = `images/startpage/p4warpgateA/${frameName}.png`;
        totalImagesToLoadForPrepareImages++;
        warpgateImages11.push(loadImage(path, imageLoadedCallback, (e) => wrappedErrorCb(path, e)));
    }

    // Load lightTower images
    for (let i = 1; i <= 11; i++) {
        const frameName = `p4lightTower${i}`;
        const path = `images/startpage/p4lightTower/${frameName}.png`;
        totalImagesToLoadForPrepareImages++;
        lightTowerImages.push(loadImage(path, imageLoadedCallback, (e) => wrappedErrorCb(path, e)));
    }

    // ImageIndex13Manager
    // Load jellyfish images
    const jellyfishPaths = [
        "images/startpage/p4p3jellyfish/p4p3jellyfishLeft.png",
        "images/startpage/p4p3jellyfish/p4p3jellyfishLowerLeft.png",
        "images/startpage/p4p3jellyfish/p4p3jellyfishLowerMiddle.png",
        "images/startpage/p4p3jellyfish/p4p3jellyfishLowerRight.png",
        "images/startpage/p4p3jellyfish/p4p3jellyfishUpperLeft.png",
        "images/startpage/p4p3jellyfish/p4p3jellyfishUpperRight.png"
    ];
    jellyfishPaths.forEach(p => {
        totalImagesToLoadForPrepareImages++;
        jellyfishImages.push(loadImage(p, imageLoadedCallback, (e) => wrappedErrorCb(p, e)));
    });

    // GameImageManager
    const imagePaths = [
        "images/startpage/background/hangerTeamGreen.png", "images/startpage/background/planet1p1.png", "images/startpage/background/planet1p2.png",
        "images/startpage/background/planet1p3.png", "images/startpage/background/planet2p1.png", "images/startpage/background/planet2p2.png",
        "images/startpage/background/planet3p1.png", "images/startpage/background/planet3p2.png", "images/startpage/background/planet3p3.png",
        "images/startpage/background/planet3p4.png", "images/startpage/background/hangerTeamBlue.png", "images/startpage/background/planet4p1.png",
        "images/startpage/background/planet4p2.png", "images/startpage/background/planet4p3cleaned.png", "images/startpage/background/planet4p4.png",
        "images/startpage/background/logo.png", "images/startpage/background/planet0p1.png", "images/startpage/background/planet0p2.png",
        "images/startpage/background/planet0p3.png", "images/startpage/background/planet0p4.png"
    ];
    imagePaths.forEach(p => {
        totalImagesToLoadForPrepareImages++;
        gameImages.push(loadImage(p, imageLoadedCallback, (e) => wrappedErrorCb(p, e)));
    });



    // Load warp gate up images
    for (let indexPlanet = 0; indexPlanet <= 4; indexPlanet++) {

        let numberOfWarpGateUpImagesForTheDifferentPlanets = [8, 14, 14, 14, 14];

        // warpGateUpImages = []; // This was causing the issue by re-initializing in each loop
        warpGateUpImages[indexPlanet] = []; // Initialize the sub-array for the current planet

        for (let indexWarpGate = 0; indexWarpGate < numberOfWarpGateUpImagesForTheDifferentPlanets[indexPlanet]; indexWarpGate++) {
            const path = `images/planet${indexPlanet}/p${indexPlanet}warpGateUp/p${indexPlanet}wUp${indexWarpGate}.png`;
            totalImagesToLoadForPrepareImages++;
            warpGateUpImages[indexPlanet].push(loadImage(path, imageLoadedCallback, (e) => wrappedErrorCb(path, e)));
        }
    }

    // Load warp gate down images
    for (let indexPlanet = 0; indexPlanet <= 4; indexPlanet++) {

        let numberOfWarpGateDownImagesForTheDifferentPlanets = [11, 14, 10, 7, 14];

        // warpGateDownImages = []; // This was causing the issue by re-initializing in each loop
        warpGateDownImages[indexPlanet] = []; // Initialize the sub-array for the current planet

        for (let indexWarpGate = 0; indexWarpGate < numberOfWarpGateDownImagesForTheDifferentPlanets[indexPlanet]; indexWarpGate++) {
            const path = `images/planet${indexPlanet}/p${indexPlanet}warpGateDown/p${indexPlanet}wDown${indexWarpGate}.png`; // Note: Path seems to be same as Up, might be a typo in original code.
            totalImagesToLoadForPrepareImages++;
            warpGateDownImages[indexPlanet].push(loadImage(path, imageLoadedCallback, (e) => wrappedErrorCb(path, e)));
        }
    }

    // spacecrafts
    path = `images/spacecraft/spacecraftPurple7Cloaked.png`;
    totalImagesToLoadForPrepareImages++;
    cloakedPurpleSpacecraft7Image = loadImage(path, imageLoadedCallback, (e) => wrappedErrorCb(path, e));
    path = `images/spacecraft/spacecraftPurple10Cloaked.png`;
    totalImagesToLoadForPrepareImages++;
    cloakedPurpleSpacecraft10Image = loadImage(path, imageLoadedCallback, (e) => wrappedErrorCb(path, e));
    path = `images/spacecraft/spacecraftGreen7Cloaked.png`;
    totalImagesToLoadForPrepareImages++;
    cloakedGreenSpacecraft7Image = loadImage(path, imageLoadedCallback, (e) => wrappedErrorCb(path, e));
    path = `images/spacecraft/spacecraftGreen10Cloaked.png`;
    totalImagesToLoadForPrepareImages++;
    cloakedGreenSpacecraft10Image = loadImage(path, imageLoadedCallback, (e) => wrappedErrorCb(path, e));

    for (let i = 0; i < 12; i++) {
        const path = `images/spacecraft/spacecraftGreen${i}.png`;
        totalImagesToLoadForPrepareImages++;
        spacecraftGreenImages[i] = loadImage(path, imageLoadedCallback, (e) => wrappedErrorCb(path, e));
    }
    for (let i = 0; i < 12; i++) {
        const path = `images/spacecraft/spacecraftPurple${i}.png`;
        totalImagesToLoadForPrepareImages++;
        spacecraftPurpleImages[i] = loadImage(path, imageLoadedCallback, (e) => wrappedErrorCb(path, e));
    }

    // Canon towers
    for (let i = 0; i < 3; i++) {
        const path = `images/spacecraft/canon${i}.png`;
        totalImagesToLoadForPrepareImages++;
        canonImages[i] = loadImage(path, imageLoadedCallback, (e) => wrappedErrorCb(path, e));
    }

    // Single basic minimap  
    const fixedMinimapPaths = [
        "images/planet0/p0minimap.png",
        "images/planet1/p1minimap.png",
        "images/planet2/p2minimap.png",
        "images/planet3/p3minimap.png",
        "images/planet4/p4minimap.png"
    ];
    fixedMinimapPaths.forEach((p, i) => {
        totalImagesToLoadForPrepareImages++;
        fixedMinimapImage[i] = loadImage(p, imageLoadedCallback, (e) => wrappedErrorCb(p, e));
    });

    // Game background images
    const planetBackgroundPaths = [
        "images/planet0/p0.png",
        "images/planet1/p1.png",
        "images/planet2/p2.png",
        "images/planet3/p3.png",
        "images/planet4/p4.png"
    ];
    planetBackgroundPaths.forEach((p, i) => {
        totalImagesToLoadForPrepareImages++;
        planetBackgroundImages[i] = loadImage(p, imageLoadedCallback, (e) => wrappedErrorCb(p, e));
    });

    if (totalImagesToLoadForPrepareImages === 0) {
        imagesStillLoading = false; // No images to load, so stop loading state
        console.log("No images were queued for loading in prepareImages.");
    }
} 