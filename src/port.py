import requests
import urllib
import base64
from flask import Flask, redirect, request
from credentials import CLIENT_ID, CLIENT_SECRET

app = Flask(__name__)

REDIRECT_URI = "http://127.0.0.1:8888/callback"
AUTH_URL = "https://accounts.spotify.com/authorize?"
TOKEN_URL = "https://accounts.spotify.com/api/token"

@app.route('/')
def index():
    return "<a href='/login'> Login to spotify</a>"

@app.route('/login')
def login():
    scope = 'user-modify-playback-state user-read-playback-state'
    params = {
        'client_id': CLIENT_ID,
        'response_type': 'code',
        'redirect_uri': REDIRECT_URI,
        'scope': scope
    }

    auth_url = f"{AUTH_URL}{urllib.parse.urlencode(params)}"
    return redirect(auth_url)

@app.route('/callback')
def callback():
    global token_info
    if 'code' in request.args:
        body = {
            'grant_type': "authorization_code",
            'code': request.args.get('code'),
            'redirect_uri': REDIRECT_URI
        }
        
        auth_str = f"{CLIENT_ID}:{CLIENT_SECRET}"
        auth_bytes = auth_str.encode("utf-8")       # convert to bytes
        base64_bytes = base64.b64encode(auth_bytes) # encode in Base64
        base64_str = base64_bytes.decode("utf-8")   # convert back to string

        header = {
            'Authorization': f"Basic {base64_str}",
            'Content-type': 'application/x-www-form-urlencoded'
        }

        response = requests.post(TOKEN_URL, data=body, headers=header)
        token_info = response.json()
        return f"<a>Here are your tokens: <br><br> access token:  {token_info['access_token']} <br><br> refresh token: {token_info['refresh_token']}</a>"

if __name__ == '__main__':
    # Start Flask app
    app.run(port=8888, debug=True)