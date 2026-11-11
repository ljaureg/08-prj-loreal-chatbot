/* DOM elements */
const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");
const chatWindow = document.getElementById("chatWindow");
const sendBtn = document.getElementById("sendBtn");

const workerURL = 'https://solitary-moon-d2a1.ljaureg4.workers.dev/';
const systemPrompt =
  "You are a L'Oréal chatbot. Your job is to only answer questions related to L'Oréal products, routines, and recommendations. Do not answer anything unrelated to these topics. If a user prompts something unrelated, redirect them by saying \"I can only answer questions related to L'Oréal products, routines, and recommendations. What can I help you with regarding these topics?\" Use a friendly but professional tone the entire time. Use the conversation history to remember relevant details the user shares, such as their name, preferences, and past questions. Refer to those details when helpful and avoid asking the user to repeat information they have already shared.";

// Keep the system instructions and conversation together for each API request.
const chatHistory = [{ role: "system", content: systemPrompt }];

// Set initial message
chatWindow.textContent = "👋 Hello! How can I help you today?";

// Add each message as text so user or assistant content is not treated as HTML.
function addMessage(role, content) {
  const message = document.createElement("p");
  message.className = `msg ${role}`;
  message.textContent = content;
  chatWindow.appendChild(message);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

function addQuestion(content) {
  const question = document.createElement("div");
  question.className = "question";
  question.textContent = content;
  chatWindow.appendChild(question);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

/* Handle form submit */
chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const message = userInput.value.trim();
  if (!message) return;

  chatWindow.replaceChildren();
  addQuestion(message);
  userInput.value = "";
  userInput.disabled = true;
  sendBtn.disabled = true;

  try {
    const response = await fetch(workerURL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [...chatHistory, { role: "user", content: message }],
      }),
    });

    if (!response.ok) {
      throw new Error(`The chatbot request failed (${response.status}).`);
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      throw new Error("The chatbot returned an empty or invalid response.");
    }

    chatHistory.push(
      { role: "user", content: message },
      { role: "assistant", content: reply },
    );
    addMessage("ai", reply);
  } catch (error) {
    console.error("Unable to get a chatbot response:", error);
    addMessage(
      "ai",
      "Sorry, I couldn't get a response right now. Please try again.",
    );
  } finally {
    userInput.disabled = false;
    sendBtn.disabled = false;
    userInput.focus();
  }
});
