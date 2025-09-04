import * as Tiptap from '@tiptap/react'
import BubbleMenuExtension from '@tiptap/extension-bubble-menu'
import StarterKit from '@tiptap/starter-kit'
import { Button } from './ui/button'
import { Loader2, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { runGemini } from '@/lib/gemini'
import { showError } from '@/utils/toast'

const TiptapEditor = () => {
  const [isLoading, setIsLoading] = useState(false);

  const editor = Tiptap.useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
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
      </ul>
      <p>On the right-hand side, you'll find a chat panel where you can interact with an AI assistant. In future steps, this assistant will be able to read and modify the document content based on your commands.</p>
      <p>Happy writing!</p>
    `,
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert max-w-none p-6 focus:outline-none h-full',
      },
    },
  })

  const handleAiAction = async (action: 'improve' | 'shorten' | 'lengthen') => {
    if (!editor) return;

    const { from, to } = editor.state.selection;
    const selectedText = editor.state.doc.textBetween(from, to);

    if (!selectedText) {
      showError("Please select text to perform an AI action.");
      return;
    }

    setIsLoading(true);
    try {
      const prompt = `${action.charAt(0).toUpperCase() + action.slice(1)} the following text: "${selectedText}"`;
      const result = await runGemini(prompt);
      
      editor.chain().focus().deleteRange({ from, to }).insertContent(result).run();

    } catch (error) {
      console.error(error);
      showError("An error occurred while processing your request.");
    } finally {
      setIsLoading(false);
    }
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
          </div>
        </Tiptap.BubbleMenu>
      )}
      <Tiptap.EditorContent editor={editor} />
    </div>
  )
}

export default TiptapEditor