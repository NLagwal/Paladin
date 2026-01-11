import axios from 'axios';

const METRICS_ENDPOINT = process.env.REACT_APP_METRICS_ENDPOINT || 'http://localhost:5000/api/metrics';

export async function recordMetric(metric: string, path: string, value?:  number) {
  try {
    await axios.post(METRICS_ENDPOINT, {
      metric,
      path,
      value,
      timestamp: new Date().toISOString(),
    }, {
      timeout: 5000,
    });
  } catch (error) {
    // Silently fail - don't crash app if metrics fail
    if (process.env.NODE_ENV === 'development') {
      console.warn('Error recording metric:', error);
    }
  }
}
