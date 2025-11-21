"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Eye, EyeOff, Check, X, Loader2, Sparkles, Zap } from "lucide-react";
import { toast } from "@/modules/shared/lib/toast";
import { encryptApiKey } from "./actions";

// Available providers and their models
const AI_PROVIDERS = {
  openai: {
    name: "OpenAI",
    models: [
      { value: "gpt-4o", label: "GPT-4o (Most capable)" },
      { value: "gpt-4o-mini", label: "GPT-4o Mini (Fast & affordable)" },
      { value: "gpt-4-turbo", label: "GPT-4 Turbo" },
      { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Legacy)" },
    ],
  },
  anthropic: {
    name: "Anthropic Claude",
    models: [
      { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet (Best)" },
      { value: "claude-3-opus-20240229", label: "Claude 3 Opus" },
      { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku (Fast)" },
    ],
  },
  google: {
    name: "Google Gemini",
    models: [
      { value: "gemini-pro", label: "Gemini Pro" },
      { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
      { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash (Fast)" },
    ],
  },
} as const;

type Provider = keyof typeof AI_PROVIDERS;

export default function SettingsPage() {
  const aiSettings = useQuery(api.aiSettings.getAISettingsPublic);
  const saveSettings = useMutation(api.aiSettings.saveAISettings);
  const deleteSettings = useMutation(api.aiSettings.deleteAISettings);

  const [provider, setProvider] = useState<Provider>("openai");
  const [model, setModel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  // Load existing settings
  useEffect(() => {
    if (aiSettings) {
      setProvider(aiSettings.provider as Provider);
      setModel(aiSettings.model);
      // Don't load the encrypted key - require user to re-enter
      setApiKey("");
    }
  }, [aiSettings]);

  // Update model when provider changes
  useEffect(() => {
    if (provider) {
      const defaultModel = AI_PROVIDERS[provider].models[0].value;
      setModel(defaultModel);
    }
  }, [provider]);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error("API key is required");
      return;
    }

    if (!model) {
      toast.error("Please select a model");
      return;
    }

    setIsSaving(true);

    try {
      // Encrypt API key server-side
      const encryptedApiKey = await encryptApiKey(apiKey);

      await saveSettings({
        provider,
        model,
        encryptedApiKey,
      });

      toast.success("AI settings saved successfully");
      setApiKey(""); // Clear the input after saving
    } catch (error) {
      console.error("Failed to save AI settings:", error);
      toast.error("Failed to save settings", error instanceof Error ? error.message : undefined);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTest = async () => {
    if (!apiKey.trim()) {
      toast.error("Please enter an API key to test");
      return;
    }

    if (!model) {
      toast.error("Please select a model");
      return;
    }

    setIsTesting(true);

    try {
      // Encrypt API key for testing
      const encryptedApiKey = await encryptApiKey(apiKey);

      const response = await fetch("/api/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider,
          model,
          encryptedApiKey,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast.success(`Connection successful! Response: "${data.response}"`);
      } else {
        toast.error("Connection failed", data.message || "Unknown error");
        console.error("Test failed:", data);
      }
    } catch (error) {
      console.error("Failed to test connection:", error);
      toast.error("Test failed", error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsTesting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to remove your AI configuration?")) {
      return;
    }

    setIsDeleting(true);

    try {
      await deleteSettings();
      toast.success("AI settings removed");
      setApiKey("");
    } catch (error) {
      console.error("Failed to delete AI settings:", error);
      toast.error("Failed to remove settings");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="h-full overflow-auto bg-background">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Settings className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">AI Settings</h1>
          </div>
          <p className="text-muted-foreground">
            Configure your AI provider and use your own API keys for AI-powered features.
          </p>
        </div>

        {/* Current Status */}
        {aiSettings && (
          <div className="mb-6 p-4 bg-accent/50 rounded-lg border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-green-500" />
              <span className="font-medium">AI Configured</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Currently using <strong>{AI_PROVIDERS[aiSettings.provider as Provider].name}</strong> with model{" "}
              <strong>{aiSettings.model}</strong>
            </p>
          </div>
        )}

        {/* Settings Form */}
        <div className="space-y-6 bg-card p-6 rounded-lg border border-border">
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label htmlFor="provider">AI Provider</Label>
            <Select value={provider} onValueChange={(v) => setProvider(v as Provider)}>
              <SelectTrigger id="provider">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AI_PROVIDERS).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose your preferred AI provider. You'll need an API key from them.
            </p>
          </div>

          {/* Model Selection */}
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Select value={model} onValueChange={setModel}>
              <SelectTrigger id="model">
                <SelectValue placeholder="Select model" />
              </SelectTrigger>
              <SelectContent>
                {AI_PROVIDERS[provider].models.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Different models have different capabilities and pricing.
            </p>
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key</Label>
            <div className="relative">
              <Input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={aiSettings ? "Enter new API key to update" : "Enter your API key"}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your API key is encrypted before storage and never shared.{" "}
              <a
                href={
                  provider === "openai"
                    ? "https://platform.openai.com/api-keys"
                    : provider === "anthropic"
                    ? "https://console.anthropic.com/settings/keys"
                    : "https://makersuite.google.com/app/apikey"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Get your {AI_PROVIDERS[provider].name} API key
              </a>
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-4">
            {/* Test Connection Button */}
            <Button
              onClick={handleTest}
              disabled={isTesting || !apiKey.trim() || !model}
              variant="outline"
              className="w-full"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Test Connection
                </>
              )}
            </Button>

            {/* Save and Delete Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={handleSave}
                disabled={isSaving || !apiKey.trim()}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    {aiSettings ? "Update Settings" : "Save Settings"}
                  </>
                )}
              </Button>
              {aiSettings && (
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  variant="outline"
                  className="border-destructive text-destructive hover:bg-destructive/10"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Removing...
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Remove
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
          <h3 className="font-medium mb-2">How it works</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Your API key is encrypted using industry-standard AES-256-GCM encryption</li>
            <li>• Keys are stored securely and only decrypted when making AI requests</li>
            <li>• You maintain full control over your AI usage and costs</li>
            <li>• Different models have different capabilities and pricing tiers</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
