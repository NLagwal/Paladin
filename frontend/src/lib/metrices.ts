import axios from 'axios';

const METRICS_ENDPOINT = 'http://localhost:5000/api/metrics';

export async function recordMetric(metric: string, path: string, value?: number) {
  try {
    await axios.post(METRICS_ENDPOINT, {
      metric,
      path,
      value,
    });
  } catch (error) {
    console.error('Error recording metric:', error);
  }
};