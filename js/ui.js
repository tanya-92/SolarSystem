class UIController {
  constructor(solarSystem) {
    this.solarSystem = solarSystem
    this.isDarkMode = true
    this.isPanelCollapsed = false

    this.init()
    this.setupEventListeners()
  }

  init() {
    this.createPlanetControls()
    this.updateTheme()
    this.hideLoadingScreen()
  }

  hideLoadingScreen() {
    setTimeout(() => {
      const loadingScreen = document.getElementById("loading-screen")
      loadingScreen.style.opacity = "0"
      setTimeout(() => {
        loadingScreen.style.display = "none"
      }, 600)
    }, 2500)
  }

  createPlanetControls() {
    const container = document.getElementById("planet-controls")
    const PLANET_DATA = [
      { name: "Mercury", color: "#FFD700", glowColor: "#FFD700" },
      { name: "Venus", color: "#FF69B4", glowColor: "#FF69B4" },
      { name: "Earth", color: "#0000FF", glowColor: "#0000FF" },
      { name: "Mars", color: "#FF4500", glowColor: "#FF4500" },
      { name: "Jupiter", color: "#FFA500", glowColor: "#FFA500" },
      { name: "Saturn", color: "#FFFF00", glowColor: "#FFFF00" },
      { name: "Uranus", color: "#00FFFF", glowColor: "#00FFFF" },
      { name: "Neptune", color: "#00008B", glowColor: "#00008B" },
    ] // Example PLANET_DATA declaration

    PLANET_DATA.forEach((planet, index) => {
      const controlElement = document.createElement("div")
      controlElement.className = "planet-control"
      controlElement.innerHTML = `
        <div class="planet-color glow-effect" style="background-color: ${planet.color}; box-shadow: 0 0 12px ${planet.glowColor};"></div>
        <div class="planet-info">
          <div class="planet-name">${planet.name}</div>
          <div class="planet-speed">Speed: <span class="speed-value">1.0x</span></div>
        </div>
        <div class="slider-container">
          <input type="range" class="slider planet-slider" 
                 min="0" max="8" step="0.1" value="1.0" 
                 data-planet-index="${index}">
          <span class="slider-value">1.0x</span>
        </div>
      `

      container.appendChild(controlElement)

      // Add event listener to slider
      const slider = controlElement.querySelector(".slider")
      const valueDisplay = controlElement.querySelector(".slider-value")
      const speedDisplay = controlElement.querySelector(".speed-value")

      slider.addEventListener("input", (e) => {
        const value = Number.parseFloat(e.target.value)
        this.solarSystem.setPlanetSpeed(index, value)
        valueDisplay.textContent = `${value.toFixed(1)}x`
        speedDisplay.textContent = `${value.toFixed(1)}x`

        // Enhanced visual feedback
        controlElement.style.transform = "scale(1.02)"
        controlElement.style.boxShadow = `0 8px 25px ${planet.glowColor}40`

        setTimeout(() => {
          controlElement.style.transform = "scale(1)"
          controlElement.style.boxShadow = ""
        }, 200)
      })

      // Add hover effects
      controlElement.addEventListener("mouseenter", () => {
        controlElement.style.borderColor = planet.glowColor
        controlElement.querySelector(".planet-color").style.transform = "scale(1.1)"
      })

      controlElement.addEventListener("mouseleave", () => {
        controlElement.style.borderColor = ""
        controlElement.querySelector(".planet-color").style.transform = "scale(1)"
      })
    })
  }

  setupEventListeners() {
    // Enhanced global speed control
    const globalSpeedSlider = document.getElementById("global-speed")
    const globalSpeedValue = globalSpeedSlider.nextElementSibling

    globalSpeedSlider.addEventListener("input", (e) => {
      const value = Number.parseFloat(e.target.value)
      this.solarSystem.setGlobalSpeed(value)
      globalSpeedValue.textContent = `${value.toFixed(1)}x`

      // Visual feedback for global speed
      globalSpeedSlider.style.boxShadow = `0 0 15px var(--accent-secondary)`
      setTimeout(() => {
        globalSpeedSlider.style.boxShadow = ""
      }, 300)
    })

    // Enhanced Pause/Resume button
    const pauseBtn = document.getElementById("pause-btn")
    pauseBtn.addEventListener("click", () => {
      const isPaused = this.solarSystem.togglePause()
      const icon = pauseBtn.querySelector(".btn-icon")
      const text = pauseBtn.querySelector(".btn-text")

      if (isPaused) {
        icon.textContent = "▶️"
        text.textContent = "Resume"
        pauseBtn.classList.add("paused")
        pauseBtn.style.background = "linear-gradient(135deg, #68d391 0%, #38a169 100%)"
      } else {
        icon.textContent = "⏸️"
        text.textContent = "Pause"
        pauseBtn.classList.remove("paused")
        pauseBtn.style.background = "linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)"
      }

      // Enhanced button animation
      pauseBtn.style.transform = "scale(0.95)"
      setTimeout(() => {
        pauseBtn.style.transform = "scale(1)"
      }, 150)
    })

    // Enhanced Reset button
    const resetBtn = document.getElementById("reset-btn")
    resetBtn.addEventListener("click", () => {
      this.solarSystem.resetSpeeds()
      this.resetAllSliders()

      // Enhanced visual feedback
      resetBtn.style.transform = "scale(0.9) rotate(180deg)"
      resetBtn.style.background = "linear-gradient(135deg, #f6e05e 0%, #d69e2e 100%)"

      setTimeout(() => {
        resetBtn.style.transform = "scale(1) rotate(0deg)"
        resetBtn.style.background = ""
      }, 400)

      this.showNotification("All speeds reset to default", "success")
    })

    // Enhanced Theme toggle
    const themeToggle = document.getElementById("theme-toggle")
    themeToggle.addEventListener("click", () => {
      this.toggleTheme()

      // Enhanced theme toggle animation
      themeToggle.style.transform = "scale(0.8) rotate(180deg)"
      setTimeout(() => {
        themeToggle.style.transform = "scale(1) rotate(0deg)"
      }, 300)
    })

    // Panel toggle with enhanced animation
    const panelToggle = document.getElementById("toggle-panel")
    panelToggle.addEventListener("click", () => {
      this.togglePanel()

      panelToggle.style.transform = "scale(0.9)"
      setTimeout(() => {
        panelToggle.style.transform = "scale(1)"
      }, 150)
    })

    // Enhanced Camera controls
    const resetCameraBtn = document.getElementById("reset-camera")
    resetCameraBtn.addEventListener("click", () => {
      this.solarSystem.resetCamera()

      resetCameraBtn.style.transform = "scale(0.9) rotate(360deg)"
      setTimeout(() => {
        resetCameraBtn.style.transform = "scale(1) rotate(0deg)"
      }, 500)

      this.showNotification("Camera position reset", "info")
    })

    const autoRotateBtn = document.getElementById("auto-rotate")
    autoRotateBtn.addEventListener("click", () => {
      this.solarSystem.controls.autoRotate = !this.solarSystem.controls.autoRotate
      autoRotateBtn.classList.toggle("active")

      if (this.solarSystem.controls.autoRotate) {
        autoRotateBtn.style.background =
          "linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%)"
        autoRotateBtn.style.color = "white"
        this.showNotification("Auto-rotate enabled", "success")
      } else {
        autoRotateBtn.style.background = ""
        autoRotateBtn.style.color = ""
        this.showNotification("Auto-rotate disabled", "info")
      }
    })

    // Enhanced Fullscreen button
    const fullscreenBtn = document.getElementById("fullscreen-btn")
    fullscreenBtn.addEventListener("click", () => {
      this.solarSystem.toggleFullscreen()

      fullscreenBtn.style.transform = "scale(0.9)"
      setTimeout(() => {
        fullscreenBtn.style.transform = "scale(1)"
      }, 150)
    })

    // Enhanced Info button and instructions
    const infoBtn = document.getElementById("info-btn")
    const instructions = document.getElementById("instructions")
    const closeInstructions = document.getElementById("close-instructions")

    infoBtn.addEventListener("click", () => {
      instructions.classList.remove("hidden")
      instructions.style.animation = "fadeIn 0.4s ease-out"
    })

    closeInstructions.addEventListener("click", () => {
      instructions.style.animation = "fadeOut 0.4s ease-out"
      setTimeout(() => {
        instructions.classList.add("hidden")
      }, 400)
    })

    // Close instructions when clicking outside
    instructions.addEventListener("click", (e) => {
      if (e.target === instructions) {
        instructions.style.animation = "fadeOut 0.4s ease-out"
        setTimeout(() => {
          instructions.classList.add("hidden")
        }, 400)
      }
    })

    // Enhanced keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      switch (e.code) {
        case "KeyH":
          if (!instructions.classList.contains("hidden")) return
          instructions.classList.remove("hidden")
          instructions.style.animation = "fadeIn 0.4s ease-out"
          break
        case "Escape":
          if (!instructions.classList.contains("hidden")) {
            instructions.style.animation = "fadeOut 0.4s ease-out"
            setTimeout(() => {
              instructions.classList.add("hidden")
            }, 400)
          }
          break
      }
    })
  }

  resetAllSliders() {
    // Reset global speed with animation
    const globalSlider = document.getElementById("global-speed")
    globalSlider.value = 1.0
    globalSlider.nextElementSibling.textContent = "1.0x"

    // Animate global slider
    globalSlider.style.transform = "scale(1.05)"
    setTimeout(() => {
      globalSlider.style.transform = "scale(1)"
    }, 200)

    // Reset planet sliders with staggered animation
    const planetSliders = document.querySelectorAll(".planet-slider")
    const PLANET_DATA = [
      { name: "Mercury", color: "#FFD700", glowColor: "#FFD700" },
      { name: "Venus", color: "#FF69B4", glowColor: "#FF69B4" },
      { name: "Earth", color: "#0000FF", glowColor: "#0000FF" },
      { name: "Mars", color: "#FF4500", glowColor: "#FF4500" },
      { name: "Jupiter", color: "#FFA500", glowColor: "#FFA500" },
      { name: "Saturn", color: "#FFFF00", glowColor: "#FFFF00" },
      { name: "Uranus", color: "#00FFFF", glowColor: "#00FFFF" },
      { name: "Neptune", color: "#00008B", glowColor: "#00008B" },
    ] // Example PLANET_DATA declaration

    planetSliders.forEach((slider, index) => {
      setTimeout(() => {
        slider.value = 1.0
        const control = slider.closest(".planet-control")
        control.querySelector(".slider-value").textContent = "1.0x"
        control.querySelector(".speed-value").textContent = "1.0x"

        // Animate each control
        control.style.transform = "scale(1.02)"
        control.style.borderColor = PLANET_DATA[index].glowColor

        setTimeout(() => {
          control.style.transform = "scale(1)"
          control.style.borderColor = ""
        }, 200)
      }, index * 100) // Staggered animation
    })
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode
    const solarSystemTheme = this.solarSystem.toggleTheme()
    this.updateTheme()

    const message = this.isDarkMode ? "Dark mode enabled" : "Light mode enabled"
    this.showNotification(message, "info")
  }

  updateTheme() {
    const body = document.body
    const themeIcon = document.querySelector(".theme-icon")

    if (this.isDarkMode) {
      body.setAttribute("data-theme", "dark")
      themeIcon.textContent = "☀️"
    } else {
      body.setAttribute("data-theme", "light")
      themeIcon.textContent = "🌙"
    }

    // Update theme with smooth transition
    body.style.transition = "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)"
  }

  togglePanel() {
    const panel = document.getElementById("control-panel")
    this.isPanelCollapsed = !this.isPanelCollapsed

    if (this.isPanelCollapsed) {
      panel.classList.add("collapsed")
    } else {
      panel.classList.remove("collapsed")
    }
  }

  showNotification(message, type = "info") {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll(".notification")
    existingNotifications.forEach((notification) => {
      notification.remove()
    })

    const notification = document.createElement("div")
    notification.className = `notification ${type}`

    // Enhanced notification styling
    const icons = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
    }

    const colors = {
      success: "var(--success)",
      error: "var(--error)",
      warning: "var(--warning)",
      info: "var(--accent-primary)",
    }

    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-left: 4px solid ${colors[type]};
        border-radius: 12px;
        padding: 1rem 1.5rem;
        color: var(--text-primary);
        font-weight: 500;
        box-shadow: var(--shadow-lg);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        transform: translateX(100%);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        max-width: 300px;
      ">
        <span style="font-size: 1.2rem;">${icons[type]}</span>
        <span>${message}</span>
      </div>
    `

    document.body.appendChild(notification)

    // Animate in
    setTimeout(() => {
      notification.firstElementChild.style.transform = "translateX(0)"
    }, 100)

    // Remove after delay
    setTimeout(() => {
      notification.firstElementChild.style.transform = "translateX(100%)"
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification)
        }
      }, 400)
    }, 3000)
  }

  updatePlanetInfo(planetData) {
    // Enhanced planet info display
    console.log("Planet info:", planetData)

    // Could be extended to show detailed planet information panel
    const detailedInfo = {
      name: planetData.name,
      atmosphere: planetData.atmosphere,
      temperature: planetData.temperature,
      moons: planetData.moons,
      dayLength: planetData.dayLength,
      yearLength: planetData.yearLength,
    }

    // This could trigger a detailed info modal or side panel
    this.showNotification(`Viewing ${planetData.name} details`, "info")
  }
}
