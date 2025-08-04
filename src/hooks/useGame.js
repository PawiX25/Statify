import { useState, useEffect, useCallback } from 'react';

const useGame = (accessToken) => {
  const [songs, setSongs] = useState([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('playing'); // 'playing', 'correct', 'incorrect'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchSongs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/spotify?action=random-songs', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch songs');
      }
      const data = await response.json();
      setSongs(data);
      setGameState('playing');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      fetchSongs();
    }
  }, [accessToken, fetchSongs]);

  const handleGuess = (selectedSong) => {
    const otherSong = songs.find(song => song.id !== selectedSong.id);
    if (selectedSong.popularity >= otherSong.popularity) {
      setScore(prev => prev + 1);
      setGameState('correct');
    } else {
      setGameState('incorrect');
    }
  };

  const handleNext = () => {
    fetchSongs();
  };

  return { songs, score, gameState, loading, error, handleGuess, handleNext };
};

export default useGame;
