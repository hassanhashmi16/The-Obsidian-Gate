async function test() {
    console.log("Testing API...");
    try {
        const response = await fetch("http://localhost:3000/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                userMessage: "Hello",
                conversationHistory: [],
                currentScore: 0,
                sessionId: "test-session-123"
            })
        });
        const data = await response.json();
        console.log("Response:", data);
    } catch (e) {
        console.error("Error:", e);
    }
}
test();
