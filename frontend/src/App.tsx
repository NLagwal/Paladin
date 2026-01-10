import { useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/QueryClient";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/use-auth";
import Dashboard from "@/pages/Dashboard";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { recordMetric } from "@/lib/metrics";

function App() {
  useEffect(() => {
    recordMetric('page_view', window.location.pathname);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
            <TooltipProvider>
            <div className="min-h-screen bg-background text-foreground">
              <Dashboard />
              <Toaster />
                </div>
            </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;