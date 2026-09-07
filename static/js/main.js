// ==========================================================================
// Application Configuration & State
// ==========================================================================

// Initial default settings representing physical hardware defaults
const DEFAULT_CONFIG = [
  {
    keyId: 1,
    gpio: 23,
    action: "play_pause",
    trigger: "single_press",
    label: "Play"
  },
  {
    keyId: 2,
    gpio: 17,
    action: "next_track",
    trigger: "single_press",
    label: "Next"
  },
  {
    keyId: 3,
    gpio: 3,
    action: "prev_track",
    trigger: "single_press",
    label: "Prev"
  },
  {
    keyId: 4,
    gpio: 16,
    action: "like_track",
    trigger: "single_press",
    label: "Like"
  }
];

// Spotify Action Metadata (human readable names, icons, and colors)
const ACTIONS_METADATA = {
  play_pause: { name: "Play / Pause", icon: "play", color: "#1DB954" },
  next_track: { name: "Next Track", icon: "skip-forward", color: "#00f2fe" },
  prev_track: { name: "Previous Track", icon: "skip-back", color: "#d946ef" },
  like_track: { name: "Like Song", icon: "heart", color: "#ef4444" },
  volume_up: { name: "Volume Up", icon: "volume-2", color: "#f59e0b" },
  volume_down: { name: "Volume Down", icon: "volume-x", color: "#f97316" },
  shuffle_toggle: { name: "Shuffle Toggle", icon: "shuffle", color: "#a855f7" },
  repeat_toggle: { name: "Repeat Toggle", icon: "repeat", color: "#6366f1" },
  mute_toggle: { name: "Mute Toggle", icon: "volume-x", color: "#64748b" },
  none: { name: "None (Disabled)", icon: "slash", color: "#475569" }
};

// Mock Playlist for Spotify Simulation
const MOCK_PLAYLIST = [
  {
    title: "Midnight City Nights",
    artist: "Cyber Retro Band",
    duration: 204, // seconds (3:24)
    art: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><defs><linearGradient id='g1' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23120c1f'/><stop offset='100%' stop-color='%23701a75'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g1)'/><circle cx='50' cy='50' r='25' fill='none' stroke='%23f472b6' stroke-width='4'/><line x1='50' y1='10' x2='50' y2='90' stroke='%23d946ef' stroke-width='2'/></svg>"
  },
  {
    title: "Green Light Glow",
    artist: "The Spark Plugs",
    duration: 178, // seconds (2:58)
    art: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><defs><linearGradient id='g2' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23062f4f'/><stop offset='100%' stop-color='%231DB954'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g2)'/><polygon points='35,25 75,50 35,75' fill='%231ed760'/></svg>"
  },
  {
    title: "Out of Sync",
    artist: "Jittery Waveforms",
    duration: 245, // seconds (4:05)
    art: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><defs><linearGradient id='g3' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23111827'/><stop offset='100%' stop-color='%231e293b'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g3)'/><path d='M10,50 Q25,10 40,50 T70,50 T90,50' fill='none' stroke='%2338bdf8' stroke-width='3'/></svg>"
  },
  {
    title: "Analog Whispers",
    artist: "Hertz & Volts",
    duration: 192, // seconds (3:12)
    art: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><defs><linearGradient id='g4' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' stop-color='%23450a0a'/><stop offset='100%' stop-color='%23f43f5e'/></linearGradient></defs><rect width='100' height='100' fill='url(%23g4)'/><rect x='25' y='25' width='50' height='50' rx='8' fill='none' stroke='%23fda4af' stroke-width='4'/></svg>"
  }
];

// App State
const state = {
  configs: [], // Active Key configs
  selectedKeyId: 1, // Currently focused key in the editor
  
  // Spotify Player State
  player: {
    isPlaying: false,
    currentTrackIndex: 0,
    progress: 0, // current seconds
    volume: 75, // 0 to 100
    isMuted: false,
    isLiked: false,
    isShuffle: false,
    isRepeat: false,
    timer: null
  }
};

// ==========================================================================
// Initialization & Storage
// ==========================================================================

function initApp() {
  // Load config from Local Storage
  const saved = localStorage.getItem("macropad_config");
  if (saved) {
    try {
      state.configs = JSON.parse(saved);
    } catch (e) {
      console.error("Error parsing saved config, resetting defaults.", e);
      state.configs = [...DEFAULT_CONFIG];
    }
  } else {
    state.configs = [...DEFAULT_CONFIG];
    saveConfig();
  }

  // Bind UI Events
  bindUIEvents();

  // Load first key in editor
  selectKey(1);

  // Load initial simulated player track
  loadTrack(0);

  // Render elements
  renderAll();
  
  // Re-evaluate Lucide Icons
  lucide.createIcons();
}

function saveConfig() {
  localStorage.setItem("macropad_config", JSON.stringify(state.configs));
}

// ==========================================================================
// Rendering Elements
// ==========================================================================

function renderAll() {
  renderKeys();
  renderMappingsTable();
  renderPlayer();
}

// Update the physical looking keycaps
function renderKeys() {
  state.configs.forEach(cfg => {
    const keyBtn = document.getElementById(`key-${cfg.keyId}`);
    const keySub = document.getElementById(`key-sub-${cfg.keyId}`);
    const rgb = document.getElementById(`rgb-${cfg.keyId}`);
    const keyContainer = document.getElementById(`key-container-${cfg.keyId}`);

    if (keySub) {
      keySub.textContent = cfg.label || "Unmapped";
    }

    if (rgb) {
      // Set the color glow variable dynamically from the action metadata
      const actionMeta = ACTIONS_METADATA[cfg.action] || ACTIONS_METADATA.none;
      rgb.style.backgroundColor = actionMeta.color;
    }

    // Toggle selected borders
    if (keyContainer) {
      if (cfg.keyId === state.selectedKeyId) {
        keyContainer.classList.add("selected");
      } else {
        keyContainer.classList.remove("selected");
      }
    }
  });
}

// Render Table list of configurations
function renderMappingsTable() {
  const tbody = document.getElementById("mappings-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  state.configs.forEach(cfg => {
    const tr = document.createElement("tr");
    tr.setAttribute("data-key-id", cfg.keyId);
    
    // Check if selected
    if (cfg.keyId === state.selectedKeyId) {
      tr.style.backgroundColor = "rgba(0, 242, 254, 0.05)";
      tr.style.borderColor = "rgba(0, 242, 254, 0.2)";
    }

    const actionMeta = ACTIONS_METADATA[cfg.action] || ACTIONS_METADATA.none;
    
    tr.innerHTML = `
      <td><span class="table-key-badge">Key ${cfg.keyId} (${cfg.label})</span></td>
      <td><span class="table-pin-badge">GPIO ${cfg.gpio}</span></td>
      <td><span class="text-secondary">${cfg.trigger.replace('_', ' ')}</span></td>
      <td>
        <div class="table-action-cell">
          <i data-lucide="${actionMeta.icon}" class="table-action-icon" style="color: ${actionMeta.color}"></i>
          <span>${actionMeta.name}</span>
        </div>
      </td>
      <td>
        <button class="table-btn-edit" title="Edit mapping">
          <i data-lucide="edit-3"></i>
        </button>
      </td>
    `;

    // Click on row to edit
    tr.addEventListener("click", () => {
      selectKey(cfg.keyId);
    });

    tbody.appendChild(tr);
  });
  
  lucide.createIcons();
}

// Select a key for editing
function selectKey(keyId) {
  state.selectedKeyId = keyId;
  const cfg = state.configs.find(c => c.keyId === keyId);
  if (!cfg) return;

  // Update editor header title
  document.getElementById("editor-key-number").textContent = keyId;
  
  // Fill form
  document.getElementById("edit-key-id").value = cfg.keyId;
  document.getElementById("edit-key-label").value = cfg.label;
  document.getElementById("edit-gpio-pin").value = cfg.gpio;
  document.getElementById("edit-trigger-type").value = cfg.trigger;
  document.getElementById("edit-spotify-action").value = cfg.action;

  renderAll();
}

// ==========================================================================
// Event Binding & Form Submits
// ==========================================================================

function bindUIEvents() {
  // Bind clicks on physical-looking keys
  for (let i = 1; i <= 4; i++) {
    const container = document.getElementById(`key-container-${i}`);
    if (container) {
      container.addEventListener("click", (e) => {
        selectKey(i);
        simulatePhysicalPress(i);
      });
    }
  }

  // Editor Form Submit
  const form = document.getElementById("mapping-form");
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      
      const keyId = parseInt(document.getElementById("edit-key-id").value, 10);
      const label = document.getElementById("edit-key-label").value.trim() || `Key ${keyId}`;
      const gpio = parseInt(document.getElementById("edit-gpio-pin").value, 10);
      const trigger = document.getElementById("edit-trigger-type").value;
      const action = document.getElementById("edit-spotify-action").value;

      // Update state
      const targetIndex = state.configs.findIndex(c => c.keyId === keyId);
      if (targetIndex !== -1) {
        state.configs[targetIndex] = {
          keyId,
          gpio,
          action,
          trigger,
          label
        };

        fetch('/update_key_binding', {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
          },
          body: JSON.stringify([keyId, action]),
        })
        .then(response => response.json());

        saveConfig();
        addLogLine(`Applied new configuration to KEY ${keyId} [GPIO ${gpio}]: Mapping to '${action}' with trigger '${trigger}'`, "action");
        renderAll();
      }
    });
  }

  // Form Individual Reset Key
  const resetKeyBtn = document.getElementById("btn-reset-key");
  if (resetKeyBtn) {
    resetKeyBtn.addEventListener("click", () => {
      const keyId = state.selectedKeyId;
      const original = DEFAULT_CONFIG.find(c => c.keyId === keyId);
      if (original) {
        const targetIndex = state.configs.findIndex(c => c.keyId === keyId);
        if (targetIndex !== -1) {
          state.configs[targetIndex] = { ...original };
          saveConfig();
          selectKey(keyId);
          addLogLine(`Reset KEY ${keyId} to default configuration.`, "default");
        }
      }
    });
  }

  // Reset All Keys
  const resetAllBtn = document.getElementById("btn-reset-all");
  if (resetAllBtn) {
    resetAllBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to reset all button mappings to factory defaults?")) {
        state.configs = DEFAULT_CONFIG.map(c => ({ ...c }));
        saveConfig();
        selectKey(state.selectedKeyId);
        addLogLine("Factory Reset: Reverted all key configurations to default pins and actions.", "default");
      }
    });
  }

  // Simulate Tap Button
  const testBtn = document.getElementById("btn-quick-test");
  if (testBtn) {
    testBtn.addEventListener("click", () => {
      simulatePhysicalPress(state.selectedKeyId);
    });
  }

  // Computer physical keybinds to simulate (keys '1', '2', '3', '4')
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "SELECT") {
      return; // Ignore typing in form fields
    }
    
    if (e.key === "1" || e.key === "2" || e.key === "3" || e.key === "4") {
      const id = parseInt(e.key, 10);
      simulatePhysicalPress(id);
    }
  });

  // Help Modal Toggle
  const helpBtn = document.getElementById("btn-help-modal");
  const helpModal = document.getElementById("help-modal");
  const closeHelpBtn = document.getElementById("btn-close-help");
  const closeHelpConfirmBtn = document.getElementById("btn-close-help-confirm");

  if (helpBtn && helpModal) {
    helpBtn.addEventListener("click", (e) => {
      e.preventDefault();
      helpModal.classList.add("show");
    });
  }

  const hideHelp = () => {
    if (helpModal) helpModal.classList.remove("show");
  };

  if (closeHelpBtn) closeHelpBtn.addEventListener("click", hideHelp);
  if (closeHelpConfirmBtn) closeHelpConfirmBtn.addEventListener("click", hideHelp);
  
  if (helpModal) {
    helpModal.addEventListener("click", (e) => {
      if (e.target === helpModal) hideHelp();
    });
  }

  // Simulator Music progress area seek capability
  const progressBg = document.getElementById("progress-bar-click-area");
  if (progressBg) {
    progressBg.addEventListener("click", (e) => {
      const rect = progressBg.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const ratio = clickX / rect.width;
      const duration = MOCK_PLAYLIST[state.player.currentTrackIndex].duration;
      state.player.progress = Math.floor(ratio * duration);
      updateProgressDisplay();
    });
  }
}

// ==========================================================================
// Spotify Player Simulation Engine
// ==========================================================================

function loadTrack(index) {
  state.player.currentTrackIndex = index;
  const track = MOCK_PLAYLIST[index];
  
  document.getElementById("track-name").textContent = track.title;
  document.getElementById("artist-name").textContent = track.artist;
  document.getElementById("album-art").src = track.art;
  document.getElementById("track-duration-time").textContent = formatTime(track.duration);
  
  state.player.progress = 0;
  updateProgressDisplay();
}

function updateProgressDisplay() {
  const track = MOCK_PLAYLIST[state.player.currentTrackIndex];
  const progressFill = document.getElementById("track-progress-fill");
  const progressText = document.getElementById("track-progress-time");
  
  if (progressFill) {
    const percentage = (state.player.progress / track.duration) * 100;
    progressFill.style.width = `${percentage}%`;
  }
  
  if (progressText) {
    progressText.textContent = formatTime(state.player.progress);
  }
}

function renderPlayer() {
  const playIcon = document.querySelector("#sim-btn-play i");
  const widget = document.querySelector(".spotify-widget");
  const artImg = document.getElementById("album-art");
  
  // Play state rendering
  if (state.player.isPlaying) {
    if (playIcon) {
      playIcon.setAttribute("data-lucide", "pause");
      playIcon.classList.remove("fill-play");
    }
    widget.classList.add("playing");
    artImg.classList.add("playing");
  } else {
    if (playIcon) {
      playIcon.setAttribute("data-lucide", "play");
      playIcon.classList.add("fill-play");
    }
    widget.classList.remove("playing");
    artImg.classList.remove("playing");
  }
  
  // Like status rendering
  const heartIcon = document.getElementById("sim-heart-icon");
  const likeBtn = document.getElementById("sim-btn-like");
  if (heartIcon && likeBtn) {
    if (state.player.isLiked) {
      heartIcon.setAttribute("data-lucide", "heart-off");
      likeBtn.classList.add("liked");
      heartIcon.style.fill = "var(--spotify-green)";
    } else {
      heartIcon.setAttribute("data-lucide", "heart");
      likeBtn.classList.remove("liked");
      heartIcon.style.fill = "none";
    }
  }

  // Shuffle & Repeat buttons
  toggleBtnActiveState("sim-btn-shuffle", state.player.isShuffle);
  toggleBtnActiveState("sim-btn-repeat", state.player.isRepeat);

  // Volume rendering
  const volFill = document.getElementById("sim-volume-fill");
  const volIcon = document.getElementById("sim-volume-icon");
  if (volFill) {
    volFill.style.width = `${state.player.isMuted ? 0 : state.player.volume}%`;
  }
  if (volIcon) {
    if (state.player.isMuted || state.player.volume === 0) {
      volIcon.setAttribute("data-lucide", "volume-x");
    } else if (state.player.volume < 40) {
      volIcon.setAttribute("data-lucide", "volume-1");
    } else {
      volIcon.setAttribute("data-lucide", "volume-2");
    }
  }
  
  lucide.createIcons();
}

function toggleBtnActiveState(id, isActive) {
  const btn = document.getElementById(id);
  if (btn) {
    if (isActive) btn.classList.add("active");
    else btn.classList.remove("active");
  }
}

// Tick progress every second when playing
function startProgressTimer() {
  if (state.player.timer) clearInterval(state.player.timer);
  state.player.timer = setInterval(() => {
    if (state.player.isPlaying) {
      const track = MOCK_PLAYLIST[state.player.currentTrackIndex];
      state.player.progress++;
      
      if (state.player.progress >= track.duration) {
        // Track finished
        if (state.player.isRepeat) {
          state.player.progress = 0;
        } else {
          // Play next track
          skipTrack(1);
        }
      }
      updateProgressDisplay();
    }
  }, 1000);
}

function skipTrack(direction) {
  let newIndex = state.player.currentTrackIndex + direction;
  if (state.player.isShuffle && direction > 0) {
    newIndex = Math.floor(Math.random() * MOCK_PLAYLIST.length);
  } else {
    if (newIndex >= MOCK_PLAYLIST.length) newIndex = 0;
    if (newIndex < 0) newIndex = MOCK_PLAYLIST.length - 1;
  }
  loadTrack(newIndex);
  renderPlayer();
}

// Helper to format time
function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

// ==========================================================================
// Simulation Event Handler
// ==========================================================================

function simulatePhysicalPress(keyId) {
  const cfg = state.configs.find(c => c.keyId === keyId);
  if (!cfg) return;

  // Add click animation class to key container
  const container = document.getElementById(`key-container-${keyId}`);
  if (container) {
    container.classList.add("pressed");
    setTimeout(() => {
      container.classList.remove("pressed");
    }, 120);
  }

  // Create simulated beep/click sound via Web Audio API (satisfying feedback!)
  playClickSound();

  const action = cfg.action;
  const pin = cfg.gpio;
  const triggerText = cfg.trigger.replace("_", " ").toUpperCase();
  
  addLogLine(`[ESP32 -> INPUT] Pin GPIO ${pin} changed to LOW (${triggerText})`);

  // Process mapping action
  switch (action) {
    case "play_pause":
      state.player.isPlaying = !state.player.isPlaying;
      if (state.player.isPlaying) {
        startProgressTimer();
        addLogLine(`[ESP32 -> API] POST /v1/me/player/play -- OK (Status 204)`, "action");
      } else {
        addLogLine(`[ESP32 -> API] PUT /v1/me/player/pause -- OK (Status 204)`, "action");
      }
      break;

    case "next_track":
      skipTrack(1);
      const nextSong = MOCK_PLAYLIST[state.player.currentTrackIndex];
      addLogLine(`[ESP32 -> API] POST /v1/me/player/next -- OK. Playing: "${nextSong.title}"`, "action");
      break;

    case "prev_track":
      skipTrack(-1);
      const prevSong = MOCK_PLAYLIST[state.player.currentTrackIndex];
      addLogLine(`[ESP32 -> API] POST /v1/me/player/previous -- OK. Playing: "${prevSong.title}"`, "action");
      break;

    case "like_track":
      state.player.isLiked = !state.player.isLiked;
      if (state.player.isLiked) {
        addLogLine(`[ESP32 -> API] PUT /v1/me/player/tracks?ids=... -- OK (Added to Library)`, "action");
      } else {
        addLogLine(`[ESP32 -> API] DELETE /v1/me/player/tracks?ids=... -- OK (Removed from Library)`, "action");
      }
      break;

    case "volume_up":
      state.player.isMuted = false;
      state.player.volume = Math.min(100, state.player.volume + 10);
      addLogLine(`[ESP32 -> API] PUT /v1/me/player/volume?volume_percent=${state.player.volume} -- OK`, "action");
      break;

    case "volume_down":
      state.player.volume = Math.max(0, state.player.volume - 10);
      addLogLine(`[ESP32 -> API] PUT /v1/me/player/volume?volume_percent=${state.player.volume} -- OK`, "action");
      break;

    case "shuffle_toggle":
      state.player.isShuffle = !state.player.isShuffle;
      addLogLine(`[ESP32 -> API] PUT /v1/me/player/shuffle?state=${state.player.isShuffle} -- OK`, "action");
      break;

    case "repeat_toggle":
      state.player.isRepeat = !state.player.isRepeat;
      addLogLine(`[ESP32 -> API] PUT /v1/me/player/repeat?state=${state.player.isRepeat ? 'track' : 'off'} -- OK`, "action");
      break;

    case "mute_toggle":
      state.player.isMuted = !state.player.isMuted;
      addLogLine(`[ESP32 -> API] PUT /v1/me/player/volume?volume_percent=${state.player.isMuted ? 0 : state.player.volume} -- OK`, "action");
      break;

    case "none":
    default:
      addLogLine(`[ESP32] Pin GPIO ${pin} triggered but action is set to None. No API call made.`, "default");
      break;
  }

  renderPlayer();
}

// Log utility
function addLogLine(text, type = "default") {
  const consoleEl = document.getElementById("sim-log-output");
  if (!consoleEl) return;

  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${(now.getMilliseconds() / 10).toFixed(0).padStart(2, '0')}`;
  
  const line = document.createElement("div");
  line.className = `log-line ${type}`;
  line.innerHTML = `<span style="color: var(--text-muted)">[${timeStr}]</span> ${text}`;
  
  consoleEl.appendChild(line);
  consoleEl.scrollTop = consoleEl.scrollHeight;

  // Keep log length reasonable
  while (consoleEl.children.length > 20) {
    consoleEl.removeChild(consoleEl.firstChild);
  }
}

// Satisfying mechanical key click sound generator using Web Audio API
let audioCtx = null;
function playClickSound() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Quick transient high-passed click/snap sound
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, audioCtx.currentTime + 0.08);
    
    gainNode.gain.setValueAtTime(0.08, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
    
    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.08);
  } catch (err) {
    // Audio Context blocker helper
  }
}

// ==========================================================================
// App Startup
// ==========================================================================
window.addEventListener("DOMContentLoaded", initApp);
