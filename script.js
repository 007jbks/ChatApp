async function callGeminiAPI(apiKey, history) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    const requestBody = {
        contents: [
            {
                parts: history.map(({ text }) => ({ text }))
            }
        ]
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Error occurred while fetching response.";
    }
}

const API_KEY = "AIzaSyDfRLr5B0vgLeMhIf0MmnRnjBd8vJ9W08Y"; // Replace with actual API key
const system_prompt = "You are now a chatbot. Respond like a friendly motivator.";
let history = JSON.parse(localStorage.getItem("chatHistory")) || [{ role: "system", text: system_prompt }];

const go = document.getElementById("go");
const input = document.getElementById("in");
const output = document.getElementById("output");

// Function to add messages to chat and save them locally
function addMessage(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender === "user" ? "user-message" : "bot-message");
    messageDiv.textContent = text;
    output.appendChild(messageDiv);

    // Auto-scroll to the latest message
    output.scrollTop = output.scrollHeight;
}

// Function to load previous chats from localStorage
function loadPreviousChats() {
    history.forEach((msg) => {
        if (msg.role !== "system") {
            addMessage(msg.text, msg.role === "user" ? "user" : "bot");
        }
    });
}

// Load previous messages when the page loads
loadPreviousChats();

go.addEventListener("click", async () => {
    const user_reply = input.value.trim();
    if (!user_reply) return;

    addMessage(user_reply, "user"); // Show user message
    history.push({ role: "user", text: user_reply });

    input.value = ""; // Clear input field

    const responseText = await callGeminiAPI(API_KEY, history);
    addMessage(responseText, "bot"); // Show bot response
    history.push({ role: "model", text: responseText });

    // Save updated chat history in localStorage
    localStorage.setItem("chatHistory", JSON.stringify(history));
});
