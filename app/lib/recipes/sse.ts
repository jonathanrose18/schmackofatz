const DONE_EVENT_TOKEN = '[DONE]';

function parseEventData(rawEvent: string): string {
   return rawEvent
      .split('\n')
      .filter(line => line.startsWith('data:'))
      .map(line => line.slice(5).trimStart())
      .join('\n');
}

export async function readSseStream(
   stream: ReadableStream<Uint8Array>,
   onData: (chunk: string) => void,
   doneToken = DONE_EVENT_TOKEN
): Promise<void> {
   const reader = stream.getReader();
   const decoder = new TextDecoder();
   let buffer = '';
   let streamEnded = false;

   const appendEvent = (rawEvent: string) => {
      const data = parseEventData(rawEvent);

      if (!data) return;

      if (data === doneToken) {
         streamEnded = true;
         return;
      }

      onData(data);
   };

   try {
      while (!streamEnded) {
         const { done, value } = await reader.read();

         if (done) break;

         buffer += decoder.decode(value, { stream: true });
         buffer = buffer.replace(/\r\n/g, '\n');
         const events = buffer.split('\n\n');
         buffer = events.pop() ?? '';

         for (const event of events) {
            if (!event.trim()) continue;

            appendEvent(event);

            if (streamEnded) break;
         }
      }

      buffer += decoder.decode();
      buffer = buffer.replace(/\r\n/g, '\n');
      const remainingEvent = buffer.trim();
      if (!streamEnded && remainingEvent) {
         appendEvent(remainingEvent);
      }
   } finally {
      reader.releaseLock();
   }
}
