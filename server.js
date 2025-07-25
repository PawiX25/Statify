require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const querystring = require('querystring');

const app = express();
const port = process.env.PORT || 8888;

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;
const FRONTEND_URI = process.env.FRONTEND_URI;

app.use(cors());
app.use(express.json());

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = (length) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const stateKey = 'spotify_auth_state';

app.get('/login', (req, res) => {
  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  const scope = 'user-read-private user-read-email playlist-read-private';
  const queryParams = querystring.stringify({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    state: state,
    scope: scope,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
});

app.get('/callback', (req, res) => {
  const code = req.query.code || null;

  axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data: querystring.stringify({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI,
    }),
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
    },
  })
    .then(response => {
      if (response.status === 200) {
        const { access_token, refresh_token, expires_in } = response.data;

        const queryParams = querystring.stringify({
          access_token,
          refresh_token,
          expires_in,
        });

        res.redirect(`${FRONTEND_URI}/?${queryParams}`);
      } else {
        res.redirect(`/?${querystring.stringify({ error: 'invalid_token' })}`);
      }
    })
    .catch(error => {
      res.send(error);
    });
});

app.get('/refresh_token', (req, res) => {
  const { refresh_token } = req.query;

  axios({
    method: 'post',
    url: 'https://accounts.spotify.com/api/token',
    data: querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token: refresh_token,
    }),
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')}`,
    },
  })
    .then(response => {
      res.send(response.data);
    })
    .catch(error => {
      res.send(error);
    });
});

const getRandomSearch = () => {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  const randomCharacter = characters.charAt(Math.floor(Math.random() * characters.length));
  let randomSearch = '';
  switch (Math.round(Math.random())) {
    case 0:
      randomSearch = randomCharacter + '%';
      break;
    case 1:
      randomSearch = '%' + randomCharacter + '%';
      break;
  }
  return randomSearch;
}

app.get('/api/random-songs', async (req, res) => {
    const accessToken = req.headers.authorization.split(' ')[1];
    if (!accessToken) {
        return res.status(401).send('Access token missing');
    }

    const getTwoRandomSongs = async () => {
        try {
            const query = querystring.stringify({
                q: getRandomSearch(),
                type: 'track',
                limit: 50,
                offset: Math.floor(Math.random() * 950) // Max offset is 950 to stay under 1000 total with limit 50
            });

            const response = await axios.get(`https://api.spotify.com/v1/search?${query}`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`
                }
            });

            const tracks = response.data.tracks.items.filter(track => track.popularity > 0);
            if (tracks.length < 2) {
                return null; // Not enough tracks found, will retry
            }

            const index1 = Math.floor(Math.random() * tracks.length);
            let index2 = Math.floor(Math.random() * tracks.length);
            while (index1 === index2) {
                index2 = Math.floor(Math.random() * tracks.length);
            }
            
            const formatTrack = (track) => ({
                id: track.id,
                name: track.name,
                artist: track.artists.map(artist => artist.name).join(', '),
                albumArt: track.album.images[0]?.url,
                popularity: track.popularity
            });

            return [formatTrack(tracks[index1]), formatTrack(tracks[index2])];
        } catch (error) {
            console.error('Error fetching from Spotify:', error.response ? error.response.data : error.message);
            throw error;
        }
    };

    try {
        let songs = null;
        let retries = 5;
        while (songs === null && retries > 0) {
            songs = await getTwoRandomSongs();
            retries--;
        }

        if (songs) {
            res.json(songs);
        } else {
            res.status(500).send('Could not find two suitable songs after multiple attempts.');
        }
    } catch (error) {
        res.status(500).send('Failed to fetch songs from Spotify.');
    }
});


app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
