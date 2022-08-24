const { fetch } = require("cross-fetch")

const getAccessToken = async () => {
    try {
        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(process.env.CLIENT_ID + ':' + process.env.CLIENT_SECRET)
            },
            body: 'grant_type=client_credentials'
        })

        const data = await result.json()
        return data.access_token

    } catch (error) {
        console.error("Error",error)
    }
}

const getCategories = async (access_token) => {
    try{
        const result = await fetch('https://api.spotify.com/v1/browse/categories',{
            method:'GET',
            headers: { 
                'Authorization' : 'Bearer ' + access_token
            }
        })
        const data = await result.json()
        return data
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
        if (result.status == 200){
            console.log(result.statusText)
            const data = await result.json()
            return data
        }
        else{
            throw Error(result.statusText)
        }
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
        if (result.status == 200){
            const data = await result.json()
            return data;
        }
        else{
            throw Error(result.statusText)
        }
    }catch(error){
        console.log(error)
    }
}


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
    return response.send(data)
}

module.exports = {
    getSpotifyToken: getAccessToken,
    getCategories:getCategories,
    getCategoryPlaylist:getCategoryPlaylist,
    getTracks:getTracks,
    getTrackById: getTrackById,
}