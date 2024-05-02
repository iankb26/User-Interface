from flask import Flask, render_template
import subprocess

app = Flask(__name__, template_folder= 'templates')

@app.route('/')
def main():
    return render_template('index.html')

@app.route('/turn_on_led')
def turn_on_led():
    # Call the Python script to send the serial command to turn on the LED
    try:
        subprocess.run(['python3', 'Scripts/LEDserial.py'], check=True)
        return 'LED turned on successfully!'
    except subprocess.CalledProcessError as e:
        return f'Error turning on LED: {e}', 500
    

if __name__ == '__main__':
    app.run(host='127.0.1.1', port=5000, debug=True)
