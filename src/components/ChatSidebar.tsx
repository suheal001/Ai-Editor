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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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
      const prompt = `You are an AI writing assistant. Your purpose is to help a user with the document they are writing.

Here is the full content of their current document for your context:
---
${documentContent}
---

Here is the user's request:
---
${input}
---

Please respond to the user's request. If your response is content that should be inserted directly into the document, you MUST output ONLY that content, without any conversational phrases like "Sure, here you go:" or "Here is the text you requested:".`;
      
      const aiResponse = await runGemini(prompt);
      const modelMessage: Message = { role: 'model', content: aiResponse };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      showError("The AI assistant is unavailable. Please check your API key.");
      setMessages(prev => prev.filter(msg => msg !== userMessage)); // Remove user message on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full p-2 pl-0">
      <Card className="h-full flex flex-col border-0 shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                   {message.role === 'user' ? (
                    <div className="p-3 rounded-lg bg-primary text-primary-foreground max-w-xs">
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 w-full">
                      <div className="p-3 rounded-lg bg-muted text-muted-foreground max-w-xs">
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {index > 0 && (
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
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}

export default ChatSidebar;