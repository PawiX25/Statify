import React from 'react';
import useGame from '../hooks/useGame';
import Song from './Song';
import Score from './Score';

const Game = ({ accessToken }) => {
  const { songs, score, gameState, loading, error, handleGuess, handleNext } = useGame(accessToken);

  if (loading) {
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

  if (error) {
    return (
      <div className="w-full text-center">
        <p className="body-text mb-4 text-red-500">{error}</p>
      </div>
    );
  }

  if (gameState === 'correct' || gameState === 'incorrect') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 slide-up">
        <h1 className="text-5xl font-bold text-white mb-2">
          {gameState === 'correct' ? 'CORRECT!' : 'GAME OVER'}
        </h1>
        <div className={`w-24 h-1 ${gameState === 'correct' ? 'bg-green-500' : 'bg-red-500'} mb-8`}></div>
        
        <div className="text-center mb-8">
          <p className="text-6xl font-bold text-white mb-2">{score}</p>
          <p className="text-sm text-gray-500 uppercase tracking-wider">
            {score === 1 ? 'Round' : 'Rounds'} Won
          </p>
        </div>
        
        <button
          onClick={handleNext}
          className="dark-button px-6 py-3"
        >
          {gameState === 'correct' ? 'NEXT ROUND' : 'TRY AGAIN'}
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4">
        {songs.map(song => (
          <Song 
            key={song.id}
            track={song} 
            onGuess={handleGuess}
          />
        ))}
      </div>
    </div>
  );
};

export default Game;
