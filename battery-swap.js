// Global variables
let batteryPercentage = 35; // Start at 35% instead of 0%
let isCharging = false;
let swapInProgress = false;
let chargingInterval;
let depletionInterval;
let uptimeInterval;
let homingInterval;
let uptimeSeconds = 0;
let totalSwaps = 0;
let graphData = [];
let maxDataPoints = 40; // Number of data points to show on graph
let firstSwapCompleted = false; // Track if first swap has been completed
let isDepleting = false; // Track if battery is depleting
let isHoming = false; // Track if AGV is homing
let manualModeEnabled = false; // Track if manual mode is enabled
let alignmentModeEnabled = false; // Track if alignment mode is enabled

// Make hasError accessible from window object for cross-file access
window.hasError = false;
window.lastErrorType = null; // Store the type of error (alignment or charging)

// Battery types with voltage ranges
const batteryTypes = [
    { type: "18650 Li-ion 3S", voltage: "12.4V" }
];

// DOM elements
let startSwapButton;
let resetButton;
let emergencyStopButton;
let feedbackArea;
let batteryPercentageElement;
let batteryCircle;
let battery2PercentageElement;
let battery2Circle;
let batteryTypeElement;
let batteryVoltageElement;
let batteryStatusElement;
let batteryHealthElement;
let systemStatusElement;
let lastSwapElement;
let totalSwapsElement;
let uptimeElement;
let consoleElement;
let chargingGraphCanvas;
let ctx;

// Error simulation variables
let errorProbability = 0.15; // 15% chance of error during charging
let errorCheckInterval;
let hasError = false;

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');

    // Initialize the application
    initializeApp();
});

// Initialize the application
function initializeApp() {
    // Get DOM elements
    startSwapButton = document.getElementById('startSwapButton');
    resetButton = document.getElementById('resetButton');
    emergencyStopButton = document.getElementById('emergencyStopButton');
    feedbackArea = document.getElementById('feedbackArea').querySelector('.value');
    batteryPercentageElement = document.getElementById('batteryPercentage');
    batteryCircle = document.getElementById('batteryCircle');
    battery2PercentageElement = document.getElementById('battery2Percentage');
    battery2Circle = document.getElementById('battery2Circle');
    batteryTypeElement = document.getElementById('batteryType');
    batteryVoltageElement = document.getElementById('batteryVoltage');
    batteryStatusElement = document.getElementById('batteryStatus');
    batteryHealthElement = document.getElementById('batteryHealth');
    // systemStatusElement might not exist anymore since we removed it from the header
    systemStatusElement = document.getElementById('systemStatus') || { textContent: '', style: {} };
    lastSwapElement = document.getElementById('lastSwap');
    totalSwapsElement = document.getElementById('totalSwaps');
    uptimeElement = document.getElementById('uptime');
    consoleElement = document.getElementById('console');
    chargingGraphCanvas = document.getElementById('chargingGraph');

    // Check if all elements were found
    if (!chargingGraphCanvas) {
        console.error('Could not find charging graph canvas');
        return;
    }

    ctx = chargingGraphCanvas.getContext('2d');

    // Initialize the UI
    initializeUI();

    // Add event listeners
    if (startSwapButton) {
        startSwapButton.addEventListener('click', startBatterySwap);
        console.log('Added click listener to start button');
    }

    if (resetButton) {
        resetButton.addEventListener('click', resetSystem);
        console.log('Added click listener to reset button');
    }

    if (emergencyStopButton) {
        emergencyStopButton.addEventListener('click', handleEmergencyStop);
        console.log('Added click listener to emergency stop button');
    }

    // Log initialization
    logToConsole("System initialized and ready");
}

// Initialize the UI elements
function initializeUI() {
    // Set initial battery circle properties - Battery 1 starts at 35%
    batteryPercentage = 35;
    updateBatteryCircle(batteryPercentage);

    // Battery 2 is already at 100%
    // No need to update it as it's set in HTML with the battery-full class

    // Set initial battery info
    batteryTypeElement.textContent = "18650 Li-ion 3S";
    batteryVoltageElement.textContent = "12.4V";
    batteryStatusElement.textContent = "Not Connected";
    batteryStatusElement.style.color = "var(--warning-color)"; // Yellow for not connected
    batteryHealthElement.textContent = "Good";

    // Set up the canvas
    setupCanvas();

    // Add initial battery data to graph
    graphData = Array(maxDataPoints).fill(batteryPercentage);
    drawGraph();

    // Start uptime counter
    startUptimeCounter();

    // Add window resize listener for responsive graph
    window.addEventListener('resize', function() {
        setupCanvas();
        drawGraph();
    });
}

// Set up the canvas for the graph
function setupCanvas() {
    // Set canvas dimensions based on its container
    const container = chargingGraphCanvas.parentElement;
    chargingGraphCanvas.width = container.clientWidth;
    chargingGraphCanvas.height = container.clientHeight;

    // Initialize empty graph data
    graphData = [];
    for (let i = 0; i < maxDataPoints; i++) {
        graphData.push(0);
    }

    // Draw initial empty graph
    drawGraph();
}

// Function to set manual mode
function setManualMode(enabled) {
    manualModeEnabled = enabled;
    if (enabled) {
        logToConsole("Manual Change Mode enabled by operator");
    } else {
        logToConsole("Manual Change Mode disabled");
    }
}

// Function to set alignment mode
function setAlignmentMode(enabled) {
    alignmentModeEnabled = enabled;
    if (enabled) {
        logToConsole("Alignment Adjustment Mode enabled by operator");
    } else {
        logToConsole("Alignment Adjustment Mode disabled");
    }
}

// Start the battery swap process
function startBatterySwap() {
    console.log('startBatterySwap function called');
    if (swapInProgress) return;

    swapInProgress = true;
    systemStatusElement.textContent = "Active";
    startSwapButton.disabled = true;
    emergencyStopButton.disabled = false;

    // Log the action
    logToConsole("Battery swap initiated");

    // If alignment mode is enabled, perform alignment calibration before swap
    if (alignmentModeEnabled) {
        // Stop battery depletion during the alignment process
        stopBatteryDepletion();

        // Step 1: Communicating with central computer
        updateFeedback("Communicating with central computer...");

        setTimeout(function() {
            // Step 2: Detecting alignment mechanism
            updateFeedback("Detecting alignment mechanism...");
            logToConsole("Detecting alignment mechanism parameters");

            setTimeout(function() {
                // Step 3: Alignment mechanism detected
                logToConsole("Alignment mechanism detected, starting calibration");
                updateFeedback("Alignment mechanism detected, starting calibration...");

                setTimeout(function() {
                    // Step 4: Perform the alignment calibration
                    updateFeedback("Mechanism calibrating in progress...");
                    logToConsole("Calibrating battery alignment mechanism");

                    // Show calibration progress
                    let calibrationProgress = 0;
                    let calibrationInterval = setInterval(function() {
                        calibrationProgress += 20;
                        updateFeedback(`Mechanism calibrating: ${calibrationProgress}% complete...`);

                        if (calibrationProgress >= 100) {
                            clearInterval(calibrationInterval);

                            // Calibration complete
                            logToConsole("Alignment calibration completed successfully");
                            updateFeedback("Alignment calibration successful! Proceeding with battery swap...");

                            // Reset alignment mode after successful calibration
                            alignmentModeEnabled = false;

                            // Proceed with battery swap that always succeeds
                            setTimeout(function() {
                                // Get current battery levels before the swap
                                const currentAGVPercentage = batteryPercentage;
                                const currentBMHPercentage = parseInt(document.getElementById('battery2Percentage').textContent);

                                // Perform the battery swap
                                logToConsole("Swapping batteries between AGV and BMH after successful calibration");
                                updateFeedback("Battery swap in progress...");

                                // Swap the battery levels
                                batteryPercentage = currentBMHPercentage; // AGV gets BMH's level (100%)
                                updateBatteryCircle(batteryPercentage);

                                // BMH gets AGV's depleted level
                                updateBattery2Circle(currentAGVPercentage);

                                // Log the successful swap
                                logToConsole("Battery swap completed successfully");
                                updateFeedback("Battery swap successful! Charging depleted battery...");

                                // Start depleting Battery 1 (AGV) immediately after swap
                                firstSwapCompleted = true;
                                logToConsole("AGV is now operational. Battery will deplete during charging process.");
                                batteryStatusElement.textContent = "In Use";
                                batteryStatusElement.style.color = "var(--primary-color)"; // Orange for in use
                                startBatteryDepletion();

                                // Start charging Battery 2 (BMH) from depleted level to 100%
                                let bmhChargingInterval;
                                let currentPercentage = currentAGVPercentage;
                                const chargingStep = 2; // Increase by 2% each step
                                const totalSteps = Math.ceil((100 - currentAGVPercentage) / chargingStep);
                                const intervalTime = 5000 / totalSteps; // 5 seconds total divided by steps

                                bmhChargingInterval = setInterval(function() {
                                    currentPercentage += chargingStep;
                                    if (currentPercentage >= 100) {
                                        currentPercentage = 100;
                                        clearInterval(bmhChargingInterval);

                                        // Charging complete
                                        logToConsole("BMH battery fully charged");
                                        updateFeedback("All batteries fully charged");

                                        // Complete the swap process
                                        swapInProgress = false;

                                        // Update swap statistics
                                        totalSwaps++;
                                        totalSwapsElement.textContent = totalSwaps;
                                        lastSwapElement.textContent = getCurrentTime();

                                        // Enable start button
                                        startSwapButton.disabled = false;
                                    }

                                    // Update Battery 2 (BMH) circle
                                    updateBattery2Circle(currentPercentage);

                                }, intervalTime);
                            }, 1000);
                        }
                    }, 1000); // Update every second

                }, 1000);

            }, 1000);

        }, 1000);
    }
    // If manual mode is enabled, perform a swap of battery levels and charge to 100%
    else if (manualModeEnabled) {
        // Stop battery depletion during the swap attempt
        stopBatteryDepletion();

        // Step 1: Communicating with central computer
        updateFeedback("Communicating with central computer...");

        setTimeout(function() {
            // Step 2: Detecting battery
            updateFeedback("Detecting battery...");
            logToConsole("Detecting battery type and parameters in manual mode");

            setTimeout(function() {
                // Step 3: Battery detected
                logToConsole(`Battery detected: 18650 Li-ion 3S (12.4V) at ${batteryPercentage}%`);
                updateFeedback("Battery detected, preparing for manual swap...");

                setTimeout(function() {
                    // Step 4: Perform the battery swap with manual override
                    updateFeedback("Manual battery swap in progress...");
                    logToConsole("Manual override: Swapping batteries between AGV and BMH");

                    // Get current battery levels
                    const currentAGVPercentage = batteryPercentage;
                    const currentBMHPercentage = parseInt(document.getElementById('battery2Percentage').textContent);

                    // Swap the battery levels
                    batteryPercentage = currentBMHPercentage; // AGV gets BMH's level (100%)
                    updateBatteryCircle(batteryPercentage);

                    // BMH gets AGV's depleted level
                    let bmhCurrentPercentage = currentAGVPercentage;
                    updateBattery2Circle(bmhCurrentPercentage);

                    // Log the battery swap
                    logToConsole(`Manual swap: AGV battery now at ${batteryPercentage}%, BMH battery now at ${bmhCurrentPercentage}%`);
                    updateFeedback("Battery levels swapped. Charging BMH battery to 100%...");

                    // Start depleting Battery 1 (AGV) immediately after swap
                    firstSwapCompleted = true;
                    logToConsole("AGV is now operational. Battery will deplete during charging process.");
                    batteryStatusElement.textContent = "In Use";
                    batteryStatusElement.style.color = "var(--primary-color)"; // Orange for in use
                    startBatteryDepletion();

                    // Start charging Battery 2 (BMH) from depleted level to 100%
                    let bmhChargingInterval;
                    let targetPercentage = 100;
                    let chargingStep = 2; // Increase by 2% each step
                    let totalSteps = Math.ceil((targetPercentage - bmhCurrentPercentage) / chargingStep);
                    let intervalTime = 3000 / totalSteps; // 3 seconds total divided by steps

                    bmhChargingInterval = setInterval(function() {
                        bmhCurrentPercentage += chargingStep;
                        if (bmhCurrentPercentage >= targetPercentage) {
                            bmhCurrentPercentage = targetPercentage;
                            clearInterval(bmhChargingInterval);

                            // Charging complete
                            logToConsole("Manual battery swap and charging completed successfully");
                            updateFeedback("Manual swap successful! BMH battery charged to 100%.");

                            // Reset manual mode after successful swap
                            manualModeEnabled = false;

                            // Complete the swap process
                            swapInProgress = false;
                            hasError = false;

                            // Update swap statistics
                            totalSwaps++;
                            totalSwapsElement.textContent = totalSwaps;
                            lastSwapElement.textContent = getCurrentTime();

                            // Enable start button
                            startSwapButton.disabled = false;

                            // Disable emergency stop button
                            emergencyStopButton.disabled = true;
                            emergencyStopButton.classList.remove("active");
                        }

                        // Update Battery 2 (BMH) circle
                        updateBattery2Circle(bmhCurrentPercentage);

                        // Update graph data for BMH charging
                        graphData.push(batteryPercentage); // Keep AGV battery level in graph
                        if (graphData.length > maxDataPoints) {
                            graphData.shift(); // Remove oldest data point
                        }

                        // Redraw the graph
                        drawGraph();

                    }, intervalTime);

                }, 1000); // Faster swap in manual mode

            }, 1000); // Faster detection in manual mode

        }, 1000);
    }
    // If this is the second swap attempt and manual mode is not enabled, it will fail with an error
    else if (firstSwapCompleted) {
        // Stop battery depletion during the swap attempt
        stopBatteryDepletion();

        // Step 1: Communicating with central computer
        updateFeedback("Communicating with central computer...");

        setTimeout(function() {
            // Step 2: Detecting battery
            updateFeedback("Detecting battery...");
            logToConsole("Detecting battery type and parameters");

            setTimeout(function() {
                // Step 3: Battery detected
                logToConsole(`Battery detected: 18650 Li-ion 3S (12.4V) at ${batteryPercentage}%`);
                updateFeedback("Battery detected, preparing for swap...");

                setTimeout(function() {
                    // Step 4: Attempt the battery swap but encounter an error BEFORE the swap happens
                    updateFeedback("Battery swap in progress...");
                    logToConsole("Attempting to swap batteries between AGV and BMH");

                    // Choose one of two errors that will occur
                    const errorType = Math.random() < 0.5 ? "alignment" : "charging";

                    // Simulate a brief delay before error occurs
                    setTimeout(function() {
                        // Error occurs before the swap can happen
                        if (errorType === "alignment") {
                            // Alignment error
                            logToConsole("ERROR: Battery alignment mechanism failure detected");
                            updateFeedback("ERROR: Battery alignment mechanism failure. Swap aborted.");
                            batteryStatusElement.textContent = "Alignment Error";
                            batteryStatusElement.style.color = "var(--danger-color)"; // Red for error
                            batteryHealthElement.textContent = "Check Required";
                            batteryHealthElement.style.color = "var(--danger-color)";

                            // Update system status in System Information
                            const feedbackValueElement = document.querySelector('#feedbackArea .value');
                            if (feedbackValueElement) {
                                feedbackValueElement.textContent = "ERROR: Alignment mechanism failure";
                                feedbackValueElement.style.color = "var(--danger-color)"; // Red for error
                            }
                        } else {
                            // Charging error
                            logToConsole("ERROR: Electric charging circuit failure detected");
                            updateFeedback("ERROR: Electric charging circuit failure. Swap aborted.");
                            batteryStatusElement.textContent = "Charging Error";
                            batteryStatusElement.style.color = "var(--danger-color)"; // Red for error
                            batteryHealthElement.textContent = "Check Required";
                            batteryHealthElement.style.color = "var(--danger-color)";

                            // Update system status in System Information
                            const feedbackValueElement = document.querySelector('#feedbackArea .value');
                            if (feedbackValueElement) {
                                feedbackValueElement.textContent = "ERROR: Electric charging circuit failure";
                                feedbackValueElement.style.color = "var(--danger-color)"; // Red for error
                            }
                        }

                        // Enable emergency stop button for error recovery
                        emergencyStopButton.disabled = false;
                        emergencyStopButton.classList.add("active");

                        // Set error state
                        window.hasError = true;

                        // Disable start button
                        startSwapButton.disabled = true;

                        // Battery 1 continues to deplete
                        logToConsole("AGV continues to operate with current battery");

                        // Store the error type for recovery
                        window.lastErrorType = errorType;

                        // Resume battery depletion if it was stopped
                        if (!isDepleting && batteryPercentage > 5) {
                            startBatteryDepletion();
                        }
                    }, 2000); // Show error after 2 seconds

                }, 2000);

            }, 2000);

        }, 1000);
    } else {
        // First swap - will succeed
        performFirstBatterySwap();
    }
}

// Function to perform the first battery swap (always succeeds)
function performFirstBatterySwap() {
    // Step 1: Communicating with central computer
    updateFeedback("Communicating with central computer...");

    setTimeout(function() {
        // Step 2: Detecting battery
        updateFeedback("Detecting battery...");
        logToConsole("Detecting battery type and parameters");

        setTimeout(function() {
            // Step 3: Battery detected
            logToConsole(`Battery detected: 18650 Li-ion 3S (12.4V) at ${batteryPercentage}%`);
            updateFeedback("Battery detected, preparing for swap...");

            setTimeout(function() {
                // Step 4: Perform the battery swap
                updateFeedback("Battery swap in progress...");
                logToConsole("Swapping batteries between AGV and BMH");

                // Swap the batteries - AGV gets 100%, BMH gets 30%
                // Update Battery 1 (AGV) to 100%
                batteryPercentage = 100;
                updateBatteryCircle(batteryPercentage);

                // Update Battery 2 (BMH) to 30%
                const battery2Percentage = 30;
                updateBattery2Circle(battery2Percentage);

                // Update status
                batteryStatusElement.textContent = "Fully Charged";
                batteryStatusElement.style.color = "var(--success-color)"; // Green for fully charged

                // Log the successful swap
                setTimeout(function() {
                    logToConsole("Battery swap completed successfully");
                    updateFeedback("Battery swap successful! Charging depleted battery...");

                    // Start depleting Battery 1 (AGV) immediately after swap
                    // Set firstSwapCompleted to true to enable faster depletion
                    firstSwapCompleted = true;
                    logToConsole("AGV is now operational. Battery will deplete during charging process.");
                    batteryStatusElement.textContent = "In Use";
                    batteryStatusElement.style.color = "var(--primary-color)"; // Orange for in use
                    startBatteryDepletion();

                    // Start charging Battery 2 (BMH) from 30% to 100% in 5 seconds
                    let bmhChargingInterval;
                    let currentPercentage = 30;
                    const chargingStep = 2; // Increase by 2% each step
                    const totalSteps = 35; // 35 steps * 2% = 70% increase (from 30% to 100%)
                    const intervalTime = 5000 / totalSteps; // 5 seconds total divided by steps

                    bmhChargingInterval = setInterval(function() {
                        currentPercentage += chargingStep;
                        if (currentPercentage >= 100) {
                            currentPercentage = 100;
                            clearInterval(bmhChargingInterval);

                            // Charging complete
                            logToConsole("BMH battery fully charged");
                            updateFeedback("All batteries fully charged");

                            // Complete the swap process but don't start depletion again
                            // since it's already running
                            swapInProgress = false;

                            // Update swap statistics
                            totalSwaps++;
                            totalSwapsElement.textContent = totalSwaps;
                            lastSwapElement.textContent = getCurrentTime();
                        }

                        // Update Battery 2 (BMH) circle
                        updateBattery2Circle(currentPercentage);

                    }, intervalTime);

                }, 1000);

            }, 2000);

        }, 2000);

    }, 1000);
}

// Start the charging process
function startCharging() {
    // Clear any existing interval
    if (chargingInterval) {
        clearInterval(chargingInterval);
    }

    // Reset error state
    hasError = false;

    // Enable emergency stop button
    emergencyStopButton.disabled = false;

    // Set up charging interval (increase by 2% every 1 second for faster demo)
    chargingInterval = setInterval(function() {
        if (batteryPercentage < 100 && isCharging) {
            batteryPercentage += 2;
            if (batteryPercentage > 100) batteryPercentage = 100; // Cap at 100%
            updateBatteryCircle(batteryPercentage);

            // Update graph data
            graphData.push(batteryPercentage);
            if (graphData.length > maxDataPoints) {
                graphData.shift(); // Remove oldest data point
            }

            // Redraw the graph
            drawGraph();

            // Log every 10%
            if (batteryPercentage % 10 === 0) {
                logToConsole(`Battery charge at ${batteryPercentage}%`);
            }

            // If battery is full, stop charging
            if (batteryPercentage >= 100) {
                stopCharging();
                logToConsole("Battery fully charged");
                updateFeedback("Battery fully charged");
                batteryStatusElement.textContent = "Fully Charged";
                batteryStatusElement.style.color = "var(--success-color)"; // Green for fully charged
                emergencyStopButton.disabled = true;
            }
        }
    }, 1000); // Changed from 3000 to 1000 for faster charging

    // Start error checking
    startErrorChecking();
}

// Start error checking during charging
function startErrorChecking() {
    // Clear any existing error check interval
    if (errorCheckInterval) {
        clearInterval(errorCheckInterval);
    }

    // Set up error check interval (check every 5 seconds)
    errorCheckInterval = setInterval(function() {
        // Only check for errors if we're charging and don't already have an error
        if (isCharging && !hasError) {
            // Random chance of error based on errorProbability
            if (Math.random() < errorProbability) {
                // Trigger a charging error
                triggerChargingError();
            }
        }
    }, 5000);
}

// Trigger a charging error
function triggerChargingError() {
    hasError = true;

    // Update UI to show error
    batteryStatusElement.textContent = "ERROR";
    batteryHealthElement.textContent = "Warning";
    batteryHealthElement.style.color = "var(--danger-color)";
    systemStatusElement.textContent = "ERROR";
    systemStatusElement.style.color = "var(--danger-color)";

    // Make the emergency stop button pulse
    emergencyStopButton.classList.add("active");

    // Log the error
    logToConsole("ERROR: Battery charging fault detected!");
    updateFeedback("ERROR: Battery charging fault detected!");

    // Play alert sound (if available)
    try {
        const audio = new Audio('data:audio/wav;base64,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');
        audio.play();
    } catch (e) {
        console.error("Could not play alert sound", e);
    }
}

// Handle emergency stop button click
function handleEmergencyStop() {
    if (!hasError && !isCharging && !swapInProgress) {
        // If there's no error, we're not charging, and no swap in progress, do nothing
        return;
    }

    // Stop charging of Battery 2 (BMH)
    stopCharging();

    // Stop swap in progress but DO NOT stop battery depletion
    swapInProgress = false;

    // Stop error checking
    if (errorCheckInterval) {
        clearInterval(errorCheckInterval);
        errorCheckInterval = null;
    }

    // Update UI
    emergencyStopButton.classList.remove("active");
    emergencyStopButton.disabled = true;
    systemStatusElement.textContent = "Emergency Stop";
    systemStatusElement.style.color = "var(--warning-color)";

    // Log the emergency stop
    logToConsole("EMERGENCY STOP activated by operator");
    updateFeedback("Emergency stop activated. Charging halted but AGV continues to operate.");

    // Reset battery health display if not in error state
    if (!window.hasError) {
        batteryHealthElement.style.color = "";
    }

    // Enable start button immediately to allow for recovery
    startSwapButton.disabled = false;

    // Clear error state to allow for recovery
    window.hasError = false;

    // If battery is not already depleting and we're after first swap, start depletion
    if (!isDepleting && firstSwapCompleted && batteryPercentage > 5) {
        batteryStatusElement.textContent = "In Use";
        batteryStatusElement.style.color = "var(--primary-color)"; // Orange for in use
        batteryHealthElement.textContent = "Good";
        batteryHealthElement.style.color = "";
        startBatteryDepletion();
    }

    // Log that AGV continues to operate
    logToConsole("AGV continues to operate with current battery despite emergency stop");

    // Update system status after a short delay
    setTimeout(function() {
        systemStatusElement.textContent = "Standby";
        systemStatusElement.style.color = "";
        updateFeedback("System ready for next operation. AGV battery continues to deplete.");
    }, 3000);
}

// Stop the charging process
function stopCharging() {
    isCharging = false;

    // Clear charging interval
    if (chargingInterval) {
        clearInterval(chargingInterval);
        chargingInterval = null;
    }

    // Clear error checking interval
    if (errorCheckInterval) {
        clearInterval(errorCheckInterval);
        errorCheckInterval = null;
    }
}

// Finish the battery swap process
function finishBatterySwap() {
    // This function is now only used for manual mode swaps
    // For the first swap, depletion starts during the charging process

    stopCharging();
    swapInProgress = false;
    hasError = false;

    // Update UI
    updateFeedback("Battery swap and charging complete!");
    systemStatusElement.textContent = "Standby";
    systemStatusElement.style.color = "";
    startSwapButton.disabled = false;

    // Disable emergency stop button
    emergencyStopButton.disabled = true;
    emergencyStopButton.classList.remove("active");

    // Update swap statistics if not already updated
    if (!firstSwapCompleted) {
        totalSwaps++;
        totalSwapsElement.textContent = totalSwaps;
        lastSwapElement.textContent = getCurrentTime();
    }

    // Log completion
    logToConsole("Battery swap and charging process completed successfully");

    // Only start battery depletion for manual mode swaps
    // For the first swap, depletion is already started during charging
    if (manualModeEnabled) {
        // Reset manual mode
        manualModeEnabled = false;

        // Set firstSwapCompleted to true if this is the first swap
        if (!firstSwapCompleted) {
            firstSwapCompleted = true;
        }

        logToConsole("AGV is now operational. Battery will deplete during use.");
        // Start depletion immediately
        startBatteryDepletion();
    }
}

// Start battery depletion process
function startBatteryDepletion() {
    if (isDepleting) return;

    isDepleting = true;
    batteryStatusElement.textContent = "In Use";
    batteryStatusElement.style.color = "var(--primary-color)"; // Orange for in use

    // Log the start of depletion
    logToConsole("AGV battery is now being used and will deplete over time");
    updateFeedback("AGV is operational. Battery depleting during use.");

    // Determine depletion speed based on whether first swap has been completed
    // After first swap, depletion is twice as fast (1% every 1 second instead of every 2 seconds)
    const depletionSpeed = firstSwapCompleted ? 1000 : 2000; // 1 second after first swap, 2 seconds before

    if (firstSwapCompleted) {
        logToConsole("AGV operating at higher power. Battery depleting faster.");
    }

    // Set up depletion interval
    depletionInterval = setInterval(function() {
        if (batteryPercentage > 5) {
            batteryPercentage -= 1;

            // Update the battery circle display
            updateBatteryCircle(batteryPercentage);

            // Also update the battery percentage text display
            batteryPercentageElement.textContent = batteryPercentage + "%";

            // Update graph data
            graphData.push(batteryPercentage);
            if (graphData.length > maxDataPoints) {
                graphData.shift(); // Remove oldest data point
            }

            // Redraw the graph
            drawGraph();

            // Log every 10% decrease
            if (batteryPercentage % 10 === 0) {
                logToConsole(`AGV battery depleted to ${batteryPercentage}%`);
            }

            // If battery is low, show warning
            if (batteryPercentage === 20) {
                logToConsole("WARNING: AGV battery level low (20%)");
                updateFeedback("WARNING: Battery level low. Consider swapping soon.");
            }
        } else {
            // Stop depletion at 5% to prevent complete discharge
            stopBatteryDepletion();
            logToConsole("CRITICAL: AGV battery at minimum safe level (5%)");
            updateFeedback("CRITICAL: Battery at minimum safe level. Swap required.");
            batteryStatusElement.textContent = "Critical";
            batteryStatusElement.style.color = "var(--danger-color)"; // Red for critical

            // Ensure the battery percentage is displayed correctly
            batteryPercentage = 5;
            batteryPercentageElement.textContent = "5%";
            updateBatteryCircle(5);
        }
    }, depletionSpeed); // Deplete 1% at variable speed based on swap status
}

// Stop battery depletion
function stopBatteryDepletion() {
    if (depletionInterval) {
        clearInterval(depletionInterval);
        depletionInterval = null;
    }
    isDepleting = false;
}

// Start AGV Homing process
function startAGVHoming() {
    // Only prevent homing if a swap is in progress, allow homing even if already depleting
    if (swapInProgress) return;

    // If already homing, just return
    if (isHoming) return;

    isHoming = true;

    // Log the action
    logToConsole("AGV homing process initiated");
    updateFeedback("AGV homing process initiated. Returning to BMH...");

    // Stop any ongoing depletion
    stopBatteryDepletion();

    // Set up homing interval (decrease by 1% every 1 second for a quick simulation)
    let targetPercentage = 30; // Target is 30%
    homingInterval = setInterval(function() {
        if (batteryPercentage > targetPercentage) {
            batteryPercentage -= 1;
            updateBatteryCircle(batteryPercentage);

            // Update graph data
            graphData.push(batteryPercentage);
            if (graphData.length > maxDataPoints) {
                graphData.shift(); // Remove oldest data point
            }

            // Redraw the graph
            drawGraph();
        } else {
            // Stop homing when target is reached
            clearInterval(homingInterval);
            isHoming = false;

            // Log completion
            logToConsole("AGV homing completed. AGV docked at BMH.");
            updateFeedback("AGV successfully docked at Battery Management Hub.");

            // Update status
            batteryStatusElement.textContent = "Docked";
            batteryStatusElement.style.color = "var(--warning-color)"; // Yellow for docked

            // Enable the Start Battery Swap button when docked
            startSwapButton.disabled = false;
        }
    }, 1000); // Deplete 1% every 1 second for quick simulation
}

// Reset the system
function resetSystem() {
    // Stop any ongoing processes
    stopCharging();
    stopBatteryDepletion();
    if (homingInterval) {
        clearInterval(homingInterval);
    }
    swapInProgress = false;
    isHoming = false;
    hasError = false;
    firstSwapCompleted = false;
    manualModeEnabled = false; // Reset manual mode
    alignmentModeEnabled = false; // Reset alignment mode

    // Reset UI elements for Battery 1 (AGV)
    batteryPercentage = 30;
    updateBatteryCircle(batteryPercentage);

    // Reset Battery 2 (BMH) to 100%
    updateBattery2Circle(100);

    // Reset battery info
    batteryTypeElement.textContent = "18650 Li-ion 3S";
    batteryVoltageElement.textContent = "12.4V";
    batteryStatusElement.textContent = "Not Connected";
    batteryStatusElement.style.color = "var(--warning-color)"; // Yellow for not connected
    batteryHealthElement.textContent = "Good";
    batteryHealthElement.style.color = "";
    systemStatusElement.textContent = "Standby";
    systemStatusElement.style.color = "";
    updateFeedback("System reset, awaiting action...");
    startSwapButton.disabled = false;

    // Reset emergency stop button
    emergencyStopButton.disabled = true;
    emergencyStopButton.classList.remove("active");

    // Reset graph
    graphData = Array(maxDataPoints).fill(batteryPercentage);
    drawGraph();

    // Log reset
    logToConsole("System reset");
}

// Update the battery circle visualization
function updateBatteryCircle(percentage) {
    // Update text
    batteryPercentageElement.textContent = `${percentage}%`;

    // Update circle
    const circumference = 2 * Math.PI * 80; // r=80
    const offset = circumference - (percentage / 100) * circumference;
    batteryCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    batteryCircle.style.strokeDashoffset = offset;

    // Update color based on percentage - changed to match requirements
    if (percentage < 50) {
        batteryCircle.style.stroke = 'var(--danger-color)';
    } else if (percentage < 80) {
        batteryCircle.style.stroke = 'var(--warning-color)';
    } else {
        batteryCircle.style.stroke = 'var(--success-color)';
    }
}

// Update the second battery circle visualization
function updateBattery2Circle(percentage) {
    // Update text
    battery2PercentageElement.textContent = `${percentage}%`;

    // Update circle
    const circumference = 2 * Math.PI * 80; // r=80
    const offset = circumference - (percentage / 100) * circumference;
    battery2Circle.style.strokeDasharray = `${circumference} ${circumference}`;
    battery2Circle.style.strokeDashoffset = offset;

    // Update color based on percentage
    if (percentage < 50) {
        battery2Circle.style.stroke = 'var(--danger-color)';
        battery2Circle.classList.remove('battery-full');
    } else if (percentage < 80) {
        battery2Circle.style.stroke = 'var(--warning-color)';
        battery2Circle.classList.remove('battery-full');
    } else {
        battery2Circle.style.stroke = 'var(--success-color)';
        if (percentage === 100) {
            battery2Circle.classList.add('battery-full');
        } else {
            battery2Circle.classList.remove('battery-full');
        }
    }
}

// Draw the charging graph
function drawGraph() {
    // Clear the canvas
    ctx.clearRect(0, 0, chargingGraphCanvas.width, chargingGraphCanvas.height);

    // Set up drawing properties
    ctx.lineWidth = 2;

    // Set color based on battery percentage to match the circle
    if (batteryPercentage < 50) {
        ctx.strokeStyle = 'var(--danger-color)';
        ctx.fillStyle = 'rgba(244, 67, 54, 0.1)'; // Red with transparency
    } else if (batteryPercentage < 80) {
        ctx.strokeStyle = 'var(--warning-color)';
        ctx.fillStyle = 'rgba(255, 152, 0, 0.1)'; // Orange with transparency
    } else {
        ctx.strokeStyle = 'var(--success-color)';
        ctx.fillStyle = 'rgba(76, 175, 80, 0.1)'; // Green with transparency
    }

    // Start drawing path
    ctx.beginPath();

    // Calculate point spacing
    const pointSpacing = chargingGraphCanvas.width / (maxDataPoints - 1);

    // Draw the line
    graphData.forEach((value, index) => {
        const x = index * pointSpacing;
        const y = chargingGraphCanvas.height - (value / 100) * chargingGraphCanvas.height;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    // Stroke the line
    ctx.stroke();

    // Fill area under the line
    ctx.lineTo(chargingGraphCanvas.width, chargingGraphCanvas.height);
    ctx.lineTo(0, chargingGraphCanvas.height);
    ctx.closePath();
    ctx.fill();

    // Draw grid lines
    drawGridLines();
}

// Draw grid lines on the graph
function drawGridLines() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;

    // Draw horizontal grid lines
    for (let i = 0; i <= 4; i++) {
        const y = i * (chargingGraphCanvas.height / 4);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chargingGraphCanvas.width, y);
        ctx.stroke();
    }

    // Draw vertical grid lines
    for (let i = 0; i <= 4; i++) {
        const x = i * (chargingGraphCanvas.width / 4);
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, chargingGraphCanvas.height);
        ctx.stroke();
    }
}

// Update the feedback area
function updateFeedback(message) {
    feedbackArea.textContent = message;
}

// Log a message to the console
function logToConsole(message) {
    const time = getCurrentTime();
    const logLine = document.createElement('div');
    logLine.className = 'console-line';
    logLine.innerHTML = `<span class="console-time">${time}</span><span class="console-message">${message}</span>`;

    consoleElement.appendChild(logLine);
    consoleElement.scrollTop = consoleElement.scrollHeight;
}

// Start the uptime counter
function startUptimeCounter() {
    uptimeInterval = setInterval(function() {
        uptimeSeconds++;
        uptimeElement.textContent = formatTime(uptimeSeconds);
    }, 1000);
}

// Format seconds into HH:MM:SS
function formatTime(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return [hours, minutes, secs]
        .map(v => v < 10 ? "0" + v : v)
        .join(":");
}

// Get current time in HH:MM:SS format
function getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');

    return `${hours}:${minutes}:${seconds}`;
}
