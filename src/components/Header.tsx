import { MessageSquarePlus } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/button';

interface HeaderProps {
  isMobile: boolean;
  onMobileChatClick?: () => void;
}

const Header = ({ isMobile, onMobileChatClick }: HeaderProps) => {
  return (
    <header className="flex items-center justify-between p-4 border-b">
      <div className="flex items-center gap-2">
        <img src="/favicon.ico" alt="App Logo" className="h-6 w-6" />
        <h1 className="text-xl font-bold tracking-tight">AI Collaborative Editor</h1>
      </div>
      <div className="flex items-center gap-2">
        {isMobile && (
          <Button variant="outline" size="icon" onClick={onMobileChatClick}>
            <MessageSquarePlus className="h-5 w-5" />
            <span className="sr-only">Open AI Assistant</span>
          </Button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;