import { Send, Sparkles, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState, useRef, useEffect } from 'react'
import { runGemini } from '@/lib/gemini'
import { showError } from '@/utils/toast'
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !editor) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const documentContent = editor.getText();
      const prompt = `You are an AI writing assistant. The user is working on the following document:\n\n---\n${documentContent}\n---\n\nThe user has sent you the following message: "${input}". Respond to the user's message. If you suggest a change to the document, provide the full text of your suggested change so the user can copy and paste it.`;
      
      const aiResponse = await runGemini(prompt);
      const modelMessage: Message = { role: 'model', content: aiResponse };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error)
      {
      console.error(error);
      showError("The AI assistant is not available right now.");
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
                  <div className={`p-3 rounded-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
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