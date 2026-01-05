"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMotivationalResponse = void 0;
const generative_ai_1 = require("@google/generative-ai");
const openai_1 = __importDefault(require("openai"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Init Google
const googleKey = process.env.GOOGLE_AI_KEY || "";
const genAI = new generative_ai_1.GoogleGenerativeAI(googleKey);
// Init OpenAI
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY || "dummy", // Prevent crash if missing
});
const getMotivationalResponse = (name, emotionalGoal) => __awaiter(void 0, void 0, void 0, function* () {
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
            const result = yield model.generateContent(userPrompt);
            const response = yield result.response;
            const text = response.text();
            console.log('[AI SERVICE] Google Gemini Success');
            return text;
        }
        catch (error) {
            console.error('[AI SERVICE] Google Gemini Failed:', error.message);
        }
    }
    else {
        console.log('[AI SERVICE] Google Key missing, skipping...');
    }
    // 2. Fallback to OpenAI
    if (process.env.OPENAI_API_KEY) {
        try {
            console.log(`[AI SERVICE] Fallback to OpenAI (gpt-3.5-turbo)...`);
            const response = yield openai.chat.completions.create({
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
        }
        catch (error) {
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
});
exports.getMotivationalResponse = getMotivationalResponse;
