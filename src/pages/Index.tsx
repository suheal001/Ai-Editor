import { useState, useEffect } from 'react';
import ChatSidebar from "@/components/ChatSidebar";
import TiptapEditor from "@/components/Editor";
import ApiKeyDialog from '@/components/ApiKeyDialog';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Drawer, DrawerContent } from "@/components/ui/drawer";
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import FloatingToolbar, { type AIAction } from '@/components/FloatingToolbar';
import AIEditModal from '@/components/AIEditModal';
import { runGemini } from '@/lib/gemini';
import { showLoading, dismissToast, showError, showSuccess } from '@/utils/toast';

const Index = () => {
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  // State for AI editing feature
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [originalSelection, setOriginalSelection] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [selectionRange, setSelectionRange] = useState<{ from: number; to: number } | null>(null);

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
    ],
    content: `
      <h1>Welcome to your AI-Powered Editor!</h1>
      <p>This is a demonstration of a collaborative editor built with Tiptap, React, and Tailwind CSS. The goal is to integrate AI features directly into the writing experience.</p>
      <p><strong>Try selecting some text!</strong> A floating toolbar will appear with AI actions like "Shorten" or "Improve".</p>
      <p>On the right-hand side (or in the slide-up drawer on mobile), you'll find a chat panel where you can interact with an AI assistant.</p>
      <p>Happy writing!</p>
    `,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none p-6 focus:outline-none h-full',
      },
    },
    editable: hasApiKey,
  });

  const handleEditWithAI = async (action: AIAction) => {
    if (!editor) return;

    const { from, to, empty } = editor.state.selection;
    if (empty) return;

    const selectedText = editor.state.doc.textBetween(from, to);
    setOriginalSelection(selectedText);
    setSelectionRange({ from, to });
    
    const toastId = showLoading("AI is thinking...");

    let prompt = '';
    switch (action) {
      case 'shorten':
        prompt = `You are an AI writing assistant. Shorten the following text:\n\n"${selectedText}"\n\nReturn only the shortened text.`;
        break;
      case 'improve':
        prompt = `You are an AI writing assistant. Improve the writing of the following text (e.g., clarity, flow, vocabulary):\n\n"${selectedText}"\n\nReturn only the improved text.`;
        break;
      case 'fix':
        prompt = `You are an AI writing assistant. Fix the spelling and grammar of the following text:\n\n"${selectedText}"\n\nReturn only the corrected text.`;
        break;
    }

    try {
      const result = await runGemini(prompt);
      setAiSuggestion(result);
      setIsAIModalOpen(true);
      dismissToast(toastId);
      showSuccess("AI suggestion is ready!");
    } catch (error) {
      console.error("AI Edit Error:", error);
      dismissToast(toastId);
      showError("The AI assistant failed to generate a suggestion.");
    }
  };

  const handleConfirmAIEdit = () => {
    if (!editor || !selectionRange) return;

    editor.chain().focus().deleteRange(selectionRange).insertContent(aiSuggestion).run();
    setIsAIModalOpen(false);
  };

  const handleCancelAIEdit = () => {
    setIsAIModalOpen(false);
  };

  const desktopLayout = (
    <ResizablePanelGroup direction="horizontal" className="flex-grow rounded-lg border">
      <ResizablePanel defaultSize={70} className="overflow-auto relative">
        <TiptapEditor editor={editor} />
        {editor && <FloatingToolbar editor={editor} onEditWithAI={handleEditWithAI} />}
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={30} minSize={20}>
        <ChatSidebar editor={editor} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );

  const mobileLayout = (
    <div className="flex-grow flex flex-col min-h-0">
      <div className="flex-grow border rounded-lg overflow-auto relative">
        <TiptapEditor editor={editor} />
        {editor && <FloatingToolbar editor={editor} onEditWithAI={handleEditWithAI} />}
      </div>
      <Drawer open={isMobileChatOpen} onOpenChange={setIsMobileChatOpen}>
        <DrawerContent className="h-[75vh]">
          <ChatSidebar editor={editor} />
        </DrawerContent>
      </Drawer>
    </div>
  );

  return (
    <>
      <ApiKeyDialog isOpen={isApiKeyModalOpen} onSave={handleSaveApiKey} />
      <AIEditModal
        isOpen={isAIModalOpen}
        onClose={handleCancelAIEdit}
        onConfirm={handleConfirmAIEdit}
        originalText={originalSelection}
        suggestionText={aiSuggestion}
      />
      <div className="h-screen w-screen bg-background text-foreground flex flex-col">
        <Header isMobile={!isDesktop} onMobileChatClick={() => setIsMobileChatOpen(true)} />
        <main className="flex-grow flex flex-col gap-4 p-4 min-h-0">
          {isDesktop ? desktopLayout : mobileLayout}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;