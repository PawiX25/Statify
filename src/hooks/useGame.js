import { useState } from 'react';

const useGame = () => {
  const [score, setScore] = useState(0);

  return { score, setScore };
};

export default useGame;
