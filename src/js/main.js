// --------------------------------- 
// debug

main()

async function main() {  
    let years = await getYears()
    console.log(years)

    let terms = await getTerms(years[4].value)
    console.log(terms)

    let departments = await getDepartments(years[4].value, terms[1].value)
    console.log(departments)

    let courseNumbers = await getCourseNumbers(years[4].value, terms[1].value, departments[27].value)
    console.log(courseNumbers)

    let courseSections = await getCourseSections(years[4].value, terms[1].value, departments[27].value, courseNumbers[7].value)
    console.log(courseSections)

    let courseOutline = await getCourseOutline(years[4].value, terms[1].value, departments[27].value, courseNumbers[7].value, courseSections[0].value)
    console.log(courseOutline)

}

function start() {

}

function update() {
    cube.rotation.x += 0.01
    cube.rotation.y += 0.01
}

// --------------------------------- 
// load control

function loadMain() {
    const geometry = new THREE.BoxGeometry()
    const material = new THREE.MeshBasicMaterial( { color: 0xf0ff40 } )
    const cube = new THREE.Mesh(geometry, material)
    scene.add(cube)

    // TODO: look into how we should be loading & unloading models from the scene / if we should have multiple scenes.
    //scene.get
    
    camera.position.z = 5
}