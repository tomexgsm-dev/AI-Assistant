import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getListOpenaiMessagesQueryKey } from '@workspace/api-client-react';
import { getClientId } from '@/lib/client-id';

export interface SendMessageOptions {
  imageBase64?: string;
  imageMimeType?: string;
}

export interface StreamError {
  type: 'limit_reached';
  limitType: 'chat' | 'image';
}

export function useChatStream(conversationId: number | undefined) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [streamError, setStreamError] = useState<StreamError | null>(null);
  const queryClient = useQueryClient();

  const sendMessage = async (content: string, options?: SendMessageOptions): Promise<boolean> => {
    if (!conversationId) return false;
    
    setIsStreaming(true);
    setStreamingMessage('');
    setStreamError(null);

    try {
      const body: Record<string, string> = { content };
      if (options?.imageBase64) body.imageBase64 = options.imageBase64;
      if (options?.imageMimeType) body.imageMimeType = options.imageMimeType;

      const res = await fetch(`/api/openai/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client-id': getClientId(),
        },
        body: JSON.stringify(body),
      });

      if (res.status === 429) {
        const data = await res.json();
        setStreamError({ type: 'limit_reached', limitType: data.type ?? 'chat' });
        setIsStreaming(false);
        return false;
      }

      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (!dataStr) continue;

            try {
              const data = JSON.parse(dataStr);
              if (data.done) {
                break;
              }
              if (data.content) {
                setStreamingMessage(prev => prev + data.content);
              }
            } catch (e) {
              console.error('[SSE] Failed to parse chunk', dataStr, e);
            }
          }
        }
      }
      return true;
    } catch (err) {
      console.error('[SSE] Stream error', err);
      return false;
    } finally {
      setIsStreaming(false);
      queryClient.invalidateQueries({
        queryKey: getListOpenaiMessagesQueryKey(conversationId)
      });
    }
  };

  return { sendMessage, isStreaming, streamingMessage, streamError, clearError: () => setStreamError(null) };
}
