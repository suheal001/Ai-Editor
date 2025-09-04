import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/extension-bubble-menu'
import StarterKit from '@tiptap/starter-kit'
import { Button } from './ui/button'
import { Sparkles } from 'lucide-react'

const TiptapEditor = () => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      // The BubbleMenu extension is required for the BubbleMenu component to work
      BubbleMenu,
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

  return (
    <div className="relative h-full w-full overflow-y-auto bg-card text-card-foreground rounded-lg">
      {editor && (
        // The BubbleMenu component now comes from the extension package
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex items-center space-x-1 rounded-md bg-background border p-1 shadow-lg">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Improve
            </Button>
            <Button variant="ghost" size="sm">Shorten</Button>
            <Button variant="ghost" size="sm">Lengthen</Button>
          </div>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} />
    </div>
  )
}

export default TiptapEditor