const API_KEY = "AIzaSyDfRLr5B0vgLeMhIf0MmnRnjBd8vJ9W08Y";
const system_prompt = "You are now a chatbot. Keep responses short and motivating.";

// Selecting elements
const go = document.getElementById("go");
const input = document.getElementById("in");
const output = document.getElementById("output");
const clearChat = document.getElementById("clearChat");

// Load chat history from local storage
let history = JSON.parse(localStorage.getItem("chatHistory")) || [{ role: "system", text: system_prompt }];

// Function to display messages
function displayMessages() {
    output.innerHTML = "";
    history.forEach(({ role, text }) => {
        if (role !== "system") { // Hide system prompt
            const messageDiv = document.createElement("div");
            messageDiv.classList.add("message", role);
            messageDiv.textContent = text;
            output.appendChild(messageDiv);
        }
    });
    output.scrollTop = output.scrollHeight; // Auto-scroll to latest message
}

// Function to call Gemini API
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

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const data = await response.json();
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response";
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        return "Error occurred while fetching response.";
    }
}

// Load saved chat on page load
displayMessages();

// Click event for sending messages
go.addEventListener("click", async () => {
    const userText = input.value.trim();
    if (!userText) return;

    // Add user message to history
    history.push({ role: "user", text: userText });
    displayMessages();
    input.value = "";

    // Call API and get response
    const botResponse = await callGeminiAPI(API_KEY, history);
    history.push({ role: "bot", text: botResponse });
    
    // Save chat to local storage
    localStorage.setItem("chatHistory", JSON.stringify(history));

    displayMessages();
});

// Clear chat button
clearChat.addEventListener("click", () => {
    history = [{ role: "system", text: system_prompt }]; // Reset history
    localStorage.removeItem("chatHistory"); // Remove from local storage
    displayMessages();
});
