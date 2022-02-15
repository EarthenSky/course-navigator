
// --------------------------------- 
// setup scene & renderer

const scene = new THREE.Scene()
// TODO: make this orthographic & figure out how to draw boxes & text
//const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const camera = new THREE.OrthographicCamera(-5, 5, 5, -5, 0, 10)
camera.position.z = 5

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight, false)
renderer.powerPreference = "low-power" // TODO: check that the syntax here is correct
document.body.appendChild(renderer.domElement)

// --------------------------------- 
// objects

const root = {}

// --------------------------------- 
// for window resizing

window.addEventListener('resize', onWindowResize, false)

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight, false)
}

// --------------------------------- 
// main loop

function animate() {
    requestAnimationFrame(animate)
    update()
    renderer.render(scene, camera)
}