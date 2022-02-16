# this file grabs json from the sfu api
import requests, json, asyncio
import aiohttp

# -------------------------------
# atoms

def getYears():
    return requests.get("http://www.sfu.ca/bin/wcm/course-outlines")

def getTerms(year):
    return requests.get("http://www.sfu.ca/bin/wcm/course-outlines?" + year)

def getDepartments(year, term):
    return requests.get("http://www.sfu.ca/bin/wcm/course-outlines?" + year + "/" + term)

async def getCourseNumbers(session, year, term, department):
    url = "http://www.sfu.ca/bin/wcm/course-outlines?" + year + "/" + term + "/" + department

    try:    
        async with session.get(url=url) as response:
            response = await response.read()
            response = json.loads(response)
            if "errorMessage" in response and response["errorMessage"] == 'Invalid Query String or Object does not exist.':
                return None
            else:
                return response 
    except Exception as e:
        print("Unable to get url {} due to {}.".format(url, e.__class__))
        return None

# GET {base-url}?{year}/{term}/{department}/{courseNumber}
async def getCourseSections(session, year, term, department, courseNumber):
    url = "http://www.sfu.ca/bin/wcm/course-outlines?" + year + "/" + term + "/" + department + "/" + courseNumber

    try:    
        async with session.get(url=url) as response:
            response = await response.read()
            response = json.loads(response)
            if "errorMessage" in response and response["errorMessage"] == 'Invalid Query String or Object does not exist.':
                return None
            else:
                return response 
    except Exception as e:
        print("Unable to get url {} due to {}.".format(url, e.__class__))
        return None

async def getCourseOutline(session, year, term, department, courseNumber, courseOutline):
    url = "http://www.sfu.ca/bin/wcm/course-outlines?" + year + "/" + term + "/" + department + "/" + courseNumber + "/" + courseOutline

    try:    
        async with session.get(url=url) as response:
            response = await response.read()
            response = json.loads(response)
            if "errorMessage" in response and response["errorMessage"] == 'Invalid Query String or Object does not exist.':
                return None
            else:
                return response 
    except Exception as e:
        print("Unable to get url {} due to {}.".format(url, e.__class__))
        return None


# ----------------------- 
# specific use-case functions

# all courses in all departments
async def getAllCourseNumbers(year, term, departmentList):
    async with aiohttp.ClientSession() as session:
        requests = [getCourseNumbers(session, year, term, department["value"]) for department in departmentList]
        ret = await asyncio.gather(*requests)
        return ret

# all sections for all courses in a single department
async def getAllCourseSections(year, term, department, courseList):
    async with aiohttp.ClientSession() as session:
        requests = [getCourseSections(session, year, term, department, course["value"]) for course in courseList]
        ret = await asyncio.gather(*requests)
        return ret

# NOTE: this is likely not parallel enough
# all outlines for a specific course
async def getAllCourseOutlines(year, term, department, course, sectionList):
    async with aiohttp.ClientSession() as session:
        requests = [getCourseOutline(session, year, term, department, course, section["value"]) for section in sectionList]
        ret = await asyncio.gather(*requests)
        return ret

def getAllCourseData(year, term):
    response = getDepartments(year, term)
    departmentList = json.loads(response.text)

    courseListList = asyncio.run(getAllCourseNumbers(year, term, departmentList))

    for department, courseList in zip(departmentList, courseListList):
        #print("======================")
        #print(department["value"])
        #print(str(courseList)[:79])

        if courseList != None:
            sectionListList = asyncio.run(getAllCourseSections(year, term, department["value"], courseList))
            for course, sectionList in zip(courseList, sectionListList):
                if sectionList != None:
                    outlineList = asyncio.run(getAllCourseOutlines(year, term, department["value"], course["value"], sectionList))
                    for section, outline in zip(sectionList, outlineList):
                        section["outline"] = outline

                course["sectionList"] = sectionList
    
        department["courseList"] = courseList

    return departmentList

# returns all possible (year, term) pairs
def getAllTerms():
    pass


if __name__ == "__main__":
    departments = getAllCourseData("2021", "spring")

    with open('../data/2021-spring-coursedata.json', 'w') as f:
        json.dump(departments, f, separators=(',', ':'))
