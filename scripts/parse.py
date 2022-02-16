import json

# TODO:
# - get big json from data & break it into visible information only. That is: course prerequisites, department, course number, and course title
# - will need to do some parsing on the course pre-requisite strings

def parse_prereq(prereq_str, possible_course_names):
    pass

def parse_course_data(year, term):
    # TODO: make this automatic

    with open('../data/2021-spring-coursedata.json', 'r') as f:
        filestr = f.read().rstrip()

    department_list = json.loads(filestr)
    department_list_min = []

    # TODO: fill department list minimum with neccesary & parsed data
    # NOTE: i may want to add more searchable data to this later
    for department in department_list:
        department_min = {}
        department_min["text"] = department["text"]
        department_min["courseList"] = []

        if department["courseList"] == None: 
            department["courseList"] = []
            
        for course in department["courseList"]:
            course_min = {}
            course_min["text"] = course["text"]
            course_min["title"] = course["title"]
            course_min["sectionList"] = []

            if course["sectionList"] == None: 
                course["sectionList"] = []

            for section in course["sectionList"]:
                section_min = {}
                section_min["sectionCode"] = section["sectionCode"]
                section_min["text"] = section["text"]

                # TODO: parse coreqs & prereqs here
                section_min["corequisites"] = section["outline"]["info"]["corequisites"]
                section_min["prerequisites"] = section["outline"]["info"]["prerequisites"]

                course_min["sectionList"] += [section_min]

            department_min["courseList"] += [course_min]
        
        department_list_min += [department_min]

    return department_list_min


if __name__ == "__main__":
    departments = parse_course_data("2021", "spring")

    with open('../data/2021-spring-coursedata-min.json', 'w') as f:
        json.dump(departments, f, separators=(',', ':'))
