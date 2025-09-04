import { type Editor, EditorContent } from '@tiptap/react'
import { Trash2 } from 'lucide-react'
import { Button } from './ui/button'

interface TiptapEditorProps {
  editor: Editor | null;
}

const TiptapEditor = ({ editor }: TiptapEditorProps) => {
  const handleClearContent = () => {
    editor?.chain().focus().clearContent().run();
  };

  return (
    <div className="relative h-full w-full bg-card text-card-foreground rounded-lg">
      {editor && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-10 text-muted-foreground hover:text-foreground"
          onClick={handleClearContent}
          title="Clear all content"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
      <EditorContent editor={editor} className="h-full" />
    </div>
  )
}

export default TiptapEditor;