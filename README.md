# course-navigator
 "yourSchedule"

### features:
- scrapes the public sfu course outline api
- custom parsing of prerequisites for each course
- three.js canvas draw boxes & connections

### resources:
- https://threejs.org/docs/index.html#manual/en/introduction/Creating-a-scene
- http://www.sfu.ca/outlines/help/api.html

### testing:
- run `python -m http.server 8080` in `src/` directory
- go to `http://localhost:8080/`

### data:
- data stores cached versions of ~25mb of public course outline data per semester, taken over ~30k api requests each. Needless to say, a single js request is much faster than 30k.
- do `pip install -r requirements.txt` before running python scripts

### history:
 The first implementation of this was written in elm, and didn't use the sfu api. I switched to three.js so I could hack something together somewhat quickly.
