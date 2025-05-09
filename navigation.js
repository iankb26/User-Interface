// Navigation functionality for the sidebar
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const homeIcon = document.getElementById('homeIcon');
    const manualIcon = document.getElementById('manualIcon');
    const homePage = document.getElementById('homePage');
    const operatorPage = document.getElementById('operatorPage');
    const manualChangeButton = document.getElementById('manualChangeButton');
    const adjustAlignmentButton = document.getElementById('adjustAlignmentButton');

    // Add click event listeners to the sidebar icons
    homeIcon.addEventListener('click', function() {
        // Show home page, hide operator page
        homePage.classList.add('active');
        operatorPage.classList.remove('active');

        // Update active icon
        homeIcon.classList.add('active');
        manualIcon.classList.remove('active');

        // Log navigation
        console.log('Navigated to Home page');
    });

    manualIcon.addEventListener('click', function() {
        // Show operator page, hide home page
        operatorPage.classList.add('active');
        homePage.classList.remove('active');

        // Update active icon
        manualIcon.classList.add('active');
        homeIcon.classList.remove('active');

        // Log navigation
        console.log('Navigated to Operator Mode page');
    });

    // Add click event listener to the Manual Change Mode button
    if (manualChangeButton) {
        manualChangeButton.addEventListener('click', function() {
            // Activate manual change mode
            activateManualChangeMode();

            // Stay on the operator page (no auto-navigation)
            // User must manually click the home icon to return

            // Log action
            console.log('Manual Change Mode activated');
        });
    }

    // Add click event listener to the Adjust Alignment button
    if (adjustAlignmentButton) {
        adjustAlignmentButton.addEventListener('click', function() {
            // Activate alignment adjustment mode
            activateAlignmentMode();

            // Stay on the operator page (no auto-navigation)
            // User must manually click the home icon to return

            // Log action
            console.log('Alignment Adjustment Mode activated');
        });
    }

    // Initialize the navigation (home page is active by default)
    homeIcon.classList.add('active');
    manualIcon.classList.remove('active');
    homePage.classList.add('active');
    operatorPage.classList.remove('active');
});

// Function to activate Manual Change Mode
function activateManualChangeMode() {
    // This function will be called when the Manual Change Mode button is clicked
    // It will log a message to the console and set a flag in the battery-swap.js file

    // Check if there was an error and it was a charging error
    if (window.lastErrorType === "charging") {
        // Log to console that this is the correct recovery method
        if (typeof logToConsole === 'function') {
            logToConsole("OPERATOR ACTION: Manual Change Mode activated to resolve charging error");
            updateFeedback("Manual Change Mode activated. This will resolve the charging circuit error.");
        }
    } else {
        // Regular activation
        if (typeof logToConsole === 'function') {
            logToConsole("OPERATOR ACTION: Manual Change Mode activated");
            updateFeedback("Manual Change Mode activated. Battery swap and charge enabled.");
        }
    }

    // Clear any error state
    window.hasError = false;

    // Reset system status in System Information
    if (document.querySelector('#feedbackArea .value')) {
        document.querySelector('#feedbackArea .value').textContent = "Manual mode activated. Ready for swap.";
    }

    // Reset system status in System Information
    const feedbackValueElement = document.querySelector('#feedbackArea .value');
    if (feedbackValueElement) {
        feedbackValueElement.textContent = "Manual mode activated. Ready for swap.";
        feedbackValueElement.style.color = ""; // Reset color
    }

    // Set the manual mode flag in the battery-swap.js scope
    if (typeof setManualMode === 'function') {
        setManualMode(true);
    } else {
        console.error("setManualMode function not found. Make sure battery-swap.js is loaded first.");
    }
}

// Function to activate Alignment Adjustment Mode
function activateAlignmentMode() {
    // This function will be called when the Adjust Alignment button is clicked
    // It will log a message to the console and set a flag in the battery-swap.js file

    // Check if there was an error and it was an alignment error
    if (window.lastErrorType === "alignment") {
        // Log to console that this is the correct recovery method
        if (typeof logToConsole === 'function') {
            logToConsole("OPERATOR ACTION: Alignment Adjustment Mode activated to resolve alignment error");
            updateFeedback("Alignment Adjustment Mode activated. This will resolve the alignment mechanism error.");
        }
    } else {
        // Regular activation
        if (typeof logToConsole === 'function') {
            logToConsole("OPERATOR ACTION: Alignment Adjustment Mode activated");
            updateFeedback("Alignment Adjustment Mode activated. Calibration will run before next swap.");
        }
    }

    // Clear any error state
    window.hasError = false;

    // Reset system status in System Information
    if (document.querySelector('#feedbackArea .value')) {
        document.querySelector('#feedbackArea .value').textContent = "Alignment mode activated. Ready for calibration.";
    }

    // Reset system status in System Information
    const feedbackValueElement = document.querySelector('#feedbackArea .value');
    if (feedbackValueElement) {
        feedbackValueElement.textContent = "Alignment mode activated. Ready for calibration.";
        feedbackValueElement.style.color = ""; // Reset color
    }

    // Set the alignment mode flag in the battery-swap.js scope
    if (typeof setAlignmentMode === 'function') {
        setAlignmentMode(true);
    } else {
        console.error("setAlignmentMode function not found. Make sure battery-swap.js is loaded first.");
    }
}
