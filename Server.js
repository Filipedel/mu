
import express from "express";

import path from "path";
const __dirname = path.resolve()

import spotify from "spotify-web-api-node";
import cookieParser from "cookie-parser";
import _ from 'lodash';
import alert from "alert";
import * as dotenv from 'dotenv'
import {RandGenre} from "./Front/src/Component/genre/genre.js"

 dotenv.config()


const server = express();

server.use(express.json());
server.use(cookieParser("USER"));
server.use(express.static('Front/build'));

///PLAYLIST and Home PAGE

// form who cames from front
let User ;
let Emotion;
let itemid;


//time refresh token variable

const Secret = process.env.Secret
const Client = process.env.ClientID

const spotifytoken = new  spotify({
  clientId: Client,
  clientSecret: Secret,
})


const  TokenRefresh = ()=>{
    spotifytoken.clientCredentialsGrant().then(
    function(data) {
        console.log('The access token expires in ' + data.body['expires_in']);
        console.log('The access token is ' + data.body['access_token']);

        // Save the access token so that it's used in future calls
        spotifytoken.setAccessToken(data.body['access_token']);
    },
    function(err) {
        console.log('Something went wrong when retrieving an access token', err);
    }
)};

//Beginning
setTimeout(()=>{TokenRefresh()},0);
//loop infinitely
setInterval(()=>{TokenRefresh();
    alert("Rafraichir")},3.61e+6);

// receive emotion from front
server.post("/search",(req,res)=>{
    const { emo } = req.body;
    if (! emo){
        return res.status(400).send({status:'failed'});
    }
  Emotion = emo;   
    })

//sending Tracks matching emotion
server.get("/emotion", (req, res)=>{
    spotifytoken.searchTracks("track:"+Emotion+" year:2020-2022")
         .then(function(data) {
             console.log('Search by '+Emotion, data.body);
             res.send({
                DataEmotion: data.body
             });
         }, function(err) {
             console.error(err);
         });
})
// get new releases
server.get("/release",(req,res)=>{
    spotifytoken.getNewReleases({ limit : 20, offset: 0, country: 'FR' })
  .then(function(data) {
      res.send({
        DataRelease: data.body
      })
    }, function(err) {
       console.log("Something went wrong!", err);
    });
  });

//recieved user from front to put into cookie

server.post("/playlist",(req,res) => {
    const { user } = req.body;
    if (! user){
        return res.status(400).send({status:'failed'});
    }
    res.cookie("USERID", user.toString(),{
        sameSite:"none",
        secure: true
    }).send("cookie set");
    User = user;

})


//sending request tracks by genre 
server.get("/jour", (req, res)=>{
    var genre = RandGenre();
    var tab = [];
    var result;
    var popMax = 0; 
    // fait 50 requetes pour avoir 1000 musique diff??rentes 
        for(let i = 0; i < 50;i++){
            spotifytoken.searchTracks("genre:"+genre,{offset: i*20})
         .then(function(data) {
            result = data.body.tracks; 
            // v??rifie que chaque element de la requete satisfait un minimum de popularit??
            for (const [key, value] of Object.entries(result.items)) {
                if(value?.popularity > popMax && value?.popularity > 30){
                    tab.push(value);
                    // modifie la popularit?? maximum en accordance avec les derniers titres ajout??
                    if(value?.popularity > popMax){
                        popMax = value.popularity;
                    }
                }
              }
            if(i == 49){
                // filtre les titres n'ayant pas la popularit?? maximal
                for(let y = 0; y < tab.length; y++){
                    if(tab[y].popularity < popMax){
                        tab.splice(y,1);
                    }
                }
                // si plusieurs titre poss??de la meme popularit??, on en garde juste 1
                if(tab.length > 1){
                    tab.splice(0,tab.length - 1);
                }
                console.log(tab);
                  res.send({
                      DataJour: tab[0]
                  });
            }
         }, function(err) {
             console.error(err);
         });
        }
})

//sending request playlist and user
server.get("/playlist", (req, res)=>{
    spotifytoken.getUserPlaylists(User)
        .then(function(data) {
            console.log('Retrieved playlists', data.body);
            res.send({
                Dataplaylist: data.body
            });
        },function(err) {
            console.log('Something went wrong!', err);
        });
})

server.get("/home",(req,res)=>{
    spotifytoken.getUser(User)
        .then(function(data) {
            console.log('Retrieved UserStory', data.body);
            res.send({
                DataUser: data.body
            });
        },function(err) {
            console.log('Something went wrong!', err);
        });
})
//recieved id from front to get playlist items

server.post("/playlist/id",(req,res) => {
    const { id } = req.body;
    if (! id){
        return res.status(400).send({status:'failed'});
    }
    itemid = id;
    console.log(itemid)

})
//sending request playlistitems
server.get("/playlistitems", (req, res)=>{
    spotifytoken.getPlaylistTracks(itemid).then(function (data){
        console.log('Retrieved items', data.body);
        res.send({
            Playlistitems: data.body
        })
    },function (err){
        console.log('Something went wrong!', err);
    })

})





server.get("/*", (req, res)=>{
    res.sendFile(path.join(__dirname, './Front/build/index.html'))

})


const PORT = process.env.PORT || 8888;
  
server.listen(PORT, console.log(`Server started on port ${PORT}`));




export  default server;