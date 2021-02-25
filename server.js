import express from 'express';
import mongoose from 'mongoose';
import Pusher from "pusher";
import dotenv from 'dotenv';
import Cors from "cors";
dotenv.config();
import conversation from "./dbModel.js";

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

    const changeStream =mongoose.connection.collection("conversations").watch();

    changeStream.on("change",(change)=>{
        if(change.operationType==="insert"){
            pusher.trigger("channels","newChannel",{
                "change":change
            })
        }else if(change.operationType==="update"){
            pusher.trigger("conversation","newMessage",{
                "change":change
            })
        }else{
            console.log("Error triggering pusher");
        }
    })
});

//api routes
app.get("/",(req, res) => {res.status(200).send("hello")})

app.post("/new/channel",(req, res) => {
    const dbData=req.body;

    conversation.create(dbData,(err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(201).send(data)
        }
    })
})

app.get("/get/channelList",(req, res) => {
    conversation.find((err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            let channels=[];
            data.map((channelData)=>{
                const channelInfo={
                    id:channelData._id,
                    name:channelData.channelName
                }
                channels.push(channelInfo)
            })
            res.status(200).send(channels);
        }
    })
})

app.post('/new/message',(req, res)=>{
    const newMessage=req.body;

    conversation.update(
        {_id: req.query.id},
        {$push:{conversation:req.body}},
        (err,data)=>{
            if(err){
                res.status(500).send(err)
            }else{
                res.status(200).send(data)
            }
        }
    )
})

app.get("/get/data",(req, res)=>{
    conversation.find((err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})

app.get("/get/conversation",(req, res)=>{
    const id=req.query.id;
    conversation.find({_id:id},(err,data)=>{
        if(err){
            res.status(500).send(err)
        }else{
            res.status(200).send(data)
        }
    })
})

//listener
app.listen(port,()=>console.log(`listening to port ${port}`));