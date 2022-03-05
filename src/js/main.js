import * as THREE from 'https://cdn.skypack.dev/three@0.136.0';
import { TextGeometry } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/geometries/TextGeometry.js';
import { Font } from 'https://cdn.skypack.dev/three@0.136.0/examples/jsm/geometries/TextGeometry.js';
//import WebGL from 'https://cdn.skypack.dev/three@0.137.5/examples/jsm/capabilities/WebGL.js';

//import { OrbitControls } from 'https://cdn.skypack.dev/three@0.137.5/examples/jsm/controls/OrbitControls.js';

//const THREE = await import('https://cdn.skypack.dev/three@0.130.0')
//const { OrbitControls } = await import('https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls.js')

// --------------------------------- 
// setup scene & renderer

const scene = new THREE.Scene()
// TODO: make this orthographic & figure out how to draw boxes & text
//const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
const camera = new THREE.OrthographicCamera(-5, 5, 5, -5, 0, 10)
camera.viewSize = 5.0
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

window.addEventListener('resize', updateViewport, false)
updateViewport()

function updateViewport() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.left = -camera.viewSize
    camera.right = camera.viewSize
    camera.top = -camera.viewSize * (1 / camera.aspect)
    camera.bottom = camera.viewSize * (1 / camera.aspect)
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

// ---------------------------------

var courseData = null

const pointer = new THREE.Vector2()
var pointerDown = false

const cameraTarget = new THREE.Vector2()

// --------------------------------- 

async function start() {
    // data
    //courseData = getAllCourseData("2021", "spring")

    // geometry
    
    root.geometry = new THREE.BoxGeometry()
    root.material = new THREE.MeshBasicMaterial( { color: 0xf0ff40 } )
    root.cube = new THREE.Mesh(root.geometry, root.material)
    scene.add(root.cube) // TODO: look into how we should be loading & unloading models from the scene / if we should have multiple scenes.
    
    // testing text
    root.font = await loadFont()
    root.text_geom = createText("some text", root.font)
    root.material = new THREE.MeshBasicMaterial({color: 0xffffff})
    root.text = new THREE.Mesh(root.text_geom, root.material)
    scene.add(root.text)
    
    // input
    //var transformControls = new THREE.TransformControls(camera, renderer.domElement)
    //transformControls.addEventListener('change', render)

    renderer.domElement.addEventListener( 'pointermove', onPointerMove )
    renderer.domElement.addEventListener( 'pointerdown', onPointerDown )
    renderer.domElement.addEventListener( 'pointerup', onPointerCancel )
    renderer.domElement.addEventListener( 'pointerleave', onPointerCancel )
    renderer.domElement.addEventListener( 'wheel', onScroll );

    // init
    let response = await fetch("https://raw.githubusercontent.com/EarthenSky/course-navigator/main/data/2021-spring-coursedata-min.json")
    let departmentList = await response.json()

    //console.log(departmentList)

    root.courseNodes = []

    departmentList.forEach(department => {
        department.courseList.forEach(course => {
            root.courseNodes.push({name : department.text + " " + course.text, color: department.color})
        })
    })

    //console.log(root.courseNodes)

    root.courseNodes.forEach(el => {
        //scene.add(el);
    });

}

function update() {
    //root.cube.rotation.x += 0.01
    //root.cube.rotation.y += 0.01

    camera.position.x = cameraTarget.x
    camera.position.y = cameraTarget.y
}

// ---------------------------------
// derived from https://github.com/mrdoob/three.js/blob/master/examples/jsm/controls/DragControls.js

function onPointerMove(event) {
    updatePointer(event)

    // TODO: hover support
}

function onPointerDown(event) {
    pointerDown = true

    updatePointer(event)
    
    renderer.domElement.cursor = 'move'
}

function onPointerCancel() {
    pointerDown = false;
}

function updatePointer(event) {
    const rect = renderer.domElement.getBoundingClientRect()

    let pointerLastX = pointer.x
    let pointerLastY = pointer.y

    pointer.x = ( event.clientX - rect.left ) / rect.width * 2 - 1
    pointer.y = -( event.clientY - rect.top ) / rect.height * 2 + 1

    if (pointerDown) {
        cameraTarget.x -= camera.viewSize * (pointer.x - pointerLastX)
        cameraTarget.y -= -camera.viewSize * (pointer.y - pointerLastY) / camera.aspect
    }
}

function onScroll(event) {
    camera.viewSize *= event.deltaY > 0 ? 1.15 : 0.75;
    updateViewport()
}

// --------------------------------- 

async function loadFont() {
    let json;
    let response = await fetch("https://raw.githubusercontent.com/EarthenSky/course-navigator/main/src/fonts/RobotoSerif36ptBlack_Regular.json")
    json = await response.json()
    
    // TODO: use real font loaders & stuff

    //return json
    console.log("font loaded")
    return new THREE.Font(json)
}

function createText(text, font) {   
    console.log("createText ...") 
    let geometry = null
    
    // wait until font != null
    if (font == null) {
        //timeout(100)
        console.log("nuuuuuuuuuuu")
    }

    geometry = new TextGeometry(text, {
        font: font,
        size: 80,
        height: 5,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: 10,
        bevelSize: 8,
        bevelOffset: 0,
        bevelSegments: 5
    })

    return geometry
}

// --------------------------------- 

start()
animate()

// TODO: do a webgl check