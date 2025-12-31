const si = require('systeminformation');

// Store network history for chart (last 30 data points)
const networkHistory = [];
const MAX_HISTORY = 30;

// Get initial network stats for baseline
let lastNetworkStats = null;
let lastNetworkTime = Date.now();

async function getSystemTelemetry() {
  try {
    const [cpu, mem, networkStats, fsSize] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.networkStats(),
      si.fsSize()
    ]);

    // Calculate network activity (bytes per second)
    const now = Date.now();
    const currentNetwork = networkStats[0] || { rx_bytes: 0, tx_bytes: 0 };
    
    let networkValue = 0;
    if (lastNetworkStats) {
      const timeDiff = (now - lastNetworkTime) / 1000; // seconds
      const rxDiff = currentNetwork.rx_bytes - lastNetworkStats.rx_bytes;
      const txDiff = currentNetwork.tx_bytes - lastNetworkStats.tx_bytes;
      const totalDiff = rxDiff + txDiff;
      networkValue = Math.max(0, Math.round(totalDiff / timeDiff / 1024)); // KB/s
    }
    
    lastNetworkStats = currentNetwork;
    lastNetworkTime = now;

    // Add to history
    networkHistory.push({ value: networkValue, timestamp: now });
    if (networkHistory.length > MAX_HISTORY) {
      networkHistory.shift();
    }

    // Calculate disk usage (use root filesystem)
    const rootFs = fsSize.find(fs => fs.mount === '/') || fsSize[0] || { used: 0, size: 1 };
    const diskUsage = Math.round((rootFs.used / rootFs.size) * 100);

    return {
      cpu: Math.round(cpu.currentLoad || 0),
      memory: Math.round((mem.used / mem.total) * 100),
      disk: diskUsage,
      network: networkHistory.map(item => ({ value: item.value })),
      uptime: Math.round(process.uptime()),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error getting system telemetry:', error);
    return {
      cpu: 0,
      memory: 0,
      disk: 0,
      network: [],
      uptime: 0,
      timestamp: new Date().toISOString(),
      error: error.message
    };
  }
}

// Initialize network baseline
getSystemTelemetry().catch(console.error);

module.exports = { getSystemTelemetry };

