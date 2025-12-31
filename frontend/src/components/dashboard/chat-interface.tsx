import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "@/types/dashboard";
import { Send, Sparkles, ChevronDown, ChevronUp, Terminal, FileText } from "lucide-react";
import axios from "axios";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ChatInterfaceProps {
  seedMessages?: ChatMessage[];
}

const quickPrompts = [
  "List files in current directory",
  "Show system information",
  "Check disk usage",
  "Display network interfaces",
];

// Get API URL with fallback
// In development, use relative URL to leverage Vite proxy
// In production, use the full URL from environment variable
const getApiUrl = () => {
  // Use relative URL in dev mode to leverage Vite proxy (avoids CORS issues)
  if (import.meta.env.DEV) {
    return '/api/ai/chat';
  }
  
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl) {
    // If it already includes /api, use it as is, otherwise append /api
    return envUrl.endsWith('/api') ? `${envUrl}/ai/chat` : `${envUrl}/api/ai/chat`;
  }
  // Fallback for production
  return 'http://localhost:5000/api/ai/chat';
};

const AI_API_URL = getApiUrl();

export function ChatInterface({ seedMessages }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    seedMessages || [
      {
        id: "seed-1",
        role: "assistant",
        content:
          "Command execution system ready. Enter a command or describe what you'd like to do.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      },
    ]
  );
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false); // New loading state

  const handleSend = async (text?: string) => { // Make function async
    const value = text ?? input.trim();
    if (!value || isLoading) return;

    const newUserMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: value,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setInput("");
    setIsLoading(true); // Set loading to true

    try {
      console.log('Sending request to:', AI_API_URL);
      console.log('Environment VITE_API_URL:', import.meta.env.VITE_API_URL);
      
      const response = await axios.post(AI_API_URL, { message: value }, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 120000, // 120 second timeout (AI processing can take time)
        withCredentials: false, // Don't send credentials for CORS
      });
      const aiResponse = response.data;

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: aiResponse.message || "Command executed successfully.",
        command: aiResponse.command,
        raw_output: aiResponse.raw_output,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      setMessages((prev) => [...prev, assistantMessage]);

    } catch (error: any) {
      console.error("Error communicating with AI service:", error);
      console.error("Request URL:", AI_API_URL);
      console.error("Error details:", {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status,
      });
      
      let errorMsg = "Error: Unable to get a response from the AI service.";
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        errorMsg = "Network Error: Could not connect to the API. Please ensure the API Gateway is running on port 5000.";
      } else if (error.response?.status === 503) {
        errorMsg = "Service Unavailable: The AI service is temporarily unavailable. Please try again later.";
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = `Error: ${error.message}`;
      }
      
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: errorMsg,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false); // Set loading to false
    }
  };

  return (
    <div className="flex h-full flex-col rounded-lg border border-border/50 bg-card/40 p-4 glassmorphism">
      <div className="flex items-center justify-between pb-4 border-b border-border/30">
        <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <p className="text-sm font-semibold font-mono">Command Console</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
            <span className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                <span>LIVE</span>
            </span>
        </div>
      </div>
      
      <ScrollArea className="flex-1 my-4 -mr-4 pr-4">
        <div className="flex flex-col gap-4 font-mono text-sm">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className={message.role === 'user' ? 'text-amber-500' : 'text-primary'}>
                  {`> ${message.role}`}
                </span>
                <span>{message.timestamp}</span>
              </div>
              <div className="pl-4 space-y-2">
                <p className="leading-relaxed text-foreground/90">
                  {message.content}
                </p>
                
                {message.command && (
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <Terminal className="h-3 w-3" />
                      <span>Command: {message.command}</span>
                      <ChevronDown className="h-3 w-3" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-1 p-2 bg-muted/50 rounded border border-border/50">
                      <code className="text-xs text-foreground/80 break-all">{message.command}</code>
                    </CollapsibleContent>
                  </Collapsible>
                )}
                
                {message.raw_output && (
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
                      <FileText className="h-3 w-3" />
                      <span>Raw Output</span>
                      <ChevronDown className="h-3 w-3" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-1 p-2 bg-muted/50 rounded border border-border/50 max-h-48 overflow-auto">
                      <pre className="text-xs text-foreground/80 whitespace-pre-wrap break-words font-mono">
                        {message.raw_output}
                      </pre>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="text-primary">&gt; assistant</span>
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              <span className="animate-pulse">_</span>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="grid gap-2 grid-cols-2 mb-4">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            className="rounded-md border border-border/50 bg-background/50 px-3 py-2 text-left text-xs font-mono text-foreground/80 transition-colors hover:border-primary/60 hover:bg-secondary/50"
            disabled={isLoading}
          >
            {prompt}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter command or request..."
          className="flex-1 bg-background/80 font-mono pr-12 h-10"
          disabled={isLoading}
        />
        <Button type="submit" size="icon" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7" disabled={!input.trim() || isLoading}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

