import { useState, useEffect } from 'react';
import ChatSidebar from "@/components/ChatSidebar";
import TiptapEditor from "@/components/Editor";
import ApiKeyDialog from '@/components/ApiKeyDialog';
import Header from '@/components/Header';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useEditor, BubbleMenu, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { BubbleMenu as BubbleMenuExtension } from '@tiptap/extension-bubble-menu'
import { Button } from '@/components/ui/button';
import { Sparkles, Table, Loader2 } from 'lucide-react';
import { runGemini } from '@/lib/gemini';
import { showError } from '@/utils/toast';
import PreviewModal from '@/components/PreviewModal';

interface ModalState {
  isOpen: boolean;
  originalText: string;
  suggestedText: string;
  from: number;
  to: number;
}
type AiAction = 'improve' | 'shorten' | 'lengthen' | 'table';

const Index = () => {
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const [isLoading, setIsLoading] = useState(false);
  const [activeAction, setActiveAction] = useState<AiAction | null>(null);
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    originalText: '',
    suggestedText: '',
    from: 0,
    to: 0,
  });

  useEffect(() => {
    const key = localStorage.getItem('gemini_api_key');
    if (!key) {
      setIsApiKeyModalOpen(true);
      setHasApiKey(false);
    } else {
      setHasApiKey(true);
    }
  }, []);

  const handleSaveApiKey = (apiKey: string) => {
    localStorage.setItem('gemini_api_key', apiKey);
    setHasApiKey(true);
    setIsApiKeyModalOpen(false);
    window.location.reload();
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      BubbleMenuExtension.configure({
        pluginKey: "bubbleMenu",
        tippyOptions: {
          appendTo: () => document.body,
        }
      }),
    ],
    content: `
      <h1>Welcome to your AI-Powered Editor!</h1>
      <p>This is a demonstration of a collaborative editor built with Tiptap, React, and Tailwind CSS. The goal is to integrate AI features directly into the writing experience.</p>
      <p><strong>To get started, select any piece of text.</strong> A floating toolbar will appear with several options:</p>
      <ul>
        <li><strong>Improve:</strong> Fix grammar and improve the writing style.</li>
        <li><strong>Shorten:</strong> Make the selected text more concise.</li>
        <li><strong>Lengthen:</strong> Expand on the selected text to add more detail.</li>
        <li><strong>To Table:</strong> Convert the selected text into a markdown table.</li>
      </ul>
      <p>On the right-hand side (or in the slide-up drawer on mobile), you'll find a chat panel where you can interact with an AI assistant.</p>
      <p>Happy writing!</p>
    `,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none p-6 focus:outline-none h-full overflow-y-auto',
      },
    },
    editable: hasApiKey,
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
      setModalState({ isOpen: true, originalText: selectedText, suggestedText: result.trim(), from, to });
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

  const triggerAiAction = (e: React.MouseEvent, action: AiAction) => {
    e.preventDefault();
    handleAiAction(action);
  };

  const AiButton = ({ action, children }: { action: AiAction, children: React.ReactNode }) => (
    <Button variant="ghost" size="sm" className="flex items-center gap-2" onMouseDown={(e) => triggerAiAction(e, action)} disabled={isLoading}>
      {isLoading && activeAction === action ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </Button>
  );

  const EditorBubbleMenu = ({ editor }: { editor: Editor | null }) => {
    if (!editor) return null;
    return (
      <BubbleMenu
        editor={editor}
        pluginKey="bubbleMenu"
        tippyOptions={{ duration: 100, appendTo: () => document.body }}
        shouldShow={({ view, state }) => {
          const { selection } = state;
          const { empty } = selection;
          return view.hasFocus() && !empty;
        }}
      >
        <div className="p-1 rounded-lg bg-background border shadow-xl flex items-center gap-1">
          <AiButton action="improve"><Sparkles className="h-4 w-4" /> Improve</AiButton>
          <AiButton action="shorten">Shorten</AiButton>
          <AiButton action="lengthen">Lengthen</AiButton>
          <AiButton action="table"><Table className="h-4 w-4" /> To Table</AiButton>
        </div>
      </BubbleMenu>
    );
  };

  const desktopLayout = (
    <ResizablePanelGroup direction="horizontal" className="flex-grow rounded-lg border">
      <ResizablePanel defaultSize={70}><TiptapEditor editor={editor} /></ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={30} minSize={20}><ChatSidebar editor={editor} /></ResizablePanel>
    </ResizablePanelGroup>
  );

  const mobileLayout = (
    <div className="flex-grow flex flex-col min-h-0">
      <div className="flex-grow border rounded-lg overflow-hidden"><TiptapEditor editor={editor} /></div>
      <Drawer open={isMobileChatOpen} onOpenChange={setIsMobileChatOpen}>
        <DrawerContent className="h-[75vh]"><ChatSidebar editor={editor} /></DrawerContent>
      </Drawer>
    </div>
  );

  return (
    <>
      <ApiKeyDialog isOpen={isApiKeyModalOpen} onSave={handleSaveApiKey} />
      <EditorBubbleMenu editor={editor} />
      <div className="h-screen w-screen bg-background text-foreground flex flex-col">
        <Header isMobile={!isDesktop} onMobileChatClick={() => setIsMobileChatOpen(true)} />
        <main className="flex-grow flex flex-col gap-4 p-4">
          {isDesktop ? desktopLayout : mobileLayout}
        </main>
      </div>
      <PreviewModal isOpen={modalState.isOpen} onClose={handleCloseModal} onConfirm={handleConfirm} originalText={modalState.originalText} suggestedText={modalState.suggestedText} />
    </>
  );
};

export default Index;