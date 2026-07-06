import { useState, useCallback } from 'react';
import api from '../utils/api';

export function useGenerateArchitecture() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const generate = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await api.post('/api/generate-architecture', formData);
      setResult(response.data);
    } catch (err) {
      setError(err.message || 'Failed to generate architecture.');
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { loading, result, error, generate, reset };
}
