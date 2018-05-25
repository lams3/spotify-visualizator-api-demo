const express = require('express');
const app = express();
const cors = require('cors');
const Spotify = require('spotify-web-api-node');

const back = 'http://localhost:8080';
const front = 'http://localhost:3000';

const spotify = new Spotify({
    clientId: '3fc13de1b4244f03869862525fe63ccf',
    clientSecret: 'd36a400b2cc7434494c875cd44eaa68b',
    redirectUri: `${back}/code`,
});

const scopes = [
    'streaming',
    'user-read-birthdate',
    'user-read-email',
    'user-read-private'
];

app.use(cors());

app.get('/login', (req, res, next) => {
    res.redirect(spotify.createAuthorizeURL(scopes));
});

app.get('/code', (req, res, next) => {
    spotify.authorizationCodeGrant(req.query.code)
        .then(data => res.redirect(`${front}?code=${data.body['access_token']}`));
});

app.get('/transfer/:code/:id', async (req, res, next) => {
    spotify.setAccessToken(req.params.code);
    spotify.transferMyPlayback({
        deviceIds: [req.params.id],
        play: true
    }).then(response => res.json(response));
});

app.get('/track/:code/:id', async (req, res, next) => {
    const response = {
        features: null,
        analysis: null
    };
    spotify.setAccessToken(req.params.code);
    spotify.getAudioFeaturesForTrack(req.params.id)
        .then(features => {
            response.features = features;
            return spotify.getAudioAnalysisForTrack(req.params.id);
        }).then(analysis => response.analysis = analysis)
        .then(() => res.json(response));
});

app.listen(8080, () => {
    console.log('Listening on port 8080');
})