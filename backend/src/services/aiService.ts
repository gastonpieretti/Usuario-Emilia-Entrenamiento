import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

// Init Google
const googleKey = process.env.GOOGLE_AI_KEY || "";
const genAI = new GoogleGenerativeAI(googleKey);

// Init OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "dummy", // Prevent crash if missing
});

export const getMotivationalResponse = async (name: string, emotionalGoal: string) => {
    console.log(`[AI SERVICE] Starting request for: ${name}`);

    const systemPrompt = `Eres un asistente de apoyo emocional y motivación para una aplicación de fitness. 
  Tu objetivo es empoderar al usuario, ser empático y motivador. 
  
  REGLA CRÍTICA: Tienes estrictamente prohibido hablar de dietas, nutrición, calorías, macros o recomendar cualquier tipo de alimento o régimen alimenticio. 
  Si el usuario pregunta por comida o dietas, redirígelo amablemente a consultar con un profesional o a la sección de nutrición de la aplicación. 
  
  Solo puedes dar apoyo emocional y motivación. Dirígete al usuario por su nombre.`;

    const userPrompt = `Hola, mi nombre es ${name}. Mi objetivo emocional o situación actual es: "${emotionalGoal}". ¿Podrías darme unas palabras de aliento y motivación?`;

    // 1. Try Google Gemini
    if (googleKey) {
        try {
            console.log(`[AI SERVICE] Attempting Google Gemini (gemini-1.5-flash)...`);
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash",
                systemInstruction: systemPrompt
            });

            const result = await model.generateContent(userPrompt);
            const response = await result.response;
            const text = response.text();
            console.log('[AI SERVICE] Google Gemini Success');
            return text;
        } catch (error: any) {
            console.error('[AI SERVICE] Google Gemini Failed:', error.message);
        }
    } else {
        console.log('[AI SERVICE] Google Key missing, skipping...');
    }

    // 2. Fallback to OpenAI
    if (process.env.OPENAI_API_KEY) {
        try {
            console.log(`[AI SERVICE] Fallback to OpenAI (gpt-3.5-turbo)...`);
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.7,
                max_tokens: 300,
            });
            console.log('[AI SERVICE] OpenAI Success');
            return response.choices[0].message.content;
        } catch (error: any) {
            console.error('[AI SERVICE] OpenAI Failed:', error.message);
        }
    }

    // 3. Fallback to Static Messages (Mock)
    console.warn('[AI SERVICE] All providers failed. Returning MOCK response.');

    const mockResponses = [
        `¡Hola ${name}! Entiendo que te sientas así, pero recuerda que cada paso cuenta. Tu esfuerzo validará tus resultados. ¡No te rindas, eres capaz de lograr cosas increíbles!`,
        `Fuerza ${name}, todo proceso requiere paciencia y constancia. Lo importante es que hoy estás aquí intentándolo. ¡Sigue adelante, creo en ti!`,
        `${name}, es normal tener días difíciles. Tómalo con calma, respira y recuerda tu objetivo inicial. ¡Tienes la fortaleza para superar esto!`,
        `¡Vamos ${name}! La disciplina es el puente entre tus metas y tus logros. Hoy es un gran día para volver a enfocarte en lo que te hace bien.`
    ];

    return mockResponses[Math.floor(Math.random() * mockResponses.length)] + " (Respuesta Automática de Respaldo)";
};
