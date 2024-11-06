const express = require('express');
const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');
const { GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } = require('@google/generative-ai');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize the AI model with safety settings
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);


const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash"
});

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Summarize article
app.post('/summarize', async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: 'URL is required' });

    try {
        const response = await axios.get(`https://article-extractor-and-summarizer.p.rapidapi.com/summarize?url=${encodeURIComponent(url)}&length=3`, {
            headers: {
                'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                'X-RapidAPI-Host': 'article-extractor-and-summarizer.p.rapidapi.com'
            }
        });

        const summary = response.data.summary || 'No summary available.';
        res.json({ summary });
    } catch (error) {
        res.status(500).json({ error: 'Error summarizing the article.' });
    }
});

// Translate text using AI model with safety settings
app.post('/generate', async (req, res) => {
    try {
        const { text, language } = req.body;
        if (!text || !language) {
            return res.status(400).json({ error: 'Both text and language are required' });
        }
        let jsonData = {
            "prompt": `translate "${text}" into ${language} give only the translation dont give explaination`
        };
        const result = await model.generateContent(jsonData.prompt);
        res.json({ text: result.response.text() });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'An error occurred while processing the request' });
    }
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
