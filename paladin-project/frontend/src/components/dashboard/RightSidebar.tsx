import React from 'react';
import { activityLog } from '@/data/mockData';
import { ActivityLogs } from './activity-logs';

export function RightSidebar() {
    return (
        <div className="w-[25%] border-l border-border/50 bg-card/30 p-4 flex flex-col gap-4">
            <ActivityLogs logs={activityLog} />
        </div>
    );
}
