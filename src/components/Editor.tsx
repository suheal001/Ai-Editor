import * as Tiptap from '@tiptap/react'
import { Button } from './ui/button'
import { Loader2, Sparkles, Table } from 'lucide-react'
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
    if (!editor) return;

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
        prompt = `Convert the following text into a markdown table: "${selectedText}"`;
      } else {
        prompt = `${action.charAt(0).toUpperCase() + action.slice(1)} the following text: "${selectedText}"`;
      }
      
      const result = await runGemini(prompt);
      
      setModalState({
        isOpen: true,
        originalText: selectedText,
        suggestedText: result,
        from,
        to,
      });

    } catch (error) {
      console.error(error);
      showError("An error occurred while processing your request.");
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
    setModalState({
      isOpen: false,
      originalText: '',
      suggestedText: '',
      from: 0,
      to: 0,
    });
  };

  return (
    <div className="relative h-full w-full overflow-y-auto bg-card text-card-foreground rounded-lg">
      {editor && (
        <Tiptap.BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex items-center space-x-1 rounded-md bg-background border p-1 shadow-lg">
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

export default TiptapEditor