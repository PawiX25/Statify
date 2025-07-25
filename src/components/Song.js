import React from 'react';

const Song = ({ track, onGuess, disabled, result }) => {
  if (!track) {
    return (
      <div className="song-card h-full flex items-center justify-center p-6">
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  const resultClasses = {
    correct: 'border-green-500',
    incorrect: 'border-red-500',
  };

  return (
    <div className={`song-card h-full flex flex-col group relative ${result ? resultClasses[result] : ''}`}>
      <div className="relative overflow-hidden bg-gray-800">
        <div className="absolute inset-0 bg-gray-800"></div>
        <img 
          src={track.albumArt} 
          alt={track.name}
          className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110 relative z-10"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-20"></div>
        <div className="absolute bottom-4 left-6 right-6 z-30">
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Track</p>
          <h3 className="text-2xl font-medium text-white leading-tight">{track.name}</h3>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-grow bg-gray-900">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Artist</p>
        <p className="text-lg text-gray-300 mb-auto">{track.artist}</p>
        <button
          onClick={() => onGuess(track)}
          disabled={disabled}
          className={`dark-button w-full rounded mt-6 py-3 text-base font-medium
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800 hover:border-gray-400'}
          `}
        >
          {disabled ? '•••' : 'SELECT THIS TRACK'}
        </button>
      </div>
    </div>
  );
};

export default Song;