const { fetch } = require("cross-fetch")

// Back End API : API's which are used by Controllers/Middlewares.

const getCategories = async (access_token) => {
    try{
        const result = await fetch('https://api.spotify.com/v1/browse/categories',{
            method:'GET',
            headers: { 
                'Authorization' : 'Bearer ' + access_token
            }
        })
        return result
    }
    catch(error){
        console.error("Error",error)
    }
}

const getCategoryPlaylist = async (access_token,category_id) => {
    try{
        let url = `https://api.spotify.com/v1/browse/categories/${category_id}/playlists`

        const result = await fetch(url,{
            method:'GET',
            headers:{
                'Authorization': 'Bearer ' + access_token,
                'Content-Type': 'application/json'
            } 
        })
        // if (result.status == 200){
        //     const data = await result.json()
        //     // console.log(data)
        //     return data
        // }
        return result
    }catch(error){
        console.error(error)
    }
}

const getTracks = async (access_token , playlist_id) => {
    try{
        
        let url = `https://api.spotify.com/v1/playlists/${playlist_id}`
        
        const result = await fetch(url,{
            method:"GET",
            headers:{
                'Authorization': 'Bearer ' + access_token,
                'Content-Type': 'application/json'
            }
        });
        return result
    }catch(error){
        console.log(error)
    }
}

// Front End API's .

const getTrackById = async (request,response) => {
   
    const track_id = request.query.q
    const spotify_url = `https://api.spotify.com/v1/tracks/${track_id}`
    const result = await fetch(spotify_url,{
        method:"GET",
        headers:{
            'Authorization': 'Bearer ' + request.cookies.spoitfyToken,
            'Content-Type': 'application/json'
        }
    })
    const data = await result.json()
    // console.log(data)
    return response.send(data)
}

const getMultipleTracksById = async (request,response) => {
    const track_ids_str = request.query.ids
    const spotify_url = `https://api.spotify.com/v1/tracks?ids=${track_ids_str}`
    const result = await fetch(spotify_url,{
        method:"GET",
        headers:{
            'Authorization': 'Bearer ' + request.cookies.spoitfyToken,
            'Content-Type': 'application/json'
        }
    })
    const data = await result.json()
    return response.status(200).send(data)
}

const getTracksByPlaylistId = async (request,response) => {
    const playlist_id = request.query.playlist_id;
    // let field_options = request.query.field 
    let spotify_url = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`
    
    await fetch(spotify_url,{
        method:"GET",
        headers:{
            'Authorization': 'Bearer ' + request.cookies.spoitfyToken,
            'Content-Type': 'application/json'
        }
    }).then( async (data) => {
        if (data.status == 200 ){
            data = await data.json();
            return response.status(200).send(data)
        }else{
            return response.status(401).send({})
        }
    })
}

module.exports = {
    getCategories:getCategories,
    getCategoryPlaylist:getCategoryPlaylist,
    getTracks:getTracks,
    getTrackById: getTrackById,
    getMultipleTracksById:getMultipleTracksById,
    getTracksByPlaylistId:getTracksByPlaylistId
}