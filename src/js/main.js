
import * as THREE from 'https://cdn.skypack.dev/three@<version>';

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
    //root.material = new THREE.MeshBasicMaterial({color: 0xffffff})
    //root.text = new THREE.Mesh(root.text_geom, root.material)
    //scene.add(root.text)
    
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

// NOTE:
// not my code
class Font {
	constructor( data ) {
		this.type = 'Font';
		this.data = data;
	}

	generateShapes( text, size = 100 ) {
		const shapes = [];
		const paths = createPaths( text, size, this.data );

		for ( let p = 0, pl = paths.length; p < pl; p ++ ) {
			Array.prototype.push.apply( shapes, paths[ p ].toShapes() );
		}
		return shapes;
	}
}

function createPaths( text, size, data ) {

	const chars = Array.from( text );
	const scale = size / data.resolution;
	const line_height = ( data.boundingBox.yMax - data.boundingBox.yMin + data.underlineThickness ) * scale;

	const paths = [];

	let offsetX = 0, offsetY = 0;

	for ( let i = 0; i < chars.length; i ++ ) {

		const char = chars[ i ];

		if ( char === '\n' ) {

			offsetX = 0;
			offsetY -= line_height;

		} else {

			const ret = createPath( char, scale, offsetX, offsetY, data );
			offsetX += ret.offsetX;
			paths.push( ret.path );

		}

	}

	return paths;

}

function createPath( char, scale, offsetX, offsetY, data ) {

	const glyph = data.glyphs[ char ] || data.glyphs[ '?' ];

	if ( ! glyph ) {

		console.error( 'THREE.Font: character "' + char + '" does not exists in font family ' + data.familyName + '.' );

		return;

	}

	const path = new ShapePath();

	let x, y, cpx, cpy, cpx1, cpy1, cpx2, cpy2;

	if ( glyph.o ) {

		const outline = glyph._cachedOutline || ( glyph._cachedOutline = glyph.o.split( ' ' ) );

		for ( let i = 0, l = outline.length; i < l; ) {

			const action = outline[ i ++ ];

			switch ( action ) {

				case 'm': // moveTo

					x = outline[ i ++ ] * scale + offsetX;
					y = outline[ i ++ ] * scale + offsetY;

					path.moveTo( x, y );

					break;

				case 'l': // lineTo

					x = outline[ i ++ ] * scale + offsetX;
					y = outline[ i ++ ] * scale + offsetY;

					path.lineTo( x, y );

					break;

				case 'q': // quadraticCurveTo

					cpx = outline[ i ++ ] * scale + offsetX;
					cpy = outline[ i ++ ] * scale + offsetY;
					cpx1 = outline[ i ++ ] * scale + offsetX;
					cpy1 = outline[ i ++ ] * scale + offsetY;

					path.quadraticCurveTo( cpx1, cpy1, cpx, cpy );

					break;

				case 'b': // bezierCurveTo

					cpx = outline[ i ++ ] * scale + offsetX;
					cpy = outline[ i ++ ] * scale + offsetY;
					cpx1 = outline[ i ++ ] * scale + offsetX;
					cpy1 = outline[ i ++ ] * scale + offsetY;
					cpx2 = outline[ i ++ ] * scale + offsetX;
					cpy2 = outline[ i ++ ] * scale + offsetY;

					path.bezierCurveTo( cpx1, cpy1, cpx2, cpy2, cpx, cpy );

					break;

			}

		}

	}

	return { offsetX: glyph.ha * scale, path: path };
}


async function loadFont() {
    let json;
    let response = await fetch("https://raw.githubusercontent.com/EarthenSky/course-navigator/main/src/fonts/RobotoSerif36ptBlack_Regular.json")
    json = await response.json()
    
    /*
    try {  
        json = JSON.parse( fontText );
    } catch (e) {
        console.warn('THREE.FontLoader: typeface.js support is being deprecated. Use typeface.json instead.')
        json = JSON.parse( fontText.substring(65, fontText.length - 2) )
    }*/

    //return json
    console.log("font loaded")
    return new Font(json)
}

function createText(text, font) {   
    console.log("createText ...") 
    let geometry = null
    
    // wait until font != null
    if (font == null) {
        //timeout(100)
        console.log("nuuuuuuuuuuu")
    }

    geometry = new THREE.TextGeometry(text, {
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
