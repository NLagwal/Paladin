const client = require('prom-client');
const register = new client.Registry();

client.collectDefaultMetrics({ register });

const pageViews = new client.Counter({
  name: 'frontend_page_views_total',
  help: 'Total number of page views in the frontend',
  labelNames: ['path'],
});

const httpRequestDurationMicroseconds = new client.Histogram({
  name: 'http_request_duration_microseconds',
  help: 'Duration of HTTP requests in microseconds',
  labelNames: ['method', 'route', 'code'],
  buckets: [0.1, 5, 15, 50, 100, 200, 300, 400, 500]
});

register.registerMetric(pageViews);
register.registerMetric(httpRequestDurationMicroseconds);

function handleFrontendMetric(req, res) {
  const { metric, path, value } = req.body;

  if (metric === 'page_view') {
    pageViews.inc({ path });
    res.status(200).send('Metric recorded');
  } else {
    res.status(400).send('Unknown metric');
  }
}

module.exports = {
  register,
  handleFrontendMetric,
  pageViews,
  httpRequestDurationMicroseconds,
};