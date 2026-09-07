#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h> 
#include <base64.h>
#include <Preferences.h>
#include <credentials.h>

String client_id = SPOTIFY_CLIENT_ID;
String client_secret = SPOTIFY_CLIENT_SECRET;
String SSID = WIFI_SSID; 
String password = WIFI_PASSWORD;
String access_token = "";
String refresh_token = SPOTIFY_REFRESH_TOKEN;

int pin1 = 16;
int pin2 = 21;
int pin3 = 22; 
int LED = 2;
void connect_wifi();
bool get_playbackState();
void play_next();
void play_previous(); 
void play_pause();
void set_access_token();
void change_key();
void call_action(String);

Preferences preferences;

void setup() { 
  Serial.begin(115200);
  pinMode(LED, OUTPUT);
  connect_wifi();
  pinMode(pin1, INPUT_PULLUP);
  pinMode(pin2, INPUT_PULLUP); 
  pinMode(pin3, INPUT_PULLUP);
  set_access_token();

  preferences.begin("config", false);
  preferences.putString("1", "prev_track");
  preferences.putString("2", "next_track");
  preferences.putString("3", "play_pause");
  preferences.end();
}

void loop() {
  if (Serial.available() > 0) {
    change_key();
  }
  if(digitalRead(pin1) == LOW) {
    call_action("1");
  }
  else if(digitalRead(pin2) == LOW) {
    call_action("2");
  }
  else if(digitalRead(pin3) == LOW) {
    call_action("3");
  }
}

void change_key() {
  String data = Serial.readStringUntil('\n');
  delay(2500);
  
  String key = data.substring(0, 1);
  String action = data.substring(1);

  preferences.begin("config", false);
  preferences.putString(key.c_str(), action);
  preferences.end();

  Serial.println(data);
}

void call_action(String num) {
  preferences.begin("config", false);
  String action = preferences.getString(num.c_str(), "NONE");
  preferences.end();

  Serial.println(action);
  if (action == "play_pause") {
    play_pause();
  }
  else if (action == "next_track") {
    play_next();
  }
  else if (action == "prev_track") {
    play_previous();
  }
  else {
    Serial.println("Error getting key configuration");
  }
}

void connect_wifi() {
  digitalWrite(LED, HIGH);
  WiFi.begin(SSID, password);
  Serial.print("Connecting to WiFi: ");
  while(WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.print(".");
  }
  Serial.print("\nSuccessfully connected to network!\n");
  digitalWrite(LED, LOW);
}

bool get_playbackState() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    http.begin("https://api.spotify.com/v1/me/player");
    http.addHeader("Authorization", "Bearer " + access_token);
    http.addHeader("Content-length", "0");
    int code = http.GET();

    JsonDocument doc;
    DeserializationError error = deserializeJson(doc, http.getString());
    if (error) {
      Serial.println("Error occured with getting current playback state");
    }

    http.end();
    return doc["is_playing"];
    
  }
}

void play_next() {
  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(LED, HIGH);
    HTTPClient http;

    http.begin("https://api.spotify.com/v1/me/player/next");
    http.addHeader("Authorization", "Bearer " + access_token);
    http.addHeader("Content-Length", "0");

    int code = http.POST("");
    Serial.println(code);

    http.end();

    digitalWrite(LED, LOW);
  }
}

void play_previous() {
  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(LED, HIGH);
    HTTPClient http;

    http.begin("https://api.spotify.com/v1/me/player/previous");
    http.addHeader("Authorization", "Bearer " + access_token);
    http.addHeader("Content-Length", "0");

    int code = http.POST("");
    Serial.println(code);

    http.end();

    digitalWrite(LED, LOW);
  }
}

void play_pause() {
  if (WiFi.status() == WL_CONNECTED) {
    digitalWrite(LED, HIGH);
    HTTPClient http;

    bool is_playing = get_playbackState();
    int code = 0;
    if (is_playing) {
      http.begin("https://api.spotify.com/v1/me/player/pause"); 
      http.addHeader("Authorization", "Bearer " + access_token);
      http.addHeader("Content-Length", "0");
      code = http.PUT("");
    }
    else {
      http.begin("https://api.spotify.com/v1/me/player/play");
      http.addHeader("Authorization", "Bearer " + access_token);
      http.addHeader("Content-Length", "0");
      code = http.PUT("");
    }
    Serial.println(code);
    
    http.end();
    digitalWrite(LED, LOW);
  }
}

void set_access_token() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;

    String toEncode = client_id + ":" + client_secret;
    String encoded = base64::encode(toEncode);

    String postBody = "grant_type=refresh_token&refresh_token=" + refresh_token;

    http.begin("https://accounts.spotify.com/api/token");
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");
    http.addHeader("Authorization", "Basic " + encoded);

    int code = http.POST(postBody);

    JsonDocument doc; 
    DeserializationError error = deserializeJson(doc, http.getString());

    if (error) {
      Serial.println("Error occured with getting access token");
    }

    if (doc["refresh_token"].is<const char *>()) {
      refresh_token = doc["refresh_token"].as<String>();
    }

    access_token = doc["access_token"].as<String>();
    http.end();
  }
}