# Telemetry Sidebar Implementation

## Overview
The left sidebar (TelemetrySidebar) now displays real-time system metrics using WebSocket connections and the `systeminformation` npm package.

## Implementation Details

### Backend (API Gateway)

1. **Dependencies Added**:
   - `socket.io` - WebSocket server
   - `systeminformation` - System metrics collection

2. **Files Created/Modified**:
   - `api-gateway/src/telemetry.js` - System metrics collection module
   - `api-gateway/src/index.js` - WebSocket server setup

3. **WebSocket Server**:
   - Listens on the same port as the HTTP server (5000)
   - Emits `telemetry:update` events every 2 seconds
   - Sends initial data on connection
   - Handles reconnections automatically

4. **Metrics Collected**:
   - **CPU**: Current load percentage
   - **Memory**: Used memory percentage
   - **Disk**: Root filesystem usage percentage
   - **Network**: KB/s calculated from rx/tx bytes difference
   - **Uptime**: Process uptime in seconds

### Frontend (TelemetrySidebar)

1. **WebSocket Connection**:
   - Connects to API Gateway WebSocket server
   - Uses `socket.io-client` (already installed)
   - Auto-reconnects on disconnect
   - Connection status indicator (green dot = connected, red = disconnected)

2. **Real-time Updates**:
   - Receives telemetry data every 2 seconds
   - Updates CPU and RAM progress rings
   - Updates network activity chart
   - Shows percentage values below each metric

3. **Display**:
   - CPU: Progress ring + percentage
   - RAM: Progress ring + percentage  
   - Network: Line chart showing KB/s over time + current value

## Usage

### Starting the System

1. **Install dependencies** (if not already done):
   ```bash
   cd api-gateway
   npm install
   ```

2. **Start API Gateway**:
   ```bash
   npm run dev
   ```

3. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

### Testing

1. Open browser console to see WebSocket connection logs
2. Check for connection indicator (green dot in sidebar)
3. Verify metrics update every 2 seconds
4. Test network activity by generating some traffic

### WebSocket Events

- **`telemetry:update`**: Sent every 2 seconds with current system metrics
- **`telemetry:error`**: Sent on errors
- **Connection events**: `connect`, `disconnect`, `connect_error`

## Data Format

```typescript
interface TelemetryData {
  cpu: number;           // 0-100 percentage
  memory: number;        // 0-100 percentage
  disk: number;         // 0-100 percentage
  network: Array<{      // Last 30 data points
    value: number;      // KB/s
  }>;
  uptime: number;       // Seconds
  timestamp: string;    // ISO timestamp
  error?: string;       // Error message if any
}
```

## Troubleshooting

### Connection Issues

1. **Check API Gateway is running**: `curl http://localhost:5000/health`
2. **Check WebSocket connection in browser console**
3. **Verify CORS settings** in `api-gateway/src/index.js`
4. **Check firewall** isn't blocking port 5000

### No Data Showing

1. **Check browser console** for WebSocket errors
2. **Verify `systeminformation` package** is installed
3. **Check API Gateway logs** for telemetry errors
4. **Verify connection indicator** shows green (connected)

### Network Chart Not Updating

1. **Generate some network traffic** to see changes
2. **Check network history array** is being populated
3. **Verify network stats** are available (may be 0 on some systems)

## Notes

- Network activity calculation requires at least 2 data points
- First network value will be 0 (no baseline yet)
- Disk usage uses root filesystem (`/`) or first available
- All metrics are rounded to integers
- Network history keeps last 30 data points

## Future Enhancements

- Add disk usage display
- Add uptime display
- Add more detailed network stats (rx/tx separately)
- Add error handling UI
- Add metric history/trends
- Add configurable update interval

