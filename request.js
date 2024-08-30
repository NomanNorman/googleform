import fetch from 'node-fetch';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';
const API_KEY = 'AIzaSyCGppnTpCrOYAC-UNizx1KcZVMgOK3zoZs'; // Replace with your actual API key

const requestData = {
    prompt: '[{"question": "Sample question", "options": []}]',
    max_tokens: 1000
};

async function sendRequest() {
    try {
        const response = await fetch(GEMINI_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();
        console.log('Response:', data);
    } catch (error) {
        console.error('Error:', error);
    }
}

sendRequest();
