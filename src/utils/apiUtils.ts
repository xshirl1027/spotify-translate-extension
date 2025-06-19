const CLIENT_ID = "f5a9264d7cbf4bbfaabcbc7c9da36665";
const CLIENT_SECRET = "7fef90afbbd24540b17acc461c335345";
const AUTH_ENDPOINT = "https://accounts.spotify.com/api/token";
const GENIUS_CLIENT_ID = "gb1_zQqMn_Z19et5ok9YUeN6o2DpLdy_WHMmRZfTbKEu2uQXUp63a8fPNkoER1X6";
const GENIUS_CLIENT_SECRET = "LHIBG_Le0AVGdD460hmJT5_oeHqj7SriJj5RGmNTRHhuUj_oTbFMRtxmX03NVaKyCQ0aY_FdrBYrRXQqNlr9WA";
const SCOPE = 'user-library-modify user-read-private user-read-email playlist-modify-private playlist-modify-public user-read-currently-playing user-modify-playback-state';
const GOOGLE_API_KEY="AIzaSyAWt-x1uVid1Gu7mxMeVWHz64xdyTMnO0s"

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


export default {
  CLIENT_ID: CLIENT_ID,
  CLIENT_SECRET: CLIENT_SECRET,
  AUTH_ENDPOINT: AUTH_ENDPOINT,
  GENIUS_CLIENT_ID: GENIUS_CLIENT_ID,
  GENIUS_CLIENT_SECRET: GENIUS_CLIENT_SECRET,
  SCOPE: SCOPE,
};
