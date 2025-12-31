import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/QueryClient";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/hooks/use-auth";
import Dashboard from "@/pages/Dashboard";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

function App() {
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
