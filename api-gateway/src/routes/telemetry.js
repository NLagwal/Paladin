const express = require('express');
const router = express.Router();
const si = require('systeminformation');

// Cache static data
let cpuInfo = null;
si.cpu().then(data => cpuInfo = data);

router.get('/', async (req, res) => {
    try {
        const [cpu, mem, currentLoad, temp] = await Promise.all([
            si.cpu(),
            si.mem(),
            si.currentLoad(),
            si.cpuTemperature()
        ]);

        const cpuUsage = currentLoad.currentLoad;
        const memUsage = (mem.active / mem.total) * 100;

        // Safety check for temperature - some systems don't report it
        const cpuTemp = temp.main || 0;

        res.json({
            cpu: cpuUsage.toFixed(2),
            memory: memUsage.toFixed(2),
            disk: 0, // Placeholder
            cpuTemp: cpuTemp,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching telemetry:', error);
        // Fallback to zero values on error to keep UI alive
        res.json({
            cpu: 0,
            memory: 0,
            disk: 0,
            cpuTemp: 0,
            timestamp: new Date().toISOString(),
            error: "Telemetry unavailable"
        });
    }
});

module.exports = router;
