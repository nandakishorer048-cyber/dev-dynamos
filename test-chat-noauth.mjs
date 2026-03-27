import * as dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;

async function testChat() {
  console.log('Requesting patient-chat edge function directly (bypassing auth)...');
  const CHAT_URL = `${SUPABASE_URL}/functions/v1/patient-chat`;

  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        { role: 'user', content: 'hello' }
      ]
    }),
  });

  if (!resp.ok) {
    console.error('Status:', resp.status);
    const text = await resp.text();
    console.error('Error response:', text);
    process.exit(1);
  }

  console.log('Stream response OK! Reading stream...');
  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    console.log('Chunk:', decoder.decode(value));
  }
}

testChat().catch(console.error);
