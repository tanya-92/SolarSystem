// Main application initialization
class SolarSystemApp {
  constructor() {
    this.solarSystem = null
    this.ui = null
    this.isInitialized = false
    this.performanceMonitor = null

    this.init()
  }

  async init() {
    try {
      // Wait for DOM to be ready
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => this.start())
      } else {
        this.start()
      }
    } catch (error) {
      console.error("Failed to initialize Solar System App:", error)
      this.showError("Failed to load the application. Please refresh the page.")
    }
  }

  start() {
    const canvas = document.getElementById("solar-system-canvas")

    if (!canvas) {
      this.showError("Canvas element not found")
      return
    }

    // Check WebGL support
    if (!this.checkWebGLSupport()) {
      this.showError("WebGL is not supported in your browser. Please use a modern browser.")
      return
    }

    // Check device capabilities
    this.checkDeviceCapabilities()

    // Initialize solar system
    const SolarSystem = require("./SolarSystem") // Declare or import SolarSystem
    this.solarSystem = new SolarSystem(canvas)

    // Initialize UI controller
    const UIController = require("./UIController") // Declare or import UIController
    this.ui = new UIController(this.solarSystem)

    this.isInitialized = true

    // Setup enhanced error handling
    this.setupErrorHandling()

    // Setup enhanced performance monitoring
    this.setupPerformanceMonitoring()

    // Setup accessibility features
    this.setupAccessibility()

    console.log("🌟 Enhanced Solar System App initialized successfully!")

    // Show welcome message
    setTimeout(() => {
      this.ui.showNotification("Welcome to the 3D Solar System! Press 'H' for help.", "info")
    }, 3000)
  }

  checkWebGLSupport() {
    try {
      const canvas = document.createElement("canvas")
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
      return !!gl
    } catch (e) {
      return false
    }
  }

  checkDeviceCapabilities() {
    // Check if device is mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

    const ANIMATION_CONFIG = require("./ANIMATION_CONFIG") // Declare or import ANIMATION_CONFIG
    const UI_CONFIG = require("./UI_CONFIG") // Declare or import UI_CONFIG

    if (isMobile) {
      // Adjust settings for mobile devices
      ANIMATION_CONFIG.adaptiveQuality = true
      UI_CONFIG.starCount = Math.min(UI_CONFIG.starCount, 8000)
      console.log("📱 Mobile device detected - optimizing performance")
    }

    // Check available memory (if supported)
    if (navigator.deviceMemory) {
      if (navigator.deviceMemory < 4) {
        // Low memory device - reduce quality
        UI_CONFIG.starCount = Math.min(UI_CONFIG.starCount, 5000)
        ANIMATION_CONFIG.adaptiveQuality = true
        console.log("🔋 Low memory device detected - reducing quality")
      }
    }
  }

  setupErrorHandling() {
    window.addEventListener("error", (event) => {
      console.error("Global error:", event.error)
      this.showError("An unexpected error occurred. The application will continue running.")
    })

    window.addEventListener("unhandledrejection", (event) => {
      console.error("Unhandled promise rejection:", event.reason)
      this.showError("An unexpected error occurred. The application will continue running.")
    })

    // WebGL context lost handling
    const canvas = document.getElementById("solar-system-canvas")
    if (canvas) {
      canvas.addEventListener("webglcontextlost", (event) => {
        event.preventDefault()
        console.warn("WebGL context lost - attempting to restore")
        this.showError("Graphics context lost. Attempting to restore...")
      })

      canvas.addEventListener("webglcontextrestored", () => {
        console.log("WebGL context restored")
        this.ui.showNotification("Graphics context restored successfully", "success")
        // Reinitialize if needed
        if (this.solarSystem) {
          this.solarSystem.init()
        }
      })
    }
  }

  setupPerformanceMonitoring() {
    // Enhanced memory monitoring
    if (performance.memory) {
      setInterval(() => {
        const memory = performance.memory
        const memoryUsage = {
          used: Math.round(memory.usedJSHeapSize / 1048576),
          total: Math.round(memory.totalJSHeapSize / 1048576),
          limit: Math.round(memory.jsHeapSizeLimit / 1048576),
        }

        // Log warning if memory usage is high
        if (memoryUsage.used / memoryUsage.limit > 0.85) {
          console.warn("High memory usage detected:", memoryUsage)
          this.ui.showNotification("High memory usage detected. Consider refreshing the page.", "warning")
        }
      }, 15000) // Check every 15 seconds
    }

    // Enhanced frame rate monitoring
    let lastFrameTime = performance.now()
    let frameDropCount = 0
    let lowFPSWarningShown = false

    const checkFrameRate = () => {
      const currentTime = performance.now()
      const deltaTime = currentTime - lastFrameTime

      if (deltaTime > 50) {
        // More than 20fps drop
        frameDropCount++
        if (frameDropCount > 15 && !lowFPSWarningShown) {
          console.warn("Performance issues detected. Consider reducing quality settings.")
          this.ui.showNotification("Performance issues detected. Quality has been automatically adjusted.", "warning")
          lowFPSWarningShown = true

          // Reset warning after 30 seconds
          setTimeout(() => {
            lowFPSWarningShown = false
            frameDropCount = 0
          }, 30000)
        }
      } else {
        frameDropCount = Math.max(0, frameDropCount - 1)
      }

      lastFrameTime = currentTime
      requestAnimationFrame(checkFrameRate)
    }

    requestAnimationFrame(checkFrameRate)

    // Battery status monitoring (if supported)
    if ("getBattery" in navigator) {
      navigator.getBattery().then((battery) => {
        const updateBatteryStatus = () => {
          if (battery.level < 0.2 && !battery.charging) {
            console.log("Low battery detected - enabling power saving mode")
            const ANIMATION_CONFIG = require("./ANIMATION_CONFIG") // Declare or import ANIMATION_CONFIG
            ANIMATION_CONFIG.adaptiveQuality = true
            this.ui.showNotification("Low battery detected. Power saving mode enabled.", "warning")
          }
        }

        battery.addEventListener("levelchange", updateBatteryStatus)
        battery.addEventListener("chargingchange", updateBatteryStatus)
        updateBatteryStatus()
      })
    }
  }

  setupAccessibility() {
    // Enhanced keyboard navigation
    document.addEventListener("keydown", (event) => {
      // Skip if user is typing in an input
      if (event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA") {
        return
      }

      const PLANET_DATA = require("./PLANET_DATA") // Declare or import PLANET_DATA

      switch (event.code) {
        case "Digit1":
        case "Digit2":
        case "Digit3":
        case "Digit4":
        case "Digit5":
        case "Digit6":
        case "Digit7":
        case "Digit8":
          event.preventDefault()
          const planetIndex = Number.parseInt(event.code.slice(-1)) - 1
          if (planetIndex < PLANET_DATA.length) {
            this.solarSystem.focusOnPlanet(planetIndex)
            this.ui.showNotification(`Focusing on ${PLANET_DATA[planetIndex].name}`, "info")
          }
          break
        case "KeyP":
          event.preventDefault()
          this.solarSystem.togglePause()
          break
        case "KeyT":
          event.preventDefault()
          this.ui.toggleTheme()
          break
        case "KeyC":
          event.preventDefault()
          this.ui.togglePanel()
          break
      }
    })

    // Add ARIA labels and roles
    const canvas = document.getElementById("solar-system-canvas")
    if (canvas) {
      canvas.setAttribute("role", "img")
      canvas.setAttribute("aria-label", "Interactive 3D Solar System simulation")
    }

    // Add screen reader announcements for important actions
    const announceToScreenReader = (message) => {
      const announcement = document.createElement("div")
      announcement.setAttribute("aria-live", "polite")
      announcement.setAttribute("aria-atomic", "true")
      announcement.className = "sr-only"
      announcement.textContent = message
      document.body.appendChild(announcement)

      setTimeout(() => {
        document.body.removeChild(announcement)
      }, 1000)
    }

    // Make announcements available globally
    window.announceToScreenReader = announceToScreenReader
  }

  showError(message) {
    const errorDiv = document.createElement("div")
    errorDiv.className = "error-message"
    errorDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: var(--glass-bg);
        backdrop-filter: blur(20px);
        border: 1px solid var(--glass-border);
        border-left: 4px solid var(--error);
        border-radius: 16px;
        padding: 2rem;
        max-width: 400px;
        width: 90%;
        box-shadow: var(--shadow-lg);
        z-index: 9999;
        text-align: center;
        color: var(--text-primary);
      ">
        <h3 style="margin-bottom: 1rem; color: var(--error); font-size: 1.25rem;">⚠️ Error</h3>
        <p style="margin-bottom: 1.5rem; line-height: 1.5;">${message}</p>
        <button onclick="location.reload()" style="
          background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        " onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'">
          Reload Page
        </button>
      </div>
    `

    document.body.appendChild(errorDiv)
  }

  // Enhanced public API methods
  getPlanetData() {
    const PLANET_DATA = require("./PLANET_DATA") // Declare or import PLANET_DATA
    return PLANET_DATA
  }

  getSolarSystem() {
    return this.solarSystem
  }

  getUI() {
    return this.ui
  }

  // Performance optimization methods
  enablePowerSavingMode() {
    if (this.solarSystem) {
      const ANIMATION_CONFIG = require("./ANIMATION_CONFIG") // Declare or import ANIMATION_CONFIG
      ANIMATION_CONFIG.adaptiveQuality = true
      const UI_CONFIG = require("./UI_CONFIG") // Declare or import UI_CONFIG
      UI_CONFIG.starCount = Math.min(UI_CONFIG.starCount, 3000)
      this.ui.showNotification("Power saving mode enabled", "info")
    }
  }

  disablePowerSavingMode() {
    if (this.solarSystem) {
      const ANIMATION_CONFIG = require("./ANIMATION_CONFIG") // Declare or import ANIMATION_CONFIG
      ANIMATION_CONFIG.adaptiveQuality = false
      const UI_CONFIG = require("./UI_CONFIG") // Declare or import UI_CONFIG
      UI_CONFIG.starCount = 15000
      this.ui.showNotification("Power saving mode disabled", "info")
    }
  }

  // Cleanup method
  destroy() {
    if (this.solarSystem) {
      this.solarSystem.dispose()
    }

    // Remove event listeners
    document.removeEventListener("keydown", this.keydownHandler)
    window.removeEventListener("error", this.errorHandler)
    window.removeEventListener("unhandledrejection", this.rejectionHandler)

    this.isInitialized = false
    console.log("🧹 Solar System App cleaned up successfully")
  }
}

// Initialize the enhanced application
const app = new SolarSystemApp()

// Make app globally available for debugging and external control
window.solarSystemApp = app

// Export for module systems
if (typeof module !== "undefined" && module.exports) {
  module.exports = SolarSystemApp
}

// Add CSS for screen reader only content
const srOnlyStyle = document.createElement("style")
srOnlyStyle.textContent = `
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`
document.head.appendChild(srOnlyStyle)
