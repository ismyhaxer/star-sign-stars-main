import { useState, useCallback, useEffect } from 'react';
import { GameState, Celebrity, CelebrityCategory, LeaderboardEntry } from '../types/game';
import { getRandomCelebrities } from '../data/celebrities';
import { calculateZodiacSign } from '../data/zodiac';
import { useSounds } from './useSounds';
import { useDatabase } from './useDatabase';

const ROUNDS_PER_GAME = 5;
const POINTS_PER_CORRECT = 20;
const ROUND_TIME = 30; // seconds


export const useGame = () => {
  const { saveGameScore } = useDatabase();
  const [gameState, setGameState] = useState<GameState>({
    currentRound: 0,
    score: 0,
    selectedCategory: null,
    currentCelebrity: null,
    gamePhase: 'login',
    timeLeft: ROUND_TIME,
    isAnswered: false,
    lastAnswer: null,
    usedCelebrities: []
  });

  const [username, setUsername] = useState<string>('');
  const { playTick, playCritical, playCorrect, playIncorrect, playSelect, playGameOver } = useSounds();

  // Define nextRound first (before it's used in useEffect)
  const nextRound = useCallback(() => {
    setGameState(prev => {
      const nextRoundNum = prev.currentRound + 1;
      const nextCelebrity = prev.usedCelebrities[nextRoundNum - 1];
      
      return {
        ...prev,
        currentRound: nextRoundNum,
        currentCelebrity: nextCelebrity,
        gamePhase: 'quiz',
        timeLeft: ROUND_TIME,
        isAnswered: false,
        lastAnswer: null
      };
    });
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState.gamePhase === 'quiz' && gameState.timeLeft > 0 && !gameState.isAnswered) {
      interval = setInterval(() => {
        setGameState(prev => {
          if (prev.timeLeft <= 1) {
            // Time's up - auto advance
            playIncorrect();
            return {
              ...prev,
              timeLeft: 0,
              isAnswered: true,
              lastAnswer: {
                correct: false,
                selectedZodiac: 'Time\'s up!',
                correctZodiac: calculateZodiacSign(prev.currentCelebrity!.birthday).name
              }
            };
          }
          // Play tick sound for last 10 seconds
          if (prev.timeLeft <= 10) {
            if (prev.timeLeft <= 5) {
              playCritical();
            } else {
              playTick();
            }
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [gameState.gamePhase, gameState.timeLeft, gameState.isAnswered, playIncorrect, playTick, playCritical]);

  // Auto-advance after feedback
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (gameState.gamePhase === 'feedback') {
      timeout = setTimeout(() => {
        if (gameState.currentRound >= ROUNDS_PER_GAME) {
          // Game over
          playGameOver();
          setGameState(prev => ({ ...prev, gamePhase: 'game-over' }));
        } else {
          // Next round
          nextRound();
        }
      }, 2000);
    }

    return () => clearTimeout(timeout);
  }, [gameState.gamePhase, gameState.currentRound, playGameOver, nextRound]);

  const login = useCallback((user: string, pass: string) => {
    const users = JSON.parse(localStorage.getItem('zodiac-users') || '{}');
    if (users[user] && users[user] === pass) {
      // 4-hour restriction removed - users can play unlimited times
      setUsername(user);
      setGameState(prev => ({ ...prev, gamePhase: 'category-selection' }));
      return { success: true };
    }
    return { success: false, error: 'Invalid username or password' };
  }, []);

  const signup = useCallback((user: string, pass: string) => {
    const users = JSON.parse(localStorage.getItem('zodiac-users') || '{}');
    if (users[user]) {
      return { success: false, error: 'This username is already taken. Please choose a different username.' };
    }
    users[user] = pass;
    localStorage.setItem('zodiac-users', JSON.stringify(users));
    setUsername(user);
    setGameState(prev => ({ ...prev, gamePhase: 'category-selection' }));
    return { success: true };
  }, []);

  const selectCategory = useCallback((category: CelebrityCategory) => {
    playSelect();
    const celebrities = getRandomCelebrities(category, ROUNDS_PER_GAME);
    setGameState(prev => ({
      ...prev,
      selectedCategory: category,
      gamePhase: 'quiz',
      currentRound: 1,
      currentCelebrity: celebrities[0],
      usedCelebrities: celebrities,
      timeLeft: ROUND_TIME,
      isAnswered: false
    }));
  }, [playSelect]);

  const answerQuestion = useCallback((selectedZodiac: string) => {
    if (gameState.isAnswered || !gameState.currentCelebrity) return;

    const correctZodiac = calculateZodiacSign(gameState.currentCelebrity.birthday);
    const isCorrect = selectedZodiac === correctZodiac.name;
    
    // Play sound based on correctness
    if (isCorrect) {
      playCorrect();
    } else {
      playIncorrect();
    }
    
    setGameState(prev => ({
      ...prev,
      isAnswered: true,
      score: isCorrect ? prev.score + POINTS_PER_CORRECT : prev.score,
      lastAnswer: {
        correct: isCorrect,
        selectedZodiac,
        correctZodiac: correctZodiac.name
      },
      gamePhase: 'feedback'
    }));
  }, [gameState.isAnswered, gameState.currentCelebrity, playCorrect, playIncorrect]);

  const calculateGrade = useCallback((score: number): string => {
    const percentage = (score / (ROUNDS_PER_GAME * POINTS_PER_CORRECT)) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 30) return 'D';
    return 'F';
  }, []);

  const saveScore = useCallback(async () => {
  console.log('Saving score for user:', username);
  if (!username) {
    console.error('No username found when saving score');
    return { success: false, error: 'No username' };
  }

  const result = await saveGameScore(
    username,
    gameState.score,
    gameState.selectedCategory || undefined
  );
  
  console.log('Database save result:', result);
  return result;
}, [username, gameState.score, gameState.selectedCategory, saveGameScore]);

  const resetGame = useCallback(() => {
    playSelect();
    setGameState({
      currentRound: 0,
      score: 0,
      selectedCategory: null,
      currentCelebrity: null,
      gamePhase: 'category-selection',
      timeLeft: ROUND_TIME,
      isAnswered: false,
      lastAnswer: null,
      usedCelebrities: []
    });
  }, [playSelect]);

  const exitGame = useCallback(() => {
    playSelect();
    setGameState(prev => ({
      ...prev,
      gamePhase: 'category-selection',
      currentRound: 0,
      score: 0,
      selectedCategory: null,
      currentCelebrity: null,
      timeLeft: ROUND_TIME,
      isAnswered: false,
      lastAnswer: null,
      usedCelebrities: []
    }));
  }, [playSelect]);

  const showLeaderboard = useCallback(() => {
    playSelect();
    setGameState(prev => ({ ...prev, gamePhase: 'leaderboard' }));
  }, [playSelect]);

  const logout = useCallback(() => {
    playSelect();
    setUsername('');
    setGameState({
      currentRound: 0,
      score: 0,
      selectedCategory: null,
      currentCelebrity: null,
      gamePhase: 'login',
      timeLeft: ROUND_TIME,
      isAnswered: false,
      lastAnswer: null,
      usedCelebrities: []
    });
  }, [playSelect]);

  return {
    gameState,
    username,
    login,
    signup,
    logout,
    selectCategory,
    answerQuestion,
    calculateGrade,
    saveScore,
    resetGame,
    exitGame,
    showLeaderboard,
    ROUNDS_PER_GAME,
    POINTS_PER_CORRECT
  };
};