from flask import Flask, render_template, request, jsonify
import serial
import time

app = Flask(__name__)

esp32 = None
try:
    esp32 = serial.Serial(port='/dev/cu.usbserial-0001', baudrate=115200, timeout=1)
    time.sleep(2)
    print("Connected to ESP32 on /dev/cu.usbserial-0001")
except serial.SerialException as e:
    print(f"Warning: Could not connect to ESP32 on /dev/cu.usbserial-0001 ({e})")
    print("App is running, but ESP32 serial commands will be disabled until plugged in.")

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/update_key_binding', methods=['POST'])
def update_key_binding():
    if esp32 is None or not esp32.is_open:
        return jsonify({"status": "error", "message": "ESP32 not connected"}), 500

    data = request.get_json()
    command = str(data[0]) + data[1] + '\n'
    esp32.write(command.encode('utf-8'))

    response = esp32.readline().decode('utf-8')
    if response:
        print("Success")

    return jsonify({"status": "success"})

if __name__ == '__main__':
    app.run(debug=True)

