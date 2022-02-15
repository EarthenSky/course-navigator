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

// helper

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ----------------------- 
// atom functions

async function getYears() {
    return await fetch("http://www.sfu.ca/bin/wcm/course-outlines")
 
}

async function getTerms(year) {
    return await fetch("http://www.sfu.ca/bin/wcm/course-outlines?" + year)

}

async function getDepartments(year, term) {
    return await fetch("http://www.sfu.ca/bin/wcm/course-outlines?" + year + "/" + term)

}

async function getCourseNumbers(year, term, department) {
    return await fetch("http://www.sfu.ca/bin/wcm/course-outlines?" + year + "/" + term + "/" + department)

}

// this function will do tries requests each 4s apart & will give up if not possible.
// NOTE: this is a poor solution
async function getCourseSections(year, term, department, courseNumber, tries=60) {
    let response = null;
    let numTries = tries;
    while (numTries > 0) {
        try {
            response = await fetch("http://www.sfu.ca/bin/wcm/course-outlines?" + year + "/" + term + "/" + department + "/" + courseNumber)
            return response
        } catch (error) {
            await timeout(5000)
            numTries -= 1;
        }
    }
    
    console.log(`fetch failed ${tries} times`)
    throw new Error(`fetch failed ${tries} times`)
}

// "
async function getCourseOutline(year, term, department, courseNumber, courseOutline, tries=60) {
    let response = null;
    let numTries = tries;
    while (numTries > 0) {
        try {
            response = fetch("http://www.sfu.ca/bin/wcm/course-outlines?" + year + "/" + term + "/" + department + "/" + courseNumber + "/" + courseOutline)
            //response.catch((error) => {
            //    console.log(error)
            //})
            return await response
        } catch {
            await timeout(5000)
            numTries -= 1;
        }
    }
    
    console.log(`outline: fetch failed ${tries} times`)
    throw new Error(`outline: fetch failed ${tries} times`)
}

// ----------------------- 
// specific use-case functions

// NOTE: make sure year and term are valid, or this function will fail
// TODO: do all the requests in parallel using promise.all ?
async function getAllCourseData(year, term) {
    let response = await getDepartments(year, term)
    let departmentList = await response.json();

    console.log(departmentList)

    await Promise.all(departmentList.map(async department => {
        response = await getCourseNumbers(year, term, department.value)
        if (response.ok) {
            department.courseList = await response.json()
            department.empty = false
            console.log(department.courseList.length)
            await Promise.all(department.courseList.map(async course => {
                response = await getCourseSections(year, term, department.value, course.value)
                if (response.ok) {
                    course.sectionList = await response.json()
                    course.empty = false

                    await Promise.all(course.sectionList.map(async section => {
                        response = await getCourseOutline(year, term, department.value, course.value, section.value)
                        if (response.ok) {
                            section.outline = await response.json()
                            section.empty = false
                        } else {
                            section.outline = []
                            section.empty = true
                        }
                    }))              
                } else {
                    course.sectionList = []
                    course.empty = true
                }
            }))
        } else {
            if (response.status != 404) {
                console.log(`unfamiliar response ${response.status}`)
            }
            department.courseList = []
            department.empty = true
        }
    }))

    return departmentList
}

// returns all possible (year, term) pairs
async function getAllTerms() {

}