var express = require("express");
var cors = require("cors");
var jwt = require("jsonwebtoken");
var bodyParser= require("body-parser");
var mongoose = require("mongoose");
var app = express();
app.use(cors());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended:true}));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
    var url = "mongodb+srv://sriram:sriram@cluster0-htdg9.mongodb.net/"
    var DBname = "myemployee"
    
    mongoose.connection.on('connected', function() {
        console.log('Connection to Mongo established.');        
        if (mongoose.connection.client.s.url.startsWith('mongodb+srv')) {
            mongoose.connection.db = mongoose.connection.client.db(DBname);
        }
    });
    
    mongoose.connect(url, {dbName: DBname}, function(err, client) {
      if (err) {
         console.log("mongo error", err);
         return;
      }
    });


const PersonModel = mongoose.model("person", {
    firstname: String,
    lastname: String,
    username: String,
    password: String,
    phonenumber: String
});

app.post('/reg',(req,res)=>{
    console.log(req.body)
    var reg = new PersonModel({
  "firstname":req.body.firstname,
  "lastname":req.body.lastname,
  "username":req.body.username,
  "password":req.body.password,
  "phonenumber":req.body.phonenumber
    })
  reg.save().then((result)=>{
      if(result)
 res.json({"status":"success"})
 res.end();
  }).catch(err =>{
      res.send(err);
      res.end();
  })

})

app.post('/login',(req,res)=>{
    var username  = req.body.username;
    var password =  req.body.password;
    PersonModel.find({username,password}).then(result =>{
        if(result){
            // console.log(result[0]['password'])
            if(result[0]['username'] == username && result[0]['password'] == password){
                console.log("correnct")
                var token = jwt.sign(username,password);
                var data =  {
                    "Data":result,
                    "token":token
                }
                res.json(data)
                res.end();
            }           
        }           

    }).catch(err =>{
        res.send(err)
        res.end();
    })
   })

   app.delete('/deluser',(req,res)=>{
    var username  = req.body.username;
    console.log(username);
    PersonModel.deleteOne({username}).then(result =>{
        if(result){
            res.json({"status":"success","bool":true})
            res.end()
        }
    }).catch(err =>{
        res.send(err);
        res.end();
    })
   })

app.get('/allusers',(req,res)=>{
 PersonModel.find({}).then(result =>{
     res.json(result);
     res.end();
 }).catch(err =>{
     res.send(err);
     res.end();
 })
})
app.get('/test',(req,res)=>{
    res.write("Tested Connected");
    res.end();
})
app.get('/',(req,res)=>{
    res.end('Connected');
})


//var port = process.env.PORT || 3000;
//console.log("server is listineg",port)
app.listen(8080);
