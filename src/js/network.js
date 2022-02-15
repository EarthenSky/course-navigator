// functions for interacting with the sfu course outlines REST API
// see: http://www.sfu.ca/outlines/help/api.html

// ----------------------- 

async function network_test() {  
    let years = await getYears()
    console.log(years)

    let terms = await getTerms(years[6].value)
    console.log(terms)

    let departments = await getDepartments(years[4].value, terms[1].value)
    console.log(departments)

    let courseNumbers = await getCourseNumbers(years[4].value, terms[1].value, departments[59].value)
    console.log(courseNumbers)

    let courseSections = await getCourseSections(years[4].value, terms[1].value, departments[59].value, courseNumbers[3].value)
    console.log(courseSections)

    let courseOutline = await getCourseOutline(years[4].value, terms[1].value, departments[59].value, courseNumbers[3].value, courseSections[0].value)
    console.log(courseOutline)

}

// ----------------------- 
// atom functions

async function getYears() {
    let response = await fetch("http://www.sfu.ca/bin/wcm/course-outlines")
    if (!response.ok) {
        throw new Error(`Request failed with status ${reponse.status}`)
    }

    // returns a promise
    return response.json()
}

async function getTerms(year) {
    let response = await fetch("http://www.sfu.ca/bin/wcm/course-outlines?" + year)
    if (!response.ok) {
        throw new Error(`Request failed with status ${reponse.status}`)
    }

    // returns a promise
    return response.json()
}

async function getDepartments(year, term) {
    let response = await fetch("http://www.sfu.ca/bin/wcm/course-outlines?" + year + "/" + term)
    if (!response.ok) {
        throw new Error(`Request failed with status ${reponse.status}`)
    }

    // returns a promise
    return response.json()
}

async function getCourseNumbers(year, term, department) {
    let response = await fetch("http://www.sfu.ca/bin/wcm/course-outlines?" + year + "/" + term + "/" + department)
    if (!response.ok) {
        throw new Error(`Request failed with status ${reponse.status}`)
    }

    // returns a promise
    return response.json()
}

async function getCourseSections(year, term, department, courseNumber) {
    let response = await fetch("http://www.sfu.ca/bin/wcm/course-outlines?" + year + "/" + term + "/" + department + "/" + courseNumber)
    if (!response.ok) {
        throw new Error(`Request failed with status ${reponse.status}`)
    }

    // returns a promise
    return response.json()
}

async function getCourseOutline(year, term, department, courseNumber, courseOutline) {
    let response = await fetch("http://www.sfu.ca/bin/wcm/course-outlines?" + year + "/" + term + "/" + department + "/" + courseNumber + "/" + courseOutline)
    if (!response.ok) {
        throw new Error(`Request failed with status ${reponse.status}`)
    }

    // returns a promise
    return response.json()
}

// ----------------------- 
// specific use-case functions

async function getAllCourseData(year, term) {

}

// returns all possible (year, term) pairs
async function getAllTerms() {

}