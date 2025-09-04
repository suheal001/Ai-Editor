import * as Tiptap from '@tiptap/react'
import { Button } from './ui/button'
import { Sparkles, Table, Trash2 } from 'lucide-react'
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
        prompt = `You are an AI writing assistant. A user has selected text and wants to convert it into a markdown table.

Your task is to: convert the text into a markdown table.

- You MUST output ONLY the resulting markdown table.
- Do NOT include any conversational parts like "Sure, here is..." or any other explanations.

Here is the text to process:
---
${selectedText}
---
`;
      } else {
        prompt = `You are an AI writing assistant. A user has selected a piece of text in their editor and wants you to modify it.

Your task is to: ${action} the text.

- You MUST output ONLY the modified text.
- Do NOT include any conversational parts like "Sure, here is..." or any other explanations.
- Do NOT wrap the output in markdown quotes.

Here is the text to process:
---
${selectedText}
---
`;
      }
      
      const result = await runGemini(prompt);

      if (!result || result.trim() === '') {
        showError("The AI returned an empty response. Please try a different selection or action.");
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
      showError("AI action failed. Please check your Gemini API key and network connection.");
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

  const handleClearContent = () => {
    if (editor) {
      editor.chain().focus().clearContent().run();
    }
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
            <span className="sr-only">Clear content</span>
          </Button>
          <Tiptap.BubbleMenu
            pluginKey="bubbleMenu"
            editor={editor}
            tippyOptions={{ 
              duration: 100,
              appendTo: () => document.body,
            }}
            shouldShow={({ editor }) => {
              return editor.view.hasFocus() && !editor.state.selection.empty;
            }}
          >
            <div
              className="p-0.5 rounded-lg bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 animate-gradient-move"
              style={{ backgroundSize: '400% 400%' }}
              onMouseDown={(e) => e.preventDefault()}
            >
              <div className="flex flex-wrap items-center gap-1 rounded-md bg-background p-1">
                {isLoading || modalState.isOpen ? (
                  <div className="flex items-center justify-center px-3 py-1">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center animate-pulse">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                  </div>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => handleAiAction('improve')}>
                      <Sparkles className="h-4 w-4" />
                      Improve
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleAiAction('shorten')}>Shorten</Button>
                    <Button variant="ghost" size="sm" onClick={() => handleAiAction('lengthen')}>Lengthen</Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2" onClick={() => handleAiAction('table')}>
                      <Table className="h-4 w-4" />
                      To Table
                    </Button>
                  </>
                )}
              </div>
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

export default TiptapEditor