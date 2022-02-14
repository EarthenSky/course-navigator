// functions for interacting with the sfu course outlines REST API
// see: http://www.sfu.ca/outlines/help/api.html

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