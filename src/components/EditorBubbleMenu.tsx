import { useState } from 'react';
import { BubbleMenu, Editor } from '@tiptap/react';
import { Button } from '@/components/ui/button';
import { Sparkles, Table, Loader2 } from 'lucide-react';
import { runGemini } from '@/lib/gemini';
import { showError } from '@/utils/toast';

type AiAction = 'improve' | 'shorten' | 'lengthen' | 'table';

interface SuggestionData {
  originalText: string;
  suggestedText: string;
  from: number;
  to: number;
}

interface EditorBubbleMenuProps {
  editor: Editor;
  onSuggestionReady: (data: SuggestionData) => void;
}

const AiButton = ({
  action,
  children,
  onClick,
  isLoading,
  activeAction
}: {
  action: AiAction;
  children: React.ReactNode;
  onClick: (action: AiAction) => void;
  isLoading: boolean;
  activeAction: AiAction | null;
}) => (
  <Button
    variant="ghost"
    size="sm"
    className="flex items-center gap-2"
    onMouseDown={(e) => { e.preventDefault(); onClick(action); }}
    disabled={isLoading}
  >
    {isLoading && activeAction === action ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
  </Button>
);

export const EditorBubbleMenu = ({ editor, onSuggestionReady }: EditorBubbleMenuProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<AiAction | null>(null);

  const handleAiAction = async (action: AiAction) => {
    if (isLoading) return;
    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);

    if (!selectedText.trim()) {
      showError("Please select text to perform an AI action.");
      return;
    }

    setIsLoading(true);
    setActiveAction(action);

    try {
      let prompt = '';
      if (action === 'table') {
        prompt = `You are a text-to-markdown-table converter. Convert the following text into a single, well-formatted markdown table. Output ONLY the markdown table. Do not include any explanations, introductory text, or markdown code fences.\n\nTEXT TO CONVERT:\n---\n${selectedText}\n---`;
      } else {
        prompt = `You are an AI text editing engine. Your sole task is to perform the following action on the provided text: '${action}'.\n\nRULES:\n- Output ONLY the modified text.\n- Do not include any explanations, apologies, or introductory phrases (e.g., "Sure, here is the improved text:").\n- Preserve the original tone unless the action is 'improve'.\n\nTEXT TO MODIFY:\n---\n${selectedText}\n---`;
      }
      const result = await runGemini(prompt);
      if (!result || !result.trim()) {
        showError("The AI returned an empty response. Please try again.");
        return;
      }
      onSuggestionReady({ originalText: selectedText, suggestedText: result.trim(), from, to });
    } catch (error) {
      console.error("AI Action Error:", error);
      showError("AI action failed. Please check your API key and connection.");
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  };

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="bubbleMenu"
      tippyOptions={{ duration: 100, appendTo: () => document.body }}
      shouldShow={({ view, state, editor: currentEditor }) => {
        const { selection } = state;
        return view.hasFocus() && !selection.empty && currentEditor.isEditable;
      }}
    >
      <div className="p-1 rounded-lg bg-background border shadow-xl flex items-center gap-1">
        <AiButton action="improve" onClick={handleAiAction} isLoading={isLoading} activeAction={activeAction}><Sparkles className="h-4 w-4" /> Improve</AiButton>
        <AiButton action="shorten" onClick={handleAiAction} isLoading={isLoading} activeAction={activeAction}>Shorten</AiButton>
        <AiButton action="lengthen" onClick={handleAiAction} isLoading={isLoading} activeAction={activeAction}>Lengthen</AiButton>
        <AiButton action="table" onClick={handleAiAction} isLoading={isLoading} activeAction={activeAction}><Table className="h-4 w-4" /> To Table</AiButton>
      </div>
    </BubbleMenu>
  );
};