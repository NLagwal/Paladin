import { useEffect, useState } from 'react';
import { Settings, Save, X } from 'lucide-react';
import { api, AppConfig } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

export function SettingsModal() {
    const [open, setOpen] = useState(false);
    const [config, setConfig] = useState<AppConfig | null>(null);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (open) {
            loadConfig();
        }
    }, [open]);

    const loadConfig = async () => {
        setLoading(true);
        const data = await api.getConfig();
        if (data) {
            setConfig(data);
        } else {
            toast({
                title: "Error",
                description: "Failed to load configuration",
                variant: "destructive"
            })
        }
        setLoading(false);
    };

    const handleSave = async () => {
        if (!config) return;
        setLoading(true);
        const success = await api.saveConfig(config);
        if (success) {
            toast({
                title: "Success",
                description: "Configuration saved successfully. Services will reload.",
            });
            setOpen(false);
        } else {
            toast({
                title: "Error",
                description: "Failed to save configuration",
                variant: "destructive",
            });
        }
        setLoading(false);
    };

    const updateField = (key: keyof AppConfig, value: any) => {
        if (key === 'timeout_seconds' || key === 'temperature') {
            value = Number(value);
        }
        setConfig(prev => prev ? { ...prev, [key]: value } : null);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                    <Settings className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-card/95 border-border/50">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        System Configuration
                    </DialogTitle>
                </DialogHeader>

                {loading && !config ? (
                    <div className="py-8 text-center text-muted-foreground">Loading configuration...</div>
                ) : config ? (
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="provider">LLM Provider</Label>
                            <Select value={config.provider} onValueChange={(v) => updateField('provider', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select provider" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="gemini">Google Gemini</SelectItem>
                                    <SelectItem value="ollama">Ollama (Local)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {config.provider === 'ollama' && (
                            <div className="grid gap-2">
                                <Label htmlFor="ollama_url">Ollama Base URL</Label>
                                <Input
                                    id="ollama_url"
                                    value={config.ollama_base_url || "http://127.0.0.1:11434"}
                                    onChange={(e) => updateField('ollama_base_url', e.target.value)}
                                    placeholder="http://127.0.0.1:11434"
                                />
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="model">Model Name</Label>
                            <Input
                                id="model"
                                value={config.model}
                                onChange={(e) => updateField('model', e.target.value)}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="api_key">API Key (Optional)</Label>
                            <Input
                                id="api_key"
                                type="password"
                                value={config.api_key || ''}
                                onChange={(e) => updateField('api_key', e.target.value)}
                                placeholder="Required for cloud providers"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="temp">Temperature</Label>
                                <Input
                                    id="temp"
                                    type="number"
                                    step="0.1"
                                    min="0"
                                    max="1"
                                    value={config.temperature}
                                    onChange={(e) => updateField('temperature', e.target.value)}
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="timeout">Timeout (sec)</Label>
                                <Input
                                    id="timeout"
                                    type="number"
                                    value={config.timeout_seconds}
                                    onChange={(e) => updateField('timeout_seconds', e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="mode">Execution Mode</Label>
                            <Select value={config.mode} onValueChange={(v) => updateField('mode', v)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select mode" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="stable">Stable (Safe)</SelectItem>
                                    <SelectItem value="experimental">Experimental (Unsafe)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                ) : (
                    <div className="py-8 text-center text-destructive">Failed to load config</div>
                )}

                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading || !config}>
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
