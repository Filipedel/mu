import React, {useEffect, useState} from "react";
import {Container, InputGroup, FormControl, Button, Row, Card, Image} from 'react-bootstrap'
import "bootstrap/dist/css/bootstrap.min.css";
import {handleRelease} from "../../../../public/assets/services/SpotifyApi";

const Release = () => {

//Get playlist matching emotion
const [Playlist,setPlaylist]= useState({});
// not working until data are fetched
const [valid,setvalid]=useState(false);

    const GetRelease = ()=>{
        handleRelease().then(MusicSearch => setPlaylist(MusicSearch))
        .catch(err=>console.log(err));
    };

    return(
        <Container>
        {valid === true ?
            <Row className={"mx-2 row row-cols-4" } >

                {Playlist.items  ? Playlist.items.map( (Playlist) => {
                    return(

                        <Card >
                                    <Card.Img src={(typeof Playlist.images[0] !== 'undefined') ? Playlist.images[0].url :
                                        null
                                    } />
                                    <Card.Title>{Playlist.name}</Card.Title>
                                </Card>)

                }) : null }

            </Row>:<Button onClick={() => {GetRelease();setvalid(true);}}>See Releases</Button>}
            </Container>
    )
}

export default Release;