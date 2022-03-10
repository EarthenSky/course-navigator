const canvas = document.getElementById('canvas');

var cameraX = 0
var cameraY = 0

var scale = 1

const pointer = {x: 0, y: 0}
var cameraTarget = {x: 0, y: 0}
var pointerDown = false

// collision info & bounds
const k = 1;
const MIN_X = 0;
const MIN_Y = 0;
const MAX_X = 16000;
const MAX_Y = 16000;

var root = {}
root.courseNodes = []
root.collisionBuckets = []

// -------------------

function start() {
    // add the lists:
    for (let i = 0; i < k*k; i++)
        root.collisionBuckets.push([])

    //console.log(root.collisionBuckets)
}

async function async_start() {
    // input:
    canvas.addEventListener( 'pointermove', onPointerMove )
    canvas.addEventListener( 'pointerdown', onPointerDown )
    canvas.addEventListener( 'pointerup', onPointerCancel )
    canvas.addEventListener( 'pointerleave', onPointerCancel )
    canvas.addEventListener( 'wheel', onScroll );

    // grab data:
    let response = await fetch("https://raw.githubusercontent.com/EarthenSky/course-navigator/main/data/2021-spring-coursedata-min.json")
    let departmentList = await response.json()

    console.log(departmentList)
   
    departmentList.forEach(department => {
        department.courseList.forEach(course => {
            root.courseNodes.push({name : department.text + " " + course.text, color: department.color})
        })
    })

    // set initial locations:
    let y = 0
    let x = 100
    root.courseNodes.forEach(el => {
        if (y >= MAX_Y) {
            y = 0
            x += 312 + 64 // TODO: add const
            console.log(x)
        }

        el.x = x + Math.random(-15, 15)
        el.y = y

        el.velx = 0
        el.vely = 0
    
        y += 128 + 64
    });
    
    console.log("done")
}

function draw() {
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.transform(1, 0, 0, 1, canvas.width/2, canvas.height/2);
    ctx.transform(scale, 0, 0, scale, 0, 0);
    ctx.transform(1, 0, 0, 1, cameraX, cameraY);

    ctx.font = '48px mono';
    root.courseNodes.forEach(el => {
        ctx.fillStyle = el.color;
        ctx.fillText(el.name, el.x, el.y);
        
        ctx.beginPath()
        ctx.strokeStyle = el.color;
        ctx.lineWidth = 3;
        ctx.arc(el.x + string_radius(el.name), el.y , string_radius(el.name), 0, 2*Math.PI, false);
        ctx.stroke();
    });

    ctx.fillStyle = "#894";
    ctx.fillRect(130, 190, 40, 60);

    ctx.resetTransform();
}

function update() {

    // TODO: add items to buckets

    let left = []
    let right = []
    let top = []
    let bot = []

    root.courseNodes.forEach(el => {
        if (el.x >= MAX_X) {
            right.push(el)
            return;
        } else if (el.x < MIN_X) {
            left.push(el)
            return;
        } else if (el.y >= MAX_Y) {
            bot.push(el)
            return;
        } else if (el.y < MIN_Y) {
            top.push(el)
            return;
        } else if (isNaN(el.x) || isNaN(el.y)) {
            return;
        }

        xi = Math.floor((el.x / (MAX_X)) * k)
        yi = Math.floor((el.y / (MAX_Y)) * k)

        i = xi + yi * k
        root.collisionBuckets[i].push(el)
    }); 

    const mod = 0.02;
    function collide(obj, other) {
        let diffX = obj.x-other.x
        let diffY = obj.y-other.y
        let sqdist = (diffX*diffX) + (diffY*diffY)
        let dist = Math.sqrt(sqdist)
        if (dist < string_radius(obj.name) + string_radius(other.name) + 4) {
            obj.velx += mod * diffX/2.0;
            other.velx -= mod * diffX/2.0;
            obj.vely += mod * diffY/2.0;
            other.vely -= mod * diffY/2.0;
        }
    }

    left.forEach(obj => {
        obj.velx -= mod * (obj.x-MIN_X)/2.0 - 10;  
    })
    right.forEach(obj => {
        obj.velx -= mod * (obj.x-MAX_X)/2.0 + 10;  
    })
    top.forEach(obj => {
        obj.vely -= mod * (obj.y-MIN_Y)/2.0 - 10;  
    })
    bot.forEach(obj => {
        obj.vely -= mod * (obj.y-MAX_Y)/2.0 + 10;  
    })

    // apply forces to objects not in buckets

    // TODO: this

    // do collision between objects in buckets only
    root.collisionBuckets.forEach(bucket => {
        for (let i = 0; i < bucket.length; i++) {
            for (let j = i+1; j < bucket.length; j++) {
                collide(bucket[i], bucket[j]);
            }
        }
    });

    root.courseNodes.forEach(el => {
        el.x += el.velx;
        el.y += el.vely;

        el.velx *= 0.7;
        el.vely *= 0.7;
    });

    // empty buckets
    for (let i = 0; i < k*k; i++)
        root.collisionBuckets[i] = []
        
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

    pointer.x /= scale
    pointer.y /= scale

    if (pointerDown) {
        cameraTarget.x -= /*camera.viewSize * */ (pointer.x - pointerLastX)
        cameraTarget.y -= /*-camera.viewSize * */ (pointer.y - pointerLastY) /* / camera.aspect */

        cameraX = cameraTarget.x;
        cameraY = cameraTarget.y;  
    }

}

function onScroll(event) {
    // TODO: add a zoom
    scale *= event.deltaY > 0 ? 0.75 : 1.25;
    //updateViewport()
}

// --------------------------------- 

start()
async_start()
draw()
animate()
