import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
      <DialogContent className="sm:max-w-[60vw]">
        <DialogHeader>
          <DialogTitle>AI Suggestion</DialogTitle>
          <DialogDescription>
            Review the suggestion below. You can accept it or cancel to keep the original text.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
          <div>
            <h3 className="font-semibold mb-2 text-center">Original</h3>
            <div className="p-4 rounded-md bg-muted h-64 overflow-y-auto border">
              <p className="text-sm whitespace-pre-wrap">{originalText}</p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-2 text-center">Suggestion</h3>
            <div className="p-4 rounded-md bg-primary/10 h-64 overflow-y-auto border border-primary/20">
              <p className="text-sm whitespace-pre-wrap">{suggestedText}</p>
            </div>
          </div>
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