import ChatSidebar from "@/components/ChatSidebar";
import TiptapEditor from "@/components/Editor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { BubbleMenu } from '@tiptap/extension-bubble-menu'

const Index = () => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      BubbleMenu.configure({
        pluginKey: "bubbleMenu",
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
      <p>On the right-hand side, you'll find a chat panel where you can interact with an AI assistant. The assistant can now read your document to provide context-aware help.</p>
      <p>Happy writing!</p>
    `,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none p-6 focus:outline-none h-full',
      },
    },
  })

  return (
    <div className="h-screen w-screen bg-background text-foreground p-4 flex flex-col gap-4">
      <header className="text-center">
        <h1 className="text-2xl font-bold">Live Collaborative Editor</h1>
        <p className="text-muted-foreground">Select text in the editor to see AI options.</p>
      </header>
      <ResizablePanelGroup direction="horizontal" className="flex-grow rounded-lg border">
        <ResizablePanel defaultSize={70}>
          <TiptapEditor editor={editor} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={30} minSize={20}>
          <ChatSidebar editor={editor} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;