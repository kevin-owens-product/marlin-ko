"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';
import type {
  CopilotContextValue,
  CopilotMessage,
  CopilotModule,
  CopilotApiRequest,
  CopilotApiResponse,
} from './types';
import { getModuleFromPath, getSuggestions } from './module-context';

const CopilotContext = createContext<CopilotContextValue | undefined>(undefined);

let messageCounter = 0;
function nextId(): string {
  return `msg_${++messageCounter}_${Date.now()}`;
}

export function CopilotProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const currentModule: CopilotModule = getModuleFromPath(pathname);
  const suggestions = getSuggestions(currentModule);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const sendQuery = useCallback(
    async (query: string) => {
      if (!query.trim() || isLoading) return;

      const userMsg: CopilotMessage = {
        id: nextId(),
        role: 'user',
        content: query,
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      const loadingMsg: CopilotMessage = {
        id: nextId(),
        role: 'copilot',
        timestamp: new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
        isLoading: true,
      };

      setMessages((prev) => [...prev, userMsg, loadingMsg]);
      setIsLoading(true);

      try {
        const body: CopilotApiRequest = { query, module: currentModule };
        const res = await fetch('/api/copilot', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        const data: CopilotApiResponse = await res.json();

        const copilotMsg: CopilotMessage = {
          id: loadingMsg.id,
          role: 'copilot',
          blocks: data.blocks,
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };

        setMessages((prev) =>
          prev.map((m) => (m.id === loadingMsg.id ? copilotMsg : m))
        );
      } catch {
        const errorMsg: CopilotMessage = {
          id: loadingMsg.id,
          role: 'copilot',
          blocks: [
            {
              type: 'error',
              message: 'Failed to connect to the copilot service. Please try again.',
            },
          ],
          timestamp: new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };

        setMessages((prev) =>
          prev.map((m) => (m.id === loadingMsg.id ? errorMsg : m))
        );
      } finally {
        setIsLoading(false);
      }
    },
    [currentModule, isLoading]
  );

  // Keyboard shortcut: Cmd+Shift+I / Ctrl+Shift+I
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'i') {
        e.preventDefault();
        toggle();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggle]);

  return (
    <CopilotContext.Provider
      value={{
        isOpen,
        open,
        close,
        toggle,
        messages,
        sendQuery,
        clearMessages,
        currentModule,
        isLoading,
        suggestions,
      }}
    >
      {children}
    </CopilotContext.Provider>
  );
}

export function useCopilot(): CopilotContextValue {
  const context = useContext(CopilotContext);
  if (!context) {
    throw new Error('useCopilot must be used within a CopilotProvider');
  }
  return context;
}
