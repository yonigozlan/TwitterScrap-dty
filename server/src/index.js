// const bearerToken = require('express-bearer-token');
// const oktaAuth = require('./auth');
const app = require('express')();
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql');
// const events = require('./events');
const Twit = require('twit')
const url = require('url');
const request = require('request');
// const session = require('express-session');
const woeid = require('twitter-woeid');
// const { count } = require('console');
var serveStatic = require('serve-static')




// const connection = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'tweeterscrap',
//   password : 'password',
//   database : 'tweets'
// });

// // connection.connect();

const port =  process.env.PORT || 8080;
// const portIo = 3000;

app.use(cors())
  .use(bodyParser.json())
//   .use(oktaAuth)
  // .use(events(connection))
  .use(serveStatic("./dist/myapp"))
  .use((function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  }));

// app.get('/', (req,res) => {
//     console.log("index called");
//     res.sendFile(process.cwd()+"/myapp/dist/myapp/index.html");
// });

const http = require('http').createServer(app);


const io = require('socket.io')(http, {
  cors: {
    origin: "*",
    credentials: true,
  },
});
// app.listen(port, () => {
//   console.log(`Express server listening on port ${port}`);
// });

http.listen(port, () => {
  console.log(`http server listening on port ${port}`);
});

// app.post('/port', function(req, res){
//   res.send(process.env.PORT);
// });

const apikey = 'KIWlQYh552ntwoafqgm6urJ4O'
const apiSecretKey = 'YEHkoVescHQdAD0WN2REVDz9fYknER2K1tw2VfMHTpC0SFdqqN'
const accessToken = '1329548062080065539-hcDOSZMV4uIJwkJJoGiOK2ZMKNJ7sU'
const accessTokenSecret = 'eblXzR1VOwkLA5ffizxxQWdnS2zsyVzrF9ibnXzGwgxDt'
const Bearer = 'AAAAAAAAAAAAAAAAAAAAAKewJwEAAAAAyWsibxUTf9SBM83C0dLw3zYelfI%3DLY4HxAiouxSkLNhqdUZaHkemhJLZ8lcH3MZlwEw05w5zCcRNHb'

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

// app.get('/maphistory', oauthMiddleware, (req, res) => {
//   var paramsString = url.parse(req.url,true).search;
//   paramsString = paramsString.slice(1);
//   console.log(paramsString)
//   var params = paramsString.split(';');
//   console.log(params)
//   tweets = []

//   // `${params[0]} since:${params[1]}-${params[2]}-${params[3]}`
//   var url1 = 'https://api.twitter.com/1.1/search/tweets.json?q=37.781157 -122.398720 1mi' + params[0].toString() + '&37.781157 -122.398720 50000km' ;
//   request.get({url: url1, oauth: req.oauth}, (e, r, body) => {
//     if (e || r.statusCode !== 200) {
//       res.status(500).send({message: 'Error'});
//     } else {
//       res.status(200).send(body);
//       console.log(body)
//       tweets.push(body.statuses
//         .map(tweet => tweet));
//     }
//   });
// });

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
  // tweets = []
  // for (var i = 0; i<1; i++ ){
    T.get('search/tweets', { q: ' #trump', locations:[-180,-90,180,90]}, function(err, data, response) {
      // `${params[0]} since:${params[1]}-${params[2]}-${params[3]}`
      
      tweets.push(data.statuses
        .map(tweet => tweet));
        console.log(tweets)
        res.send(tweets);
      });
    });
  // }
//   console.log(tweets)
//   res.send(tweets);
// });



var doubleCheck;
var streamOn = false;
var stream = undefined;
var Streams = {};
var stream_count;
var streamMap;
io.on('connection', (socket) => {
  socket.on('trend', (trend) => {  
    // if (stream !== undefined){
    //   stream.stop();
    // }
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




// app.get('/live_feed', (req, res) => {
//   // const params = { tweet_mode: 'extended', count: 10 };
//     var trend = url.parse(req.url,true).search;
//     trend = trend.slice(1);
//     // .get(`statuses/home_timeline`, params)
//     T.get('search/tweets', { q: `${trend} since:2020-11-01`, count: 100 }, function(err, data, response) {
//     const tweets = data.statuses
//     .map(tweet => tweet)
//     res.send(tweets);
//     // .then(tweet => {
       
//     //   res.send(tweet);
//     // })
//     // .catch(error => {
//     // res.send(error);
//     // });
//     //console.log(tweets);

    
// });
// })


// (async () => {

//     //1. GET RECENT TWEETS
//     T.get('search/tweets', { q: '#tesla since:2020-11-18', count: 100 }, function(err, data, response) {
//       const tweets = data.statuses
//       .map(tweet => tweet.text)
//       .filter(tweet => tweet.toLowerCase().includes('elon'));
//       console.log(tweets);
//     })
// q
//     // //2. REAL TIME MONITORING USING STREAM (HASHTAG)
//     // var stream = T.stream('statuses/filter', { track: '#tesla' })
//     // stream.on('tweet', function (tweet) {
//     //     console.log(tweet.text);
//     //     console.log('------');
//     // })

//     // 3. REAL TIME MONITORING USING STREAM (LOCATION)
//     var sanFrancisco = [ '-122.75', '36.8', '-121.75', '37.8' ]
//     var stream = T.stream('statuses/filter', { locations: sanFrancisco })
    
//     //SHOW NOTIFICATION FOR EACH RECEIVED TWEET
//     // stream.on('tweet', function (tweet) {
//     //   console.log(tweet.text);
//     //   let url = `https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}`

//     //   notifier.notify({
//     //     title: tweet.user.name,
//     //     message: tweet.text
//     //   });

//     //   notifier.on('click', async function(notifierObject, options, event) {
//     //     console.log('clicked');
//     //     await open(url);
//     //   });
//     // })
//})();