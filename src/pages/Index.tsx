import { useState } from 'react';
import { useGame } from '../hooks/useGame';
import { LoginScreen } from '../components/LoginScreen';
import { CategorySelection } from '../components/CategorySelection';
import { QuizScreen } from '../components/QuizScreen';
import { FeedbackScreen } from '../components/FeedbackScreen';
import { GameOverScreen } from '../components/GameOverScreen';
import { Leaderboard } from '../components/Leaderboard';
import { DatabaseTest } from '@/components/DatabaseTest';



const Index = () => {
  const [leaderboardRefresh, setLeaderboardRefresh] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  const {
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
  } = useGame();

  const handleSaveScore = async () => {
    console.log('handleSaveScore called with score:', gameState.score);
    setIsSaving(true);
    try {
      const result = await saveScore();
      console.log('Save score result:', result);
      setLeaderboardRefresh(prev => prev + 1);
    } catch (error) {
      console.error('Failed to save score:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderCurrentScreen = () => {
    console.log('Current game phase:', gameState.gamePhase);

    try {
      switch (gameState.gamePhase) {
        case 'login':
          return <LoginScreen onLogin={login} onSignup={signup} />;

        case 'category-selection':
          return (
            <CategorySelection
              onSelectCategory={selectCategory}
              onShowLeaderboard={showLeaderboard}
              onLogout={logout}
            />
          );

        case 'quiz':
          if (!gameState.currentCelebrity) {
            console.error('No current celebrity in quiz phase');
            return <div>Loading...</div>;
          }
          return (
            <QuizScreen
              celebrity={gameState.currentCelebrity}
              currentRound={gameState.currentRound}
              totalRounds={ROUNDS_PER_GAME}
              timeLeft={gameState.timeLeft}
              score={gameState.score}
              onAnswer={answerQuestion}
              onExit={exitGame}
              isAnswered={gameState.isAnswered}
            />
          );

        case 'feedback':
          if (!gameState.lastAnswer || !gameState.currentCelebrity) {
            console.error('Missing data in feedback phase');
            return <div>Loading...</div>;
          }
          return (
            <FeedbackScreen
              celebrity={gameState.currentCelebrity}
              isCorrect={gameState.lastAnswer.correct}
              selectedZodiac={gameState.lastAnswer.selectedZodiac}
              correctZodiac={gameState.lastAnswer.correctZodiac}
              score={gameState.score}
            />
          );

        case 'game-over':
          return (
            <GameOverScreen
              score={gameState.score}
              totalPossible={ROUNDS_PER_GAME * POINTS_PER_CORRECT}
              grade={calculateGrade(gameState.score)}
              username={username}
              onPlayAgain={resetGame}
              onShowLeaderboard={showLeaderboard}
              onSaveScore={handleSaveScore}
              isSaving={isSaving}
            />
          );

        case 'leaderboard':
          return (
            <Leaderboard
              onBack={resetGame}
              onLogout={logout}
              refreshTrigger={leaderboardRefresh}
            />
          );

        default:
          console.error('Unknown game phase:', gameState.gamePhase);
          return <LoginScreen onLogin={login} onSignup={signup} />;
      }
    } catch (error) {
      console.error('Error rendering screen:', error);
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong!</h2>
            <p className="text-gray-600 mb-4">Please refresh the page to try again.</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10">
      {renderCurrentScreen()}
    </div>
  );
};

export default Index;