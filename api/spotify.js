const axios = require('axios');
const querystring = require('querystring');

const generateRandomString = (length) => {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const getRandomSearch = () => {
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  const randomCharacter = characters.charAt(Math.floor(Math.random() * characters.length));
  return `${randomCharacter}%`;
};

const getApiAuth = () => `Basic ${Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString('base64')}`;

const getBaseUrl = (req) => {
  if (process.env.NODE_ENV === 'development') {
    return process.env.FRONTEND_URI;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  const host = req.headers['x-forwarded-host'] || req.headers['host'];
  return `https://${host}`;
};

const handleLogin = (req, res) => {
  const state = generateRandomString(16);
  const baseUrl = getBaseUrl(req);
  const redirect_uri = `${baseUrl}/api/spotify?action=callback`;

  const scope = 'user-read-private user-read-email playlist-read-private';
  const queryParams = querystring.stringify({
    client_id: process.env.SPOTIFY_CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirect_uri,
    state: state,
    scope: scope,
  });

  res.redirect(`https://accounts.spotify.com/authorize?${queryParams}`);
};

const handleCallback = async (req, res) => {
  const code = req.query.code || null;
  const baseUrl = getBaseUrl(req);
  const redirect_uri = `${baseUrl}/api/spotify?action=callback`;

  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect_uri,
      }),
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        Authorization: getApiAuth(),
      },
    });

    if (response.status === 200) {
      const { access_token, refresh_token, expires_in } = response.data;
      const queryParams = querystring.stringify({ access_token, refresh_token, expires_in });
      res.redirect(`${baseUrl}/?${queryParams}`);
    } else {
      res.redirect(`${baseUrl}/?error=invalid_token`);
    }
  } catch (error) {
    res.status(500).send(error.message);
  }
};

const handleRandomSongs = async (req, res) => {
    const accessToken = req.headers.authorization?.split(' ')[1];
    if (!accessToken) {
        return res.status(401).send('Access token missing');
    }

    const getTwoRandomSongs = async () => {
        const query = querystring.stringify({
            q: getRandomSearch(),
            type: 'track',
            limit: 50,
            offset: Math.floor(Math.random() * 950)
        });

        const response = await axios.get(`https://api.spotify.com/v1/search?${query}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const tracks = response.data.tracks.items.filter(track => track.popularity > 0 && track.album.images.length > 0);
        if (tracks.length < 2) return null;

        const index1 = Math.floor(Math.random() * tracks.length);
        let index2 = Math.floor(Math.random() * tracks.length);
        while (index1 === index2) {
            index2 = Math.floor(Math.random() * tracks.length);
        }
        
        const formatTrack = (track) => ({
            id: track.id,
            name: track.name,
            artist: track.artists.map(a => a.name).join(', '),
            albumArt: track.album.images[0].url,
            popularity: track.popularity
        });

        return [formatTrack(tracks[index1]), formatTrack(tracks[index2])];
    };

    try {
        let songs = null;
        for (let i = 0; i < 5 && songs === null; i++) {
            songs = await getTwoRandomSongs();
        }

        if (songs) {
            res.json(songs);
        } else {
            res.status(500).send('Could not find two suitable songs.');
        }
    } catch (error) {
        res.status(500).send('Failed to fetch songs from Spotify.');
    }
};

module.exports = (req, res) => {
  const { action } = req.query;

  switch (action) {
    case 'login':
      return handleLogin(req, res);
    case 'callback':
      return handleCallback(req, res);
    case 'random-songs':
      return handleRandomSongs(req, res);
    default:
      res.status(400).send('No action specified.');
  }
};
