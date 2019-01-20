class Pacman {
    constructor(scaledTileSize, mazeArray, characterUtil) {
        this.scaledTileSize = scaledTileSize;
        this.mazeArray = mazeArray;
        this.characterUtil = characterUtil;
        this.animationTarget = document.getElementById('pacman');
        this.pacmanArrow = document.getElementById('pacman-arrow');

        this.setMovementStats(scaledTileSize);
        this.setSpriteAnimationStats();
        this.setStyleMeasurements(scaledTileSize, this.spriteFrames);
        this.setDefaultPosition(scaledTileSize);
        this.setKeyListeners();

        this.setSpriteSheet(this.direction);
    }

    /**
     * Sets various properties related to Pacman's movement
     * @param {number} scaledTileSize - The dimensions of a single tile
     */
    setMovementStats(scaledTileSize) {
        this.velocityPerMs = this.calculateVelocityPerMs(scaledTileSize);
        this.desiredDirection = this.characterUtil.directions.left;
        this.direction = this.characterUtil.directions.left;
        this.moving = false;
    }

    /**
     * Sets values pertaining to Pacman's spritesheet animation
     */
    setSpriteAnimationStats() {
        this.msBetweenSprites = 50;
        this.msSinceLastSprite = 0;
        this.spriteFrames = 4;
        this.backgroundOffsetPixels = 0;
    }

    /**
     * Sets css property values for Pacman and Pacman's Arrow
     * @param {number} scaledTileSize - The dimensions of a single tile
     * @param {number} spriteFrames - The number of frames in Pacman's spritesheet
     */
    setStyleMeasurements(scaledTileSize, spriteFrames) {
        this.measurement = scaledTileSize * 2;

        this.animationTarget.style.height = `${this.measurement}px`;
        this.animationTarget.style.width = `${this.measurement}px`;
        this.animationTarget.style.backgroundSize = `${this.measurement * spriteFrames}px`;

        this.pacmanArrow.style.height = `${this.measurement * 2}px`;
        this.pacmanArrow.style.width = `${this.measurement * 2}px`;
        this.pacmanArrow.style.backgroundSize = `${this.measurement * 2}px`;
    }

    /**
     * Sets the default position and direction for Pacman at the game's start
     * @param {number} scaledTileSize - The dimensions of a single tile 
     */
    setDefaultPosition(scaledTileSize) {
        this.position = {
            top: scaledTileSize * 22.5,
            left: scaledTileSize * 13
        };
        this.oldPosition = Object.assign({}, this.position);
        this.animationTarget.style.top = `${this.position.top}px`;
        this.animationTarget.style.left = `${this.position.left}px`;
    }

    /**
     * Sets the movement key options for Pacman and registers a keydown event listener
     */
    setKeyListeners() {
        this.movementKeys = {
            // WASD
            87: 'up',
            83: 'down',
            65: 'left',
            68: 'right',
     
            // Arrow Keys
            38: 'up',
            40: 'down',
            37: 'left',
            39: 'right'
        };

        window.addEventListener('keydown', (e) => {
            this.changeDirection(e);
        });
    }

    /**
     * Calculates how fast Pacman should move in a millisecond
     * @param {number} scaledTileSize - The dimensions of a single tile
     */
    calculateVelocityPerMs(scaledTileSize) {
        // In the original game, Pacman moved at 11 tiles per second.
        let velocityPerSecond = scaledTileSize * 11;
        return velocityPerSecond / 1000;
    }

    /**
     * Chooses a movement Spritesheet depending upon direction
     * @param {('up'|'down'|'left'|'right')} direction - The direction the character is currently traveling in
     */
    setSpriteSheet(direction) {
        this.animationTarget.style.backgroundImage = `url(app/style/graphics/spriteSheets/characters/pacman/pacman_${direction}.svg)`;
    }

    /**
     * Changes Pacman's desiredDirection, updates the PacmanArrow sprite, and sets moving to true
     * @param {Event} e - The keydown event to evaluate
     */
    changeDirection(e) {
        if(this.movementKeys[e.keyCode]) {
            this.desiredDirection = this.characterUtil.directions[this.movementKeys[e.keyCode]];
            this.pacmanArrow.style.backgroundImage = `url(app/style/graphics/spriteSheets/characters/pacman/arrow_${this.desiredDirection}.svg)`;
            this.moving = true;
        }
    }

    /**
     * Updates the position of the leading arrow in front of Pacman
     * @param {({top: number, left: number})} position - Pacman's position during the current frame
     * @param {number} scaledTileSize - The dimensions of a single tile
     */
    updatePacmanArrowPosition(position, scaledTileSize) {
        this.pacmanArrow.style.top = `${position.top - scaledTileSize}px`;
        this.pacmanArrow.style.left = `${position.left - scaledTileSize}px`;
    }

    /**
     * Handle Pacman's movement and return a new position when Pacman is snapped to the x-y grid of the Maze Array
     * @param {number} elapsedMs - The amount of MS that have passed since the last update
     * @returns {({ top: number, left: number})}
     */
    handleSnappedMovement(elapsedMs) {
        const desired = this.characterUtil.determineNewPositions(this.position, this.desiredDirection, this.velocityPerMs, elapsedMs, this.scaledTileSize);
        const alternate = this.characterUtil.determineNewPositions(this.position, this.direction, this.velocityPerMs, elapsedMs, this.scaledTileSize);

        if (this.characterUtil.checkForWallCollision(desired.newGridPosition, this.mazeArray, this.desiredDirection)) {
            if(this.characterUtil.checkForWallCollision(alternate.newGridPosition, this.mazeArray, this.direction)) {
                this.moving = false;
                return this.position;
            } else {
                return alternate.newPosition;
            }
        } else {
            this.direction = this.desiredDirection;
            this.setSpriteSheet(this.direction);
            return desired.newPosition;
        }
    }

    /**
     * Handle Pacman's movement and return a new position when Pacman is inbetween tiles on the x-y grid of the Maze Array
     * @param {({x: number, y: number})} gridPosition  - The character's maze grid position during the current frame 
     * @param {number} elapsedMs - The amount of MS that have passed since the last update
     * @returns {({ top: number, left: number})}
     */
    handleUnsnappedMovement(gridPosition, elapsedMs) {
        const desired = this.characterUtil.determineNewPositions(this.position, this.desiredDirection, this.velocityPerMs, elapsedMs, this.scaledTileSize);
        const alternate = this.characterUtil.determineNewPositions(this.position, this.direction, this.velocityPerMs, elapsedMs, this.scaledTileSize);

        if (this.characterUtil.turningAround(this.direction, this.desiredDirection)) {
            this.direction = this.desiredDirection;
            this.setSpriteSheet(this.direction);
            return desired.newPosition;
        } else if (this.characterUtil.changingGridPosition(gridPosition, alternate.newGridPosition)) {
            return this.characterUtil.snapToGrid(gridPosition, this.direction, this.scaledTileSize);
        } else {
            return alternate.newPosition;
        }
    }

    /**
     * Updates the css position of Pacman and the Pacman arrow, hides them if there is a stutter, and animates Pacman's spritesheet
     * @param {number} interp - The percentage of accuracy between the desired and actual amount of time between updates
     */
    draw(interp){
        this.animationTarget.style['top'] = `${this.characterUtil.calculateNewDrawValue(interp, 'top', this.oldPosition, this.position)}px`;
        this.animationTarget.style['left'] = `${this.characterUtil.calculateNewDrawValue(interp, 'left', this.oldPosition, this.position)}px`;

        this.animationTarget.style['visibility'] = this.characterUtil.checkForStutter(this.position, this.oldPosition);

        this.updatePacmanArrowPosition(this.position, this.scaledTileSize);

        this.characterUtil.advanceSpriteSheet(this);
    }
    
    /**
     * Handles movement logic for Pacman
     * @param {number} elapsedMs - The amount of MS that have passed since the last update
     */
    update(elapsedMs){
        this.oldPosition = Object.assign({}, this.position);

        if (this.moving) {
            const gridPosition = this.characterUtil.determineGridPosition(this.position, this.scaledTileSize);

            if (JSON.stringify(this.position) === JSON.stringify(this.characterUtil.snapToGrid(gridPosition, this.direction, this.scaledTileSize))) {
                this.position = this.handleSnappedMovement(elapsedMs);
            } else {
                this.position = this.handleUnsnappedMovement(gridPosition, elapsedMs);
            }

            this.position = this.characterUtil.handleWarp(this.position, this.scaledTileSize, this.mazeArray);

            this.msSinceLastSprite += elapsedMs;
        }
    }
}

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = Pacman;
}