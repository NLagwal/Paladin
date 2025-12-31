import { Header } from '@/components/dashboard/Header';
import { ChatInterface } from '@/components/dashboard/chat-interface';
import { RightSidebar } from '@/components/dashboard/RightSidebar';
import { TelemetrySidebar } from '@/components/dashboard/TelemetrySidebar';

export default function Dashboard() {
    return (
        <div className="fixed inset-0 bg-background text-foreground flex flex-col overflow-hidden font-sans">
            <Header />
            <div className="flex-1 flex overflow-hidden">
                <TelemetrySidebar />
                <main className="flex-1 flex flex-col p-4 gap-4">
                  <ChatInterface />
                </main>
                <RightSidebar />
            </div>
        </div>
    );
}
