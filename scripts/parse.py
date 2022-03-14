import json
from typing import Union

from colors import pallete

TODO_prereq_forms = [
    "BC Math 12 or equivalent is recommended.",
    "CMPT 120. Corequisite: CMPT 127.",
    "CMPT 120 or CMPT 128 or CMPT 130. Corequisite: CMPT 125.",
    "CMPT 102 or CMPT 120."
]

static_possible = {
    "BC Math 12 or equivalent is recommended." : "bcmath",
}

# ~2k courses
valid_course_names = set()

# TODO:
# - get big json from data & break it into visible information only. That is: course prerequisites, department, course number, and course title
# - will need to do some parsing on the course pre-requisite strings

# returns (parsed, prereq)
def parse_prereq(prereq: str):
    if prereq == "":
        return (True, prereq)
    elif prereq in static_possible:
        return (True, static_possible[prereq])
    
    tokens = tokenize(prereq)
    if (len(tokens) == 2 or len(tokens) == 3) and "{} {}".format(tokens[0], tokens[1]) in valid_course_names:
        return (True, "{} {}".format(tokens[0], tokens[1]))

    return (False, prereq)

# TODO: write a custom tokenizer
def tokenize(prereq: str) -> "list[str]":
    list = prereq.split(" ")
    
    for token in list:
        if '.' in list:
            token = [token[:-1], token[-1]]

    flat_list = [item for sublist in list for item in sublist]
    return flat_list

def parse_course_data(year: str, term: str):
    # TODO: make this automatic

    i = 0
    j = 0

    with open('../data/2021-spring-coursedata.json', 'r') as f:
        filestr = f.read().rstrip()

    department_list = json.loads(filestr)
    department_list_min = []

    # store all course names first
    global course_names
    for department in department_list:
        if department["courseList"] == None: 
            department["courseList"] = []

        for course in department["courseList"]:
            valid_course_names.add("{} {}".format(department["text"], course["text"]))

    # TODO: fill department list minimum with neccesary & parsed data
    # NOTE: i may want to add more searchable data to this later
    the_pallete = iter(pallete)
    for department in department_list:
        department_min = {}
        department_min["text"] = department["text"]
        department_min["color"] = next(the_pallete)
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

                parsed, prereq = parse_prereq(section["outline"]["info"]["prerequisites"])
                section_min["prerequisites"] = prereq
                section_min["parsed"] = parsed
                if parsed == True:
                    print(department_min["text"] + " " + section_min["text"])
                    print(i)
                    i = i + 1
                j = j + 1

                course_min["sectionList"] += [section_min]

            department_min["courseList"] += [course_min]
        
        department_list_min += [department_min]

    print("final: ")
    print(j)

    return department_list_min


if __name__ == "__main__":
    departments = parse_course_data("2021", "spring")

    with open('../data/2021-spring-coursedata-min-2022-03-11.json', 'w') as f:
        json.dump(departments, f, separators=(',', ':'))
