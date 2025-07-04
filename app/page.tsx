"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Pause, RotateCcw, SunIcon, MoonIcon } from "lucide-react"
import * as THREE from "three"

// Planet data with solid, visible colors for both modes
const PLANET_DATA = [
  {
    name: "Mercury",
    lightColor: "#8C7853",
    darkColor: "#B8A082",
    size: 0.15,
    distance: 3,
    speed: 4.15,
    info: "Closest planet to the Sun with extreme temperature variations",
    details: {
      diameter: "4,879 km",
      temperature: "-173°C to 427°C",
      dayLength: "59 Earth days",
      yearLength: "88 Earth days",
      moons: 0,
    },
  },
  {
    name: "Venus",
    lightColor: "#FFC649",
    darkColor: "#FFD700",
    size: 0.18,
    distance: 4,
    speed: 3.5,
    info: "Hottest planet with thick atmosphere of carbon dioxide",
    details: {
      diameter: "12,104 km",
      temperature: "462°C",
      dayLength: "243 Earth days",
      yearLength: "225 Earth days",
      moons: 0,
    },
  },
  {
    name: "Earth",
    lightColor: "#4A90E2",
    darkColor: "#6BB6FF",
    size: 0.2,
    distance: 5,
    speed: 2.98,
    info: "Our home planet - the only known planet with life",
    details: {
      diameter: "12,756 km",
      temperature: "-89°C to 58°C",
      dayLength: "24 hours",
      yearLength: "365.25 days",
      moons: 1,
    },
  },
  {
    name: "Mars",
    lightColor: "#CD5C5C",
    darkColor: "#FF6B6B",
    size: 0.16,
    distance: 6.5,
    speed: 2.41,
    info: "The red planet with the largest volcano in the solar system",
    details: {
      diameter: "6,792 km",
      temperature: "-87°C to -5°C",
      dayLength: "24.6 hours",
      yearLength: "687 Earth days",
      moons: 2,
    },
  },
  {
    name: "Jupiter",
    lightColor: "#D2691E",
    darkColor: "#FF8C42",
    size: 0.8,
    distance: 9,
    speed: 1.31,
    info: "Largest planet - a gas giant with the Great Red Spot",
    details: {
      diameter: "142,984 km",
      temperature: "-108°C",
      dayLength: "9.9 hours",
      yearLength: "12 Earth years",
      moons: 95,
    },
  },
  {
    name: "Saturn",
    lightColor: "#FAD5A5",
    darkColor: "#FFEB9C",
    size: 0.7,
    distance: 12,
    speed: 0.97,
    info: "Famous for its spectacular ring system",
    details: {
      diameter: "120,536 km",
      temperature: "-139°C",
      dayLength: "10.7 hours",
      yearLength: "29 Earth years",
      moons: 146,
    },
  },
  {
    name: "Uranus",
    lightColor: "#4FD0E7",
    darkColor: "#7FDBFF",
    size: 0.4,
    distance: 15,
    speed: 0.68,
    info: "Ice giant tilted on its side with faint rings",
    details: {
      diameter: "51,118 km",
      temperature: "-197°C",
      dayLength: "17.2 hours",
      yearLength: "84 Earth years",
      moons: 28,
    },
  },
  {
    name: "Neptune",
    lightColor: "#4169E1",
    darkColor: "#5B9BD5",
    size: 0.38,
    distance: 18,
    speed: 0.54,
    info: "Windiest planet with supersonic winds up to 2,100 km/h",
    details: {
      diameter: "49,528 km",
      temperature: "-201°C",
      dayLength: "16.1 hours",
      yearLength: "165 Earth years",
      moons: 16,
    },
  },
]

interface PlanetProps {
  data: (typeof PLANET_DATA)[0]
  speedMultiplier: number
  isPaused: boolean
  darkMode: boolean
  onHover: (planet: (typeof PLANET_DATA)[0] | null) => void
  isHovered: boolean
}

function Planet({ data, speedMultiplier, isPaused, darkMode, onHover, isHovered }: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  useFrame(() => {
    if (!isPaused && !isHovered && groupRef.current) {
      groupRef.current.rotation.y += data.speed * speedMultiplier * 0.01
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.02
    }
  })

  const planetColor = darkMode ? data.darkColor : data.lightColor

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        position={[data.distance, 0, 0]}
        onPointerOver={() => onHover(data)}
        onPointerOut={() => onHover(null)}
        scale={isHovered ? 1.3 : 1}
      >
        <sphereGeometry args={[data.size, 32, 32]} />
        <meshStandardMaterial color={planetColor} roughness={0.6} metalness={0.1} />

        {data.name === "Saturn" && (
          <mesh rotation={[Math.PI / 2, 0, Math.PI / 6]}>
            <ringGeometry args={[data.size * 1.5, data.size * 2.2, 64]} />
            <meshBasicMaterial
              color={darkMode ? "#FFEB9C" : "#C4A484"}
              transparent
              opacity={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}
      </mesh>

      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[data.distance - 0.02, data.distance + 0.02, 64]} />
        <meshBasicMaterial color={darkMode ? "#FFFFFF" : "#333333"} transparent opacity={darkMode ? 0.4 : 0.6} />
      </mesh>
    </group>
  )
}

function EnhancedSun() {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005
    }
  })

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#FDB813" />
        <pointLight intensity={2} distance={50} />
      </mesh>
    </group>
  )
}

function MovingStars({ darkMode }: { darkMode: boolean }) {
  const starsRef = useRef<THREE.Points>(null)

  useFrame(() => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0005
      starsRef.current.rotation.x += 0.0002
    }
  })

  return (
    <Stars
      ref={starsRef}
      radius={100}
      depth={50}
      count={darkMode ? 6000 : 3000}
      factor={4}
      saturation={0}
      fade
      speed={1}
    />
  )
}

function SolarSystemScene({
  planetSpeeds,
  isPaused,
  darkMode,
  onPlanetHover,
  hoveredPlanet,
}: {
  planetSpeeds: number[]
  isPaused: boolean
  darkMode: boolean
  onPlanetHover: (planet: (typeof PLANET_DATA)[0] | null) => void
  hoveredPlanet: (typeof PLANET_DATA)[0] | null
}) {
  const { scene } = useThree()

  useEffect(() => {
    scene.background = new THREE.Color(darkMode ? "#000011" : "#87CEEB")
  }, [darkMode, scene])

  return (
    <>
      <ambientLight intensity={0.3} />
      <MovingStars darkMode={darkMode} />
      <EnhancedSun />

      {PLANET_DATA.map((planet, index) => (
        <Planet
          key={planet.name}
          data={planet}
          speedMultiplier={planetSpeeds[index]}
          isPaused={isPaused}
          darkMode={darkMode}
          onHover={onPlanetHover}
          isHovered={hoveredPlanet?.name === planet.name}
        />
      ))}
    </>
  )
}

export default function Component() {
  const [planetSpeeds, setPlanetSpeeds] = useState(PLANET_DATA.map(() => 1))
  const [isPaused, setIsPaused] = useState(false)
  const [hoveredPlanet, setHoveredPlanet] = useState<(typeof PLANET_DATA)[0] | null>(null)
  const [darkMode, setDarkMode] = useState(false) // Light mode as default
  const [showControls, setShowControls] = useState(true)

  // Simplified speed change handler - no complex event handling
  const handleSpeedChange = useCallback((planetIndex: number, newValue: number) => {
    setPlanetSpeeds((prev) => {
      const newSpeeds = [...prev]
      newSpeeds[planetIndex] = newValue
      return newSpeeds
    })
  }, [])

  const resetSpeeds = useCallback(() => {
    setPlanetSpeeds(PLANET_DATA.map(() => 1))
  }, [])

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev)
  }, [])

  const toggleTheme = useCallback(() => {
    setDarkMode((prev) => !prev)
  }, [])

  const handlePlanetHover = useCallback((planet: (typeof PLANET_DATA)[0] | null) => {
    setHoveredPlanet(planet)
  }, [])

  return (
    <div
      className={`min-h-screen transition-all duration-300 font-['Inter'] ${
        darkMode ? "bg-black text-white" : "bg-gray-100 text-black"
      }`}
      style={{ fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4">
        <div className="flex justify-between items-center">
          <h1
            className={`text-2xl md:text-3xl font-bold flex items-center gap-2 ${
              darkMode ? "text-white" : "text-black"
            }`}
          >
            <SunIcon className="w-8 h-8 text-yellow-500" />
            3D Solar System
          </h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTheme}
              className={`font-semibold transition-all duration-200 border-2 ${
                darkMode
                  ? "border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black bg-black/50"
                  : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white bg-white/80"
              }`}
            >
              {darkMode ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowControls(!showControls)}
              className={`font-semibold transition-all duration-200 border-2 ${
                darkMode
                  ? "border-green-400 text-green-400 hover:bg-green-400 hover:text-black bg-black/50"
                  : "border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white bg-white/80"
              }`}
            >
              Controls
            </Button>
          </div>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="h-screen">
        <Canvas camera={{ position: [0, 10, 20], fov: 60 }}>
          <OrbitControls enablePan={false} enableZoom={true} enableRotate={false} minDistance={5} maxDistance={50} />
          <SolarSystemScene
            planetSpeeds={planetSpeeds}
            isPaused={isPaused}
            darkMode={darkMode}
            onPlanetHover={handlePlanetHover}
            hoveredPlanet={hoveredPlanet}
          />
        </Canvas>
      </div>

      {/* Centered Planet Info Card */}
      {hoveredPlanet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <Card
            className={`max-w-md w-full mx-4 transition-all duration-300 transform scale-100 border-2 ${
              darkMode
                ? "bg-gradient-to-br from-purple-900/95 to-blue-900/95 border-cyan-400 text-white shadow-2xl shadow-cyan-400/20"
                : "bg-gradient-to-br from-blue-50/95 to-purple-50/95 border-blue-400 text-black shadow-2xl shadow-blue-400/20"
            }`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-full border-2"
                  style={{
                    backgroundColor: darkMode ? hoveredPlanet.darkColor : hoveredPlanet.lightColor,
                    borderColor: darkMode ? "#00FFFF" : "#0066CC",
                    boxShadow: `0 0 15px ${darkMode ? hoveredPlanet.darkColor : hoveredPlanet.lightColor}`,
                  }}
                />
                <span className={`text-xl font-bold ${darkMode ? "text-cyan-100" : "text-blue-900"}`}>
                  {hoveredPlanet.name}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className={`text-sm leading-relaxed ${darkMode ? "text-cyan-200" : "text-blue-800"}`}>
                {hoveredPlanet.info}
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className={`${darkMode ? "text-purple-200" : "text-purple-700"}`}>
                  <div className="font-semibold">Diameter:</div>
                  <div>{hoveredPlanet.details.diameter}</div>
                </div>
                <div className={`${darkMode ? "text-purple-200" : "text-purple-700"}`}>
                  <div className="font-semibold">Temperature:</div>
                  <div>{hoveredPlanet.details.temperature}</div>
                </div>
                <div className={`${darkMode ? "text-purple-200" : "text-purple-700"}`}>
                  <div className="font-semibold">Day Length:</div>
                  <div>{hoveredPlanet.details.dayLength}</div>
                </div>
                <div className={`${darkMode ? "text-purple-200" : "text-purple-700"}`}>
                  <div className="font-semibold">Year Length:</div>
                  <div>{hoveredPlanet.details.yearLength}</div>
                </div>
                <div className={`${darkMode ? "text-purple-200" : "text-purple-700"}`}>
                  <div className="font-semibold">Moons:</div>
                  <div>{hoveredPlanet.details.moons}</div>
                </div>
                <div className={`${darkMode ? "text-purple-200" : "text-purple-700"}`}>
                  <div className="font-semibold">Orbital Speed:</div>
                  <div>{hoveredPlanet.speed} km/s</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Colorful Control Panel */}
      {showControls && (
        <div className="absolute bottom-4 left-4 right-4 md:left-auto md:w-80">
          <Card
            className={`backdrop-blur-sm transition-all duration-300 border-2 ${
              darkMode
                ? "bg-gradient-to-br from-indigo-900/90 to-purple-900/90 border-pink-400 text-white shadow-xl shadow-pink-400/20"
                : "bg-gradient-to-br from-white/95 to-blue-50/95 border-indigo-400 text-black shadow-xl shadow-indigo-400/20"
            }`}
          >
            <CardHeader className="pb-3">
              <CardTitle
                className={`flex items-center justify-between ${darkMode ? "text-pink-100" : "text-indigo-900"}`}
              >
                <span className="font-bold">🚀 Orbital Controls</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={togglePause}
                    className={`transition-all duration-200 border-2 font-bold ${
                      darkMode
                        ? "border-green-400 text-green-400 hover:bg-green-400 hover:text-black bg-black/30"
                        : "border-green-600 text-green-600 hover:bg-green-600 hover:text-white bg-white/80"
                    }`}
                  >
                    {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetSpeeds}
                    className={`transition-all duration-200 border-2 font-bold ${
                      darkMode
                        ? "border-orange-400 text-orange-400 hover:bg-orange-400 hover:text-black bg-black/30"
                        : "border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white bg-white/80"
                    }`}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-60 overflow-y-auto">
              {PLANET_DATA.map((planet, index) => (
                <div key={planet.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full border-2"
                        style={{
                          backgroundColor: darkMode ? planet.darkColor : planet.lightColor,
                          borderColor: darkMode ? "#FFFFFF" : "#333333",
                          boxShadow: `0 0 8px ${darkMode ? planet.darkColor : planet.lightColor}`,
                        }}
                      />
                      <span className={`text-sm font-semibold ${darkMode ? "text-cyan-100" : "text-indigo-900"}`}>
                        {planet.name}
                      </span>
                    </div>
                    <Badge
                      className={`text-xs font-bold border ${
                        darkMode
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-pink-300"
                          : "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-300"
                      }`}
                    >
                      {planetSpeeds[index].toFixed(1)}x
                    </Badge>
                  </div>
                  <div className="px-2">
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.1"
                      value={planetSpeeds[index]}
                      onChange={(e) => handleSpeedChange(index, Number.parseFloat(e.target.value))}
                      className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${
                        darkMode ? "bg-gray-700 slider-thumb-dark" : "bg-gray-300 slider-thumb-light"
                      }`}
                      style={{
                        background: darkMode
                          ? `linear-gradient(to right, #8B5CF6 0%, #EC4899 ${(planetSpeeds[index] / 5) * 100}%, #374151 ${(planetSpeeds[index] / 5) * 100}%, #374151 100%)`
                          : `linear-gradient(to right, #3B82F6 0%, #8B5CF6 ${(planetSpeeds[index] / 5) * 100}%, #D1D5DB ${(planetSpeeds[index] / 5) * 100}%, #D1D5DB 100%)`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 right-4 md:bottom-auto md:top-20 md:left-4">
        <Card
          className={`backdrop-blur-sm w-64 transition-all duration-300 border-2 ${
            darkMode
              ? "bg-gradient-to-br from-gray-900/90 to-slate-800/90 border-cyan-400 text-white shadow-lg shadow-cyan-400/20"
              : "bg-gradient-to-br from-white/95 to-gray-50/95 border-gray-400 text-black shadow-lg shadow-gray-400/20"
          }`}
        >
          <CardContent className="p-3">
            <h4 className={`font-bold text-sm mb-2 ${darkMode ? "text-cyan-100" : "text-gray-900"}`}>
              📖 Instructions
            </h4>
            <ul className={`text-xs space-y-1 ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
              <li>• Scroll to zoom in/out</li>
              <li>• Hover planets for detailed info</li>
              <li>• Use sliders to control orbital speed</li>
              <li>• Click pause/play to control animation</li>
              <li>• Toggle between light/dark themes</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <style jsx>{`
        .slider-thumb-dark::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #EC4899, #8B5CF6);
          cursor: pointer;
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 10px rgba(236, 72, 153, 0.5);
        }
        
        .slider-thumb-light::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3B82F6, #8B5CF6);
          cursor: pointer;
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
        
        .slider-thumb-dark::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #EC4899, #8B5CF6);
          cursor: pointer;
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 10px rgba(236, 72, 153, 0.5);
        }
        
        .slider-thumb-light::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #3B82F6, #8B5CF6);
          cursor: pointer;
          border: 2px solid #FFFFFF;
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  )
}
