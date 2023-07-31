import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/* Creta Galaxy */
const params = {
    count: 35000,
    size: 0.001,
    radius: 4,
    branches: 3,
    spin: 1.8,
    randomness: 0.32,
    randomnessPower: 3,
    insideColor: '#ff6030',
    outsideColor: '#1b3984',
}
let geometry = null
let material = null
let points = null

const generateGalaxy = () => {
    if (points) {
        geometry.dispose()
        material.dispose()
        scene.remove(points)
    }

    // Geometry
    geometry = new THREE.BufferGeometry()
    const positionArr = new Float32Array(params.count * 3)
    const colorArr = new Float32Array(params.count * 3)

    const colorInside = new THREE.Color(params.insideColor)
    const colorOutside = new THREE.Color(params.outsideColor)

    for (let i = 0; i < params.count; i++) {
        const i3 = i * 3
        const radius = params.radius * Math.random()
        const spinAngle = radius * params.spin
        const brancheAngle =
            ((i % params.branches) / params.branches) * Math.PI * 2

        const randomX =
            Math.pow(Math.random(), params.randomnessPower) *
            (Math.random() < 0.5 ? -1 : 1) *
            params.randomness *
            radius
        const randomY =
            Math.pow(Math.random(), params.randomnessPower) *
            (Math.random() < 0.5 ? -1 : 1) *
            params.randomness *
            radius
        const randomZ =
            Math.pow(Math.random(), params.randomnessPower) *
            (Math.random() < 0.5 ? -1 : 1) *
            params.randomness *
            radius

        positionArr[i3] = Math.sin(brancheAngle + spinAngle) * radius + randomX
        positionArr[i3 + 1] = randomY
        positionArr[i3 + 2] =
            Math.cos(brancheAngle + spinAngle) * radius + randomZ

        const mixedColor = colorInside.clone()
        mixedColor.lerp(colorOutside, radius / params.radius)

        colorArr[i3] = mixedColor.r
        colorArr[i3 + 1] = mixedColor.g
        colorArr[i3 + 2] = mixedColor.b
    }
    const positionAttr = new THREE.BufferAttribute(positionArr, 3)
    const colorAttr = new THREE.BufferAttribute(colorArr, 3)
    geometry.setAttribute('position', positionAttr)
    geometry.setAttribute('color', colorAttr)

    // Material
    material = new THREE.PointsMaterial({
        size: params.size,
        sizeAttenuation: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
    })

    // Points
    points = new THREE.Points(geometry, material)
    scene.add(points)
}
generateGalaxy()

// LIL-GUI
gui.add(params, 'count').min(100).max(100000).step(100).onChange(generateGalaxy)
gui.add(params, 'size').min(0.001).max(1).step(0.001).onChange(generateGalaxy)
gui.add(params, 'radius').min(1).max(7).step(0.1).onChange(generateGalaxy)
gui.add(params, 'branches').min(2).max(7).step(1).onChange(generateGalaxy)
gui.add(params, 'spin').min(-7).max(7).step(0.1).onChange(generateGalaxy)
gui.add(params, 'randomness')
    .min(0)
    .max(0.5)
    .step(0.01)
    .onChange(generateGalaxy)
gui.add(params, 'randomnessPower')
    .min(1)
    .max(7)
    .step(0.1)
    .onChange(generateGalaxy)
gui.addColor(params, 'insideColor').onChange(generateGalaxy)
gui.addColor(params, 'outsideColor').onChange(generateGalaxy)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
}

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100
)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Update controls
    controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()
