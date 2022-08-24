
let  sound_id=null,
     id=null,
     howl_instance = null,
     master_element,
     element,
     pause_element,
     volumn_element,
     track_ids_string,
     track_ids_array;

$(document).ready( () => {
   element = document.getElementById('master-play-btn')
   master_element = document.getElementById('master-btn')
   pause_element = document.getElementById("master-pause-btn")
   volumn_element = document.getElementById("volume-progress-bar")
   track_ids_string = document.getElementById("tracks_available").value;
   track_ids_array = track_ids_string.split(",")
   
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

const control_audio = (track) => {
   
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
      },
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
      console.log(howl_instance.state())
      document.getElementById("song-poster").setAttribute("src",poster)
      document.getElementById("title").innerHTML = title
      document.getElementById("artist").innerHTML = artist
   })
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

            control_audio(data)
         })
         // document.write(data)
      }
      else{
         alert("Cannot play track.")
      }
   })
}