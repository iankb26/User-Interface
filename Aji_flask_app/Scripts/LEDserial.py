import serial
import sys
import termios
import tty

# Replace '/dev/ttyACM0' with the appropriate serial port for your Arduino
ser = serial.Serial('/dev/ttyACM0', 9600)

# Function to read a single character from the terminal without waiting for a newline
def getch():
    fd = sys.stdin.fileno()
    old_settings = termios.tcgetattr(fd)
    try:
        tty.setraw(sys.stdin.fileno())
        ch = sys.stdin.read(1)
    finally:
        termios.tcsetattr(fd, termios.TCSADRAIN, old_settings)
    return ch

try:
    while True:
        # Wait for user input
        key = getch()

        # If user presses 'p', send 'P' over serial
        if key == 'p':
            ser.write(b'P')
            print("LED turned on")

except KeyboardInterrupt:
    # Clean up and close the serial connection
    ser.close()