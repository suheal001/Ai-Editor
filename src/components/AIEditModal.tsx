"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "./ui/separator";

interface AIEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  originalText: string;
  suggestionText: string;
}

const AIEditModal = ({ isOpen, onClose, onConfirm, originalText, suggestionText }: AIEditModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>AI Suggestion</DialogTitle>
          <DialogDescription>
            Review the suggestion below. Confirm to replace your selection.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <h3 className="font-semibold mb-2 text-sm text-muted-foreground">ORIGINAL</h3>
            <div className="p-3 rounded-md border bg-muted/50 max-h-48 overflow-y-auto">
              <p className="text-sm whitespace-pre-wrap">{originalText}</p>
            </div>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2 text-sm text-green-600 dark:text-green-400">SUGGESTION</h3>
            <div className="p-3 rounded-md border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950 max-h-48 overflow-y-auto">
              <p className="text-sm whitespace-pre-wrap">{suggestionText}</p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onConfirm}>✅ Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AIEditModal;