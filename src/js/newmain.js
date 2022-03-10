const canvas = document.getElementById('canvas');

var cameraX = -2560
var cameraY = -2560

var scale = 1/8

const pointer = {x: 0, y: 0}
var cameraTarget = {x: cameraX, y: cameraY}
var pointerDown = false

// collision info & bounds
const k = 16;  // 32 is best
const MIN_X = 0;
const MIN_Y = 0;
const MAX_X = 16000;
const MAX_Y = 16000;
console.log("assert biggest radius <", MAX_X/k/2)
console.log("takes about 7ms per frame for 2k obj w/ k=16 on my nice cpu.")
console.log("1ms collision detection when k=16")
console.log("0.5ms collision detection when k=32") // this would probably work on old cpus too

var root = {}
root.courseNodes = []
root.collisionBuckets = []

// -------------------

function start() {
    var ctx = canvas.getContext('2d');
    ctx.canvas.width  = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    // add the lists:
    for (let i = 0; i < k*k; i++)
        root.collisionBuckets.push([])

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
        if (department.text != "CMPT") return;
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
            x += 312 + 64
        }

        el.x = x + Math.random(-15, 15)
        el.y = y

        el.velx = 0
        el.vely = 0
    
        y += 128 + 64
    });
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
        ctx.fillText(el.name, el.x - string_radius(el.name), el.y);
        
        ctx.beginPath()
        ctx.strokeStyle = el.color;
        ctx.lineWidth = 8;
        ctx.arc(el.x, el.y, string_radius(el.name), 0, 2*Math.PI, false);
        ctx.stroke();
    });

    ctx.fillStyle = "#894";
    ctx.fillRect(130, 190, 40, 60);

    ctx.resetTransform();
}

function update() {

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
    const base = 10;
    // applies a force from other->obj
    function oneway_collide(target, other) {
        let diffX = target.x-other.x
        let diffY = target.y-other.y
        let sqdist = (diffX*diffX) + (diffY*diffY)
        let dist = Math.sqrt(sqdist)
        if (dist < string_radius(target.name) + string_radius(other.name) + 8) {
            // console.log(string_radius(target.name)) // biggest radius is probably ~140
            target.velx += mod * diffX/4.0 + base * diffX/dist;
            //other.velx -= mod * diffX/4.0 + base * diffX/dist;
            target.vely += mod * diffY/4.0 + base * diffY/dist;
            //other.vely -= mod * diffY/4.0 + base * diffY/dist;
        }
    }

    // apply forces to objects not in buckets
    left.forEach(obj => {
        obj.velx -= mod * (obj.x-MIN_X)/2.0 - base;  
    })
    right.forEach(obj => {
        obj.velx -= mod * (obj.x-MAX_X)/2.0 + base;  
    })
    top.forEach(obj => {
        obj.vely -= mod * (obj.y-MIN_Y)/2.0 - base;  
    })
    bot.forEach(obj => {
        obj.vely -= mod * (obj.y-MAX_Y)/2.0 + base;  
    })

    // do collisions
    for (let bi = 0; bi < root.collisionBuckets.length; bi++) {
        let bucket = root.collisionBuckets[bi];
        for (let i = 0; i < bucket.length; i++) {
            for (let j = i+1; j < bucket.length; j++) {
                // do bidirectional collisions
                oneway_collide(bucket[i], bucket[j]);
                oneway_collide(bucket[j], bucket[i]);
            }
        }

        if (bi + 1 < root.collisionBuckets.length) {
            let bucket2 = root.collisionBuckets[bi + 1];
            for (let i = 0; i < bucket.length; i++) {
                for (let j = 0; j < bucket2.length; j++) {
                    oneway_collide(bucket[i], bucket2[j]);
                }
            }
        }

        if (bi - 1 >= 0) {
            let bucket3 = root.collisionBuckets[bi - 1];
            for (let i = 0; i < bucket.length; i++) {
                for (let j = i+1; j < bucket3.length; j++) {
                    oneway_collide(bucket[i], bucket3[j]);
                }
            }
        }

        if (bi + k < root.collisionBuckets.length) {
            let bucket4 = root.collisionBuckets[bi + k];
            for (let i = 0; i < bucket.length; i++) {
                for (let j = 0; j < bucket4.length; j++) {
                    oneway_collide(bucket[i], bucket4[j]);
                }
            }
        }

        if (bi - k >= 0) {
            let bucket5 = root.collisionBuckets[bi - k];
            for (let i = 0; i < bucket.length; i++) {
                for (let j = i+1; j < bucket5.length; j++) {
                    oneway_collide(bucket[i], bucket5[j]);
                }
            }
        }

        // TODO: collide on corners
        
    }

    root.courseNodes.forEach(el => {
        el.x += el.velx;
        el.y += el.vely;

        el.velx *= 0.5;
        el.vely *= 0.5;
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
    const rect = canvas.getBoundingClientRect()

    let pointerLastX = pointer.x
    let pointerLastY = pointer.y

    pointer.x = -( event.clientX - rect.left ) / rect.width * window.innerWidth
    pointer.y = -( event.clientY - rect.top ) / rect.height * window.innerHeight

    pointer.x /= scale
    pointer.y /= scale

    if (pointerDown) {
        cameraTarget.x -= (pointer.x - pointerLastX)
        cameraTarget.y -= (pointer.y - pointerLastY)

        cameraX = cameraTarget.x
        cameraY = cameraTarget.y
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
