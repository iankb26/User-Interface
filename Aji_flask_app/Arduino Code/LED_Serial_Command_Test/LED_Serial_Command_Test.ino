int LED = 13; //Define the pin 13 LED light green

void setup() {
  pinMode(LED, OUTPUT);  // Set the LED pin as an output
  Serial.begin(9600);        // Start serial communication
}

void loop() {
  if (Serial.available() > 0) {  // Check if serial data is available
    char command = Serial.read(); // Read the serial command
    
    if (command == 'P') {         // Check if the command is 'P'
      digitalWrite(LED, HIGH);  // Turn on the LED
      Serial.println("LED turned on"); // Send a confirmation message
    }
  }
}
