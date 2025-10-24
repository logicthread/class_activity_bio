import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

class BowlingGame {
    constructor() {
        this.initThreeJS();
        this.setupGame();
        this.setupEventListeners();
        this.animate();
    }

    initThreeJS() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue background
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.getElementById('canvas-container').appendChild(this.renderer.domElement);

        // Enhanced lighting setup
        // Ambient light for base illumination
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);

        // Main directional light (like ceiling lights)
        const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
        mainLight.position.set(0, 10, 5);
        mainLight.castShadow = true;
        mainLight.shadow.camera.near = 0.5;
        mainLight.shadow.camera.far = 500;
        mainLight.shadow.mapSize.width = 2048;
        mainLight.shadow.mapSize.height = 2048;
        mainLight.shadow.bias = -0.001;
        this.scene.add(mainLight);

        // Spotlights for pin illumination
        const spotLight1 = new THREE.SpotLight(0xffffff, 1);
        spotLight1.position.set(0, 8, -3);
        spotLight1.angle = Math.PI / 4;
        spotLight1.penumbra = 0.3;
        spotLight1.decay = 1;
        spotLight1.distance = 20;
        spotLight1.target.position.set(0, 0, -7);
        this.scene.add(spotLight1);
        this.scene.add(spotLight1.target);

        // Fill lights for better pin visibility
        const fillLight1 = new THREE.DirectionalLight(0xffffff, 0.4);
        fillLight1.position.set(-5, 8, -7);
        this.scene.add(fillLight1);

        const fillLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
        fillLight2.position.set(5, 8, -7);
        this.scene.add(fillLight2);

        // Camera position adjusted for better pin visibility
        this.camera.position.set(0, 6, 10);
        this.camera.lookAt(0, 0, -7);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enablePan = false;
        this.controls.enableZoom = true;
        this.controls.minDistance = 8;
        this.controls.maxDistance = 15;
        this.controls.minPolarAngle = Math.PI / 6; // Limit how low the camera can go
        this.controls.maxPolarAngle = Math.PI / 2.5; // Limit how high the camera can go
        this.controls.target.set(0, 0, -7); // Set orbit target to pin area
    }

    setupGame() {
        this.createLane();
        this.createPins();
        this.createBall();
        this.gameState = {
            currentFrame: 1,
            currentBall: 1,
            scores: Array(10).fill().map(() => ({ first: null, second: null, third: null, total: 0 })),
            gameMode: 'singles',
            players: [],
            isThrowInProgress: false
        };
    }

    createLane() {
        // Lane
        const laneGeometry = new THREE.BoxGeometry(2, 0.1, 20);
        const laneTexture = new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/hardwood2_diffuse.jpg');
        laneTexture.wrapS = THREE.RepeatWrapping;
        laneTexture.wrapT = THREE.RepeatWrapping;
        laneTexture.repeat.set(2, 10);
        const laneMaterial = new THREE.MeshPhongMaterial({ 
            map: laneTexture,
            shininess: 60
        });
        this.lane = new THREE.Mesh(laneGeometry, laneMaterial);
        this.lane.receiveShadow = true;
        this.scene.add(this.lane);

        // Gutters
        const gutterShape = new THREE.Shape();
        gutterShape.moveTo(0, 0);
        gutterShape.absarc(0.15, 0.15, 0.15, Math.PI, 0, false);
        gutterShape.lineTo(0.3, 0);
        const gutterGeometry = new THREE.ExtrudeGeometry(gutterShape, {
            depth: 20,
            bevelEnabled: false
        });
        const gutterMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x444444,
            shininess: 30
        });
        
        this.leftGutter = new THREE.Mesh(gutterGeometry, gutterMaterial);
        this.leftGutter.position.set(-1.15, -0.15, -10);
        this.leftGutter.receiveShadow = true;
        this.scene.add(this.leftGutter);

        this.rightGutter = new THREE.Mesh(gutterGeometry, gutterMaterial);
        this.rightGutter.position.set(0.85, -0.15, -10);
        this.rightGutter.receiveShadow = true;
        this.scene.add(this.rightGutter);

        // Foul line
        const foulLineGeometry = new THREE.BoxGeometry(2, 0.01, 0.1);
        const foulLineMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff0000,
            emissive: 0xff0000,
            emissiveIntensity: 0.5
        });
        this.foulLine = new THREE.Mesh(foulLineGeometry, foulLineMaterial);
        this.foulLine.position.set(0, 0.06, 5);
        this.scene.add(this.foulLine);

        // Add lane borders
        const borderGeometry = new THREE.BoxGeometry(0.1, 0.2, 20);
        const borderMaterial = new THREE.MeshPhongMaterial({ color: 0x8b4513 });
        
        const leftBorder = new THREE.Mesh(borderGeometry, borderMaterial);
        leftBorder.position.set(-1.35, 0, 0);
        this.scene.add(leftBorder);

        const rightBorder = new THREE.Mesh(borderGeometry, borderMaterial);
        rightBorder.position.set(1.35, 0, 0);
        this.scene.add(rightBorder);
    }

    createPins() {
        this.pins = [];
        
        // Create a more visible pin geometry
        const pinBodyGeometry = new THREE.CylinderGeometry(0.08, 0.12, 0.4, 32);
        const pinNeckGeometry = new THREE.CylinderGeometry(0.06, 0.08, 0.08, 32);
        const pinHeadGeometry = new THREE.SphereGeometry(0.08, 32, 32);
        
        // Create a more distinctive material for the pins
        const pinMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFFFFF,
            shininess: 100,
            specular: 0x666666,
        });

        // Red stripe material
        const stripeMaterial = new THREE.MeshPhongMaterial({
            color: 0xFF0000,
            shininess: 100,
            specular: 0x666666,
        });

        // Pin positions in triangle formation (adjusted for better visibility)
        const positions = [
            [0, 0, -7],           // Pin 1 (front pin)
            [-0.3, 0, -7.4],      // Pin 2
            [0.3, 0, -7.4],       // Pin 3
            [-0.6, 0, -7.8],      // Pin 4
            [0, 0, -7.8],         // Pin 5
            [0.6, 0, -7.8],       // Pin 6
            [-0.9, 0, -8.2],      // Pin 7
            [-0.3, 0, -8.2],      // Pin 8
            [0.3, 0, -8.2],       // Pin 9
            [0.9, 0, -8.2]        // Pin 10
        ];

        positions.forEach((pos, index) => {
            // Create pin parts
            const pinBody = new THREE.Mesh(pinBodyGeometry, pinMaterial);
            const pinNeck = new THREE.Mesh(pinNeckGeometry, pinMaterial);
            const pinHead = new THREE.Mesh(pinHeadGeometry, pinMaterial);
            
            // Create red stripes
            const stripeGeometry = new THREE.CylinderGeometry(0.121, 0.121, 0.05, 32);
            const stripe1 = new THREE.Mesh(stripeGeometry, stripeMaterial);
            const stripe2 = new THREE.Mesh(stripeGeometry, stripeMaterial);
            
            // Position the parts
            pinNeck.position.y = 0.24;
            pinHead.position.y = 0.35;
            stripe1.position.y = 0.1;
            stripe2.position.y = -0.1;
            
            // Create pin group and add all parts
            const pinGroup = new THREE.Group();
            pinGroup.add(pinBody);
            pinGroup.add(pinNeck);
            pinGroup.add(pinHead);
            pinGroup.add(stripe1);
            pinGroup.add(stripe2);

            // Position the pin group
            pinGroup.position.set(pos[0], 0.2, pos[2]);
            
            // Add shadows
            pinGroup.traverse((object) => {
                if (object instanceof THREE.Mesh) {
                    object.castShadow = true;
                    object.receiveShadow = true;
                }
            });

            pinGroup.isStanding = true;
            pinGroup.pinNumber = index + 1;
            
            // Scale up the pins slightly
            pinGroup.scale.set(1.2, 1.2, 1.2);

            this.pins.push(pinGroup);
            this.scene.add(pinGroup);
        });
    }

    createBall() {
        const ballGeometry = new THREE.SphereGeometry(0.15, 32, 32);
        const ballMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x000000,
            shininess: 80,
            metalness: 0.5,
            roughness: 0.2
        });
        this.ball = new THREE.Mesh(ballGeometry, ballMaterial);
        this.ball.castShadow = true;
        this.ball.receiveShadow = true;
        this.resetBall();
        this.scene.add(this.ball);

        // Add finger holes (decorative)
        const holeGeometry = new THREE.SphereGeometry(0.03, 16, 16);
        const holeMaterial = new THREE.MeshPhongMaterial({ color: 0x202020 });
        
        const hole1 = new THREE.Mesh(holeGeometry, holeMaterial);
        hole1.position.set(0.06, 0.1, 0);
        this.ball.add(hole1);

        const hole2 = new THREE.Mesh(holeGeometry, holeMaterial);
        hole2.position.set(-0.06, 0.1, 0);
        this.ball.add(hole2);

        const hole3 = new THREE.Mesh(holeGeometry, holeMaterial);
        hole3.position.set(0, 0.1, 0.06);
        this.ball.add(hole3);
    }

    resetBall() {
        this.ball.position.set(0, 0.15, 5);
        this.ball.velocity = new THREE.Vector3(0, 0, 0);
    }

    setupEventListeners() {
        // Ball movement controls
        const leftBtn = document.getElementById('left-btn');
        const rightBtn = document.getElementById('right-btn');
        
        leftBtn.addEventListener('mousedown', () => this.startMovingBall('left'));
        rightBtn.addEventListener('mousedown', () => this.startMovingBall('right'));
        document.addEventListener('mouseup', () => this.stopMovingBall());
        
        // Throw button with power meter
        const throwBtn = document.getElementById('throw-btn');
        throwBtn.addEventListener('mousedown', () => this.startPowerMeter());
        throwBtn.addEventListener('mouseup', () => this.throwBall());

        // Game mode selection
        document.querySelectorAll('#mode-selection button').forEach(button => {
            button.addEventListener('click', (e) => this.setGameMode(e.target.dataset.mode));
        });

        // Window resize handler
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Prevent OrbitControls from interfering with UI
        this.renderer.domElement.addEventListener('mousedown', (e) => {
            if (e.target.closest('#game-ui')) {
                e.stopPropagation();
            }
        });
    }

    startMovingBall(direction) {
        this.movingDirection = direction;
        if (!this.moveInterval) {
            this.moveInterval = setInterval(() => this.adjustBallPosition(), 16);
        }
    }

    stopMovingBall() {
        if (this.moveInterval) {
            clearInterval(this.moveInterval);
            this.moveInterval = null;
        }
        this.movingDirection = null;
    }

    adjustBallPosition() {
        if (!this.movingDirection || this.gameState.isThrowInProgress) return;

        const moveAmount = this.movingDirection === 'left' ? -0.05 : 0.05;
        const newPosition = this.ball.position.x + moveAmount;

        if (Math.abs(newPosition) < 0.9) {
            this.ball.position.x = newPosition;
        }
    }

    startPowerMeter() {
        if (this.gameState.isThrowInProgress) return;

        const powerBar = document.getElementById('power-bar');
        let power = 0;
        let increasing = true;

        this.powerInterval = setInterval(() => {
            if (increasing) {
                power += 2;
                if (power >= 100) {
                    increasing = false;
                }
            } else {
                power -= 2;
                if (power <= 0) {
                    increasing = true;
                }
            }
            powerBar.style.width = power + '%';
            this.currentPower = power;
        }, 20);
    }

    throwBall() {
        if (this.gameState.isThrowInProgress) return;
        
        if (this.powerInterval) {
            clearInterval(this.powerInterval);
            this.powerInterval = null;
        }

        const power = Math.min((this.currentPower || 50) / 100, 1);
        document.getElementById('power-bar').style.width = '0%';
        
        this.gameState.isThrowInProgress = true;
        this.ball.velocity = new THREE.Vector3(0, 0, -0.3 * (0.5 + power));
        
        // Add some spin based on the ball's position
        const spin = this.ball.position.x * 0.1;
        this.ball.velocity.x = spin;
    }

    setGameMode(mode) {
        this.gameState.gameMode = mode;
        this.gameState.players = [];
        
        switch(mode) {
            case 'singles':
                this.gameState.players.push({ name: 'Player 1', scores: [] });
                break;
            case 'doubles':
                this.gameState.players.push(
                    { name: 'Athlete', scores: [] },
                    { name: 'Partner', scores: [] }
                );
                break;
            case 'team':
                this.gameState.players.push(
                    { name: 'Athlete 1', scores: [] },
                    { name: 'Athlete 2', scores: [] },
                    { name: 'Partner 1', scores: [] },
                    { name: 'Partner 2', scores: [] }
                );
                break;
        }
        this.updateUI();
    }

    adjustBallPosition(direction) {
        const moveAmount = direction === 'left' ? -0.1 : 0.1;
        if (Math.abs(this.ball.position.x + moveAmount) < 1) {
            this.ball.position.x += moveAmount;
        }
    }

    throwBall() {
        if (this.gameState.isThrowInProgress) return;
        
        this.gameState.isThrowInProgress = true;
        this.ball.velocity = new THREE.Vector3(0, 0, -0.3);
    }

    updateBall() {
        if (!this.gameState.isThrowInProgress) return;

        // Apply velocity
        this.ball.position.add(this.ball.velocity);
        
        // Add rolling rotation
        this.ball.rotation.x -= this.ball.velocity.z * 0.5;
        
        // Add friction
        this.ball.velocity.multiplyScalar(0.995);

        // Check for gutters
        if (Math.abs(this.ball.position.x) > 0.9) {
            this.ball.position.x = Math.sign(this.ball.position.x) * 0.9;
            if (Math.abs(this.ball.velocity.x) > 0.01) {
                this.ball.velocity.x *= -0.5;
            }
        }

        // Check for end of lane
        if (this.ball.position.z < -10) {
            this.handleEndOfThrow();
            return;
        }

        // Check pin collisions
        this.checkPinCollisions();

        // Check if ball has stopped
        if (Math.abs(this.ball.velocity.z) < 0.01) {
            this.handleEndOfThrow();
        }
    }

    checkPinCollisions() {
        this.pins.forEach(pin => {
            if (!pin.isStanding) return;

            const distance = this.ball.position.distanceTo(pin.position);
            if (distance < 0.25) {
                pin.isStanding = false;
                
                // Create falling animation
                const fallDirection = Math.random() * Math.PI * 2;
                const fallSpeed = 0.1;
                
                const animate = () => {
                    if (pin.rotation.z < Math.PI / 2) {
                        pin.rotation.z += fallSpeed;
                        pin.position.y = Math.cos(pin.rotation.z) * 0.15;
                        requestAnimationFrame(animate);
                    }
                };
                
                // Add some "kick" to the pin
                pin.position.x += Math.cos(fallDirection) * 0.2;
                pin.position.z += Math.sin(fallDirection) * 0.2;
                
                animate();

                // Affect ball velocity slightly
                this.ball.velocity.multiplyScalar(0.95);
            }
        });
    }

    handleGutterBall() {
        this.recordScore(0);
        this.resetThrow();
    }

    handleEndOfThrow() {
        const knockedPins = this.pins.filter(pin => !pin.isStanding).length;
        this.recordScore(knockedPins);
        
        // Add a small delay before resetting
        setTimeout(() => {
            this.resetThrow();
        }, 1500);
    }

    recordScore(pins) {
        const frame = this.gameState.scores[this.gameState.currentFrame - 1];
        
        if (this.gameState.currentBall === 1) {
            frame.first = pins;
            if (pins === 10) { // Strike
                frame.total = 10;
                this.advanceFrame();
            } else {
                this.gameState.currentBall = 2;
            }
        } else {
            frame.second = pins;
            frame.total = (frame.first || 0) + pins;
            this.advanceFrame();
        }

        this.updateUI();
    }

    advanceFrame() {
        if (this.gameState.currentFrame < 10) {
            this.gameState.currentFrame++;
            this.gameState.currentBall = 1;
        } else {
            this.endGame();
        }
    }

    resetThrow() {
        this.gameState.isThrowInProgress = false;
        this.resetBall();
        this.resetPins();
    }

    resetPins() {
        this.pins.forEach(pin => {
            pin.isStanding = true;
            pin.position.y = 0;
        });
    }

    updateUI() {
        document.getElementById('current-frame').textContent = this.gameState.currentFrame;
        document.getElementById('current-ball').textContent = this.gameState.currentBall;
        
        const totalScore = this.gameState.scores.reduce((sum, frame) => sum + frame.total, 0);
        document.getElementById('total-score').textContent = totalScore;

        // Update frames display
        const framesDisplay = document.getElementById('frames-display');
        framesDisplay.innerHTML = this.gameState.scores.map((frame, i) => `
            <div class="frame">
                <div>Frame ${i + 1}</div>
                <div>${frame.first ?? '-'}|${frame.second ?? '-'}</div>
                <div>Total: ${frame.total}</div>
            </div>
        `).join('');
    }

    endGame() {
        alert('Game Over! Final Score: ' + 
            this.gameState.scores.reduce((sum, frame) => sum + frame.total, 0));
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.updateBall();
        this.renderer.render(this.scene, this.camera);
    }
}

// Start the game
const game = new BowlingGame();