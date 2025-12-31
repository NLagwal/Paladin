const express = require('express');
const fs = require('fs');
const os = require('os');
const { exec } = require('child_process');
const router = express.Router();

let lastCpuTimes = getCpuTimes();

function getCpuTimes() {
    try {
        const stat = fs.readFileSync('/host/proc/stat', 'utf8');
        const lines = stat.split('\n');
        const cpuLine = lines.find(line => line.startsWith('cpu '));
        const times = cpuLine.split(/\s+/).slice(1).map(Number);
        const idle = times[3] + times[4];
        const total = times.reduce((a, b) => a + b, 0);
        return { idle, total };
    } catch (e) {
        return { idle: 0, total: 0 };
    }
}

function getCpuUsage() {
    const start = lastCpuTimes;
    const end = getCpuTimes();
    const idleDiff = end.idle - start.idle;
    const totalDiff = end.total - start.total;
    lastCpuTimes = end;
    if (totalDiff === 0) return 0;
    return 100 - (100 * idleDiff / totalDiff);
}

function getMemoryUsage() {
    try {
        const memInfo = fs.readFileSync('/host/proc/meminfo', 'utf8');
        const lines = memInfo.split('\n');
        const memTotal = parseInt(lines.find(line => line.startsWith('MemTotal:')).split(/\s+/)[1], 10);
        const memAvailable = parseInt(lines.find(line => line.startsWith('MemAvailable:')).split(/\s+/)[1], 10);
        return 100 * (1 - memAvailable / memTotal);
    } catch (e) {
        return 0;
    }
}

function getCpuTemp(callback) {
    exec("sensors -u | awk '/temp1_input/ {print $2; exit}'", (error, stdout, stderr) => {
        if (error) {
            console.error(`Error getting CPU temp: ${error.message}`);
            return callback(0);
        }
        if (stderr) {
            console.error(`Stderr getting CPU temp: ${stderr}`);
        }
        callback(parseFloat(stdout.trim()) || 0);
    });
}


router.get('/', (req, res) => {
    getCpuTemp(cpuTemp => {
        try {
            const cpu = getCpuUsage();
            const memory = getMemoryUsage();

            res.json({
                cpu: cpu.toFixed(2),
                memory: memory.toFixed(2),
                disk: 0, // Placeholder
                cpuTemp: cpuTemp,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Error fetching telemetry:', error);
            res.status(500).json({ error: 'Failed to fetch telemetry data' });
        }
    });
});

module.exports = router;
