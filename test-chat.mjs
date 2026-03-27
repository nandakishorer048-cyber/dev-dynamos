import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase variables in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testChat() {
  console.log('Signing up a test user...');
  const email = `testuser_${Date.now()}@example.com`;
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password: 'testPassword123!'
  });

  if (authError) {
    console.error('Signup error:', authError);
    process.exit(1);
  }

  const token = authData.session?.access_token;
  if (!token) {
    console.error('No token returned');
    process.exit(1);
  }

  console.log('Requesting patient-chat edge function...');
  const CHAT_URL = `${SUPABASE_URL}/functions/v1/patient-chat`;

  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
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
