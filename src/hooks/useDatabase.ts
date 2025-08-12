import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LeaderboardEntry } from '@/types/game';

export interface GameSession {
  id?: string;
  username: string;
  score: number;
  category?: string;
  completed_at: string;
}

export const useDatabase = () => {
  const calculateGrade = (averageScore: number): string => {
    const percentage = averageScore;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 30) return 'D';
    return 'F';
  };

  const saveGameScore = useCallback(async (username: string, score: number, category?: string) => {
    try {
      // Insert game session
      const { error: sessionError } = await supabase
        .from('game_sessions')
        .insert({
          username,
          score,
          category,
          completed_at: new Date().toISOString()
        });

      if (sessionError) throw sessionError;

      // Check if user exists in leaderboard
      const { data: existingUser, error: fetchError } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('username', username)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingUser) {
        // Update existing user
        const newTotalScore = existingUser.total_score + score;
        const newGamesPlayed = existingUser.games_played + 1;
        const newAverageScore = newTotalScore / newGamesPlayed;
        const maxPossiblePerGame = 100;
        const newPercentage = Math.round((newAverageScore / maxPossiblePerGame) * 100);
        const newGrade = calculateGrade(newAverageScore);

        const { error: updateError } = await supabase
          .from('leaderboard')
          .update({
            total_score: newTotalScore,
            games_played: newGamesPlayed,
            average_score: newAverageScore,
            percentage: newPercentage,
            grade: newGrade,
            last_played: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('username', username);

        if (updateError) throw updateError;
      } else {
        // Create new user entry
        const maxPossiblePerGame = 100;
        const percentage = Math.round((score / maxPossiblePerGame) * 100);
        const grade = calculateGrade(score);

        const { error: insertError } = await supabase
          .from('leaderboard')
          .insert({
            username,
            total_score: score,
            games_played: 1,
            average_score: score,
            percentage,
            grade,
            last_played: new Date().toISOString()
          });

        if (insertError) throw insertError;
      }

      return { success: true };
    } catch (error) {
      console.error('Error saving game score:', error);
      return { success: false, error };
    }
  }, []);

  const getLeaderboard = useCallback(async (limit = 10): Promise<LeaderboardEntry[]> => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .order('total_score', { ascending: false })
        .limit(limit);

      if (error) throw error;
      
      // Map database fields to match LeaderboardEntry interface
      return (data || []).map(item => ({
        id: item.id,
        username: item.username,
        score: item.total_score, // Map total_score to score for component compatibility
        total_score: item.total_score,
        gamesPlayed: item.games_played || 1, // Map games_played to gamesPlayed for component compatibility
        games_played: item.games_played,
        average_score: item.average_score,
        percentage: item.percentage,
        grade: item.grade,
        date: item.last_played, // Map last_played to date for backward compatibility
        last_played: item.last_played,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return [];
    }
  }, []);

  const getUserStats = useCallback(async (username: string): Promise<LeaderboardEntry | null> => {
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('username', username)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        return {
          id: data.id,
          username: data.username,
          score: data.total_score,
          total_score: data.total_score,
          gamesPlayed: data.games_played || 1, // Map games_played to gamesPlayed
          games_played: data.games_played,
          average_score: data.average_score,
          percentage: data.percentage,
          grade: data.grade,
          date: data.last_played,
          last_played: data.last_played,
          created_at: data.created_at,
          updated_at: data.updated_at
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return null;
    }
  }, []);

  const clearLeaderboard = useCallback(async () => {
    try {
      const { error } = await supabase
        .from('leaderboard')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error clearing leaderboard:', error);
      return { success: false, error };
    }
  }, []);

  return {
    saveGameScore,
    getLeaderboard,
    getUserStats,
    clearLeaderboard
  };
};