let  sound_id=null,
     id=null,
     master_element,
     element,
     pause_element,
     volumn_element,
     howl_instance = null,
     track_ids_array = []

const player_queue = []


$(document).ready( async () => {
   element = document.getElementById('master-play-btn')
   master_element = document.getElementById('master-btn')
   pause_element = document.getElementById("master-pause-btn")
   volumn_element = document.getElementById("volume-progress-bar")
   playlist_id = document.getElementById("playlist").value
   
   const url = `http://localhost:3000/track/getTracksByPlaylistId?playlist_id=${playlist_id}`

   await fetch(url,{
      method:"GET",
      headers:{
         'Content-Type': 'application/json'
      }
   }).then(async (data) => {
      if (data.status == 200){
         await data.json().then( (data) => {
            data.items.forEach( (data) => {
               track_ids_array.push(data.track.id)
            })
            
         })
      }
   })

   pause_element.addEventListener("click",() => {
      howl_instance.pause()
   })

   element.addEventListener("click",() => {
      howl_instance.play()
   })

   volumn_element.addEventListener("change",() => {
      const vol = volumn_element.value;
      let howl_volumn = ( vol / 100 )
      howl_instance.volume(howl_volumn)
      volumn_element.value = vol;
   })
})

const control_audio = (track,single,playlist) => {
   // console.log(track)
   if (howl_instance != null && playlist == true && single == false) {
      // put the track in the queue and pop when already playing track is finished.
      player_queue.push(track)
   }else{
      function play_and_control(track){
         let title = track.name;
         let poster = track.album.images[2].url
         id = track.id;
         let audio = `${track.preview_url}.mpeg`
         
         const artist_array = []
         track.artists.forEach((artist) => { 
            artist_array.push( artist.name ) 
         })
         let artist = artist_array.join(" | ")
   
         // If song is currently playing.
         if (master_element.ariaLabel == "pause"){
            master_element.ariaLabel = "play"
            document.getElementById(id).style.display="block"
            document.getElementById("track_equalizer_gif_"+id).style.display="none"
            howl_instance.stop()
         }
   
         howl_instance = new Howl({
            src: [audio],
            preload:true,
            html5: true,
            onplay: function(){
               element.style.display="none"
               pause_element.style.display = "block"
               master_element.ariaLabel = "pause" 
               document.getElementById(id).style.display="none"
               document.getElementById("track_equalizer_gif_"+id).style.display="block"
            },
            onpause: function(){
               element.style.display = "block"
               pause_element.style.display = "none"
               master_element.ariaLabel = "play"  
            },
            onend: function(){
               pause_element.style.display = "none"   
               element.style.display = "block"
               master_element.ariaLabel = "play"
            },
            onstop:function(){
               element.style.display = "block"
               pause_element.style.display = "none"
               master_element.ariaLabel = "play"
            }
         })
   
         switch(howl_instance.state()){
            case "unloaded":
                           howl_instance.load()
                           howl_instance.play()
                           break;
            case "loaded": 
                           console.log("Loaded")
                           sound_id = howl_instance.play();
                           break;
            default :  
                        howl_instance.once('load',() => {
                           sound_id = howl_instance.play()
                        })
                        break;
         }
   
         howl_instance.on("play",() => {
            document.getElementById("song-poster").setAttribute("src",poster)
            document.getElementById("title").innerHTML = title
            document.getElementById("artist").innerHTML = artist
            const moment_howl_duration = new moment(howl_instance.duration(),"seconds")
            document.getElementById("track-playback-end-time").innerHTML = `${moment_howl_duration.minutes()}:${moment_howl_duration.seconds()}`
            track_audio_progress()
         })
   
         howl_instance.on("end",() => {
            if (player_queue.length != 0){
               next_track_in_queue = player_queue.shift()
               play_and_control(next_track_in_queue)
            }
         })

         function track_audio_progress(){
            var seek = howl_instance.seek();
            document.getElementById("track-playback-progress-bar").style.width = (((seek / howl_instance.duration()) * 100)) + '%';
            seek_duration = new moment.duration(seek,"seconds")
            document.getElementById("track-playback-start-time").innerHTML = `${seek_duration.minutes()}:${seek_duration.seconds()}`
            if (howl_instance.playing()){
               requestAnimationFrame( () => { track_audio_progress()})
            }
         }
      }
      play_and_control(track)
   }
}

const play_previous_song = () => {
   if (id == null){
      alert("No song is selected !")
   }else{
      audio_index = track_ids_array.indexOf(id)

      if (( audio_index - 1 ) < 0){
         console.log("No Song found .")
         alert('No song found .')
      }else{
         id = track_ids_array[audio_index -1]
         play_track(id)
      }
   }
}

const play_next_song = () => {
   if (id == null){
      alert("No song is selected !")
   }else{
      audio_index = track_ids_array.indexOf(id)

      if ( (audio_index +1 ) > ( track_ids_array.length -1 ) ){
         console.log("No song found");
         alert("No song found !")
      }else{
         id = track_ids_array[audio_index + 1]
         play_track(id)
      }
   }
}

const play_track = async (clicked_track_id) => {
   
   // Fetch the track details 
   const url = `http://localhost:3000/track/getTrack?q=${clicked_track_id}`
   // Fetch the previous two tracks and next two tracks if available 
   await fetch(url,{
      method:"GET",
      headers:{
         'Content-Type': "application/json"
      }
   }).then( (data) => {
      if (data.status == 200){
         data.json().then( (data) => {

            control_audio(data,true,false)
         })
         // document.write(data)
      }
      else{
         alert("Cannot play track.")
      }
   })
}

const play_all_playlist_track = async () => {
   const total_tracks_ids = track_ids_array.length
   const queue = []
   let pointer,pointer1;
   const remainder = total_tracks_ids % 3 
   if (remainder != 0){
      final_length = total_tracks_ids - remainder
   }
   else{
      final_length = total_tracks_ids
   }

   // Closure function 
   async function play_all_tracks(index){
      if (index == final_length){
         console.log("PLaylist has completed all of its songs.")
      }else{
         for(let i=index;i<index+3;i++){
            queue.push(track_ids_array[i])
         }
         pointer = index
         pointer1 = queue.length
         
         ids = `${queue[pointer]},${queue[pointer+1]},${queue[pointer+2]}`
         const url = `http://localhost:3000/track/getMultipleTrack?ids=${ids}`
         await fetch(url,{
            method:"GET",
            headers:{
               'Content-Type': 'application/json'
            }

         }).then( (data) => {
            if (data.status == 200){
               data.json().then( (data)=>{
                  i = 0
                  while (pointer != pointer1){
                     control_audio(data.tracks[i],false,true)
                     i += 1
                     pointer += 1
                  }
               })
            }
         })   
         index = pointer1
         play_all_tracks(index)
      }
   }   
   play_all_tracks(0)      // default to 0

   // Play the remaining tracks
   // if (remainder == 1){
   //    last_track_id = track_ids_array[total_tracks_ids - 1]
   //    play_track(last_track_id)
   // }else if (remainder == 2){
   //    // play these last two tracks  

   //    // PENDING
   //    last_track_id = track_ids_array[total_tracks_ids - 1]
   //    second_last_track_id = track_ids_array[total_tracks_ids - 2 ]
   // }
} 
