import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';

// Load env from one level up (since this script will be in backend/scripts or root of backend)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const apiKey = process.env.GOOGLE_AI_KEY;
console.log('API Key present:', !!apiKey);

const genAI = new GoogleGenerativeAI(apiKey || "");

async function test() {
    try {
        // 1. List available models
        console.log("Listing models...");
        // Note: listModels is not directly on GoogleGenerativeAI instance in some versions? 
        // Actually typically it is not exposed in the high-level SDK easily, 
        // but the getGenerativeModel gives us a model.
        // Let's just try to generate with a standard model.

        const modelName = "gemini-1.5-flash";
        console.log(`Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        console.log("Response:", response.text());

    } catch (error: any) {
        console.error("Error testing gemini-1.5-flash:", error.message);

        try {
            console.log("Trying fallback: gemini-pro");
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent("Hello, are you working?");
            const response = await result.response;
            console.log("Response:", response.text());
        } catch (fallbackError: any) {
            console.error("Error testing gemini-pro:", fallbackError.message);
        }
    }
}

test();
