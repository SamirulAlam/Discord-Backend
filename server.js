import express from 'express';
import mongoose from 'mongoose';
import Pusher from "pusher";
import dotenv from 'dotenv';
import Cors from "cors";
dotenv.config();

//app config
const app = express();
const port=process.env.PORT || 9000;
const secret = process.env.SECRET_KEY;
const pusher = new Pusher({
    appId: "1161152",
    key: "2d5c9b126c78e10f60ba",
    secret: secret,
    cluster: "ap2",
    useTLS: true
  });

//middleware
app.use(express.json());
app.use(Cors());


//DB config
const password = process.env.PASSWORD;
const connection_url=`mongodb+srv://admin:${password}@cluster0.5u8j3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
mongoose.connect(connection_url,{
    useCreateIndex:true,
    useNewUrlParser:true,
    useUnifiedTopology:true,
});
mongoose.connection.once("open",()=>{
    console.log("DB Connected");
});

//api routes
app.get("/",(req, res) => {res.status(200).send("hello")})

//listener
app.listen(port,()=>console.log(`listening to port ${port}`));