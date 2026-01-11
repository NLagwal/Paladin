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

    // Check for Demo Mode
    const isDemo = import.meta.env.VITE_DEMO_MODE === 'true';

    try {
      if (isDemo) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        let demoResponse = {
          message: "Demo Mode: Command simulated successfully.",
          command: "",
          raw_output: ""
        };

        const lowerVal = value.toLowerCase();
        if (lowerVal.includes("list files") || lowerVal.includes("ls")) {
          demoResponse = {
            message: "Here are the files in the current directory.",
            command: "ls -la",
            raw_output: "drwxr-xr-x  5 user group 4096 Jan 11 10:00 .\ndrwxr-xr-x 10 user group 4096 Jan 11 09:30 ..\n-rw-r--r--  1 user group  120 Jan 11 10:00 config.toml\n-rwxr-xr-x  1 user group 2048 Jan 10 14:00 main.py"
          };
        } else if (lowerVal.includes("disk") || lowerVal.includes("space") || lowerVal.includes("df")) {
          demoResponse = {
            message: "Disk usage check complete.",
            command: "df -h",
            raw_output: "Filesystem      Size  Used Avail Use% Mounted on\n/dev/sda1       100G   45G   55G  45% /\ntmpfs            16G  4.0K   16G   1% /tmp"
          };
        } else if (lowerVal.includes("system") || lowerVal.includes("info") || lowerVal.includes("fastfetch")) {
          demoResponse = {
            message: "System information retrieved.",
            command: "fastfetch --pipe",
            raw_output: "OS: Paladin Linux x86_64\nKernel: 6.8.0-generic\nUptime: 2 hours, 14 mins\nCPU: AMD Ryzen 9 5950X (32) @ 3.4GHz\nMemory: 4.2 GiB / 32.0 GiB (13%)"
          };
        }

        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: demoResponse.message,
          command: demoResponse.command,
          raw_output: demoResponse.raw_output,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMessage]);

      } else {
        // Real API Call
        console.log('Sending request to:', AI_API_URL);
        const response = await axios.post(AI_API_URL, { message: value }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 120000,
          withCredentials: false,
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
      }

    } catch (error: any) {
      console.error("Error communicating with AI service:", error);

      let errorMsg = "Error: Unable to get a response from the AI service.";
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        errorMsg = "Network Error: Could not connect to the API. Please ensure the API Gateway is running on port 5000.";
      } else if (error.response?.status === 503) {
        errorMsg = "Service Unavailable: The AI service is temporarily unavailable. Please try again later.";
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

  /* ... inside ChatInterface ... */

  const MessageContent = ({ content }: { content: string }) => {
    // Split key: match triple backticks blocks
    const parts = content.split(/(```[\s\S]*?```)/g);

    return (
      <div className="space-y-2">
        {parts.map((part, index) => {
          if (part.startsWith('```') && part.endsWith('```')) {
            // Extract content and optional language
            const match = part.match(/^```(\w+)?\n?([\s\S]*)```$/);
            const code = match ? match[2] : part.slice(3, -3);

            return (
              <div key={index} className="relative rounded-md bg-muted/80 border border-border/50 my-2">
                <div className="absolute right-2 top-2 text-[10px] text-muted-foreground uppercase opacity-50">
                  {match?.[1] || 'code'}
                </div>
                <div className="overflow-x-auto p-3">
                  <pre className="text-xs font-mono leading-relaxed">
                    <code>{code.trim()}</code>
                  </pre>
                </div>
              </div>
            );
          }
          // Render regular text (with basic paragraph handling)
          if (!part.trim()) return null;
          return (
            <p key={index} className="leading-relaxed text-foreground/90 whitespace-pre-wrap">{part}</p>
          );
        })}
      </div>
    );
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
        <div className="flex flex-col gap-6 font-mono text-sm"> {/* Increased gap for better readability */}
          {messages.map((message) => (
            <div key={message.id} className="space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center gap-2 text-xs text-muted-foreground border-b border-border/10 pb-1">
                <span className={message.role === 'user' ? 'text-amber-500 font-bold' : 'text-primary font-bold'}>
                  {`> ${message.role}`}
                </span>
                <span className="opacity-50 text-[10px]">{message.timestamp}</span>
              </div>
              <div className="pl-2 space-y-3">
                <MessageContent content={message.content} />

                {message.command && (
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors group">
                      <Terminal className="h-3 w-3 group-hover:text-primary transition-colors" />
                      <span>Executed Command</span>
                      <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="rounded-md bg-black/40 border border-white/10 p-3 shadow-inner">
                        <div className="flex items-center justify-between mb-1 pb-1 border-b border-white/5">
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Shell</span>
                        </div>
                        <pre className="text-xs text-green-400 font-mono break-all overflow-x-auto">
                          <code>{message.command}</code>
                        </pre>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}

                {message.raw_output && (
                  <Collapsible>
                    <CollapsibleTrigger className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-primary transition-colors group">
                      <FileText className="h-3 w-3 group-hover:text-primary transition-colors" />
                      <span>System Output</span>
                      <ChevronDown className="h-3 w-3 transition-transform group-data-[state=open]:rotate-180" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2">
                      <div className="rounded-md bg-black/40 border border-white/10 p-3 shadow-inner max-h-60 overflow-auto">
                        <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap break-words">
                          {message.raw_output}
                        </pre>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground pl-2">
              <span className="text-primary">&gt; assistant</span>
              <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              <span className="animate-pulse w-2 h-4 bg-primary block"></span>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="grid gap-2 grid-cols-2 mb-4">
        {quickPrompts.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            className="rounded-md border border-border/40 bg-background/20 px-3 py-2 text-left text-xs font-mono text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/10 hover:text-foreground active:scale-95"
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
          className="flex-1 bg-background/50 font-mono pr-12 h-10 border-border/50 focus-visible:ring-primary/30"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 transition-all hover:scale-105 active:scale-95"
          disabled={!input.trim() || isLoading}
          variant={input.trim() ? "default" : "ghost"}
        >
          <Send className="h-3 w-3" />
        </Button>
      </form>
    </div>
  );
}

