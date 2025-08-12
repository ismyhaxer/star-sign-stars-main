import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LeaderboardEntry } from '../types/game';
import { useDatabase } from '@/hooks/useDatabase';

interface LeaderboardProps {
  onBack: () => void;
  onLogout: () => void;
  refreshTrigger?: number;
}

export const Leaderboard = ({ onBack, onLogout, refreshTrigger }: LeaderboardProps) => {
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { getLeaderboard } = useDatabase();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      const data = await getLeaderboard(10);
      setScores(data);
      setLoading(false);
    };

    fetchLeaderboard();
  }, [refreshTrigger, getLeaderboard]);

  const getPositionEmoji = (position: number): string => {
    const emojis = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    return emojis[position - 1] || '📍';
  };

  const getGradeColor = (grade: string): string => {
    if (grade.startsWith('A')) return 'text-success';
    if (grade.startsWith('B')) return 'text-primary';
    if (grade.startsWith('C')) return 'text-secondary';
    return 'text-destructive';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 floating-animation">🏆</div>
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4 floating-animation">🏆</div>
          <h1 className="text-4xl font-bold gradient-text mb-2">
            Leaderboard
          </h1>
          <p className="text-muted-foreground">
            Top cosmic scholars and their achievements
          </p>
        </div>

        {/* Leaderboard */}
        {scores.length === 0 ? (
          <div className="celebrity-card text-center">
            <div className="text-6xl mb-4">⭐</div>
            <h3 className="text-xl font-bold mb-2">No scores yet!</h3>
            <p className="text-muted-foreground">
              Be the first to complete a game and claim your spot on the leaderboard.
            </p>
          </div>
        ) : (
          <div className="space-y-4 mb-8">
            {scores.map((entry, index) => (
              <div key={`${entry.username}-${entry.id || entry.date}`} className="celebrity-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">
                      {getPositionEmoji(index + 1)}
                    </div>
                    
                    <div>
                      <div className="font-bold text-lg gradient-text">
                        {entry.username}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(entry.date)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 text-center">
                    <div>
                      <div className="font-bold text-xl gradient-text">
                        {entry.score}
                      </div>
                      <div className="text-xs text-muted-foreground">Score</div>
                    </div>
                    
                    <div>
                      <div className="font-bold text-xl text-accent">
                        {entry.gamesPlayed}
                      </div>
                      <div className="text-xs text-muted-foreground">Games</div>
                    </div>

                    <div>
                      <div className="font-bold text-xl text-primary">
                        {entry.percentage}%
                      </div>
                      <div className="text-xs text-muted-foreground">Accuracy</div>
                    </div>

                    <div>
                      <div className={`font-bold text-xl ${getGradeColor(entry.grade)}`}>
                        {entry.grade}
                      </div>
                      <div className="text-xs text-muted-foreground">Grade</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={onBack}
            className="btn-primary px-8 py-3"
          >
            Back to Game ⭐
          </Button>
          <Button 
            onClick={onLogout}
            variant="outline"
            className="px-8 py-3"
          >
            Logout 🚪
          </Button>
        </div>
      </div>
    </div>
  );
}; 