// Function to handle text-to-speech using Google Cloud API
async function convertTextToSpeech(text, languageCode) {
    const apiKey = "AIzaSyDF-zVaSHGmizLXP7lVfgR8IeIQ6ZVR5w0"; // Replace with your Google Cloud API key
    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`;

    const requestPayload = {
        input: { text: text },
        voice: { languageCode: languageCode, ssmlGender: "NEUTRAL" },
        audioConfig: { audioEncoding: "MP3" }
    };

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestPayload)
        });

        const result = await response.json();

        if (result.audioContent) {
            const audioPlayer = document.getElementById("audioPlayer");
            audioPlayer.src = `data:audio/mp3;base64,${result.audioContent}`;
            audioPlayer.play();
        } else {
            alert("Error: Unable to generate speech.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error: " + error.message);
    }
}

// Summarize the article
document.getElementById('summarize-btn').addEventListener('click', async () => {
    const articleUrl = document.getElementById('article-url').value;
    const summaryOutput = document.getElementById('summary-output');
    const loader = document.getElementById('loader');

    if (articleUrl.trim() === "") {
        summaryOutput.innerHTML = "Please enter a valid article URL.";
        return;
    }

    loader.style.display = "block";
    summaryOutput.innerHTML = '';

    try {
        const response = await fetch('/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: articleUrl })
        });

        const data = await response.json();
        loader.style.display = "none";

        if (data && data.summary) {
            summaryOutput.innerHTML = `<h3>Summary:</h3><p id="summary-text">${data.summary}</p>`;
        } else {
            summaryOutput.innerHTML = "No summary available.";
        }
    } catch (error) {
        loader.style.display = "none";
        summaryOutput.innerHTML = "An error occurred.";
    }
});

// Translate the summary
document.getElementById('translate-btn').addEventListener('click', async () => {
    const summaryTextElement = document.getElementById('summary-text');
    const targetLanguage = document.getElementById('target-language').value;
    const translationOutput = document.getElementById('translation-output');
    const translateLoader = document.getElementById('translate-loader');

    if (!summaryTextElement) {
        translationOutput.innerHTML = "Please summarize an article first.";
        return;
    }

    const textToTranslate = summaryTextElement.innerText;

    if (targetLanguage.trim() === "") {
        translationOutput.innerHTML = "Please enter a target language.";
        return;
    }

    translateLoader.style.display = "block";
    translationOutput.innerHTML = '';

    try {
        const response = await fetch('/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: textToTranslate, language: targetLanguage })
        });

        const data = await response.json();
        translateLoader.style.display = "none";

        if (data && data.text) {
            translationOutput.innerHTML = `<h3>Translation:</h3><p id="translated-text">${data.text}</p>`;
        } else {
            translationOutput.innerHTML = "No translation available.";
        }
    } catch (error) {
        translateLoader.style.display = "none";
        translationOutput.innerHTML = "An error occurred.";
    }
});

// Play the translated text using Google Cloud Text-to-Speech API
document.getElementById('speak-btn').addEventListener('click', async () => {
    const translatedTextElement = document.getElementById('translated-text');
    const targetLanguage = document.getElementById('target-language').value;

    if (!translatedTextElement) {
        alert("Please translate the text first.");
        return;
    }

    if (targetLanguage.trim() === "") {
        alert("Please enter a target language.");
        return;
    }

    const textToSpeak = translatedTextElement.innerText;
    const langCode = getLanguageCode(targetLanguage);

    await convertTextToSpeech(textToSpeak, langCode);
});

// Pause the audio playback
document.getElementById('pause-btn').addEventListener('click', () => {
    const audioPlayer = document.getElementById("audioPlayer");
    if (!audioPlayer.paused) {
        audioPlayer.pause();
    } else {
        alert("Audio is already paused.");
    }
});

// Function to map input language to appropriate language code
function getLanguageCode(language) {
    const languages = {
        "English": "en-US",
        "French": "fr-FR",
        "Spanish": "es-ES",
        "German": "de-DE",
        "Telugu": "te-IN",
        "Hindi": "hi-IN",
        "Japanese": "ja-JP",
        "Korean": "ko-KR",
        "Russian": "ru-RU",
        "Chinese": "zh-CN",
        "Vietnamese": "vi-VN",
        "Thai": "th-TH",
        "Urdu": "ur-PK",
        "Indonesian": "id-ID",
        "Bengali": "bn-BD",
        "Punjabi": "pa-IN"
    };
    return languages[language] || "en-US";
}
