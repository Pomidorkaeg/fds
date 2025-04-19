import { useState, useEffect } from 'react';
import { fetchMatches, addMatch, updateMatch, deleteMatch, getLocalMatches, saveLocalMatches } from '@/utils/api/matches';

export type MatchStatus = 'scheduled' | 'live' | 'finished';

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  time: string;
  venue: string;
  competition: string;
  status: MatchStatus;
  score?: {
    home: number;
    away: number;
  };
}

export const useMatches = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [isApiAvailable, setIsApiAvailable] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setIsLoading(true);
        // Сначала загружаем из локального хранилища
        const localMatches = getLocalMatches();
        setMatches(localMatches);
        
        // Затем пытаемся получить данные из API
        const apiMatches = await fetchMatches();
        
        if (apiMatches && apiMatches.length > 0) {
          setMatches(apiMatches);
          setIsApiAvailable(true);
          setError('');
        } else {
          setIsApiAvailable(false);
          setError('Используются сохраненные данные. API недоступен.');
        }
      } catch (err) {
        console.error('Error loading matches:', err);
        setIsApiAvailable(false);
        setError('Используются сохраненные данные. API недоступен.');
      } finally {
        setIsLoading(false);
      }
    };

    loadMatches();
  }, []);

  const handleAddMatch = async (match: Match) => {
    try {
      const newMatch = await addMatch(match);
      setMatches(prev => [...prev, newMatch]);
      if (!isApiAvailable) {
        setError('Используются сохраненные данные. API недоступен.');
      }
    } catch (err) {
      console.error('Error adding match:', err);
      throw err;
    }
  };

  const handleUpdateMatch = async (updatedMatch: Match) => {
    try {
      const match = await updateMatch(updatedMatch);
      setMatches(prev => prev.map(m => m.id === match.id ? match : m));
      if (!isApiAvailable) {
        setError('Используются сохраненные данные. API недоступен.');
      }
    } catch (err) {
      console.error('Error updating match:', err);
      throw err;
    }
  };

  const handleDeleteMatch = async (matchId: string) => {
    try {
      await deleteMatch(matchId);
      setMatches(prev => prev.filter(m => m.id !== matchId));
      if (!isApiAvailable) {
        setError('Используются сохраненные данные. API недоступен.');
      }
    } catch (err) {
      console.error('Error deleting match:', err);
      throw err;
    }
  };

  const handleSaveMatches = async (newMatches: Match[]) => {
    try {
      saveLocalMatches(newMatches);
      setMatches(newMatches);
      if (!isApiAvailable) {
        setError('Используются сохраненные данные. API недоступен.');
      }
    } catch (err) {
      console.error('Error saving matches:', err);
      throw err;
    }
  };

  return {
    matches,
    setMatches,
    isLoading,
    error,
    isApiAvailable,
    addMatch: handleAddMatch,
    updateMatch: handleUpdateMatch,
    deleteMatch: handleDeleteMatch,
    saveMatches: handleSaveMatches
  };
}; 