import React from 'react';

const Score = ({ score }) => {
  return (
    <div className="text-center">
      <div className="inline-flex items-center gap-3">
        <span className="text-xl text-gray-500 uppercase tracking-wider">Score</span>
        <span className="text-3xl font-bold text-white">
          {score}
        </span>
      </div>
    </div>
  );
};

export default Score;