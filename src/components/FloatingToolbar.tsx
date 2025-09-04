"use client";

import { type Editor, BubbleMenu } from '@tiptap/react';
import { Button } from './ui/button';

export type AIAction = 'shorten' | 'improve' | 'fix';

interface FloatingToolbarProps {
  editor: Editor;
  onEditWithAI: (action: AIAction) => void;
}

const FloatingToolbar = ({ editor, onEditWithAI }: FloatingToolbarProps) => {
  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100, zIndex: 20 }}
      className="bg-background border rounded-lg shadow-xl p-1 flex items-center gap-1"
      shouldShow={({ state }) => {
        const { from, to } = state.selection;
        // Only show if there is a non-empty selection
        return from !== to;
      }}
    >
      <Button variant="ghost" size="sm" onClick={() => onEditWithAI('shorten')}>
        Shorten
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onEditWithAI('improve')}>
        Improve
      </Button>
      <Button variant="ghost" size="sm" onClick={() => onEditWithAI('fix')}>
        Fix Grammar
      </Button>
    </BubbleMenu>
  );
};

export default FloatingToolbar;