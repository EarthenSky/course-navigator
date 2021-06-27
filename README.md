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
- 
- update the parser config when the sfu website gets updated.

## Helpfil Sites: TODO: minimize a little.
- https://learnxinyminutes.com/docs/elm/
- https://package.elm-lang.org/packages/elm/core/latest/Basics#Float
- https://package.elm-lang.org/packages/mdgriffith/elm-ui/latest/
- https://package.elm-lang.org/packages/elm/browser/latest/Browser#element
- https://guide.elm-lang.org/effects/http.html
- https://package.elm-lang.org/packages/elm/http/latest/Http
- https://package.elm-lang.org/packages/elm/core/latest/Result
- https://package.elm-lang.org/packages/ianmackenzie/elm-geometry/latest/
- https://elm-visualization.netlify.app/forcedirectedgraph/
- https://www.sfu.ca/students/calendar/2021/summer/courses.html
- https://package.elm-lang.org/packages/elm/core/latest/Platform.Cmd
- file:///.../course-navigator/index.html
- https://package.elm-lang.org/packages/hecrj/html-parser/latest/