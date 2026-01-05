import fetch from 'node-fetch';

async function testChat() {
  try {
    console.log("Testing /api/ai/chat endpoint...");
    const response = await fetch('http://localhost:5000/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Hi! What is the hostel mess management system?',
        userId: 'test-user-123',
        role: 'student'
      })
    });

    console.log("Response status:", response.status);
    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error testing chat:", error.message);
  }
}

testChat();
