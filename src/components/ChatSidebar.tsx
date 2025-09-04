import { Send, Sparkles, Loader2, CopyPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState, useRef, useEffect } from 'react'
import { runGemini } from '@/lib/gemini'
import { showError, showSuccess } from '@/utils/toast'
import * as Tiptap from '@tiptap/react'

interface Message {
  role: 'user' | 'model';
  content: string;
}

interface ChatSidebarProps {
  editor: Tiptap.Editor | null;
}

const ChatSidebar = ({ editor }: ChatSidebarProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'Hello! How can I help you with the document today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleInsert = (content: string) => {
    if (editor) {
      editor.chain().focus().insertContent(content).run();
      showSuccess("Content inserted into editor!");
    } else {
      showError("Editor not available.");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !editor) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const documentContent = editor.getText();
      const prompt = `You are an AI writing assistant. The user is working on the following document:\n\n---\n${documentContent}\n---\n\nThe user has sent you the following message: "${input}". Respond to the user's message. If you suggest new content or changes for the document, provide only the text that should be inserted. The user will have a button to insert your response directly into the editor. Do not include conversational fluff like "Sure, here is the text:" if you are providing content for the document.`;
      
      const aiResponse = await runGemini(prompt);
      const modelMessage: Message = { role: 'model', content: aiResponse };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error)
      {
      console.error("AI Chat Error:", error);
      showError("The AI assistant is not available. Please check your Gemini API key and network connection.");
      setMessages(prev => prev.slice(0, -1)); // Remove user message on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full p-2 pl-0">
      <Card className="h-full flex flex-col border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                   {message.role === 'user' ? (
                    <div className="p-3 rounded-lg bg-primary text-primary-foreground">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 w-full">
                      <div className="p-3 rounded-lg bg-muted text-muted-foreground">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {index > 0 && ( // Don't show for initial message
                        <div className="flex justify-start">
                          <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => handleInsert(message.content)}>
                            <CopyPlus className="h-4 w-4" />
                            Insert into Editor
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-lg bg-muted text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="pt-4">
          <form className="flex w-full items-center space-x-2" onSubmit={handleSubmit}>
            <Input 
              id="message" 
              placeholder="Ask AI..." 
              className="flex-1" 
              autoComplete="off"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading || !editor}
            />
            <Button type="submit" size="icon" disabled={isLoading || !editor}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}

export default ChatSidebar