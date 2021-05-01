# course-navigator
 A course prerequiste navigator written in elm which scrapes the public SFU website

## Notes: 
- `bin/` contains the webapp 'binaries' runnable on web-browsers.
- 

## How to build:
- `elm make src/Main.elm` creates an html file with the app in it.
- `elm make src/Main.elm --output=main.js` creates a js file with an embeddable version of the app. (**TODO: check this here** https://guide.elm-lang.org/interop/ )

## Roadmap:
- make an html request to sfu calendar (allow choice of year for graph).
- scrape subject titles.
- scrape all **course-names** for each subject w/ **course-title** and **description**.
- for each course description, remove the quantitaive, breadth sci, w & other characteristics & mark them on the entry.
- for each course description, remove the corequisites & prerequisites & mark them on the entry. <span style="color: red;">The hard part</span>
- for each course name, scrape the course page & determine all past (& future) runnings of that class by going back in time & the proffessor who taught it.
- 
- make a force directed graph of nodes -> TODO: instead of a force directed graph, consider designing a custom graph untangling mechanism that works best in this situation.
- next, create a square box-node for each entry and display them in a 2d space.
- make it so that boxes push away from each other if they're too close.
- make it so that selecting a box opens up a set of past runnings of the course and which proffessor ran the course.
-
- for each proffessor search them on rmp and store the rating.
- 
- cache the updated info every semester (rmp info)
