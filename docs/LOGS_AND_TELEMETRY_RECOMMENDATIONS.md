#TODO for Round 2: 

## Logs
*   Standardize log format (JSON: timestamp, service_name, level, message, trace_id).
*   Set up central log collection.
*   Configure all services to send logs to central collection.

## Tracing
*   Implement OpenTelemetry for distributed tracing in all services.
*   Ensure trace context propagates between services.
*   Set up a trace visualization tool (e.g., Jaeger).

## Metrics
*   Collect key performance metrics (latency, traffic, errors, saturation).
*   Set up Prometheus for metrics collection.
*   Create Grafana dashboards.

## Alerts
*   Define critical alerting rules.
*   Configure Alertmanager for notifications.
