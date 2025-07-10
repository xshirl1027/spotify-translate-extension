const CLIENT_ID = "f5a9264d7cbf4bbfaabcbc7c9da36665";
const CLIENT_SECRET = "7fef90afbbd24540b17acc461c335345";
const AUTH_ENDPOINT = "https://accounts.spotify.com/api/token";
const GENIUS_CLIENT_ID = "gb1_zQqMn_Z19et5ok9YUeN6o2DpLdy_WHMmRZfTbKEu2uQXUp63a8fPNkoER1X6";
const GENIUS_CLIENT_SECRET = "LHIBG_Le0AVGdD460hmJT5_oeHqj7SriJj5RGmNTRHhuUj_oTbFMRtxmX03NVaKyCQ0aY_FdrBYrRXQqNlr9WA";
const SCOPE = 'user-library-modify user-read-private user-read-email playlist-modify-private playlist-modify-public user-read-currently-playing user-modify-playback-state';
const GOOGLE_API_KEY="AIzaSyAWt-x1uVid1Gu7mxMeVWHz64xdyTMnO0s"
const musixmatch_api_key = 'b04f6e8f37cca67c1054c0ec6d4232df';


/**
 * Generates a random string of the specified length.
 */
export const generateRandomString = (length: number): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

interface TranslateRequestBody {
  q: string;
  target: string;
}

interface Translation {
  translatedText: string;
  detectedSourceLanguage?: string;
}

interface TranslateResponseData {
  data: {
    translations: Translation[];
  };
}

export const translateText = async (
  text: string,
  targetLanguage: string
): Promise<string> => {
  const url = `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_API_KEY}`;
  
  const requestBody: TranslateRequestBody = {
    q: text,
    target: targetLanguage
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: TranslateResponseData = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Error translating text:', error);
    throw error;
  }
};


/**
 * Makes an API request with the given endpoint, method, and headers.
 */
export const makeApiRequest = async (
  endpoint: string,
  method: string,
  headers: Record<string, any>,
  body?: Record<string, any>
): Promise<any> => {

    const options: RequestInit = {
      method,
      headers
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(endpoint, options);

    if (!response.ok) {
      const errorDetails = await response.json();
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }
    if (response.status === 204) {
      return null; // No content
    }
    if(method !== 'PUT'){
      return response.json();
    }

};

 // function to save playlist to spotify
  // make request to create a new playlist
  // and add tracks to it
  
  
  export const createPlaylist = async (headers:any, playlistName: string, userId: string | null) => {
      const createPlaylistEndpoint = `https://api.spotify.com/v1/users/${userId}/playlists`;
      const createPlaylistData = {
        name: playlistName,
        description: 'Playlist created using Spotify Translate',
        public: false,
      };
      const response = await makeApiRequest(createPlaylistEndpoint, 'POST', headers, createPlaylistData);
      return response.id;
    };

  export const updatePlaylistName = async (headers: any, playlistName: string, playlistId: string | null) => {
      const updatePlaylistEndpoint = `https://api.spotify.com/v1/playlists/${playlistId}`;
      const updatePlaylistData = {
        name: playlistName,
        description: 'Playlist created using Spotify Translate',
        public: false,
      };
      await makeApiRequest(updatePlaylistEndpoint, 'PUT', headers, updatePlaylistData);
    };

  export const updatePlaylistItems = async (headers: any, playlistName: string, trackUris: string[], playlistId: string|null, prevSaveReq: any) => {
      //figure out which tracks to add and which tracks to remove
      //compare two tracks and returns two arrays: remove and add

      const prevTrackUris: string[] = prevSaveReq.trackUris;
      const addList = trackUris.filter((trackUri) => !prevTrackUris.includes(trackUri));
      const removeList = prevTrackUris
        .filter((trackUri) => !trackUris.includes(trackUri))
        .map((trackUri) => ({ uri: trackUri }));
      //if no changes made, return
      if(playlistName === prevSaveReq.playlistName && addList.length === 0 && removeList.length === 0) return "no changes made";
      if(addList.length > 0){
        const addTracksEndpoint = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
        const addTracksData = {
          uris: addList,
          position: 0,
        };
        await makeApiRequest(addTracksEndpoint, 'POST', headers, addTracksData);
      }
      if(removeList.length > 0){
        const removeTracksEndpoint = `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;
        const removeTracksData = {
          tracks:removeList,
        };
        await makeApiRequest(removeTracksEndpoint, 'DELETE', headers, removeTracksData);
      }
      return (prevSaveReq.trackUris.length === 0)?"playlist saved":"playlist updated";
  }

/**
 * Fetch lyrics from Genius given a track name and artist name.
 * This function uses the Genius API to search for the song, then scrapes the lyrics from the song page.
 * Note: This should be called from a backend/server due to CORS and scraping limitations.
 */
export const fetchLyricsFromGenius = async (
  trackName: string,
  artistName: string
): Promise<string | null> => {
  // 1. Search for the song on Genius
  const searchUrl = `https://api.genius.com/search?q=${encodeURIComponent(`${trackName} ${artistName}`)}`;
  const response = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${GENIUS_CLIENT_SECRET}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Genius API error: ${response.statusText}`);
  }

  const data = await response.json();
  const hit = data.response.hits.find((h: any) =>
    h.result.primary_artist.name.toLowerCase().includes(artistName.toLowerCase())
  );

  if (!hit) return null;

  const songPath = hit.result.path;
  const lyricsPageUrl = `https://genius.com${songPath}`;

  // 2. Fetch the lyrics page HTML
  const pageResponse = await fetch(lyricsPageUrl);
  const pageHtml = await pageResponse.text();

  // 3. Extract lyrics from the HTML (Genius uses <div data-lyrics-container="true">)
  const containerMatches = pageHtml.match(/<div data-lyrics-container="true">([\s\S]*?)<\/div>/g);
  if (containerMatches) {
    return containerMatches
      .map((div) => div.replace(/<[^>]+>/g, '').trim())
      .join('\n');
  }

  // Fallback: Try old Genius layout
  const lyricsMatch = pageHtml.match(/<div[^>]+class="lyrics"[^>]*>([\s\S]*?)<\/div>/);
  if (lyricsMatch && lyricsMatch[1]) {
    return lyricsMatch[1].replace(/<[^>]+>/g, '').trim();
  }

  return null;
};

/**
 * Fetches the Musixmatch track_id for a given track name and artist,
 * then fetches the subtitles (time-synced lyrics) for that track.
 * Returns the subtitles object or null if not found.
 */
export const getMusixmatchSubtitlesByTrack = async (
  trackName: string,
  artistName: string
): Promise<any | null> => {
  // try {
  //   //const proxyUrl = `https://api.musixmatch.com/ws/1.1/matcher.subtitle.get?apikey=${musixmatch_api_key}&q_track=${encodeURIComponent(trackName)}&q_artist=${encodeURIComponent(artistName)}`;
  //   const proxyUrl = `https://api.musixmatch.com/ws/1.1/matcher.subtitle.get?apikey=b04f6e8f37cca67c1054c0ec6d4232df&q_track=as%20it%20was&q_artist=harry%20styles`;
  //   const res = await fetch(proxyUrl);
  //   if (!res.ok) return null;
  //   const data = await res.json();
  //   return data.body.subtitle_body || null;
  // } catch (error) {
  //   console.error("Error fetching Musixmatch subtitles from proxy:", error);
  //   return null;
  // }
  const headers = {
    "Referrer Policy": "strict-origin-when-cross-origin",
    "Content-Type": "application/json"};
  try {
    const proxyUrl = `https://api.musixmatch.com/ws/1.1/matcher.subtitle.get?apikey=b04f6e8f37cca67c1054c0ec6d4232df&q_track=as%20it%20was&q_artist=harry%20styles`;
      const response = await makeApiRequest(proxyUrl, 'GET', headers, {});
      if (response.error === false) {
          console.log('Fetched time-stamped lyrics:', response.lines);
          return response.lines; // Assuming the response data is in the expected format
        }
      return null;

    } catch (error: any) {
      console.error('Error fetching time-stamped lyrics:', error.message);
      return null;
    }
};

export default {
  CLIENT_ID: CLIENT_ID,
  CLIENT_SECRET: CLIENT_SECRET,
  AUTH_ENDPOINT: AUTH_ENDPOINT,
  GENIUS_CLIENT_ID: GENIUS_CLIENT_ID,
  GENIUS_CLIENT_SECRET: GENIUS_CLIENT_SECRET,
  SCOPE: SCOPE,
};
