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
            "HTTP-Referer": process.env.NETLIFY_DOMAIN || "https://your-domain.netlify.app",
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
        domain: process.env.NETLIFY_DOMAIN || "https://your-domain.netlify.app",
        path: "/.netlify/functions/bot",
        port: 443,
        https: true
    },
    webhookUrl: process.env.NETLIFY_DOMAIN ? 
        `https://${process.env.NETLIFY_DOMAIN}/.netlify/functions/bot` : 
        "https://your-domain.netlify.app/.netlify/functions/bot",
    webhookOptions: {
        host: process.env.NETLIFY_DOMAIN || "your-domain.netlify.app",
        path: "/api/webhook"
    }
};

module.exports = config;
