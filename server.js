const express = require('express');
const { join } = require("path");
const app = express();
const { auth, requiredScopes } = require('express-oauth2-jwt-bearer');
const cors = require('cors');
var axios = require("axios").default;
const bodyParser = require('body-parser');
const checkScopes = requiredScopes('read:tester');

const checkJwt = auth( {
  audience: 'http://localhost:3000',
  issuerBaseURL:'https://dev-ja6utjro.us.auth0.com/'
})


//------------------------------------------------------------------------------------------------------------------------------------//
app.use(express.static(join(__dirname, "public")));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
} ) );

//------------------------------------------------------------------------------------------------------------------------------------//
// This route doesn't need authentication
app.get('/api/public', function(req, res) {
  res.json({
    message: 'Hello from a public endpoint! You don\'t need to be authenticated to see this.'
  });
});

// This route needs authentication
app.get('/api/private', checkJwt, function(req, res) {
  res.json({
    message: 'Hello from a private endpoint! You need to be authenticated to see this.'
  });
});

app.get( '/api/private-scoped', checkJwt, checkScopes, function ( req, res )
{
  console.log('Here in private');

const MgtApiOptions = {
  method: 'POST',
  url: 'https://dev-ja6utjro.us.auth0.com/oauth/token',
  headers: {'content-type': 'application/x-www-form-urlencoded'},
  data: new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: '6kNnizBGAeOa5lKqUoh8D9QCbIdHhKpE',
    client_secret: 'bfgN1IcgJm19yBTvUgutwXjTzg7PxSpp9dm5WTILeebvkSy_6UB7QPNgCBS2br1D',
    audience: 'https://dev-ja6utjro.us.auth0.com/api/v2/'
  })
};

const clientOptions = {
  method: 'GET',
  url: 'https://dev-ja6utjro.us.auth0.com/',
}

async function getMgtToken () {
  const res = await axios.request(MgtApiOptions);
  const token = res.data['access_token']
  return token
};
async function fetchClientData() {
  let mgtToken = await getMgtToken();
  console.log(mgtToken)
  let clients = await axios.request(clientOptions);
  console.log(clients);
}
fetchClientData()


















});

app.get("/auth_config.json", (req, res) => {
  res.sendFile(join(__dirname, "auth_config.json"));
});

app.get("/*", (_, res) => {
    res.sendFile(join(__dirname, "index.html"));
  });
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
app.use(function(err, req, res, next) {
    if (err.name === "UnauthorizedError") {
      return res.status(401).send({ msg: "Invalid token" });
    }
  
    next(err, req, res);
  });

app.listen(3000, function() {
  console.log('Listening on http://localhost:3000');
});