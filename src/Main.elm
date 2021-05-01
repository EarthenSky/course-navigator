module Main exposing (main)

import Browser
import Html exposing (Html)
-- import Debug exposing (todo)

import Element exposing (Element, el, column, text, padding, rgb255, layout, spacing, explain)
--import Element.Input as Input
import Element.Font as Font

import Http


-- CONST
--

courseSubjectPage = "https://www.sfu.ca/students/calendar/2021/summer/courses.html"
coursePage = "https://www.sfu.ca/students/calendar/2021/summer/courses/"


-- MAIN
--

main : Program Flags Model Msg
main =
    Browser.element { init = init, update = update, view = view, subscriptions = subscriptions }


-- MODEL 
-- this is where I want to do my scraping 

type alias Flags = ()
type Model = 
    SubjectRequest 
    | Failure
    | CourseRequest ( String )
    

-- TODO: make an http request

type Msg = GotSiteText (Result Http.Error String)

init : Flags -> (Model, Cmd Msg)
init _ =
    ( SubjectRequest
    , Http.get { url = courseSubjectPage, expect = Http.expectString GotSiteText }
    )


-- UPDATE
-- for my current purposes, update can be the indentity function

update : Msg -> Model -> (Model, Cmd Msg)
update msg model = --(model, Cmd.none)
    case msg of
        GotSiteText result -> 
            case result of 
                Ok text -> 
                    (CourseRequest (text), Cmd.none)
                
                Err _ -> 
                    (Failure, Cmd.none)


-- SUBSCRIPTIONS

subscriptions : Model -> Sub Msg
subscriptions model = Sub.none


-- VIEW

view : Model -> Html Msg
view model = layout [] 
    (case model of 
        SubjectRequest -> 
            el [padding 20, Font.color (rgb255 125 245 35)] (text "loading subject")
        
        Failure -> 
            el [padding 20, Font.color (rgb255 250 75 15)] (text "Failure. Ensure you are connected to the internet and sfu is online, then try again.")

        CourseRequest content -> 
            column [padding 20, spacing 10]
                [ el [] (text content)
                ]
    )
