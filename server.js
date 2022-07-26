const express = require('express');
const { join } = require("path");
const app = express();
const { auth, requiredScopes } = require('express-oauth2-jwt-bearer');
const authConfig = require("./auth_config.json");
const { expressjwt: jwt } = require("express-jwt");
const jwtAuthz = require("express-jwt-authz");
const jwksRsa = require('jwks-rsa');
const cors = require('cors');
const bodyParser = require('body-parser');
const checkScopes = requiredScopes('read:tester');
const options = {
  customScopeKey: 'permissions'
};
const getUsersScopes = jwtAuthz(['read:tester'], options);

const checkJwt = jwt({
  // Dynamically provide a signing key based on the kid in the header and the signing keys provided by the JWKS endpoint
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://dev-ja6utjro.us.auth0.com/.well-known/jwks.json`
  }),

  // Validate the audience and the issuer
  audience: 'http://localhost:3000', //replace with your API's audience, available at Dashboard > APIs
  issuer: 'https://dev-ja6utjro.us.auth0.com/',
  algorithms: [ 'RS256' ]
});
//------------------------------------------------------------------------------------------------------------------------------------//
app.use(express.static(join(__dirname, "public")));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));


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

app.get('/api/private-scoped', checkJwt, getUsersScopes, function(req, res) {
  res.json({
    message: 'Hello from a private endpoint! You need to be authenticated and have a scope of read:messages to see this.'
  });
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