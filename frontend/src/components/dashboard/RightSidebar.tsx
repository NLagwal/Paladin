import { useEffect, useState } from 'react';
import { ActivityLogs } from './activity-logs';
import { api } from '@/lib/api';
import { ActivityLog } from '@/types/dashboard';

export function RightSidebar() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);

    useEffect(() => {
        const fetchLogs = async () => {
            const data = await api.getAiLogs();
            setLogs(data);
        };

        fetchLogs();
        const interval = setInterval(fetchLogs, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-[25%] border-l border-border/50 bg-card/30 p-4 flex flex-col gap-4">
            <ActivityLogs logs={logs} />
        </div>
    );
}
