import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "./ui/scroll-area";

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  originalText: string;
  suggestedText: string;
}

const PreviewModal = ({ isOpen, onClose, onConfirm, originalText, suggestedText }: PreviewModalProps) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>AI Suggestion</DialogTitle>
          <DialogDescription>
            Review the suggestion below. Accept it to replace your selected text, or cancel to keep the original.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Original</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 w-full rounded-md border p-4">
                <p className="text-sm whitespace-pre-wrap">{originalText}</p>
              </ScrollArea>
            </CardContent>
          </Card>
          <Card className="border-primary/50">
            <CardHeader>
              <CardTitle className="text-lg">Suggestion</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 w-full rounded-md border bg-primary/5 p-4">
                <p className="text-sm whitespace-pre-wrap">{suggestedText}</p>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Accept Suggestion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PreviewModal;