import { Send, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

const ChatSidebar = () => {
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
              {/* Placeholder messages */}
              <div className="flex items-start gap-3">
                <div className="p-3 rounded-lg bg-muted text-muted-foreground">
                  <p className="text-sm">Hello! How can I help you with your document today?</p>
                </div>
              </div>
              <div className="flex items-start gap-3 justify-end">
                <div className="p-3 rounded-lg bg-primary text-primary-foreground">
                  <p className="text-sm">Can you fix the grammar in the first paragraph?</p>
                </div>
              </div>
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="pt-4">
          <form className="flex w-full items-center space-x-2">
            <Input id="message" placeholder="Ask AI to edit..." className="flex-1" autoComplete="off" />
            <Button type="submit" size="icon">
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