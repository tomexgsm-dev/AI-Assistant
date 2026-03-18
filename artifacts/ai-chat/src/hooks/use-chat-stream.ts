import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getListOpenaiMessagesQueryKey } from '@workspace/api-client-react';

export function useChatStream(conversationId: number | undefined) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const queryClient = useQueryClient();

  const sendMessage = async (content: string) => {
    if (!conversationId) return;
    
    setIsStreaming(true);
    setStreamingMessage('');

    try {
      const res = await fetch(`/api/openai/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
      });

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
    } catch (err) {
      console.error('[SSE] Stream error', err);
    } finally {
      setIsStreaming(false);
      // Invalidate the messages query so the finalized message from the DB appears
      queryClient.invalidateQueries({
        queryKey: getListOpenaiMessagesQueryKey(conversationId)
      });
    }
  };

  return { sendMessage, isStreaming, streamingMessage };
}
