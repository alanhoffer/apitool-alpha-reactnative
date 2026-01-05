import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import apiClient from '../../modules/API/client';

interface SeasonalTip {
  id: number;
  title: string;
  content: string;
  category: string;
}

interface RecommendationsResponse {
  current_season: string;
  current_month: number;
  tips: SeasonalTip[];
}

export const SeasonalTipCard = () => {
  const [data, setData] = useState<RecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[SeasonalTip] Fetching recommendations...');
    apiClient.get('/recommendations')
      .then(response => {
          console.log('[SeasonalTip] Data received:', response.data);
          setData(response.data);
      })
      .catch(err => console.error('[SeasonalTip] Error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <ActivityIndicator />;
  if (!data || data.tips.length === 0) return null;

  // Mostramos el primer tip disponible
  const tip = data.tips[0];

  return (
    <View style={styles.card}>
      <Text style={styles.season}>{data.current_season.toUpperCase()}</Text>
      <Text style={styles.title}>{tip.title}</Text>
      <Text style={styles.content}>{tip.content}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  season: {
    color: '#d97706',
    fontWeight: '600',
    fontSize: 11,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1f2937',
  },
  content: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  }
});

