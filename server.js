require('dotenv').config();
const express = require('express');
const { Telegraf, Markup } = require('telegraf');
const { SUPPORTED_MODELS, modelsKeyboard, getModelInfo } = require('./models');
const OpenRouterAPI = require('./services/openrouter');

// التحقق من المتغيرات البيئية
if (!process.env.TELEGRAM_TOKEN) {
    console.error('❌ Error: TELEGRAM_TOKEN is not set');
    process.exit(1);
}

// اختبار مفتاح OpenRouter
const testApiKey = async (apiKey) => {
    try {
        const api = new OpenRouterAPI(apiKey);
        const isValid = await api.validateKey();
        
        if (!isValid) {
            console.error('❌ Invalid OpenRouter API key. Testing default models...');
            
            // جرب النماذج المحددة لكل قسم
            const testModels = {
                'الخرائط الفلكية العراف': 'nvidia/llama-3.1-nemotron-70b-instruct:free',
                'التاروت وتفسير الأحلام جولنار': 'google/gemini-2.0-pro-exp-02-05:free',
                'الطاقة والأحجار الكريمة برليدس': 'qwen/qwen2.5-vl-72b-instruct:free',
                'الروحانية ريجمش': 'cognitivecomputations/dolphin3.0-r1-mistral-24b:free'
            };
            
            for (const [category, model] of Object.entries(testModels)) {
                try {
                    const response = await api.generateResponse(model, 'Test');
                    if (response) {
                        console.log(`✅ Found working model for ${category}: ${model}`);
                        return true;
                    }
                } catch (error) {
                    console.error(`❌ Model ${model} failed for ${category}:`, error);
                }
            }
            
            console.error('❌ No working models found');
            return false;
        }
        
        console.log('✅ OpenRouter API key is valid');
        return true;
    } catch (error) {
        console.error('❌ Error testing API key:', error);
        return false;
    }
};

const updateApiKey = async (ctx, newApiKey) => {
    try {
        const isValid = await testApiKey(newApiKey);
        
        if (isValid) {
            process.env.OPENROUTER_API_KEY = newApiKey;
            ctx.reply('✅ تم تحديث مفتاح OpenRouter بنجاح');
            return true;
        } else {
            ctx.reply('❌ المفتاح غير صالح. يرجى إدخال مفتاح صحيح');
            return false;
        }
    } catch (error) {
        console.error('❌ Error updating API key:', error);
        ctx.reply('❌ حدث خطأ أثناء تحديث المفتاح');
        return false;
    }
};

const startBot = async () => {
    const app = express();
    const bot = new Telegraf(process.env.TELEGRAM_TOKEN);
    const userStates = new Map();
    const port = process.env.PORT || 3000;

    // Command handlers
    bot.command('start', (ctx) => {
        ctx.reply('مرحباً! أنا بوت Al3raf. يمكنك اختيار النموذج المناسب من القائمة.', modelsKeyboard);
    });

    bot.command('help', (ctx) => {
        ctx.reply(
            'المساعدة:\n\n' +
            '1. اختر النموذج المناسب من القائمة\n' +
            '2. اكتب رسالتك\n' +
            '3. انتظر الرد\n\n' +
            'إذا واجهت أي مشاكل، استخدم:\n' +
            '/changekey - لتغيير مفتاح OpenRouter\n' +
            '/models - لعرض النماذج المتاحة\n'
        );
    });

    bot.command('changekey', (ctx) => {
        ctx.reply('أدخل مفتاح OpenRouter الجديد:');
        userStates.set(ctx.from.id, 'waiting_for_key');
    });

    bot.command('models', (ctx) => {
        const categories = Object.keys(SUPPORTED_MODELS);
        let message = 'النماذج المتاحة:\n\n';
        
        categories.forEach(category => {
            const modelInfo = getModelInfo(category);
            if (modelInfo) {
                message += `• ${category}\n`;
                message += `  - ${modelInfo.description}\n`;
                message += `  - نموذج: ${modelInfo.model}\n`;
                message += '\n';
            }
        });
        
        ctx.reply(message);
    });

    // Message handlers
    bot.on('text', async (ctx) => {
        const userId = ctx.from.id;
        const state = userStates.get(userId);

        if (state === 'waiting_for_key') {
            const success = await updateApiKey(ctx, ctx.message.text);
            if (success) {
                userStates.delete(userId);
            }
            return;
        }

        // Process category selection
        const category = ctx.message.text;
        const modelInfo = getModelInfo(category);

        // Check if the message is a command
        if (category.startsWith('/')) {
            return;
        }

        // Check if the category exists
        if (modelInfo) {
            ctx.reply('أدخل رسالتك:');
            userStates.set(userId, { category, model: modelInfo.model, prompt: modelInfo.prompt });
        } else {
            // Check if this is a user message after selecting a category
            if (state && typeof state === 'object' && state.model) {
                const api = new OpenRouterAPI(process.env.OPENROUTER_API_KEY);
                
                try {
                    const response = await api.generateResponse(state.model, 
                        `${state.prompt}\n\n${ctx.message.text}`
                    );
                    
                    ctx.reply(response);
                    userStates.delete(userId);
                } catch (error) {
                    console.error('Error generating response:', error);
                    
                    if (error.response?.status === 401) {
                        ctx.reply('❌ مفتاح OpenRouter غير صالح. يرجى تحديثه باستخدام /changekey');
                    } else {
                        ctx.reply('❌ حدث خطأ. يرجى تجربة قسم آخر أو تحديث المفتاح');
                    }
                    
                    userStates.delete(userId);
                }
            } else {
                // Show available categories if the category doesn't exist
                ctx.reply('الاقسام المتاحة:\n\n' + 
                    Object.keys(SUPPORTED_MODELS).map(cat => `• ${cat}`).join('\n') + 
                    '\n\nاختر القسم المطلوب من القائمة:', modelsKeyboard);
            }
        }
    });

    // Start the bot
    await bot.launch();
    console.log('✅ Bot started successfully');
};

startBot().catch(console.error);

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
