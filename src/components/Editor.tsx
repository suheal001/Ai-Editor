import { type Editor, EditorContent, BubbleMenu } from '@tiptap/react'
import { Button } from './ui/button'
import { Sparkles, Table, Trash2, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { runGemini } from '@/lib/gemini'
import { showError } from '@/utils/toast'
import PreviewModal from './PreviewModal'

interface TiptapEditorProps {
  editor: Editor | null;
}

interface ModalState {
  isOpen: boolean;
  originalText: string;
  suggestedText: string;
  from: number;
  to: number;
}

type AiAction = 'improve' | 'shorten' | 'lengthen' | 'table';

const TiptapEditor = ({ editor }: TiptapEditorProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<AiAction | null>(null);
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    originalText: '',
    suggestedText: '',
    from: 0,
    to: 0,
  });

  const handleAiAction = async (action: AiAction) => {
    if (!editor || isLoading) return;

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
      
      setModalState({
        isOpen: true,
        originalText: selectedText,
        suggestedText: result.trim(),
        from,
        to,
      });

    } catch (error) {
      console.error("AI Action Error:", error);
      showError("AI action failed. Please check your API key and connection.");
    } finally {
      setIsLoading(false);
      setActiveAction(null);
    }
  };

  const handleConfirm = () => {
    if (!editor) return;
    const { from, to, suggestedText } = modalState;
    editor.chain().focus().deleteRange({ from, to }).insertContent(suggestedText).run();
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setModalState({ isOpen: false, originalText: '', suggestedText: '', from: 0, to: 0 });
  };

  const handleClearContent = () => {
    editor?.chain().focus().clearContent().run();
  };

  const triggerAiAction = (e: React.MouseEvent, action: AiAction) => {
    e.preventDefault();
    handleAiAction(action);
  };

  const AiButton = ({ action, children }: { action: AiAction, children: React.ReactNode }) => (
    <Button variant="ghost" size="sm" className="flex items-center gap-2" onMouseDown={(e) => triggerAiAction(e, action)} disabled={isLoading}>
      {isLoading && activeAction === action ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </Button>
  );

  return (
    <div className="relative h-full w-full overflow-y-auto bg-card text-card-foreground rounded-lg">
      {editor && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 text-muted-foreground hover:text-foreground"
            onClick={handleClearContent}
            title="Clear all content"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <BubbleMenu
            editor={editor}
            tippyOptions={{
              duration: 100,
              appendTo: () => document.body,
              interactive: true,
            }}
          >
            <div className="p-1 rounded-lg bg-background border shadow-xl flex items-center gap-1 z-50">
              <AiButton action="improve">
                <Sparkles className="h-4 w-4" /> Improve
              </AiButton>
              <AiButton action="shorten">Shorten</AiButton>
              <AiButton action="lengthen">Lengthen</AiButton>
              <AiButton action="table">
                <Table className="h-4 w-4" /> To Table
              </AiButton>
            </div>
          </BubbleMenu>
        </>
      )}
      <EditorContent editor={editor} />
      <PreviewModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onConfirm={handleConfirm}
        originalText={modalState.originalText}
        suggestedText={modalState.suggestedText}
      />
    </div>
  )
}

export default TiptapEditor;