import SearchResults from '../components/searchResults/searchResults';
import Playlist from '../components/playlist/playlist';
import SearchBar from '../components/searchBar/searchBar';
import styles from './page.module.css';
import { useState } from 'react';
import ACCESS from '../utils/apis';
const { AUTH_ENDPOINT, CLIENT_ID, CLIENT_SECRET } = ACCESS;
import { cn } from '../utils/styles';


export default function App() {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [custom_playlist, setCustomPlaylist] = useState<any[]>([]);
  const tracks = [
    {
      name: "Cowboy Like Me",
      artist: "Taylor Swift",
      album: "Evermore (deluxe version)",
      id: 123324123,
    },
    {
      name: "夜曲",
      artist: "Jay Chou",
      album: "11 月的蕭邦",
      id: 123324124,
    },
  ];
  const [token, setToken] = useState<string | null>(null);
   // Function to handle searching
  const handleSearch = async (searchTerm:string) => {
    if (!searchTerm || !token) return;

    setLoading(true);
    setError(null);
    setSearchResults([]); // Clear previous results

    try {
      const searchEndpoint = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
        searchTerm
      )}&type=track,artist,album&limit=50`;

      const response = await fetch(searchEndpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(data.tracks?.items || []); // Adjust based on the response structure
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogin = () => {
    const fetchToken = async () => {
      // Encode the client ID and secret for the Authorization header
      const authString = `${CLIENT_ID}:${CLIENT_SECRET}`;
      const encodedAuth = btoa(authString);

      // Construct the form data
      const formData = new URLSearchParams();
      formData.append('grant_type', 'client_credentials');
      // formData.append('client_id', clientId); // Not needed in body when in auth header
      // formData.append('client_secret', clientSecret); // Not needed in body when in auth header

      try {
        const response = await fetch(AUTH_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${encodedAuth}`,
          },
          body: formData.toString(), // Convert form data to string
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setToken(data.access_token);
      } catch (error: any) {
        console.log(error.message);
        setToken('');
      }
    };
    fetchToken();
  };

  const onTrackClick = (track: any) => {
    if (!custom_playlist.some((t) => t.id === track.id)) {
      setCustomPlaylist((prevPlaylist) => [...prevPlaylist, track]);
    }
  };
  
  const onTrackRemove = (track: any) => {
    setCustomPlaylist((prevPlaylist) =>
      prevPlaylist.filter((t) => t.id !== track.id)
    );
  };

  return (
    <>
    {!token ? (
        <button onClick={handleLogin}>Login to Spotify</button>
      ) : (
        <div className={cn(
          'min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-black',
          'flex flex-col items-center justify-start p-4 md:p-8'
        )}>
          <h1>Spotify App</h1>
          <SearchBar onSearch={handleSearch}/>
          <div className={styles.listContainer}>
            <SearchResults searchResults={searchResults} onTrackClick={onTrackClick}/>
            <Playlist playlist={custom_playlist} onTrackClick={onTrackRemove}/>
          </div>
        </div>
      )}
    </>
  );
}
