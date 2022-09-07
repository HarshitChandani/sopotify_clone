const mongoose = require("mongoose")

exports.connect = async () => {

    try {
        await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true
        })    
    } catch (error) {
        console.log("Could not connect")
    }

    const connection = mongoose.connection
    connection.on("error",(err) => console.log(`Error ${err}`))
    connection.once("open",() => console.log("Connected to DB !"))
}

