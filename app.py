from flask import Flask, render_template, request
import serial
import time

app = Flask(__name__)
esp32 = serial.Serial(port='/dev/cu.usbserial-0001', baudrate=115200, timeout=1)
time.sleep(2)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/update_key_binding', methods=['POST'])
def update_key_binding():
    data = request.get_json()
    command = str(data[0]) + data[1] + '\n'
    esp32.write(command.encode('utf-8'))

    response = esp32.readline().decode('utf-8')
    if response:
        print("Success")

    return ""

if __name__ == '__main__':
    app.run(debug=True)
