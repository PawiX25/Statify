import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import Song from './Song';
import Score from './Score';

const Game = ({ accessToken }) => {
  const [songs, setSongs] = useState([]);
  const [nextSongs, setNextSongs] = useState([]);
  const [score, setScore] = useState(0);
  const [gameState, setGameState] = useState('loading');
  const [animationState, setAnimationState] = useState('in');
  const [result, setResult] = useState(null);
  const [resultAnimationState, setResultAnimationState] = useState('in');
  const isMounted = useRef(true);

  const preloadImages = (songsToPreload) => {
    songsToPreload.forEach((song) => {
      if (song.albumArt) {
        const img = new Image();
        img.src = song.albumArt;
      }
    });
  };

  const fetchSongs = useCallback(async () => {
    try {
      const response = await axios.get('/api/random-songs', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (isMounted.current) {
        preloadImages(response.data);
        return response.data;
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
      if (isMounted.current) {
        setGameState('gameOver');
      }
    }
    return [];
  }, [accessToken]);

  const startNextRound = useCallback(() => {
    setAnimationState('out');
    setResultAnimationState('out');
    setTimeout(() => {
      setSongs(nextSongs);
      setResult(null);
      setGameState('playing');
      setAnimationState('in');
      fetchSongs().then(setNextSongs);
    }, 500);
  }, [nextSongs, fetchSongs]);

  useEffect(() => {
    isMounted.current = true;
    
    const initialFetch = async () => {
      setGameState('loading');
      const initialSongs = await fetchSongs();
      if (isMounted.current) {
        setSongs(initialSongs);
        const preloadedSongs = await fetchSongs();
        if (isMounted.current) {
          setNextSongs(preloadedSongs);
          setAnimationState('in');
          setGameState('playing');
        }
      }
    };

    initialFetch();

    return () => {
      isMounted.current = false;
    };
  }, [fetchSongs]);

  const handleGuess = (guessedSong) => {
    if (gameState !== 'playing') return;

    const otherSong = songs.find(song => song.id !== guessedSong.id);
    const correct = guessedSong.popularity >= otherSong.popularity;
    
    setResult({
        correct,
        correctSong: guessedSong.popularity >= otherSong.popularity ? guessedSong : otherSong
    });
    setResultAnimationState('in');
    setGameState('result');

    if (correct) {
      setTimeout(() => {
        setScore(prevScore => prevScore + 1);
        startNextRound();
      }, 2000);
    } else {
      setTimeout(() => {
        setAnimationState('out');
        setResultAnimationState('out');
        setTimeout(() => {
          setGameState('gameOver');
        }, 500);
      }, 2000);
    }
  };

  const handlePlayAgain = () => {
    setScore(0);
    setResult(null);
    setAnimationState('in');
    setGameState('loading');
    
    const initialFetch = async () => {
      const initialSongs = await fetchSongs();
      if (isMounted.current) {
        setSongs(initialSongs);
        const preloadedSongs = await fetchSongs();
        if (isMounted.current) {
          setNextSongs(preloadedSongs);
          setGameState('playing');
        }
      }
    };
    initialFetch();
  };

  if (gameState === 'loading') {
    return (
      <div className="w-full text-center">
        <p className="body-text mb-4">Loading Tracks...</p>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }
  if (gameState === 'gameOver') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 slide-up">
        <h1 className="text-5xl font-bold text-white mb-2">GAME OVER</h1>
        <div className="w-24 h-1 bg-red-500 mb-8"></div>
        
        <div className="text-center mb-8">
          <p className="text-6xl font-bold text-white mb-2">{score}</p>
          <p className="text-sm text-gray-500 uppercase tracking-wider">
            {score === 1 ? 'Round' : 'Rounds'} Won
          </p>
        </div>
        
        {result && !result.correct && result.correctSong.albumArt && (
          <div className="mb-8 text-center max-w-xs">
            <p className="text-sm text-gray-500 mb-4">The correct answer was</p>
            <div className="relative overflow-hidden rounded-lg mb-4">
              <img 
                src={result.correctSong.albumArt} 
                alt={result.correctSong.name}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            </div>
            <p className="text-lg text-white font-medium">{result.correctSong.name}</p>
            <p className="text-sm text-gray-400">{result.correctSong.artist}</p>
          </div>
        )}
        
        <button
          onClick={handlePlayAgain}
          className="dark-button px-6 py-3"
        >
          TRY AGAIN
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <Score score={score} />
        <h2 className="text-3xl text-gray-200 mt-8 font-medium">Which song is more popular?</h2>
        <p className="subtitle-text mt-2">Choose the track with higher Spotify popularity</p>
      </div>
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 ${animationState === 'in' ? 'fade-in' : 'fade-out'} ${gameState === 'result' || animationState === 'out' ? 'pointer-events-none' : ''}`}>
        {songs.map(song => (
          <Song 
            key={song.id}
            track={song} 
            onGuess={handleGuess}
            disabled={gameState === 'result'}
            result={result && result.correct && result.correctSong.id === song.id ? 'correct' : null}
          />
        ))}
      </div>
      {result && (
        <div className={`result-overlay ${resultAnimationState === 'in' ? 'fade-in' : 'fade-out'}`}>
          <div className="dark-card text-center px-12 py-8">
            <div className={`text-6xl mb-4 ${result.correct ? 'text-green-500' : 'text-red-500'}`}>
              {result.correct ? '✓' : '✗'}
            </div>
            <h2 className={`text-3xl font-bold mb-2 ${result.correct ? 'text-green-500' : 'text-red-500'}`}>
              {result.correct ? 'Correct!' : 'Incorrect'}
            </h2>
            {!result.correct && (
              <p className="body-text mt-4">
                The more popular track was: 
                <span className="text-white block mt-1 text-lg">{result.correctSong.name}</span>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;
