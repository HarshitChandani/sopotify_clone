const {
    getCategories,
    getCategoryPlaylist,
    getTracks
} = require("../utils/spoitfy_api")

const moment = require("moment")
const {refresh_token,setCookie} = require("../controller/AuthorizeController")
const UserModel = require("../models/User")

exports.getAllCategories = async (request, response) => {
    await getCategories(request.cookies.spoitfyToken)
    .then( async (data)=>{
        if (data.status == 200){
            data = await data.json()
            response.render("home",{
                'category_data':data.categories.items,
            })
        }else if (data.status == 401){
            // UnAuthorized. Need to refresh the access token.
            await refresh_token(request.cookies.spotify_refresh_token).then( (refreshed_data) => {
                if (refreshed_data){
                    setCookie('spoitfyToken', refreshed_data.access_token, refreshed_data.expires_in*1000 *24 , response)
                    setCookie('spotify_refresh_token',request.cookies.spotify_refresh_token,refreshed_data.expires_in*1000 *24,response)
                    response.redirect("/")
                }
                else{
                    console.log(refreshed_data)
                    response.end()
                }
            })
        }
    })    
}

exports.getCategoryPlaylist = async (request,response) => {
    const category_id = request.query.q
    const category = request.query.title
    await getCategoryPlaylist(request.cookies.spoitfyToken,category_id).then( async (data)=>{
        if (data.status == 200){
            data = await data.json()
            response.render("playlist",{
                'playlist_title':category,
                'playlist_data':data.playlists.items
            })
        }else if (data.status == 401 ){
            // needs to refresh access token 
            await refresh_token(request.cookies.spotify_refresh_token).then( (refreshed_data) => {
                if (refreshed_data){
                    setCookie('spoitfyToken', refreshed_data.access_token, refreshed_data.expires_in*1000 *24 , response)
                    setCookie('spotify_refresh_token',request.cookies.spotify_refresh_token,refreshed_data.expires_in*1000 *24,response)
                    response.redirect(`/category-playlist?title=${category}&q=${category_id}`)
                }
                else{
                    console.log(refreshed_data)
                    response.end()
                }
            })
        }
    })
}

exports.getPlaylistTracks = async (request,response) => {
    // fetch cover image of the playlist.
    const playlist_id = request.query.q
    var doesUserLikedThisPlaylist = false    
    
    if (request.session.authentication != null){
        await UserModel.find({_id:request.session.authentication.user_id},{like_playlist:1,_id:0}).then( (data,error) => {
            if (data[0].like_playlist.includes(playlist_id)){
                doesUserLikedThisPlaylist = true
            }        
        })
    }

    await getTracks(request.cookies.spoitfyToken,playlist_id).then( async (data)=>{
        if (data.status == 200){
            data = await data.json()
            response.render("track",{
                'playlist_id':data.id,
                'playlist_title':data.name,
                'playlist_description':data.description,
                'playlist_followers':data.followers.total.toLocaleString(),
                'playlist_cover_poster':data.images[0].url,
                'playlist_primary_color':data.primary_color,
                'playlist_owner_detail':{
                    'id':data.owner.id,
                    'name':data.owner.display_name,
                    'type':data.owner.user
                },
                'tracks':data.tracks.items,
                'total_tracks':data.tracks.items.length,
                'moment': moment,
                'doesUserLikedThisPlaylist':doesUserLikedThisPlaylist
            })
        }else if (data.status == 401){
            // Needs to refresh access_token 
            await refresh_token(request.cookies.spotify_refresh_token).then( (refreshed_data) => {
                if (refreshed_data){
                    setCookie('spoitfyToken', refreshed_data.access_token, refreshed_data.expires_in*1000 *24 , response)
                    setCookie('spotify_refresh_token',request.cookies.spotify_refresh_token,refreshed_data.expires_in*1000 *24,response)
                    response.redirect(`/playlist-tracks?q=${playlist_id}`)
                }
                else{
                    console.log(refreshed_data)
                    response.end()
                }
            })
        }
    })    
}
