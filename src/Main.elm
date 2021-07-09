module Main exposing (main)

import String exposing (String, replace, indices, slice)
import String.Extra exposing (clean)
import List exposing (head, tail, map)
import Tuple exposing (first, second)
import Maybe exposing (withDefault)

import Debug
-- import Debug exposing (todo)

import Browser
import Element exposing (Element, el, column, text, padding, rgb255, layout, spacing, explain)
import Element.Font as Font
import Html exposing (Html)

import Regex
import Http

-- TODO: make sure that the program gives a sufficient error when it can't find the anchor points, or if it can't separate the links.
-- TODO: do a restructure afterwards in order to make the source code much simpler.

-- CONST ------------------------------------

courseSubjectPage : String
courseSubjectPage = "https://www.sfu.ca/students/calendar/2021/summer/courses.html"

coursePage : String
coursePage = "https://www.sfu.ca/students/calendar/2021/summer/courses/"

sfuUrl : String
sfuUrl = "https://www.sfu.ca/"

-- MAIN ------------------------------------

main : Program Flags Model Msg
main =
    Browser.element { init = init, update = update, view = view, subscriptions = subscriptions }

-- MODEL ------------------------------------
-- this is where I want to do my scraping 

-- TODO: there has to be a better way to update these records... -> construct things recursively? -> when can we send commands?
-- TODO: fix all the variable names

type alias SubjectRecord = 
    { path : String
    , name : String
    , id : String
    , classRecords : List ClassRecord 
    }

type alias ClassRecord = 
    { path : String
    , id : String
    , name : String
    , credits : Int
    , desc : String
    , prereq : Maybe String
    , coreq : Maybe String 
    }

type Breadth = Hum | Soc | Sci 
             | HumSoc | SocSci | HumSci
             | HumSocSci

-- entries are empty if they can't be found
newSubjectRecord : String -> SubjectRecord
newSubjectRecord listEntry = 
    let 
        halveList = String.split "\">" listEntry
        titleList = String.split " (" (withDefault "" <| second halveList)

        path = replace "<li><a href=\"" "" (withDefault "" <| head halveList)
        name = withDefault "" <| head titleList
        id = replace ")</li>" "" (withDefault "" <| second titleList) 
    in 
        -- class records start empty
        { path = path, name = name, id = id, classRecords = [] } 

updateSubjectRecord : SubjectRecord -> List String -> SubjectRecord
updateSubjectRecord originRecord class_record_entries = 
    { path = originRecord.path
    , name = originRecord.name
    , id = originRecord.id
    , classRecords = map newClassRecord class_record_entries
    } 

-- TODO: this function needs better reporting of parsing errors if the html changes.
-- TODO: this could use a parser...
newClassRecord : String -> ClassRecord
newClassRecord recordString =
    let 
        cleanedString = clean 
            <| replace " " " " -- \t 
            <| replace " " " " -- \n
            <| recordString
        
        halveList = String.split "</h3> <p>" cleanedString
        topQuarterList = String.split "</a> - " (withDefault "" <| head halveList) -- TODO: this may cause problems
        linkAndName = String.split "\">" (withDefault "" <| head topQuarterList)
        tileAndCredits = String.split " (" (withDefault "" <| second topQuarterList)

        pageLink = replace "<h3> <a href=\"" "" (withDefault "" <| head linkAndName)
        classId = withDefault "" <| second linkAndName
        className = withDefault "" <| head tileAndCredits
        credits = replace ") " "" (withDefault "" <| second tileAndCredits)
        fullDesc = String.trim <| replace "</p>" "" (withDefault "" <| second halveList)

        -- TODO: this
        --(prereq, coreq, w, q, breadthKind, desc) = parseRequisites fullDesc
    in 
        { path = pageLink
        , id = classId
        , name = className
        , credits = withDefault -1 <| String.toInt credits
        , desc = fullDesc
        , prereq = Nothing
        , coreq = Nothing
        } 

--parseRequisites : String -> (String, String, Bool, Bool, Breadth, String)
--parseRequisites desc = 
    -- TODO: this

-- TODO: use A parser instead of a regex eventually

type alias Flags = ()
type Model = 
    SubjectRequest 
    | CourseRequest (List SubjectRecord) -- TODO: change the name of this
    | Failure (String)
    

-- TODO: parse the site using html parser, then get a list of subject titles and names.
-- NOTE: will also want a normal parser to handle getting better strings -> regex might be faster than using a parser if I do two passes...

type Msg = 
    GotSubjectPageText (Result Http.Error String)
    | GotClassPageText String (Result Http.Error String)
    --| ProcessCourseNames (String)

init : Flags -> (Model, Cmd Msg)
init _ =
    ( SubjectRequest
    , Http.get { url = courseSubjectPage, expect = Http.expectString GotSubjectPageText }
    )


-- UPDATE ------------------------------------

update : Msg -> Model -> (Model, Cmd Msg)
update msg model = --(model, Cmd.none)
    case msg of
        GotSubjectPageText result -> 
            case result of 
                Ok text -> 
                    case get_subject_names text of
                        Ok courses -> 
                            ( CourseRequest courses 
                            , Cmd.batch <| map (\subjectRecord -> fill_http_get (sfuUrl ++ subjectRecord.path) (Http.expectString (GotClassPageText subjectRecord.path))) courses
                            ) 
                        Err err -> (Failure <| Debug.toString err ++ "\n\nDocument:\n\n" ++ text, Cmd.none)
                Err err -> 
                    (Failure <| Debug.toString err, Cmd.none)
        
        GotClassPageText path result -> -- TODO: update one of the pages & do a request for extended class info.
            case result of
                Ok text -> case get_class_info text path model of
                    Ok courses -> (CourseRequest courses, Cmd.none) -- might only need extended class info to see if it's being offered this semester.
                    Err err -> case model of
                        SubjectRequest -> (Failure <| (Debug.toString err) ++ " branch 2", Cmd.none)
                        CourseRequest _ -> (Failure <| (Debug.toString err) ++ " branch 2", Cmd.none)
                        Failure str -> (Failure <| (Debug.toString err) ++ " branch 2 b/c:\n" ++ str, Cmd.none)
                Err err -> (Failure <| Debug.toString err, Cmd.none)

fill_http_get url expect = Http.get {url = url, expect = expect}


-- SUBSCRIPTIONS ------------------------------------

subscriptions : Model -> Sub Msg
subscriptions model = Sub.none


-- VIEW ------------------------------------

view : Model -> Html Msg
view model = layout [] 
    (case model of 
        SubjectRequest -> 
            el [padding 20, Font.color (rgb255 125 245 35)] (text "loading subject")
        
        Failure err -> 
            el [padding 20, Font.color (rgb255 250 75 15)] (text <| "Failure. Ensure you are connected to the internet and sfu is online, then try again. \nMore info: " ++ err)

        CourseRequest record_list -> 
            column [padding 20, spacing 10]
                (map display_course_subject record_list)  -- TODO: this should have a loading bar with a % loaded.
            
    )

-- TODO: need to display links as they are supposed to be...
display_course_subject : SubjectRecord -> Element Msg
display_course_subject record = 
    column [padding 20, spacing 10] 
        ( [el [] (text <| record.path)] ++ [el [] (text <| Debug.toString record.classRecords)] ++ (map (\cr -> el [] (text <| cr.id ++ " : " ++ cr.desc)) record.classRecords)
        )


-- FUNCTIONS ------------------------------------

get_subject_names : String -> Result String (List SubjectRecord)
get_subject_names html_text = 
    let 
        area_string_result = course_subject_html_slice html_text
    in
        case Regex.fromString("<li><a href=\".*\".*\\(.*\\)</li>") of 
            Just regex -> case area_string_result of 
                Ok area_string -> Ok <| map newSubjectRecord <| map get_match <| Regex.find regex area_string -- TODO: can I combine these functions & do 1 map?
                Err err -> Err err  
            Nothing -> Err "invalid regex"

get_class_info : String -> String -> Model -> Result String (List SubjectRecord)
get_class_info html_text path model = 
    case model of
        SubjectRequest -> 
            Err "current model doesn't support this kind of request: SubjectRequest"

        CourseRequest subjectRecords -> 
            let
                area_string_result = classes_html_slice html_text
                (xRecord, xsRecords) = List.partition (\record -> record.path == path) subjectRecords  -- TODO: add x to the end of xs (we don't care about the order of subjectRecords [Should I use a set?])
                targetRecord = (withDefault (newSubjectRecord "") <| head xRecord)
            in 
                case Regex.fromString("<h3>\\s*<a href=\".*\">.*</a>.*\\s*\\(\\d\\)\\s*</h3>\\s*<p>(.|\\s)*</p>") of 
                    Just regex -> case area_string_result of 
                        Ok area_string -> 
                            let
                                regex_match_strings = map get_match (Regex.find regex area_string)
                                new_record = updateSubjectRecord targetRecord regex_match_strings
                            in
                                Ok <| xsRecords ++ [new_record]
                        Err err -> Err err
                    Nothing -> Err "invalid regex"

        Failure str -> 
            Err ("current model doesn't support this kind of request: Failure, reason: ") --++ str)

get_match : Regex.Match -> String
get_match match = match.match

course_subject_html_slice : String -> Result String String
course_subject_html_slice html = 
    let 
        start = head <| indices "<a name=\"a\"></a>" html
        end = head <| indices "<div class=\"below-main inherited-parsys\">" html
    in
        case start of 
            Just start_index -> case end of 
                Just end_index -> Ok (slice start_index end_index html)
                Nothing -> Err "no end anchor"
            Nothing -> Err "no start anchor"

classes_html_slice : String -> Result String String
classes_html_slice html = 
    let 
        start = head <| indices "<div class=\"parsys\">" html
        end = head <| indices "<div class=\"below-main inherited-parsys\">" html
    in
        case start of 
            Just start_index -> case end of 
                Just end_index -> Ok (slice start_index end_index html)
                Nothing -> Err "no end anchor"
            Nothing -> Err "no start anchor"

-- UTILS ------------------------------------

second : List a -> Maybe a
second list = head <| withDefault [] <| tail list

-- if index is too large, it just adds it to the end of the list
--takeAt : List a -> Int -> (List a, a)
--takeAt list index = 
--    let 
--        front = take index list
--        mid = head list
--        end = list
--    in 
--        (front ++ end, mid)

--insertAt : List a -> Int -> a -> List a
--insertAt list index item = 
--    let 
--        front = take index list
--        end = list
--    in 
--        front ++ item ++ end