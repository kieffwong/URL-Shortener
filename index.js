// get requirements
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const shortUrl = require("./models/shortUrl");

app.use(bodyParser.json());
app.use(cors());
//connect to the database
mongoose.connect(process.env.MONGODB_URL || "mongodb://localhost/shortUrls");

//allow host find static content
app.use(express.static(__dirname + "/public"));
//create database entry
app.get('/new/:urlToShorten(*)', (req, res, next) => {
    var {urlToShorten} = req.params; 
    var regex = /[-a-zA-Z0-9@:%\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%\+.~#?&//=]*)?/gi;
    if(regex.test(urlToShorten)===true){
        var short = Math.floor(Math.random()*100000).toString();
var data = new shortUrl(
    {
        originalUrl: urlToShorten,
        shortenUrl: short
    }
);
data.save( err=> {
    if(err){
        return res.send("There is a error occurs in database")
    }
});

        return res.json(data)
    }
    var data = new shortUrl ({
            originalUrl: "urlToShorten is invalid URL",
            shortenUrl: "InvalidURL" 
        });
    return res.json(data);
})

//Query database and forward to originalUrl
app.get('/:urlToForward', (req, res, next)=> {
    var shortenUrl  = req.params.urlToForward;
    shortUrl.findOne({'shortenUrl': shortenUrl}, (err, data)=>{
        if(err) return res.send('Error while reading database');
        var re = new RegExp("^(http||https)://", "i");
        var strToCheck = data.originalUrl;
        if(re.test(strToCheck)){
            res.redirect(301, data.originalUrl);
        } else {
            res.redirect(301, "http://" + data.originalUrl);
        }
    })
})

//listen to port if it is working
//process is for if on Heroku
app.listen(process.env.Port || 3000, () => {
    console.log("URL Shortener is working.")
})
