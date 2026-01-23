import { useEffect, useCallback } from 'react';

interface ShortcutHandlers {
  onNewChat?: () => void;
  onSearch?: () => void;
  onFocusInput?: () => void;
  onEscape?: () => void;
  onStopGeneration?: () => void;
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

    // Cmd/Ctrl + Shift + N: New Chat
    if (cmdOrCtrl && e.shiftKey && e.key === 'N') {
      e.preventDefault();
      handlers.onNewChat?.();
      return;
    }

    // Cmd/Ctrl + K: Search
    if (cmdOrCtrl && e.key === 'k') {
      e.preventDefault();
      handlers.onSearch?.();
      return;
    }

    // Cmd/Ctrl + /: Focus input
    if (cmdOrCtrl && e.key === '/') {
      e.preventDefault();
      handlers.onFocusInput?.();
      return;
    }

    // Escape: Cancel/close
    if (e.key === 'Escape') {
      handlers.onEscape?.();
      return;
    }
  }, [handlers]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
