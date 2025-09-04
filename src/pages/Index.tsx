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
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { BubbleMenu as BubbleMenuExtension } from '@tiptap/extension-bubble-menu'

const Index = () => {
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

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
      BubbleMenuExtension,
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
        class: 'prose dark:prose-invert max-w-none p-6 focus:outline-none h-full',
      },
    },
    editable: hasApiKey,
  });

  const desktopLayout = (
    <ResizablePanelGroup direction="horizontal" className="flex-grow rounded-lg border">
      <ResizablePanel defaultSize={70}>
        <TiptapEditor editor={editor} />
      </ResizablePanel>
      <ResizableHandle withHandle />
      <ResizablePanel defaultSize={30} minSize={20}>
        <ChatSidebar editor={editor} />
      </ResizablePanel>
    </ResizablePanelGroup>
  );

  const mobileLayout = (
    <div className="flex-grow flex flex-col min-h-0">
      <div className="flex-grow border rounded-lg overflow-hidden">
        <TiptapEditor editor={editor} />
      </div>
      <Drawer open={isMobileChatOpen} onOpenChange={setIsMobileChatOpen}>
        {/* The trigger is in the header, so this is just for the content */}
        <DrawerContent className="h-[75vh]">
          <ChatSidebar editor={editor} />
        </DrawerContent>
      </Drawer>
    </div>
  );

  return (
    <>
      <ApiKeyDialog isOpen={isApiKeyModalOpen} onSave={handleSaveApiKey} />
      <div className="h-screen w-screen bg-background text-foreground flex flex-col">
        <Header isMobile={!isDesktop} onMobileChatClick={() => setIsMobileChatOpen(true)} />
        <main className="flex-grow flex flex-col gap-4 p-4">
          {isDesktop ? desktopLayout : mobileLayout}
        </main>
      </div>
    </>
  );
};

export default Index;