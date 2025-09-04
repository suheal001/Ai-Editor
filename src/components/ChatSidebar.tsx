import { Send, Sparkles, Loader2, CopyPlus, Search, User, Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState, useRef, useEffect } from 'react'
import { runGemini } from '@/lib/gemini'
import { searchTavily } from '@/lib/tavily'
import { showError, showSuccess } from '@/utils/toast'
import * as Tiptap from '@tiptap/react'
import { Avatar, AvatarFallback } from './ui/avatar'

interface Message {
  role: 'user' | 'model';
  content: string;
  type?: 'search_step';
}

interface ChatSidebarProps {
  editor: Tiptap.Editor | null;
}

const ChatSidebar = ({ editor }: ChatSidebarProps) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', content: 'Hello! I can help with your document or search the web. Try asking me to "find the latest news on..."' }
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
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    try {
      const isSearchQuery = /^(search|find|what is|who is|latest news on)/i.test(currentInput);
      let aiResponse = '';

      if (isSearchQuery) {
        setMessages(prev => [...prev, { role: 'model', content: `Searching the web for "${currentInput}"...`, type: 'search_step' }]);
        const searchResults = await searchTavily(currentInput);
        const prompt = `You are an AI writing assistant. Based on the provided web search results, please answer the user's original request.\n\nWEB SEARCH RESULTS:\n---\n${searchResults}\n---\n\nUSER'S REQUEST:\n---\n${currentInput}\n---\n\nPlease provide a comprehensive answer based *only* on the search results. If the request implies creating content for the document (e.g., "write a summary"), output ONLY that content. Otherwise, provide a helpful, conversational response.`;
        aiResponse = await runGemini(prompt);
      } else {
        const documentContent = editor.getText();
        const prompt = `You are an AI writing assistant. Your purpose is to help a user with the document they are writing.\nHere is the full content of their current document for your context:\n---\n${documentContent}\n---\nHere is the user's request:\n---\n${currentInput}\n---\nPlease respond to the user's request. If your response is content that should be inserted directly into the document, you MUST output ONLY that content, without any conversational phrases.`;
        aiResponse = await runGemini(prompt);
      }
      const modelMessage: Message = { role: 'model', content: aiResponse };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      showError("The AI assistant failed. Please check your API keys and connection.");
      setMessages(prev => prev.filter(msg => msg !== userMessage));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full p-2 md:pl-0">
      <Card className="h-full flex flex-col border-0 shadow-none">
        <CardHeader className="pt-4 md:pt-6">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Assistant
          </CardTitle>
          <CardDescription>
            Get help with your document or search the web.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div key={index} className={`flex items-start gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                  {message.role === 'model' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`flex flex-col gap-2 max-w-[85%]`}>
                    {message.type === 'search_step' ? (
                      <div className="p-3 rounded-lg bg-transparent text-muted-foreground flex items-center gap-2">
                        <Search className="h-4 w-4 animate-pulse" />
                        <p className="text-sm italic">{message.content}</p>
                      </div>
                    ) : (
                      <>
                        <div className={`p-3 rounded-lg ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                        {message.role === 'model' && index > 0 && (
                          <div className="flex justify-start">
                            <Button variant="outline" size="sm" className="flex items-center gap-2" onClick={() => handleInsert(message.content)}>
                              <CopyPlus className="h-4 w-4" />
                              Insert into Editor
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback><Bot className="h-4 w-4" /></AvatarFallback>
                  </Avatar>
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
              placeholder={'Ask AI or try "Search for..."'}
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