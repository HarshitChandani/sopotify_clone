const {
    getCategories,
    getCategoryPlaylist,
    getTracks
} = require("../api/spoitfy_api")

const moment = require("moment")
const howler = require("howler")

exports.getAllCategories = async (request, response) => {
    
    if (request.cookies.spoitfyToken){
        getCategories(request.cookies.spoitfyToken.access_token).then((data)=>{
            response.render("home",{
                'category_data':data.categories.items,
            })
        })
    }
    else{
        response.redirect(`/authorize?previous_redirect_uri=${process.env.ROOT}`)
    }    
}

exports.getCategoryPlaylist = async (request,response) => {
    const category_id = request.query.q
    const category = request.query.title
    await getCategoryPlaylist(request.cookies.spoitfyToken.access_token,category_id).then( (data)=>{
        response.render("playlist",{
            'playlist_title':category,
            'playlist_data':data.playlists.items
        })
    })
}

exports.getPlaylistTracks = async (request,response) => {
    // fetch cover image of the playlist.
    const playlist_id = request.query.q
    const track_id_array = []
    
    await getTracks(request.cookies.spoitfyToken.access_token,playlist_id).then( (data)=>{
        if (data){
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
            })
        }
    })    
}