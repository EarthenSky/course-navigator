const canvas = document.getElementById('canvas');

var cameraX = 0
var cameraY = 0

var scale = 1

const pointer = {x: 0, y: 0}
var cameraTarget = {x: 0, y: 0}
var pointerDown = false

var root = {}
root.courseNodes = []

// -------------------

function draw() {
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.transform(scale, 0, 0, scale, cameraX, cameraY);

    ctx.font = '48px sans';
    root.courseNodes.forEach(el => {
        ctx.fillStyle = el.color;
        ctx.fillText(el.name, el.x, el.y);
    })

    ctx.fillStyle = "#894";
    ctx.fillRect(130, 190, 40, 60);

    ctx.resetTransform();
}

function update() {
    //cameraX += 1
    //console.log(cameraX)
    //cameraY -= 50
}

function animate() {
    requestAnimationFrame(animate)
    
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

    pointer.x = -( event.clientX - rect.left ) / rect.width * 640
    pointer.y = -( event.clientY - rect.top ) / rect.height * 640

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

    console.log(departmentList)
   
    departmentList.forEach(department => {
        department.courseList.forEach(course => {
            root.courseNodes.push({name : department.text + " " + course.text, color: department.color})
        })
    })

    //console.log(root.courseNodes)

    let y = 20
    root.courseNodes.forEach(el => {
        el.x = 10
        el.y = y
        y += 48
    });

}

start()
draw()
animate()
