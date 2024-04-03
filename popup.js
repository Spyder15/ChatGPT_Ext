document.addEventListener('DOMContentLoaded', () => {
    const selectedTextElement = document.getElementById('selected-text');
    const chatGPTResponseElement = document.getElementById('chatgpt-response');
    const getChatGPTResponseButton = document.getElementById('get-chatgpt-response');

    console.log({ getChatGPTResponseButton, chatGPTResponseElement, selectedTextElement })
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript(
            {
                target: { tabId: tabs[0].id },
                function: getSelectedText,
            },
            (result) => {
                if (chrome.runtime.lastError) {
                    console.error(chrome.runtime.lastError);
                    return;
                }
                selectedTextElement.textContent = result[0].result.text;

                // Truncate selected text if it exceeds 400 characters
                truncateSelectedText();
            }
        );
    });

    getChatGPTResponseButton.addEventListener('click', async () => {
        const selectedText = selectedTextElement.textContent;
        try {
            const chatGPTResponse = await fetchChatGPTResponse(selectedText);
            chatGPTResponseElement.textContent = chatGPTResponse;
        } catch (error) {
            console.error('Error fetching ChatGPT response:', error);
        }
    });


    // Add click-to-copy functionality for the ChatGPT response
    const chatgptResponseElem = document.getElementById('chatgpt-response');
    chatgptResponseElem.addEventListener('click', () => {
        copyTextToClipboard(chatgptResponseElem.innerText);
    });

    const copyBtn = document.getElementById('copy-chatgpt-response');
    copyBtn.addEventListener('click', () => {
        copyTextToClipboard(chatgptResponseElem.innerText);
    });

});

async function getSelectedText() {
    const selectedText = window.getSelection().toString();
    return { text: selectedText };
}

async function fetchChatGPTResponse(prompt) {
    const apiKey = "" // Update API key;
    const url = 'https://api.openai.com/v1/engines/text-davinci-002/completions';

    try {
        const loader = document.getElementById('loader');
        loader.style.display = 'block';

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                prompt: prompt,
                max_tokens: 500,
                n: 1,
                stop: null,
                temperature: 0.5,
            }),
        });

        const data = await response.json();
        loader.style.display = 'none';
        return data.choices[0].text.trim();
    } catch (error) {
        console.error('Error in fetchChatGPTResponse:', error);
        loader.style.display = 'none';
        throw error;
    }
}

function truncateSelectedText() {
    const maxLength = 200;
    const selectedTextElem = document.getElementById('selected-text');
    let originalText = selectedTextElem.innerText;

    if (originalText.length > maxLength) {
        const truncatedText = originalText.substring(0, maxLength) + '...';
        selectedTextElem.innerText = truncatedText;
    }
}

function copyTextToClipboard(text) {
    const tempElem = document.createElement('textarea');
    tempElem.value = text;
    document.body.appendChild(tempElem);
    tempElem.select();
    document.execCommand('copy');
    document.body.removeChild(tempElem);
    alert('Text copied to clipboard');
}