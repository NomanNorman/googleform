import { GoogleGenerativeAI } from "@google/generative-ai";

// Function to fetch answers from Gemini API in batches
export async function fetchAnswersFromGeminiBatch(questionsWithOptions, genAI) {
    try {
        const prompt = questionsWithOptions.map(({ question, options }) => 
            `For the following question, please provide only the correct answer option without any explanation:\n\nQuestion: "${question}"\nOptions: ${options.join(', ')}`
        ).join('\n\n');

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);

        return result.response.text().split('\n');
    } catch (error) {
        console.error(`Error fetching answers from Gemini API: ${error.message}`);
        return [];
    }
}

// Function to clean and normalize text by removing serial numbers, asterisks, and parentheses
export function cleanText(text) {
    return text
        .replace(/^\d+\.\s*|\s*\d+\s*|\s*[\d]+\.\s*/g, '')
        .replace(/[\*\(\)]/g, '')
        .trim();
}
