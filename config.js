require('dotenv').config();

const config = {
    BOT_TOKEN: process.env.TELEGRAM_TOKEN,
    openRouter: {
        baseURL: "https://openrouter.ai/api/v1",
        endpoints: {
            models: "/models",
            chat: "/chat/completions",
            auth: "/auth/key"
        },
        extraHeaders: {
            "HTTP-Referer": "https://67e82123c3c77d8aa9025154--clinquant-croissant-f1a712.netlify.app",
            "X-Title": "Al3raf Bot",
            "Content-Type": "application/json"
        }
    },
    db: {
        path: "users.db",
        encryptionKey: process.env.ENCRYPTION_KEY
    },
    server: {
        port: process.env.PORT || 8080,
        host: '0.0.0.0'
    },
    webhookConfig: {
        domain: "67e82123c3c77d8aa9025154--clinquant-croissant-f1a712.netlify.app",
        path: "/.netlify/functions/bot",
        port: 443,
        https: true
    },
    webhookUrl: "https://67e82123c3c77d8aa9025154--clinquant-croissant-f1a712.netlify.app/.netlify/functions/bot",
    webhookOptions: {
        host: "67e82123c3c77d8aa9025154--clinquant-croissant-f1a712.netlify.app",
        path: "/api/webhook"
    }
};

module.exports = config;
