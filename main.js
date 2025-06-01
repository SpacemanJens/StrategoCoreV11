/** R3 Jens2 jens jens jens2 jens4 2 3 4 5 6  7  
 * Space Stratego Game
 * A multiplayer strategy game built with p5.js and p5.party
 */

//===================================================
// CONSTANTS AND GLOBAL VARIABLES
//===================================================
const room = new URLSearchParams(location.search).get("room");

// Party System Global Variables jens3    
let shared;
let me;
//let guests;
let guests;

let spacecrafts = [];
let gameObjects = []; // Initialize as empty array

/* Grafical */
let backgroundManager;
let gameImageManager;
let imageIndex8Manager;
let imageIndex10Manager;
let imageIndex11Manager;
let imageIndex13Manager;
let imageIndex16Manager;
/* Grafical */

// Game setup
const IMAGE_RING_X = 300;
const IMAGE_RING_Y = 0;

// Game Dimensions
const SCREEN_WIDTH = 2500;
const SCREEN_HEIGHT = 1300;
const GAME_AREA_X = 300;
const GAME_AREA_Y = 50;
const GAME_AREA_WIDTH = 1200;
const GAME_AREA_HEIGHT = 700;
const GAME_AREA_RIGHT = GAME_AREA_X + GAME_AREA_WIDTH;
const GAME_AREA_BOTTOM = GAME_AREA_Y + GAME_AREA_HEIGHT;

// Background manager Constants ========.
const CIRCLE_RADIUS = 400;
const IMAGE_SIZE = 120;
const ANIMATION_FRAMES = 180; // 3 seconds at 60fps.
const SUPERNOVA_MAX_SIZE = 10001;
const SUPERNOVA_THRESHOLD = 0.7;

// Gameplay Constants  
const TOTAL_NUMBER_OF_PLAYERS = 24
const SPACECRAFT_SIZE = 110; // Was 40
const SPACECRAFT_SPEED = 8;
const MAX_PLAYERS_PER_TEAM = 12;
const GAME_TRANSITION_TIME = 6000; // 5 seconds in milliseconds
const WARP_COOLDOWN_TIME = 10000; // 3 seconds in milliseconds
const BULLET_SPEED = 4;
const BULLET_DIAMETER = 10;
const NUMBER_OF_BULLETS = 2;
const TOWER_SHOOTING_INTERVAL = 2000; // 1000

// Images
let spacecraftBlueImages = [];
let spacecraftGreenImages = [];
let spacecraftPurpleImages = [];
let canonImages = [];
let minimapImg = []; // jenskh
let fixedMinimapImage = [];
let planetBackgroundImages = [];

// ImageIndex8Manager
let warpgateAImages = [];
let warpgateBImages = [];
// ImageIndex10Manager
let backgroundImage = null;
let blackCircleImg = null;
let upperLeftImg = null;
let upperRightImg = null;
let lowerLeftImg = null;
let lowerRightImg = null;
// How to Play Images
let WASDkeyImage = null;
let TFGHkeyImage = null;
let howtoPlaySpacecrafts = null;

// ImageIndex11Manager
let warpgateImages11 = [];
let lightTowerImages = [];
// ImageIndex13Manager
let jellyfishImages = [];
// ImageIndex16Manager
let warpgateImages16 = [];
let warpgateBImages16 = [];
let waterImages = [];

// Planet 0
let warpGateUpImages = [];
let warpGateDownImages = [];

// GameImageManager
let gameImagesSmall = []; // This now fully owns the game images
let gameImages = [];
// Spider
let framesLeft = []; // Array to hold left-facing animation frames
let framesRight = []; // Array to hold right-facing animation frames

// UI Variables
let nameInput;
let chooseTeamBlueButton;
let chooseTeamGreenButton;
let message = "";

// Game Controle Variables
let fixedMinimap
let selectedPlanet
let solarSystem
let planetIndexBlue = 4
let planetIndexGreen = 4
let canonTowersGenerated = false;
let isWarpingUp = false;
let hasWarped = false;
let supernovaStarIndex = -1;
let firstRun = true;
let firstRunAfterImagesLoaded = true;
let howToPlayButtonRect; // For the interactive "How to Play" button
let minimumFrameRate = 60;

// Add frame rate tracking variables after other global variables
let frameRateHistory = [];
let frameRateHistorySize = 120; // 2 seconds at 60fps
let averageFrameRate = 60;

// Image loading state variables
let imagesStillLoading = true;
let imagesLoadedCount = 0;
let totalImagesToLoadForPrepareImages = 0;
let allImagesLoadedSuccessfully = true;

// Variables only for statistics
let totalNumberOfVisualBullets = 0;
let totalNumberOfBullets = 0;

//let backgroundColor = [20, 30, 40]; // Default background color
let backgroundColor = [10, 20, 30]; // Default background color

// to test performance
let showGraphics = true
let showHowToNavigate = true
let showStarSystem = true
let showBlurAndTintEffects = true
let showColorBlindText = false

// Add a centralized planet color palette
const planetColors = {
    0: { // Blue planet
        center: [20, 50, 160],
        edge: [80, 120, 200],
        name: "Rocky"
    },
    1: { // Green planet
        center: [20, 120, 40],
        edge: [100, 180, 100],
        name: "Organic"
    },
    2: { // Red planet
        center: [120, 20, 20],
        edge: [200, 100, 100],
        name: "Budda"
    },
    3: { // Yellow planet
        center: [120, 120, 20],
        edge: [200, 200, 100],
        name: "Ice cube"
    },
    4: { // Purple planet
        center: [80, 20, 120],
        edge: [150, 80, 200],
        name: "Insect swarm"
    }
};


// Character Definitions 
// Character Definitions 2 3 4 5 6 
const CHARACTER_DEFINITIONS = [
    { rank: -1, name: "Core Commander", id: "C", imageId: 0, count: 1, color: 'purple', isCoreCommand: true, canShoot: true },
    { rank: 10, name: "Star Commander", id: "10", imageId: 1, count: 1, color: 'cyan', isStarCommand: true, canShoot: true },
    { rank: 9, name: "Fleet Admiral", id: "9", imageId: 2, count: 1, color: 'magenta', canShoot: true },
    { rank: 8, name: "Ship Captain", id: "8", imageId: 3, count: 2, color: 'lime' },
    { rank: 7, name: "Squadron Leader", id: "7", imageId: 4, count: 3, color: 'teal', canShoot: true },
    { rank: 6, name: "Lt. Commander", id: "6", imageId: 5, count: 4, color: 'lavender', canShoot: true },
    { rank: 5, name: "Chief P. Officer", id: "5", imageId: 6, count: 4, color: 'maroon' },
    { rank: 4, name: "Night Sniper", id: "4", imageId: 7, count: 4, color: 'olive', canShoot: true, canSnipe: true, canCloake: true },
    { rank: 3, name: "Engineer", id: "3", imageId: 8, count: 5, color: 'yellow', isEngineer: true },
    { rank: 2, name: "Power Glider", id: "2", imageId: 9, count: 8, color: 'purple', canMoveFast: true },
    { rank: 1, name: "Stealth Squad", id: "S", imageId: 10, count: 1, color: 'orange', isStealthSquad: true, canCloake: true },
    { rank: 0, name: "Recon Drone", id: "D", imageId: 11, count: 6, color: 'brown', isReconDrone: true },
];

/**
 * Looks up the imageId for a given character ID in the CHARACTER_DEFINITIONS array
 * @param {string} characterId - The ID of the character to lookup 
 * @returns {number|null} - The imageId if found, null otherwise
 */
function getImageId(characterId) {
    const definition = CHARACTER_DEFINITIONS.find(def => def.id === characterId);
    if (definition) {
        return definition.imageId;
    }
    // Return default value if character ID not found
    console.warn(`No image ID found for character ID: ${characterId}`);
    return 0; // Default to first image as fallback
}

function preload() {
    partyConnect( 
        "wss://p5js-spaceman-server-29f6636dfb6c.herokuapp.com",
        "jkv-strategoCoreV10temp3",  
        room 
    );

    shared = partyLoadShared("shared", {
        gameState: "GAME-SETUP",
        winningTeam: null,
        resetFlag: false,
        coreCommandDisconnected: false,
        characterList: [],
        blueWins: 0,
        greenWins: 0,
        draws: 0,
        resetTimerStartTime: null,
        resetTimerSeconds: null,
        gameStartTimerStartTime: null,
        gameStartTimerSeconds: null,
        currentTime: null,
        gameObjects: [],  // Start with empty array jens jens2
        canonTowerHits: Array(15).fill(0),
    });

    me = partyLoadMyShared({
        playerName: "observer",
        lastWarpTime: 0 // Track when player last used a warp gate
    });

    guests = partyLoadGuestShareds();

    // GameImageManager - Only load small preview images during preload
    const imagePathsSmallImages = [
        "images/startpage/smallImages/hangerTeamGreenSmall.png", "images/startpage/smallImages/planet1p1Small.png", "images/startpage/smallImages/planet1p2Small.png",
        "images/startpage/smallImages/planet1p3Small.png", "images/startpage/smallImages/planet2p1Small.png", "images/startpage/smallImages/planet2p2Small.png",
        "images/startpage/smallImages/planet3p1Small.png", "images/startpage/smallImages/planet3p2Small.png", "images/startpage/smallImages/planet3p3Small.png",
        "images/startpage/smallImages/planet3p4Small.png", "images/startpage/smallImages/hangerTeamBlueSmall.png", "images/startpage/smallImages/planet4p1Small.png",
        "images/startpage/smallImages/planet4p2Small.png", "images/startpage/smallImages/planet4p3SmallCleaned.png", "images/startpage/smallImages/planet4p4Small.png",
        "images/startpage/smallImages/logoSmall.png", "images/startpage/smallImages/planet0p1Small.png", "images/startpage/smallImages/planet0p2Small.png",
        "images/startpage/smallImages/planet0p3Small.png", "images/startpage/smallImages/planet0p4Small.png"
    ];

    imagePathsSmallImages.forEach(path => gameImagesSmall.push(loadImage(path)));

    for (let i = 0; i < 12; i++) {
        spacecraftBlueImages[i] = loadImage(`images/spacecraft/spacecraftBlue${i}.png`);
    }

    WASDkeyImage = loadImage(`images/howtoPlay/WASDkeys.png`);
    TFGHkeyImage = loadImage(`images/howtoPlay/TFGHkeys.png`);
    howtoPlaySpacecrafts = loadImage(`images/howtoPlay/spacecrafts.png`);

    // startpage
    // Make sure these classes are defined before using them
    // Initialize manager instances first to avoid undefined references
    /* Grafical */ // 2 3
    backgroundManager = new BackgroundManager();

    imageIndex8Manager = new ImageIndex8Manager();
    imageIndex10Manager = new ImageIndex10Manager();
    imageIndex11Manager = new ImageIndex11Manager();
    imageIndex13Manager = new ImageIndex13Manager();
    imageIndex16Manager = new ImageIndex16Manager();
    gameImageManager = new GameImageManager();

    // prepareImages(); // MOVED to setup() 

    // Now load images for all managers   2  3 
    /* Grafical */
}
 
function setup() {
    createCanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
    frameRate(45);
    //noSmooth(); // Disable anti-aliasing for performance
    noStroke();

    prepareImages(); // Call prepareImages here to start loading images asynchronously

    createSpacecrafts();

    if (me.playerName === "observer") {
        joinGame();
        return;
    }

    console.log("My ID (will populate):", me.playerNumber);
}

//=================================================== jens 2 3
// MAIN DRAW FUNCTION
//===================================================

function draw() {
    background(backgroundColor[0], backgroundColor[1], backgroundColor[2]);

    if (firstRun) {
        backgroundManager.initialize();
        createNameInput();
        initializeCharacterList();
        fixedMinimap = new BasicMinimap(x = 1250, y = 900, diameter = 300, color = 'grey', diameterPlanet = 3000);
        solarSystem = new SolarSystem(xSolarSystemCenter = 1250, ySolarSystemCenter = 900);
        // Initialize the "How to Play" button's rectangle properties
        howToPlayButtonRect = {
            x: GAME_AREA_X + GAME_AREA_WIDTH / 2 - 100,
            y: GAME_AREA_Y, // Positioned a bit lower to avoid overlap
            w: 200,
            h: 40
        };
        firstRun = false;
        return;
    }

    if (firstRunAfterImagesLoaded) {
        imageIndex10Manager.loadImagesAndAddSpacecrafts();
        imageIndex13Manager.loadImages();
        firstRunAfterImagesLoaded = false;
    }

    // Only generate new Towers one time when a new host is assigned
    
    if (!canonTowersGenerated && partyIsHost()) {
        canonTowersGenerated = true;
        updateTowerCount();
    }

    resolvePlayerNumberConflicts()

    stepLocal()

    if (partyIsHost()) {
        me.iAmHost = true;
        handleHostDuties();
    } else {
        me.iAmHost = false;
        receiveNewDataFromHost();
    }

    updateLocalStateFromSharedList();

    if (shared.resetFlag && !me.lastProcessedResetFlag) {
        resetClientState();
        me.lastProcessedResetFlag = true;
    } else if (!shared.resetFlag && me.lastProcessedResetFlag) {
        me.lastProcessedResetFlag = false;
    }

    if (!me.isReady) {
        backgroundManager.drawBackground();
        drawRulesSection();
        gameImageManager.drawGameImages();
        gameImageManager.drawEnlargedImage();
        drawGameSetup();
    } else {
        if (me.planetIndex === -1) return

        switch (shared.gameState) {
            case "GAME-SETUP":
                //console.log("Game setup"); 2 4 5 6 7 
                drawGameStats()
                drawPerformanceSettings()
                drawHowToPlay() // This draws the WASD/TFGH key images
                push();
                drawCharacterListAndInfo();
                pop()
                drawCharacterLegend();
                drawGameSetup();
                drawInteractiveHowToPlay(); // Draw the new button and its hover text
                break;
            case "IN-GAME":
                //console.log("In game");
                displayTwoPlayersWithTheSamePlayerNumber()
                selectedPlanet = solarSystem.planets[me.planetIndex];
                if (!selectedPlanet) return

                fixedMinimap.update(selectedPlanet.diameterPlanet, selectedPlanet.xWarpGateUp, selectedPlanet.yWarpGateUp, selectedPlanet.xWarpGateDown, selectedPlanet.yWarpGateDown, selectedPlanet.diameterWarpGate);

                drawGameAreaBackground();
                drawBlackBackground()
                drawMinimap()
                drawSpacecraftOnMinimap();
                push();
                drawCharacterListAndInfo();
                pop()
                drawCanonTowers();
                drawSpacecrafts();
                handlePlayerMovement();
                handleBulletMovement();
                checkCollisionsWithWarpGate();
                checkBulletCollisions()
                drawCharacterLegend();
                drawPerformanceSettings()
                break;
            case "GAME-FINISHED":
                selectedPlanet = solarSystem.planets[me.planetIndex];
                if (!selectedPlanet) return
                drawGameAreaBackground();
                drawBlackBackground()
                drawMinimap()
                drawGameFinished();
                drawCharacterLegend();
                break;
        }
        drawNavigationInstruction()
    }

    drawGameTimer();
    drawStatusMessages();
    displayHostName();
}

//===================================================
// Handles my own bullets 
//===================================================

function checkBulletCollisions() {
    const opponents = spacecrafts.filter(spacecraft =>
        spacecraft.planetIndex === me.planetIndex &&
        spacecraft.hasCharacter &&
        spacecraft.team !== me.team);

    for (const opponent of opponents) {
        checkBulletCollision(opponent);
    }
}

function checkBulletCollision(spacecraft) {
    for (let i = me.bullets.length - 1; i >= 0; i--) {
        let bullet = me.bullets[i];

        // Calculate bullet's position relative to the spacecraft
        let bulletPosX = bullet.xLocal - (me.xGlobal - bullet.xGlobal);
        let bulletPosY = bullet.yLocal - (me.yGlobal - bullet.yGlobal);

        // Calculate spacecraft's position relative to the bullet
        let spacecraftPosX = spacecraft.xLocal - (me.xGlobal - spacecraft.xGlobal);
        let spacecraftPosY = spacecraft.yLocal - (me.yGlobal - spacecraft.yGlobal);

        let d = dist(spacecraftPosX, spacecraftPosY, bulletPosX, bulletPosY);

        if (d < (spacecraft.diameter / 2 + BULLET_DIAMETER / 2)) { // Adjusted to use spacecraft.diameter / 2
            me.hits[spacecraft.playerNumber]++;
            me.bullets.splice(i, 1);
        }
    }
}


