// Select DOM elements
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const chatBox = document.getElementById('chat-box');

// Function to parse basic Markdown
function parseMarkdown(text) {
  // Escape HTML to prevent XSS (basic)
  let safeText = text.replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Bold (**text**)
  safeText = safeText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Italic (*text*)
  safeText = safeText.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Newlines to <br>
  safeText = safeText.replace(/\n/g, '<br>');

  return safeText;
}

// Function to append a message to the chat box
function appendMessage(role, text) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', role);

  // Parse markdown and set as HTML
  messageDiv.innerHTML = parseMarkdown(text);

  chatBox.appendChild(messageDiv);

  // Scroll to the bottom
  chatBox.scrollTop = chatBox.scrollHeight;

  return messageDiv; // Return the element in case we need to remove it (e.g., loading message)
}

// Function to handle form submission
async function handleChatSubmit(event) {
  event.preventDefault();

  const message = userInput.value.trim();
  if (!message) return;

  // 1. Add user message
  appendMessage('user', message);
  userInput.value = '';

  // 2. Show "Thinking..." message
  const loadingMessageDiv = appendMessage('bot', 'Thinking...');

  try {
    // 3. Send POST request to backend
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        conversation: [
          { role: 'user', text: message }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    const data = await response.json();

    // 4. Replace "Thinking..." with actual response
    chatBox.removeChild(loadingMessageDiv); // Remove the temporary loading message

    if (data.result) {
      appendMessage('bot', data.result);
    } else {
      appendMessage('bot', 'Sorry, no response received from the AI.');
    }

  } catch (error) {
    console.error('Error fetching chat response:', error);

    // Remove loading message and show error
    if (loadingMessageDiv && loadingMessageDiv.parentNode) {
      chatBox.removeChild(loadingMessageDiv);
    }
    appendMessage('bot', 'Sorry, something went wrong. Please try again later.');
  }
}

// Attach event listener
chatForm.addEventListener('submit', handleChatSubmit);
