const app = require('express')();
const cors = require('cors');
const bodyParser = require('body-parser');
const Twit = require('twit')
const url = require('url');
const request = require('request');
const woeid = require('twitter-woeid');
var serveStatic = require('serve-static')




const port =  process.env.PORT || 8080;

app.use(cors())
  .use(bodyParser.json())
  .use(serveStatic("./dist/myapp"))
  .use((function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  }));


const http = require('http').createServer(app);


const io = require('socket.io')(http, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

http.listen(port, () => {
  console.log(`http server listening on port ${port}`);
});

const apikey = 'KIWlQYh552ntwoafqgm6urJ4O'
const apiSecretKey = 'YEHkoVescHQdAD0WN2REVDz9fYknER2K1tw2VfMHTpC0SFdqqN'
const accessToken = '1329548062080065539-hcDOSZMV4uIJwkJJoGiOK2ZMKNJ7sU'
const accessTokenSecret = 'eblXzR1VOwkLA5ffizxxQWdnS2zsyVzrF9ibnXzGwgxDt'

const oauthMiddleware = (req, res, next) => {
  req.oauth = {
    consumer_key: apikey,
    consumer_secret: apiSecretKey,
    token: accessToken,
    token_secret: accessTokenSecret
  }
  next();
}

app.get('/trends', oauthMiddleware, (req, res) => {
  var country = url.parse(req.url,true).search;
  country = country.slice(1);
  woeidCountry = "1";
  if (country !== "world" & country !== "undefined" & country !=null & country != ""){
    console.log("SC server : " + country.toLowerCase().replace(/%20/g, ' '));
    woeidCountry = woeid.getSingleWOEID(country.toLowerCase().replace(/%20/g, ' '))[0].woeid;
    console.log(woeidCountry)
  }
  console.log("woeid" + woeidCountry)
  var url1 = 'https://api.twitter.com/1.1/trends/place.json?id=' + woeidCountry
            + '&count=10';
  request.get({url: url1, oauth: req.oauth}, (e, r, body) => {
    if (e || r.statusCode !== 200) {
      res.status(500).send({message: 'Error'});
    } else {
      res.status(200).send(body);
      console.log(body)
    }
  });
});

var tweets = []

const T = new Twit({
  consumer_key:         apikey,
  consumer_secret:      apiSecretKey,
  access_token:         accessToken,
  access_token_secret:  accessTokenSecret,
});


app.get('/maphistory', (req, res) => {
  var paramsString = url.parse(req.url,true).search;
  paramsString = paramsString.slice(1);
  console.log(paramsString)
  var params = paramsString.split(';');
  console.log(params)
  T.get('search/tweets', { q: ' #trump', locations:[-180,-90,180,90]}, function(err, data, response) {      
    tweets.push(data.statuses
    .map(tweet => tweet));
    console.log(tweets)
    res.send(tweets);
    });
  });




var doubleCheck;
var stream = undefined;
var Streams = {};
var streamMap;
io.on('connection', (socket) => {
  socket.on('trend', (trend) => {  
    stream = T.stream('statuses/filter', { track: `${trend}` });
    Streams[trend] = stream;
    console.log("serveur trend = " + trend);
       stream.on('tweet' , function (tweet) {
        if(tweet.id !== doubleCheck){
          
          console.log(tweet.id);
          console.log('------');
          io.emit("tweet", tweet);
        }
        doubleCheck = tweet.id;
    })
  });


  socket.on('map', (trend) => {  

    streamMap = T.stream('statuses/filter', {  track: `${trend}` });
       streamMap.on('tweet', function (tweet) {
         console.log(trend)
         console.log('streamMap called')
        if(tweet.id !== doubleCheck){
          if (tweet.place != null){
            console.log("place exist")
            if (tweet.place.country_code != null & tweet.place.country_code !=undefined ){
              console.log('####################################');
              console.log(tweet.place.country_code)
              console.log(tweet.place.bounding_box.coordinates)
              console.log('####################################');
              console.log('------------------------------------');
              io.emit("tweet", tweet);
            }
          }
        }
        doubleCheck = tweet.id;
    })
  });

  socket.on('stop', (trend) => {  
    if (Streams[trend] !== undefined){
      Streams[trend].stop();
    }
  });

  socket.on('stopMap', () => {  
    if (streamMap !== undefined){
      streamMap.stop();
    }
  });
  
});