import ChatSidebar from "@/components/ChatSidebar";
import TiptapEditor from "@/components/Editor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";

const Index = () => {
  return (
    <div className="h-screen w-screen bg-background text-foreground p-4 flex flex-col gap-4">
      <header className="text-center">
        <h1 className="text-2xl font-bold">Live Collaborative Editor</h1>
        <p className="text-muted-foreground">Select text in the editor to see AI options.</p>
      </header>
      <ResizablePanelGroup direction="horizontal" className="flex-grow rounded-lg border">
        <ResizablePanel defaultSize={70}>
          <TiptapEditor />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={30} minSize={20}>
          <ChatSidebar />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default Index;