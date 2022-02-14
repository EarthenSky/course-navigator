// --------------------------------- 

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

    let courseOutlines = await getCourseOutlines(years[4].value, terms[1].value, departments[27].value, courseNumbers[7].value, courseOutlines[0].value)
    console.log(courseOutlines)
}

// --------------------------------- 

main()