var express = require("express");
var bodyparser = require("body-parser");
var jwt = require("jsonwebtoken");
var config = require("../emp_firebase/config")
var mongoose = require("mongoose");
var cors = require("cors");
var app = express();

protectedroutes = express.Router();
app.set('setsecret',config.secret)
app.use('/api',protectedroutes);
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({extended:true}));
app.use(cors());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

    var url = "mongodb+srv://sriram:sriram@cluster0-htdg9.mongodb.net/"
    // var url = "mongodb://127.0.0.1:27017/"
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

protectedroutes.use((req,res,next)=>{
    
    var token = req.headers['access-token']
    console.log(token,"hai")
    if(token){
        jwt.verify(token,app.get('setsecret'),(err,data)=>{
            if(err){
                return res.json({"msg":"invalid token"})
            } else {
                req.decoded = data;
                next();
            }
        })
    } else{
        return res.send({messge:'no token provided'})
    }
    // res.end();
})
protectedroutes.use(bodyparser.json());
protectedroutes.use(bodyparser.urlencoded({extended:true}));

app.post("/login",(req,res)=>{

    var username  = req.body.username;
    var password =  req.body.password;
    PersonModel.find({username,password}).then(result =>{               
        if(result){
            // console.log(result[0]['password'])
            if(result[0]['username'] == username && result[0]['password'] == password){
                console.log("correnct")      
             
                jwt.sign({ exp: Math.floor(Date.now() / 1000) + (60 * 60), data:req.body.name },app.get('setsecret'),(err,tok)=>{
                    // jwt.sign(req.body.name,app.get('setsecret'),{expiresIn: Math.floor(Date.now() / 1000) + (60 * 1) },(e,d)=>{
                        if(err){
                            console.log(err)
                            res.end(err)
                            
                        }   
                        res.json({"Date":result,"token":tok})
                        res.end();
                    })

                    
               
                // res.json("unable to create token")
                // res.end();
            }else{
                res.json({"status":"false","msg":"incorrect username or password"})
                res.end();
            }           
        }           

    }).catch(err =>{
        res.send(err)
        res.end();
    })
})

app.post('/reg',(req,res)=>{
    req.p
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

protectedroutes.put('/updateuser',(req,res)=>{    
    var username  = req.body.username;        
    PersonModel.findOneAndUpdate({username},{$set:req.body}).then(result =>{
        if(result){
            res.json({"status":true,"msg":"success","data":result})            
        }
    }).catch(err =>{
        res.send(err);
        res.end();
    })    
})

protectedroutes.delete('/deluser/:username',(req,res)=>{
    
    var username  = req.params.username;
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



protectedroutes.get('/allusers',(req,res)=>{    

    PersonModel.find({},(err,data)=>{
        if(err){
            console.log(err,"Error")
            return res.end();
        }
        if(data){
            console.log(data)
            return res.json(data);            
        }
    })   
})

protectedroutes.get("/",(req,res)=>{
    res.write("status connected");
    res.end();
})

protectedroutes.post("/post/:param",(req,res) =>{
    console.log(req.params.param,"asdf")  
    res.json("payload");
})

protectedroutes.get("/payload/",(req,res)=>{
    res.json("hai")
})


var port = process.env.PORT || 3000;
app.listen(port);
console.log("port is An Active:",port);