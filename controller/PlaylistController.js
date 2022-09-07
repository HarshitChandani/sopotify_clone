const UserModel = require("../models/User");

exports.like_playlist = async (request, response) => {
   const playlist_spotify_id = request.query.id;
   const event_op = request.query.event;
   
  /**
   *
   * If event_op is true:
   *    Add the playlist to favorite
   * If event_op is false:
   *    Remove the playlist from favorite
   */
   if (request.session.authentication == undefined) {
    response.status(401).send({
      status_msg: "unauthorized",
      error: false,
    });
   } else {
    // $addToSet: Maintain unqiueness of the array.

      switch (event_op) {
         case "true":
            await UserModel.findOneAndUpdate({
               _id: { $eq: request.session.authentication.user_id }
            },{
               $pull:{ like_playlist: playlist_spotify_id }
            },{
               upsert:false,
               new:true,
               returnDocument:"after"
         }).then( (data,error) => {
               if (error){
                  return response.send({
                     error:true,
                     'msg':error,
                     event:true
                  })
               }
               return response.send({
                  error:false,
                  'msg':'Playlist removed from favorite .',
                  data:data,
                  event:true
               }) 
         });
         break;
         case "false":
            await UserModel.findOneAndUpdate({
               _id: { $eq: request.session.authentication.user_id },
            },
            {
               $addToSet: { like_playlist: playlist_spotify_id },
            },
            {
               upsert: true,
               new: true,
               returnDocument: "after",
            }).then((data, error) => {
               if (data) {
                  return response.send({
                     error: false,
                     msg: "Playlist added to favorite.",
                     event:false
                  });
               } else {
                  return response.send({
                     error: true,
                     msg: "Something went wrong.",
                     event:false
                  });
               }
            });
            break;
         }
      }
};
