
var courseData = null

const pointer = new THREE.Vector2()
var pointerDown = false

const cameraTarget = new THREE.Vector2()

//network_test()

// --------------------------------- 

async function start() {
    // data
    //courseData = getAllCourseData("2021", "spring")

    // geometry
    
    /*
    root.geometry = new THREE.BoxGeometry()
    root.material = new THREE.MeshBasicMaterial( { color: 0xf0ff40 } )
    root.cube = new THREE.Mesh(root.geometry, root.material)
    scene.add(root.cube) // TODO: look into how we should be loading & unloading models from the scene / if we should have multiple scenes.
    */
    
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
    response = await fetch("https://raw.githubusercontent.com/EarthenSky/course-navigator/main/data/2021-spring-coursedata-min.json")
    departmentList = await response.json()


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

function generateCourseNodes() {

}

async function loadFont() {
    let json;
    let fontText = await fetch("https://raw.githubusercontent.com/EarthenSky/course-navigator/main/src/fonts/RobotoSerif36ptBlack_Regular.json")
    try {  
        json = JSON.parse( fontText );
    } catch (e) {
        console.warn('THREE.FontLoader: typeface.js support is being deprecated. Use typeface.json instead.')
        json = JSON.parse( fontText.substring(65, fontText.length - 2) )
    }

    return Font(json)
}

function createText(text, font) {
    const loader = new THREE.FontLoader()
    
    let geometry = null
    
    // wait until font != null
    while (geometry == null) {
        timeout(100);
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

// TODO: test this
if ( WebGL.isWebGLAvailable() ) {
    start()
	animate()
} else {
	const warning = WebGL.getWebGLErrorMessage()
	document.getElementById( 'container' ).appendChild( warning )
}