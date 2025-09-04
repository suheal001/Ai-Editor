import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { showError } from '@/utils/toast';

interface ApiKeyDialogProps {
  isOpen: boolean;
  onSave: (apiKey: string) => void;
}

const ApiKeyDialog = ({ isOpen, onSave }: ApiKeyDialogProps) => {
  const [apiKey, setApiKey] = useState('');

  const handleSave = () => {
    if (apiKey.trim()) {
      onSave(apiKey.trim());
    } else {
      showError("Please enter a valid API key.");
    }
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Enter Your Gemini API Key</DialogTitle>
          <DialogDescription>
            To use the AI features, you need to provide your own Google Gemini API key. Your key is saved only in your browser.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="api-key" className="text-right">
              API Key
            </Label>
            <Input
              id="api-key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="col-span-3"
              placeholder="Enter your key here"
              type="password"
            />
          </div>
        </div>
        <p className="text-xs text-center text-muted-foreground">
          You can get your free API key from{' '}
          <a
            href="https://aistudio.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-primary"
          >
            Google AI Studio
          </a>.
        </p>
        <DialogFooter>
          <Button onClick={handleSave} disabled={!apiKey.trim()}>Save and Reload</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiKeyDialog;