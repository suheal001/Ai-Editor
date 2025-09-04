import * as Tiptap from '@tiptap/react'
import { Button } from './ui/button'
import { Sparkles, Table, Trash2, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { runGemini } from '@/lib/gemini'
import { showError } from '@/utils/toast'
import PreviewModal from './PreviewModal'

interface TiptapEditorProps {
  editor: Tiptap.Editor | null;
}

interface ModalState {
  isOpen: boolean;
  originalText: string;
  suggestedText: string;
  from: number;
  to: number;
}

const TiptapEditor = ({ editor }: TiptapEditorProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    originalText: '',
    suggestedText: '',
    from: 0,
    to: 0,
  });

  const handleAiAction = async (action: 'improve' | 'shorten' | 'lengthen' | 'table') => {
    if (!editor || isLoading) return;

    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);

    if (!selectedText) {
      showError("Please select text to perform an AI action.");
      return;
    }

    setIsLoading(true);
    try {
      let prompt = '';
      if (action === 'table') {
        prompt = `Convert the following text into a markdown table. Output only the markdown table, with no explanations or conversational text.\n\n---\n${selectedText}\n---`;
      } else {
        prompt = `You are an AI writing assistant. ${action} the following text. Output only the modified text, with no explanations or conversational text.\n\n---\n${selectedText}\n---`;
      }
      
      const result = await runGemini(prompt);

      if (!result || result.trim() === '') {
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
          <Tiptap.BubbleMenu
            pluginKey="bubbleMenu"
            editor={editor}
            tippyOptions={{ 
              duration: 100,
              appendTo: () => document.body,
              interactive: true,
            }}
            shouldShow={({ editor }) => !editor.state.selection.empty}
          >
            <div className="p-1 rounded-lg bg-background border shadow-xl flex items-center gap-1">
              <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => handleAiAction('improve')} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Improve
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleAiAction('shorten')} disabled={isLoading}>Shorten</Button>
              <Button variant="ghost" size="sm" onClick={() => handleAiAction('lengthen')} disabled={isLoading}>Lengthen</Button>
              <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => handleAiAction('table')} disabled={isLoading}>
                <Table className="h-4 w-4" />
                To Table
              </Button>
            </div>
          </Tiptap.BubbleMenu>
        </>
      )}
      <Tiptap.EditorContent editor={editor} />
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