const clientId="18586c6fabca49ac8377a9a31dc5d055"
const redirectUrl="http://localhost:3000/"

let accessToken;


const Spotify={

    getAccessToken(){

     if(accessToken){
        return accessToken;
     }

     //check for access token match

     const accessTokenMatch=window.location.href.match(/access_token=([^&]*)/)//this expression is used to extract the value of the access token from a string by searching for the specific pattern "access_token=" followed by any characters except an ampersand.
     const expiresInMatch=window.location.href.match(/expires_in=([^&]*)/)

     //if accessTokenMatch and expiresInMatch exists in url which is typing window.location.href in console
     
     if(accessTokenMatch && expiresInMatch){

        accessToken=accessTokenMatch[1]
        const expiresIn=Number(expiresInMatch[1])

        
        /*The window.history.pushState() method is used to modify the browser's URL,
         replacing the access token and expiration time parameters  with 'Access Token', null, and '/', respectively.  */

        window.setTimeout(() => accessToken = '', expiresIn * 1000);
        window.history.pushState('Access Token', null, '/');
        return accessToken;

     }else{
    

        const accessUrl=`https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUrl}
        `

        window.location=accessUrl;


     }

    },

    search(term){

      const accessToken=Spotify.getAccessToken();
    
      const urlSpotify=`https://api.spotify.com/v1/search?type=track&q=${term}`
      return 
      fetch(urlSpotify,{headers: {
         Authorization: `Bearer ${accessToken}`
   }
   }).then(response=>{

      return response.json()
      }).then(jsonResponse=>{
         if(!jsonResponse.tracks){
            return []
         }return 
            jsonResponse.tracks.items.map(track=>({
               id:track.id,
               name:track.name,
               Artist:track.artists[0].name,
               Album:track.album.name,
               URI:track.uri

            }))

         
      })

    },

    savePlaylist(name,trackUris){

      if(name||trackUris.length){
         return


      }

      const accessToken=Spotify.getAccessToken()
      const headers={Authorization:`Bearer ${accessToken}`}
      //headers object is created with the purpose of authorizing the API requests made on behalf of the user.
      let userID;

      //get the current spotify user ID, with spotify endpoint
      //retrieve user data from server
      fetch(`https://api.spotify.com/v1/me`,{headers: headers}
      ).then(response=>
         response.json()
      ).then(responseJson=>{
         userID=responseJson.id
         //Return playlist id, end point is playlist
         //the code attempts to create a new playlist with the provided playlist name in the user's Spotify account. 
         //submit data body:name playlist name to server  so as to create the playlist
         return fetch(`https://api.spotify.com/v1/users/${userID}/playlists`,
         {
            headers:headers,
            method:"POST",
            body:JSON.stringify({name:name})
         })
      }
         ).then(response=>response.json()
         ).then(jsonResponse=>{
            

            const playlistId=jsonResponse.id;
            return fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${playlistId}/tracks`,
            //add tracks to the newly created playlist in the user's Spotify account.
            //submit tracks to server and create the track
            {headers:headers,
            method:"POST",
            body:JSON.stringify({uris:trackUris})
            //The request body contains data to be sent to the server
            //specifying the track URIs to be added to the playlist. trackUris is an array of track URIs that you want to add.
         }
         )

         })


      }



    }








export default Spotify