import express from 'express';
import cors from 'cors';
import puppeteer from 'puppeteer-core';
import chrome from 'chrome-aws-lambda';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors()); // Allow CORS
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// Function to fetch answers from Gemini API in batches
async function fetchAnswersFromGeminiBatch(questionsWithOptions) {
    try {
        const prompt = questionsWithOptions.map(({ question, options }) => 
            `For the following question, please provide only the correct answer option without any explanation:\n\nQuestion: "${question}"\nOptions: ${options.join(', ')}`
        ).join('\n\n');

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent(prompt);

        return result.response.text().split('\n').map(answer => answer.trim());
    } catch (error) {
        console.error(`Error fetching answers from Gemini API: ${error.message}`);
        return [];
    }
}

// Clean up the answer text for matching
function cleanAnswerText(answer) {
    return answer.replace(/^\d+\.\s*|\s*\d+\s*|\s*\*\*|\*\*$/g, '').trim();  // Remove numbering and asterisks
}

// Function to generate the autofill script
async function generateAutoFillScript(questions) {
    const answers = await fetchAnswersFromGeminiBatch(questions);
    const cleanAnswers = answers.map(cleanAnswerText);  // Clean up each answer

    const script = `
javascript:(function() {
    const answers = ${JSON.stringify(cleanAnswers)};
    const optionElements = Array.from(document.querySelectorAll('div.AB7Lab.Id5V1'));

    answers.forEach((answer) => {
        const matchingOption = optionElements.find(optionElement => {
            const label = optionElement.closest('label');
            return label && label.innerText.trim() === answer;
        });

        if (matchingOption) {
            const label = matchingOption.closest('label');
            if (label) {
                label.click();
                console.log(\`Selected answer: \${answer}\`);
            }
        } else {
            console.error(\`No matching option found for answer: \${answer}\`);
        }
    });

    console.log("Review the form and submit manually.");
})();
    `;
    return script;
}

// Endpoint to generate the script
app.post('/generate-script', async (req, res) => {
    const { googleFormUrl } = req.body;

    if (!googleFormUrl) {
        return res.status(400).json({ error: 'Google Form URL is required.' });
    }

    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: chrome.args,  // Use arguments from chrome-aws-lambda
            executablePath: await chrome.executablePath,  // Use executable path from chrome-aws-lambda
        });
        const page = await browser.newPage();
        
        await page.goto(googleFormUrl, { waitUntil: 'networkidle0' });
        await page.waitForSelector('form');

        const questions = await page.$$eval('div.geS5n', nodes => 
            nodes.map(node => {
                const questionElement = node.querySelector('div[role="heading"] span.M7eMe');
                const options = Array.from(node.querySelectorAll('div[role="radiogroup"] label div.YEVVod span.aDTYNe')).map(option => option.innerText);
                return { question: questionElement ? questionElement.innerText : '', options };
            })
        );

        console.log('Questions:', questions);

        const script = await generateAutoFillScript(questions);
        await browser.close();

        res.json({ script });
    } catch (error) {
        console.error(`Error generating script: ${error.message}`);
        res.status(500).json({ error: `Failed to generate script: ${error.message}` });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
