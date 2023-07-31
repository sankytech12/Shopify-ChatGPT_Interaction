import { useState } from "react";
import { Toast } from "@shopify/app-bridge-react";
import { useTranslation } from "react-i18next";
import { useAppQuery, useAuthenticatedFetch } from "../hooks";
import {
  Card,
  Text,
  FormLayout,
  TextField,
  Button,
  Stack,
  LegacyCard,
} from "@shopify/polaris";

export function Chat() {
  const fetch = useAuthenticatedFetch();
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  const handleMessageSubmit = (event) => {
    event.preventDefault();
    if (messageInput.trim() !== "") {
      const newMessage = {
        id: new Date().getTime(),
        text: messageInput.trim(),
        sender: "user",
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setMessageInput("");
    }
  };

  const handleResponse = (response) => {
    const newMessage = {
      id: new Date().getTime(),
      text: response,
      sender: "assistant",
    };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  };

  // Function to send user input to your backend and get a response
  const sendMessageToBackend = async (message) => {
    try {
      // Make a request to your backend API with the user's message
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message }),
      }).then((res) => {
        return res.json();
      });
      handleResponse(response.message);
    } catch (error) {
      handleResponse("Sorry, an error occurred.");
    }
  };

  const handleInputChange = (value) => {
    setMessageInput(value);
  };

  return (
    <LegacyCard title="Chat">
      <LegacyCard.Section>
        <div
          style={{
            height: "300px",
            overflowY: "scroll",
            backgroundColor: "#F2F2F2",
            padding: "0 20px",
          }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                margin: "8px 0",
                textAlign: message.sender === "user" ? "right" : "left",
              }}
            >
              <Text
                style={{
                  backgroundColor:
                    message.sender === "user" ? "#ADD8E6" : "#90EE90",
                  padding: "10px",
                  borderRadius: "5px",
                  display: "inline-block",
                }}
              >
                {message.sender === "user" ? (
                  <span>You: {message.text}</span>
                ) : (
                  <span>Assistant: {message.text}</span>
                )}
              </Text>
            </div>
          ))}
        </div>
      </LegacyCard.Section>

      <LegacyCard.Section>
        <form onSubmit={handleMessageSubmit}>
          <FormLayout>
            <TextField
              value={messageInput}
              onChange={handleInputChange}
              autoFocus
              autoComplete="off"
              placeholder="Type your message..."
              connectedRight={
                <Button
                  submit
                  onClick={() => {
                    sendMessageToBackend(messageInput);
                  }}
                >
                  Send
                </Button>
              }
            />
          </FormLayout>
        </form>
      </LegacyCard.Section>
    </LegacyCard>
  );
}
