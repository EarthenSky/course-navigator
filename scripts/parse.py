import json

# TODO:
# - get big json from data & break it into visible information only. That is: course prerequisites, department, number, and title
# - will need to do some parsing on the course pre-requisite strings

def parse_prereq(prereq_str, possible_course_names):
    pass

def parse_course_data(year, term):
    # TODO: make this automatic

    with open('data.txt', 'r') as file:
        filestr = file.read().rstrip()

    department_list = json.loads(filestr)
    department_list_minimum = []

    # TODO: fill department list minimum with neccesary & parsed data


if __name__ == "__main__":
    departments = parse_course_data("2021", "spring")

    with open('../data/2021-spring-coursedata-minimum.json', 'w') as f:
        json.dump(departments, f, separators=(',', ':'))
