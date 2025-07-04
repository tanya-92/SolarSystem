import * as THREE from "three"
import { PLANET_DATA, ANIMATION_CONFIG, STAR_CONFIG } from "./config"

class SolarSystem {
  constructor(canvas) {
    this.canvas = canvas
    this.scene = null
    this.camera = null
    this.renderer = null
    this.controls = null

    // Animation state
    this.clock = new THREE.Clock()
    this.isPaused = false
    this.globalSpeed = 1.0
    this.planetSpeeds = PLANET_DATA.map(() => 1.0)
    this.isDarkMode = true

    // Objects
    this.sun = null
    this.planets = []
    this.orbits = []
    this.stars = null
    this.starField = null

    // Performance monitoring
    this.frameCount = 0
    this.lastTime = performance.now()
    this.fps = 60

    // Raycaster for mouse interactions
    this.raycaster = new THREE.Raycaster()
    this.mouse = new THREE.Vector2()

    this.init()
    this.setupEventListeners()
    this.animate()
  }

  init() {
    this.setupScene()
    this.setupCamera()
    this.setupRenderer()
    this.setupControls()
    this.setupLighting()
    this.createSolarSystem()
    this.createEnhancedStarField()
  }

  setupScene() {
    this.scene = new THREE.Scene()
    this.updateSceneBackground()
  }

  updateSceneBackground() {
    if (this.isDarkMode) {
      // Dark space background with gradient
      this.scene.background = new THREE.Color(0x000511)
    } else {
      // Light sky background
      this.scene.background = new THREE.Color(0x87ceeb)
    }
  }

  setupCamera() {
    const aspect = window.innerWidth / window.innerHeight
    this.camera = new THREE.PerspectiveCamera(65, aspect, 0.1, 2000)
    this.camera.position.set(0, 12, 20)
  }

  setupRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    })
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = 1.2
  }

  setupControls() {
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.03
    this.controls.minDistance = 3
    this.controls.maxDistance = 150
    this.controls.maxPolarAngle = Math.PI
    this.controls.autoRotate = false
    this.controls.autoRotateSpeed = 0.5
  }

  setupLighting() {
    // Enhanced ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.15)
    this.scene.add(ambientLight)

    // Enhanced sun light with better shadows
    const sunLight = new THREE.PointLight(0xffffff, 3, 200)
    sunLight.position.set(0, 0, 0)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 4096
    sunLight.shadow.mapSize.height = 4096
    sunLight.shadow.camera.near = 0.1
    sunLight.shadow.camera.far = 100
    this.scene.add(sunLight)

    // Additional rim lighting for planets
    const rimLight = new THREE.DirectionalLight(0x4169e1, 0.3)
    rimLight.position.set(10, 10, 5)
    this.scene.add(rimLight)
  }

  createSolarSystem() {
    this.createEnhancedSun()
    this.createEnhancedPlanets()
    this.createEnhancedOrbits()
  }

  createEnhancedSun() {
    // Main sun geometry with higher detail
    const geometry = new THREE.SphereGeometry(1.2, 64, 64)

    // Enhanced sun material with glow
    const material = new THREE.MeshBasicMaterial({
      color: 0xffd700,
      emissive: 0xff8c00,
      emissiveIntensity: 0.8,
    })

    this.sun = new THREE.Mesh(geometry, material)
    this.sun.userData = { type: "sun", name: "Sun" }
    this.scene.add(this.sun)

    // Multiple glow layers for enhanced effect
    const glowLayers = [
      { size: 1.4, color: 0xffd700, opacity: 0.4 },
      { size: 1.7, color: 0xff8c00, opacity: 0.2 },
      { size: 2.0, color: 0xff6b00, opacity: 0.1 },
    ]

    glowLayers.forEach((layer) => {
      const glowGeometry = new THREE.SphereGeometry(layer.size, 32, 32)
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: layer.color,
        transparent: true,
        opacity: layer.opacity,
        side: THREE.BackSide,
      })
      const glow = new THREE.Mesh(glowGeometry, glowMaterial)
      this.sun.add(glow)
    })

    // Sun corona effect
    const coronaGeometry = new THREE.SphereGeometry(2.5, 32, 32)
    const coronaMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
      },
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
          vec3 glow = vec3(1.0, 0.6, 0.1) * intensity;
          gl_FragColor = vec4(glow, intensity * 0.3);
        }
      `,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      transparent: true,
    })

    const corona = new THREE.Mesh(coronaGeometry, coronaMaterial)
    this.sun.add(corona)
    this.sunCorona = corona
  }

  createEnhancedPlanets() {
    PLANET_DATA.forEach((planetData, index) => {
      // Higher detail geometry
      const geometry = new THREE.SphereGeometry(planetData.size, 64, 64)

      // Enhanced material with better lighting
      const material = new THREE.MeshStandardMaterial({
        color: planetData.color,
        roughness: 0.7,
        metalness: 0.1,
        emissive: planetData.color,
        emissiveIntensity: 0.05,
      })

      const planet = new THREE.Mesh(geometry, material)
      planet.position.x = planetData.distance
      planet.castShadow = true
      planet.receiveShadow = true
      planet.userData = {
        type: "planet",
        index: index,
        data: planetData,
        angle: Math.random() * Math.PI * 2,
      }

      // Add planet glow effect
      const glowGeometry = new THREE.SphereGeometry(planetData.size * 1.3, 32, 32)
      const glowMaterial = new THREE.MeshBasicMaterial({
        color: planetData.glowColor,
        transparent: true,
        opacity: 0.2,
        side: THREE.BackSide,
      })
      const planetGlow = new THREE.Mesh(glowGeometry, glowMaterial)
      planet.add(planetGlow)

      // Create planet group for orbital rotation
      const planetGroup = new THREE.Group()
      planetGroup.add(planet)
      planetGroup.userData = {
        type: "planetGroup",
        index: index,
        planet: planet,
      }

      this.scene.add(planetGroup)
      this.planets.push({ group: planetGroup, mesh: planet, data: planetData })

      // Add Saturn's rings
      if (planetData.name === "Saturn") {
        this.createSaturnRings(planet, planetData.size)
      }
    })
  }

  createSaturnRings(planet, planetSize) {
    const ringGeometry = new THREE.RingGeometry(planetSize * 1.5, planetSize * 2.5, 64)
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0xc4a484,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide,
    })

    const rings = new THREE.Mesh(ringGeometry, ringMaterial)
    rings.rotation.x = Math.PI / 2
    rings.rotation.z = Math.PI / 6 // Slight tilt
    planet.add(rings)
  }

  createEnhancedOrbits() {
    PLANET_DATA.forEach((planetData) => {
      const points = []
      const segments = 128

      for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * Math.PI * 2
        points.push(new THREE.Vector3(Math.cos(angle) * planetData.distance, 0, Math.sin(angle) * planetData.distance))
      }

      const geometry = new THREE.BufferGeometry().setFromPoints(points)
      const material = new THREE.LineBasicMaterial({
        color: this.isDarkMode ? 0xffffff : 0x333333,
        transparent: true,
        opacity: this.isDarkMode ? 0.3 : 0.5,
      })

      const orbit = new THREE.Line(geometry, material)
      this.scene.add(orbit)
      this.orbits.push(orbit)
    })
  }

  createEnhancedStarField() {
    const starGeometry = new THREE.BufferGeometry()
    const starMaterial = new THREE.PointsMaterial({
      size: 1.5,
      transparent: true,
      opacity: 0.8,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
    })

    const starVertices = []
    const starColors = []
    const starSizes = []

    for (let i = 0; i < STAR_CONFIG.count; i++) {
      // Random position in sphere
      const radius = STAR_CONFIG.radius + Math.random() * STAR_CONFIG.radius
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)

      const x = radius * Math.sin(phi) * Math.cos(theta)
      const y = radius * Math.sin(phi) * Math.sin(theta)
      const z = radius * Math.cos(phi)

      starVertices.push(x, y, z)

      // Random star color
      const colorIndex = Math.floor(Math.random() * STAR_CONFIG.colors.length)
      const color = new THREE.Color(STAR_CONFIG.colors[colorIndex])
      starColors.push(color.r, color.g, color.b)

      // Random star size
      const size = STAR_CONFIG.sizes[Math.floor(Math.random() * STAR_CONFIG.sizes.length)]
      starSizes.push(size)
    }

    starGeometry.setAttribute("position", new THREE.Float32BufferAttribute(starVertices, 3))
    starGeometry.setAttribute("color", new THREE.Float32BufferAttribute(starColors, 3))
    starGeometry.setAttribute("size", new THREE.Float32BufferAttribute(starSizes, 1))

    // Enhanced star material with custom shader
    const enhancedStarMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pixelRatio: { value: this.renderer.getPixelRatio() },
      },
      vertexShader: `
        attribute float size;
        varying vec3 vColor;
        uniform float time;
        uniform float pixelRatio;
        
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          
          // Twinkling effect
          float twinkle = sin(time * 3.0 + position.x * 0.01) * 0.5 + 0.5;
          
          gl_PointSize = size * pixelRatio * (300.0 / -mvPosition.z) * (0.5 + twinkle * 0.5);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        
        void main() {
          float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
          float alpha = 1.0 - smoothstep(0.0, 0.5, distanceToCenter);
          
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    })

    this.stars = new THREE.Points(starGeometry, enhancedStarMaterial)
    this.scene.add(this.stars)
    this.starMaterial = enhancedStarMaterial
  }

  setupEventListeners() {
    // Mouse events for planet interaction
    this.canvas.addEventListener("mousemove", (event) => {
      this.onMouseMove(event)
    })

    this.canvas.addEventListener("click", (event) => {
      this.onMouseClick(event)
    })

    // Keyboard controls
    document.addEventListener("keydown", (event) => {
      this.onKeyDown(event)
    })

    // Window resize
    window.addEventListener("resize", () => {
      this.onWindowResize()
    })
  }

  onMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect()
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

    this.checkPlanetHover()
  }

  onMouseClick(event) {
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const intersects = this.raycaster.intersectObjects(this.planets.map((p) => p.mesh))

    if (intersects.length > 0) {
      const planet = intersects[0].object
      this.focusOnPlanet(planet.userData.index)
    }
  }

  onKeyDown(event) {
    switch (event.code) {
      case "Space":
        event.preventDefault()
        this.togglePause()
        break
      case "KeyR":
        this.resetCamera()
        break
      case "KeyF":
        this.toggleFullscreen()
        break
      case "KeyT":
        this.toggleTheme()
        break
    }
  }

  checkPlanetHover() {
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const intersects = this.raycaster.intersectObjects(this.planets.map((p) => p.mesh))

    if (intersects.length > 0) {
      const planet = intersects[0].object
      this.showPlanetTooltip(planet.userData.data, event)
    } else {
      this.hidePlanetTooltip()
    }
  }

  showPlanetTooltip(planetData, event) {
    const tooltip = document.getElementById("planet-tooltip")
    const rect = this.canvas.getBoundingClientRect()

    // Update tooltip content
    tooltip.querySelector(".planet-color").style.backgroundColor = planetData.color
    tooltip.querySelector(".planet-name").textContent = planetData.name
    tooltip.querySelector(".planet-description").textContent = planetData.description
    tooltip.querySelector(".distance").textContent = planetData.realDistance
    tooltip.querySelector(".speed").textContent = planetData.realSpeed

    // Position tooltip
    tooltip.style.left = `${event.clientX - rect.left + 15}px`
    tooltip.style.top = `${event.clientY - rect.top - 15}px`
    tooltip.classList.remove("hidden")
  }

  hidePlanetTooltip() {
    const tooltip = document.getElementById("planet-tooltip")
    tooltip.classList.add("hidden")
  }

  focusOnPlanet(planetIndex) {
    const planet = this.planets[planetIndex]
    const planetPosition = new THREE.Vector3()
    planet.mesh.getWorldPosition(planetPosition)

    // Animate camera to planet
    const distance = planet.data.size * 8
    const targetPosition = planetPosition.clone().add(new THREE.Vector3(distance, distance * 0.5, distance))

    this.animateCamera(targetPosition, planetPosition)
  }

  animateCamera(targetPosition, lookAtPosition) {
    const startPosition = this.camera.position.clone()
    const startTarget = this.controls.target.clone()

    let progress = 0
    const duration = 2500
    const startTime = performance.now()

    const animate = (currentTime) => {
      progress = Math.min((currentTime - startTime) / duration, 1)
      const easeProgress = this.easeInOutCubic(progress)

      this.camera.position.lerpVectors(startPosition, targetPosition, easeProgress)
      this.controls.target.lerpVectors(startTarget, lookAtPosition, easeProgress)
      this.controls.update()

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }

  easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
  }

  animate() {
    requestAnimationFrame(() => this.animate())

    const deltaTime = this.clock.getDelta()

    if (!this.isPaused) {
      this.updatePlanets(deltaTime)
      this.updateSun(deltaTime)
      this.updateStars(deltaTime)
    }

    this.controls.update()
    this.renderer.render(this.scene, this.camera)
    this.updatePerformanceMonitor()
  }

  updatePlanets(deltaTime) {
    this.planets.forEach((planet, index) => {
      const speed = PLANET_DATA[index].speed * this.planetSpeeds[index] * this.globalSpeed

      // Orbital rotation with realistic speeds
      planet.group.rotation.y += speed * ANIMATION_CONFIG.baseSpeed * deltaTime

      // Planet self-rotation
      planet.mesh.rotation.y += PLANET_DATA[index].rotationSpeed * deltaTime * 10
    })
  }

  updateSun(deltaTime) {
    // Sun rotation
    this.sun.rotation.y += 0.002 * deltaTime

    // Update corona shader
    if (this.sunCorona) {
      this.sunCorona.material.uniforms.time.value += deltaTime
    }

    // Sun pulsing effect
    const pulseScale = 1 + Math.sin(this.clock.elapsedTime * 2) * 0.02
    this.sun.scale.setScalar(pulseScale)
  }

  updateStars(deltaTime) {
    if (this.stars && this.starMaterial) {
      // Update star twinkling
      this.starMaterial.uniforms.time.value += deltaTime

      // Gentle star field rotation
      this.stars.rotation.y += ANIMATION_CONFIG.starMovementSpeed * deltaTime
      this.stars.rotation.x += ANIMATION_CONFIG.starMovementSpeed * 0.5 * deltaTime
    }
  }

  updatePerformanceMonitor() {
    this.frameCount++
    const currentTime = performance.now()

    if (currentTime >= this.lastTime + 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (currentTime - this.lastTime))
      this.frameCount = 0
      this.lastTime = currentTime

      const fpsElement = document.getElementById("fps-value")
      if (fpsElement) {
        fpsElement.textContent = this.fps

        // Color code FPS display
        if (this.fps >= 50) {
          fpsElement.style.color = "#68d391"
        } else if (this.fps >= 30) {
          fpsElement.style.color = "#f6e05e"
        } else {
          fpsElement.style.color = "#fc8181"
        }
      }

      // Adaptive quality based on performance
      if (ANIMATION_CONFIG.adaptiveQuality) {
        this.adjustQuality()
      }
    }
  }

  adjustQuality() {
    if (this.fps < 25) {
      // Reduce quality significantly
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio * 0.5, 1))
      if (this.stars) {
        this.stars.material.size = 0.8
      }
    } else if (this.fps < 40) {
      // Reduce quality moderately
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio * 0.75, 1.5))
    } else if (this.fps > 55) {
      // Increase quality
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
      if (this.stars) {
        this.stars.material.size = 1.5
      }
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(window.innerWidth, window.innerHeight)

    if (this.starMaterial) {
      this.starMaterial.uniforms.pixelRatio.value = this.renderer.getPixelRatio()
    }
  }

  // Enhanced public methods for UI controls
  togglePause() {
    this.isPaused = !this.isPaused
    return this.isPaused
  }

  setGlobalSpeed(speed) {
    this.globalSpeed = Math.max(0, Math.min(8, speed))
  }

  setPlanetSpeed(planetIndex, speed) {
    if (planetIndex >= 0 && planetIndex < this.planetSpeeds.length) {
      this.planetSpeeds[planetIndex] = Math.max(0, Math.min(8, speed))
    }
  }

  resetSpeeds() {
    this.globalSpeed = 1.0
    this.planetSpeeds = PLANET_DATA.map(() => 1.0)
  }

  resetCamera() {
    this.camera.position.set(0, 12, 20)
    this.controls.target.set(0, 0, 0)
    this.controls.update()
  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode
    this.updateSceneBackground()
    this.updateOrbitColors()
    return this.isDarkMode
  }

  updateOrbitColors() {
    this.orbits.forEach((orbit) => {
      orbit.material.color.setHex(this.isDarkMode ? 0xffffff : 0x333333)
      orbit.material.opacity = this.isDarkMode ? 0.3 : 0.5
    })
  }

  dispose() {
    // Enhanced cleanup
    this.scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose()
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach((material) => material.dispose())
        } else {
          object.material.dispose()
        }
      }
    })

    this.renderer.dispose()
    this.controls.dispose()
  }
}
