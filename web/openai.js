import axios from "axios";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: "Enter Your API Key",
});
const openai = new OpenAIApi(configuration);


export async function getEmbeddings(data) {
  console.log("Getting embeddings");
  try {
    const response = await openai.createEmbedding({
      model: "text-embedding-ada-002",
      input: data,
    });

    const embeddings = response.data.data[0].embedding;
    return embeddings;
  } catch (error) {
    console.error("Error:", error.message);
    return null;
  }
}

export async function chatCompletion(prompt) {
  try {
    const completionResponse = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
    });
    return completionResponse.data.choices[0].message.content;
  } catch (error) {
    console.error("Chat completion error:", error);
    return "Sorry, an error occurred.";
  }
}
