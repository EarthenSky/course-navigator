const canvas = document.getElementById('canvas');

var cameraX = 0
var cameraY = 0

const pointer = {x: 0, y: 0}
var cameraTarget = {x: 0, y: 0}
var pointerDown = false

var root = {}

// -------------------

function draw() {
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //ctx.transform(1, 0, 0, 1, 30, 10);
    ctx.transform(1, 0, 0, 1, cameraX, cameraY);

    ctx.font = '48px sans';
    ctx.fillText('Hello world', 20, 50);
    
    ctx.fillStyle = "#cf4";
    ctx.fillRect(130, 190, 40, 60);

    ctx.resetTransform();
}

function update() {
    //cameraX += 1
    console.log(cameraX)
}

function animate() {
    requestAnimationFrame(animate)
    
    //renderer.render(scene, camera)
    update()
    draw()
}

// --------------------------------- 

function onPointerMove(event) {
    updatePointer(event)

    // TODO: hover support
}

function onPointerDown(event) {
    pointerDown = true

    updatePointer(event)
    
    // TODO: this /*renderer*/document.domElement.cursor = 'move'
}

function onPointerCancel() {
    pointerDown = false;
}

function updatePointer(event) {
    // TODO: fix this
    const rect = canvas.getBoundingClientRect()

    let pointerLastX = pointer.x
    let pointerLastY = pointer.y

    pointer.x = -( event.clientX - rect.left ) / rect.width * 300
    //console.log(event.clientX)
    pointer.y = -( event.clientY - rect.top ) / rect.height * 300

    if (pointerDown) {
        cameraTarget.x -= /*camera.viewSize * */ (pointer.x - pointerLastX)
        cameraTarget.y -= /*-camera.viewSize * */ (pointer.y - pointerLastY) /* / camera.aspect */

        cameraX = cameraTarget.x;
        cameraY = cameraTarget.y;  
    }

}

function onScroll(event) {
    // TODO: add a zoom
    //camera.viewSize *= event.deltaY > 0 ? 1.15 : 0.75;
    updateViewport()
}

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
    
    // testing text
    root.font = await loadFont()
    root.text_geom = createText("some text", root.font)
    root.material = new THREE.MeshBasicMaterial({color: 0xffffff})
    root.text = new THREE.Mesh(root.text_geom, root.material)
    scene.add(root.text)*/
    
    // input
    //var transformControls = new THREE.TransformControls(camera, renderer.domElement)
    //transformControls.addEventListener('change', render)

    canvas.addEventListener( 'pointermove', onPointerMove )
    canvas.addEventListener( 'pointerdown', onPointerDown )
    canvas.addEventListener( 'pointerup', onPointerCancel )
    canvas.addEventListener( 'pointerleave', onPointerCancel )
    canvas.addEventListener( 'wheel', onScroll );

    // init
    let response = await fetch("https://raw.githubusercontent.com/EarthenSky/course-navigator/main/data/2021-spring-coursedata-min.json")
    let departmentList = await response.json()

    //console.log(departmentList)

    root.courseNodes = []

    /*
    departmentList.forEach(department => {
        department.courseList.forEach(course => {
            root.courseNodes.push({name : department.text + " " + course.text, color: department.color})
        })
    })

    //console.log(root.courseNodes)

    root.courseNodes.forEach(el => {
        //scene.add(el);
    });*/

}

start()
draw()
animate()
