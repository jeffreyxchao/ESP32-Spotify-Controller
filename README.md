# esp32 Spotify Controller 🎵
A wireless controller for Spotify, using a esp32 to make API calls to the Spotify Web API

### Hardware:
- esp32
- jumper wires
- tactile switches

### To use:
Beforehand, you will have to follow the instructions on https://developer.spotify.com/documentation/web-api 
in order to obtain your client ID, client secret, and to set your redirect URI. 
Once obtained, paste into `port.py` or create a `credentials.py` and `credentials.h`, then past there. 

Compile src/port.py in order to log into Spotify obtain your access and refresh token. Paste these either into `main.cpp`, or create a `credentials.h` file and past there. 

This project was done within platform.IO (which made the process easier), however main.cpp is the program configured onto the esp32. 
Make sure to set the correct configuration settings, such as baud rate, port name, etc. 

By launching app.py, you will launch an interactive host site where you can customize the button mappings. For example by default, 
the buttons are set to play previous, pause/resume, and play next. However, the user can change to volume up, volume down, like/save, mute/unmute, etc. 
By then pressing save changes, the new mappings are permanently saved to the esp32, unless you reboot the microcontroller. We're able to this by 
using the `Preferences` library to write to the esp32's flash memory.

The website was built using AI, and needs a bit refactoring, it is still a work in progress.

### Current progress/build:
<img width="537" height="488" alt="Screenshot 2026-09-07 at 9 19 41 PM" src="https://github.com/user-attachments/assets/e22a4b1c-b6fc-4cba-89bd-3181c8cdc02c" />
<img width="1709" height="951" alt="Screenshot 2026-09-07 at 9 20 09 PM" src="https://github.com/user-attachments/assets/6bc21d91-62b2-4030-be01-17642e3eb89a" />
