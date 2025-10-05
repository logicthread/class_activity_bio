// Stoplight Game JavaScript Implementation with Nash Equilibrium Demonstration
// This script handles all game logic, user interactions, and Nash Equilibrium analysis

// Game state variables to track current game status
let currentRound = 1; // Counter for the current round number
let player1Score = 0; // Cumulative score for Player 1 (Human)
let player2Score = 0; // Cumulative score for Player 2 (Computer)
let gameActive = true; // Boolean flag to control game state
let player1Choice = null; // Stores Player 1's current choice (Go/Stop)
let player2Choice = null; // Stores Player 2's current choice (Go/Stop)

// Payoff matrix defining the rewards/penalties for each combination of choices
// Format: [Player1Payoff, Player2Payoff]
const payoffMatrix = {
    // Both players choose Go - results in collision (worst outcome for both)
    "Go-Go": [-10, -10],
    // Player 1 goes, Player 2 stops - Player 1 gets through safely
    "Go-Stop": [5, 0],
    // Player 1 stops, Player 2 goes - Player 2 gets through safely
    "Stop-Go": [0, 5],
    // Both players stop - safe but inefficient (small positive payoff)
    "Stop-Stop": [1, 1]
};

// Array of possible choices for random computer selection
const choices = ["Go", "Stop"];

// DOM element references for efficient access throughout the script
const elements = {
    // Button elements for user interaction
    goBtn: document.getElementById('go-btn'),
    stopBtn: document.getElementById('stop-btn'),
    newRoundBtn: document.getElementById('new-round-btn'),
    
    // Display elements for game information
    roundNumber: document.getElementById('round-number'),
    p1Choice: document.getElementById('p1-choice'),
    p2Choice: document.getElementById('p2-choice'),
    p1Score: document.getElementById('p1-score'),
    p2Score: document.getElementById('p2-score'),
    resultText: document.getElementById('result-text'),
    payoffText: document.getElementById('payoff-text'),
    
    // Player visual elements for animations
    player1: document.getElementById('player1'),
    player2: document.getElementById('player2'),
    
    // Traffic light elements for visual feedback
    redLight: document.getElementById('red-light'),
    yellowLight: document.getElementById('yellow-light'),
    greenLight: document.getElementById('green-light')
};

// Function to generate random choice for computer player
function generateComputerChoice() {
    // Use Math.random() to select random index from choices array
    const randomIndex = Math.floor(Math.random() * choices.length);
    // Return the randomly selected choice
    return choices[randomIndex];
}

// Function to calculate payoffs based on both players' choices
function calculatePayoffs(p1Choice, p2Choice) {
    // Create key string to lookup payoffs in matrix
    const key = `${p1Choice}-${p2Choice}`;
    // Return the corresponding payoff values from the matrix
    return payoffMatrix[key];
}

// Function to update traffic light display based on game outcome
function updateTrafficLight(p1Choice, p2Choice) {
    // First, reset all lights to inactive state
    elements.redLight.classList.remove('active');
    elements.yellowLight.classList.remove('active');
    elements.greenLight.classList.remove('active');
    
    // Determine which light to activate based on the outcome
    if (p1Choice === "Go" && p2Choice === "Go") {
        // Both go - collision scenario - activate red light
        elements.redLight.classList.add('active');
    } else if (p1Choice === "Stop" && p2Choice === "Stop") {
        // Both stop - cautious scenario - activate yellow light
        elements.yellowLight.classList.add('active');
    } else {
        // One goes, one stops - optimal scenario - activate green light
        elements.greenLight.classList.add('active');
    }
}

// Function to animate player cars based on their choices
function animatePlayerChoices(p1Choice, p2Choice) {
    // Reset any existing animations by removing transform classes
    elements.player1.style.transform = '';
    elements.player2.style.transform = '';
    
    // Animate Player 1 based on their choice
    if (p1Choice === "Go") {
        // Move Player 1 forward (to the right) if they choose Go
        elements.player1.style.transform = 'translateX(100px)';
        // Add visual feedback with background color change
        elements.player1.style.background = 'rgba(46, 204, 113, 0.4)';
    } else {
        // Keep Player 1 in place if they choose Stop
        elements.player1.style.transform = 'translateX(0)';
        // Add visual feedback with background color change
        elements.player1.style.background = 'rgba(231, 76, 60, 0.4)';
    }
    
    // Animate Player 2 based on their choice
    if (p2Choice === "Go") {
        // Move Player 2 forward (upward) if they choose Go
        elements.player2.style.transform = 'translateY(-100px)';
        // Add visual feedback with background color change
        elements.player2.style.background = 'rgba(46, 204, 113, 0.4)';
    } else {
        // Keep Player 2 in place if they choose Stop
        elements.player2.style.transform = 'translateY(0)';
        // Add visual feedback with background color change
        elements.player2.style.background = 'rgba(231, 76, 60, 0.4)';
    }
}

// Function to analyze and display Nash Equilibrium information
function analyzeNashEquilibrium(p1Choice, p2Choice) {
    // Define the two pure Nash Equilibria for this game
    const nashEquilibria = [
        { p1: "Go", p2: "Stop", description: "Player 1 goes, Player 2 stops" },
        { p1: "Stop", p2: "Go", description: "Player 1 stops, Player 2 goes" }
    ];
    
    // Check if current choices match any Nash Equilibrium
    const isNashEquilibrium = nashEquilibria.some(eq => 
        eq.p1 === p1Choice && eq.p2 === p2Choice
    );
    
    // Return analysis result
    return {
        isNash: isNashEquilibrium,
        equilibria: nashEquilibria
    };
}

// Function to display detailed game results and analysis
function displayResults(p1Choice, p2Choice, payoffs) {
    // Calculate payoffs for both players
    const [p1Payoff, p2Payoff] = payoffs;
    
    // Analyze Nash Equilibrium status
    const nashAnalysis = analyzeNashEquilibrium(p1Choice, p2Choice);
    
    // Create result message based on the outcome
    let resultMessage = "";
    if (p1Choice === "Go" && p2Choice === "Go") {
        // Collision scenario - worst outcome
        resultMessage = "💥 COLLISION! Both players chose to go - this is the worst outcome for both.";
    } else if (p1Choice === "Stop" && p2Choice === "Stop") {
        // Both stop - safe but inefficient
        resultMessage = "⚠️ Both players stopped - safe but inefficient outcome.";
    } else if (p1Choice === "Go" && p2Choice === "Stop") {
        // Player 1 goes, Player 2 stops - Nash Equilibrium
        resultMessage = "✅ Player 1 goes through while Player 2 waits - Nash Equilibrium achieved!";
    } else {
        // Player 1 stops, Player 2 goes - Nash Equilibrium
        resultMessage = "✅ Player 2 goes through while Player 1 waits - Nash Equilibrium achieved!";
    }
    
    // Add Nash Equilibrium analysis to the message
    if (nashAnalysis.isNash) {
        resultMessage += " This is a Nash Equilibrium - neither player can improve by changing strategy.";
    } else {
        resultMessage += " This is NOT a Nash Equilibrium - players could benefit from changing strategies.";
    }
    
    // Update the result display elements
    elements.resultText.textContent = resultMessage;
    elements.payoffText.textContent = `Payoffs: Player 1 = ${p1Payoff}, Player 2 = ${p2Payoff}`;
}

// Function to update the cumulative scores display
function updateScores() {
    // Update Player 1 score display
    elements.p1Score.textContent = player1Score;
    // Update Player 2 score display
    elements.p2Score.textContent = player2Score;
}

// Function to update the current round display
function updateRoundDisplay() {
    // Update round number display
    elements.roundNumber.textContent = currentRound;
    // Update Player 1 choice display (or dash if no choice made)
    elements.p1Choice.textContent = player1Choice || '-';
    // Update Player 2 choice display (or dash if no choice made)
    elements.p2Choice.textContent = player2Choice || '-';
}

// Function to handle player choice and execute game round
function handlePlayerChoice(choice) {
    // Check if game is active and no choice has been made yet
    if (!gameActive || player1Choice !== null) {
        return; // Exit if game is inactive or choice already made
    }
    
    // Store Player 1's choice
    player1Choice = choice;
    
    // Generate random choice for Player 2 (Computer)
    player2Choice = generateComputerChoice();
    
    // Log choices to console for debugging
    console.log(`Round ${currentRound}: Player 1 chose ${player1Choice}, Player 2 chose ${player2Choice}`);
    
    // Calculate payoffs based on both choices
    const payoffs = calculatePayoffs(player1Choice, player2Choice);
    
    // Update cumulative scores
    player1Score += payoffs[0];
    player2Score += payoffs[1];
    
    // Update all display elements
    updateRoundDisplay();
    updateScores();
    displayResults(player1Choice, player2Choice, payoffs);
    
    // Update visual elements
    updateTrafficLight(player1Choice, player2Choice);
    animatePlayerChoices(player1Choice, player2Choice);
    
    // Disable action buttons to prevent multiple choices in same round
    elements.goBtn.disabled = true;
    elements.stopBtn.disabled = true;
    
    // Add visual feedback to disabled buttons
    elements.goBtn.style.opacity = '0.5';
    elements.stopBtn.style.opacity = '0.5';
}

// Function to start a new round and reset game state
function startNewRound() {
    // Increment round counter
    currentRound++;
    
    // Reset player choices for new round
    player1Choice = null;
    player2Choice = null;
    
    // Re-enable action buttons
    elements.goBtn.disabled = false;
    elements.stopBtn.disabled = false;
    
    // Reset button visual feedback
    elements.goBtn.style.opacity = '1';
    elements.stopBtn.style.opacity = '1';
    
    // Reset player animations and colors
    elements.player1.style.transform = '';
    elements.player2.style.transform = '';
    elements.player1.style.background = 'rgba(52, 152, 219, 0.2)';
    elements.player2.style.background = 'rgba(46, 204, 113, 0.2)';
    
    // Reset traffic light
    elements.redLight.classList.remove('active');
    elements.yellowLight.classList.remove('active');
    elements.greenLight.classList.remove('active');
    
    // Update display elements
    updateRoundDisplay();
    
    // Reset result text for new round
    elements.resultText.textContent = "Make your choice to continue the game!";
    elements.payoffText.textContent = "";
    
    // Log new round start to console
    console.log(`Starting Round ${currentRound}`);
}

// Function to initialize the game when page loads
function initializeGame() {
    // Log game initialization to console
    console.log("Initializing Stoplight Game with Nash Equilibrium demonstration");
    
    // Set up event listeners for user interactions
    
    // Event listener for Go button click
    elements.goBtn.addEventListener('click', function() {
        // Call handlePlayerChoice with "Go" parameter
        handlePlayerChoice("Go");
    });
    
    // Event listener for Stop button click
    elements.stopBtn.addEventListener('click', function() {
        // Call handlePlayerChoice with "Stop" parameter
        handlePlayerChoice("Stop");
    });
    
    // Event listener for New Round button click
    elements.newRoundBtn.addEventListener('click', function() {
        // Call startNewRound function
        startNewRound();
    });
    
    // Initialize display elements with starting values
    updateRoundDisplay();
    updateScores();
    
    // Display initial instructions
    elements.resultText.textContent = "Make your choice to start the game!";
    
    // Log successful initialization
    console.log("Game initialized successfully. Ready to play!");
    
    // Display game theory explanation in console
    console.log("Nash Equilibrium Analysis:");
    console.log("- (Go, Stop): Player 1 = 5, Player 2 = 0");
    console.log("- (Stop, Go): Player 1 = 0, Player 2 = 5");
    console.log("- (Go, Go): Player 1 = -10, Player 2 = -10 (Collision)");
    console.log("- (Stop, Stop): Player 1 = 1, Player 2 = 1 (Safe but inefficient)");
}

// Function to simulate multiple rounds for Nash Equilibrium demonstration
function simulateRandomRounds(numRounds) {
    // Log simulation start
    console.log(`Simulating ${numRounds} random rounds for Nash Equilibrium analysis...`);
    
    // Arrays to store simulation results
    let outcomes = [];
    let nashCount = 0;
    
    // Run simulation for specified number of rounds
    for (let i = 0; i < numRounds; i++) {
        // Generate random choices for both players
        const p1 = choices[Math.floor(Math.random() * choices.length)];
        const p2 = choices[Math.floor(Math.random() * choices.length)];
        
        // Calculate payoffs
        const payoffs = calculatePayoffs(p1, p2);
        
        // Check if it's a Nash Equilibrium
        const nashAnalysis = analyzeNashEquilibrium(p1, p2);
        if (nashAnalysis.isNash) {
            nashCount++;
        }
        
        // Store outcome
        outcomes.push({
            round: i + 1,
            p1Choice: p1,
            p2Choice: p2,
            payoffs: payoffs,
            isNash: nashAnalysis.isNash
        });
    }
    
    // Log simulation results
    console.log("Simulation Results:");
    console.log(`Nash Equilibria achieved: ${nashCount}/${numRounds} (${(nashCount/numRounds*100).toFixed(1)}%)`);
    console.log("Expected Nash Equilibrium probability with random choices: 50%");
    
    // Return simulation data
    return outcomes;
}

// Wait for DOM to be fully loaded before initializing the game
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the game once DOM is ready
    initializeGame();
    
    // Run a simulation for demonstration purposes
    // This helps illustrate Nash Equilibrium frequency with random choices
    simulateRandomRounds(100);
});

// Export functions for potential testing or external use
// (This would be useful if using modules or testing frameworks)
if (typeof module !== 'undefined' && module.exports) {
    // Export key functions for testing
    module.exports = {
        generateComputerChoice,
        calculatePayoffs,
        analyzeNashEquilibrium,
        simulateRandomRounds,
        payoffMatrix
    };
}