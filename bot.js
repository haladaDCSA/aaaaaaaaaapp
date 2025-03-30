require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios').default;
const config = require('./config');
const { SUPPORTED_MODELS } = require('./models');
const OpenRouterAPI = require('./services/openrouter');

class OpenRouterBot {
    constructor(bot) {
        if (OpenRouterBot.instance) {
            return OpenRouterBot.instance;
        }
        OpenRouterBot.instance = this;

        this.bot = bot;
        this.userStates = new Map();
        this.setupHandlers();
    }

    setupHandlers() {
        // Welcome message
        this.bot.command(['start', 'help'], (ctx) => {
            ctx.reply(
                '🔮 مرحباً بك في بوت العراف للتنجيم والتحليل الفلكي والروحاني\n\n' +
                '📋 الأوامر المتاحة:\n\n' +
                '🎯 الأوامر الأساسية:\n' +
                '/models - عرض قائمة النماذج المتاحة\n' +
                '/key - تعيين أو تغيير مفتاح API\n' +
                '/switch - تغيير النموذج الحالي\n\n' +
                '🔮 خدمات التحليل:\n' +
                '• العراف: تحليل فلكي وتنجيم\n' +
                '• الحكيم: نصائح روحانية وفلسفية\n' +
                '• القيصر: تحليل استراتيجي عميق\n' +
                '• الكاهن: تفسير الرموز والأحلام\n\n' +
                '💡 للاستخدام:\n' +
                '1. اختر نموذجاً باستخدام /models\n' +
                '2. أدخل مفتاح API باستخدام /key\n' +
                '3. ابدأ بإرسال أسئلتك مباشرة\n\n' +
                '📚 للمزيد من المعلومات والمساعدة:\n' +
                '/help - عرض هذه القائمة\n' +
                '/about - معلومات عن البوت'
            );
        });

        // About command
        this.bot.command('about', (ctx) => {
            ctx.reply(
                '🔮 بوت العراف\n\n' +
                'بوت متخصص في التحليل الفلكي والروحاني باستخدام تقنيات الذكاء الاصطناعي المتقدمة.\n\n' +
                '🌟 المميزات:\n' +
                '• تحليل فلكي وتنجيم\n' +
                '• تفسير الأحلام والرموز\n' +
                '• تحليل الأسماء والطاقة\n' +
                '• نصائح روحانية وفلسفية\n\n' +
                '🔒 خصوصية وأمان:\n' +
                'جميع البيانات والمحادثات مشفرة وآمنة\n\n' +
                '📱 للتواصل والدعم:\n' +
                '@your_support_username'
            );
        });

        // Models command - تحديث عرض النماذج
        this.bot.command('models', async (ctx) => {
            try {
                const models = Object.values(SUPPORTED_MODELS);
                const buttons = models.map(model => [
                    Markup.button.callback(
                        `${model.name} - ${model.type}`,
                        `select:${model.id}`
                    )
                ]);
                
                const message = '🔮 النماذج المتاحة:\n\n' + 
                    models.map(m => 
                        `• *${m.name}*\n` +
                        `└ ${m.description}\n` +
                        `└ النوع: ${m.type}`
                    ).join('\n\n');
                
                await ctx.reply(message, {
                    parse_mode: 'Markdown',
                    reply_markup: Markup.inlineKeyboard(buttons)
                });
            } catch (error) {
                console.error('Error displaying models:', error);
                ctx.reply('❌ حدث خطأ في عرض النماذج. حاول مرة أخرى.');
            }
        });

        // Model selection
        this.bot.action(/select:(.+)/, async (ctx) => {
            const modelId = ctx.match[1];
            const userId = ctx.from.id;
            const model = Object.values(SUPPORTED_MODELS).find(m => m.id === modelId);

            if (!model) {
                return ctx.reply('❌ عذراً، النموذج غير متوفر');
            }

            await this.updateUserModel(userId, model);
            await ctx.reply(`✅ تم اختيار: ${model.name}\n📝 ${model.description}\n\nيرجى إدخال المفتاح باستخدام /key`);
        });

        // Add model switching command
        this.bot.command('switch', async (ctx) => {
            const modelName = ctx.message.text.split(' ')[1];
            if (!modelName) {
                return ctx.reply('يرجى تحديد اسم النموذج. مثال: /switch llama');
            }

            const model = Object.values(SUPPORTED_MODELS).find(m => 
                m.id.toLowerCase().includes(modelName.toLowerCase()));

            if (!model) {
                return ctx.reply('النموذج غير موجود. استخدم /models لعرض النماذج المتاحة');
            }

            const userId = ctx.from.id;
            await this.updateUserModel(userId, model);
            ctx.reply(`✅ تم التغيير إلى نموذج: ${model.name}`);
        });

        // Message handling
        this.bot.on('text', async (ctx) => {
            const userId = ctx.from.id;
            const userState = this.userStates.get(userId) || {};

            if (userState.waitingForKey) {
                return this.handleApiKey(ctx);
            }

            if (!userState.model || !userState.apiKey) {
                return ctx.reply('⚠️ يرجى اختيار نموذج واضافة مفتاح API أولاً');
            }

            await this.handleMessage(ctx, userState);
        });
    }

    async handleApiKey(ctx) {
        try {
            const apiKey = ctx.message.text.trim();
            
            if (!apiKey || apiKey.length < 32) {
                throw new Error('صيغة المفتاح غير صحيحة');
            }

            const loadingMsg = await ctx.reply('⏳ جاري التحقق من المفتاح...');
            const api = new OpenRouterAPI(apiKey);
            
            const isValid = await api.validateApiKey();
            await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);

            if (!isValid) {
                throw new Error('المفتاح غير صالح');
            }

            // تخزين المفتاح
            this.userStates.set(ctx.from.id, {
                ...this.userStates.get(ctx.from.id),
                apiKey: apiKey,
                waitingForKey: false,
                lastVerified: new Date()
            });

            // حفظ المفتاح في .env
            await this.saveApiKey(apiKey);

            await ctx.reply('✅ تم حفظ المفتاح وتفعيله!\n\nيمكنك الآن استخدام البوت.');

        } catch (error) {
            console.error('API Key Error:', error);
            await ctx.reply(error.message);
        }
    }

    async saveApiKey(apiKey) {
        try {
            const fs = require('fs').promises;
            const envPath = '.env';
            const envContent = await fs.readFile(envPath, 'utf8');
            
            // تحديث المفتاح في ملف .env
            const updatedContent = envContent.replace(
                /OPENROUTER_API_KEY=.*/,
                `OPENROUTER_API_KEY=${apiKey}`
            );
            
            await fs.writeFile(envPath, updatedContent);
            
            // تحديث المتغير البيئي مباشرة
            process.env.OPENROUTER_API_KEY = apiKey;
            
            console.log('✅ تم حفظ المفتاح في .env');
        } catch (error) {
            console.error('Error saving API key:', error);
            throw new Error('فشل حفظ المفتاح');
        }
    }

    async handleMessage(ctx, userState) {
        try {
            const loadingMsg = await ctx.reply(
                userState.model.id.includes('llama-3.3') 
                    ? '🔮 جاري التحليل الفلكي المفصل...'
                    : '🎯 جاري التحليل السريع...'
            );
            
            const api = new OpenRouterAPI(userState.apiKey);
            const response = await api.sendMessage(ctx.message.text, userState.model.id);
            
            await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id);
            await ctx.reply(response);
        } catch (error) {
            console.error('Message Error:', error);
            ctx.reply('❌ ' + error.message);
        }
    }

    async updateUserModel(userId, model) {
        this.userStates.set(userId, {
            ...this.userStates.get(userId),
            model: model,
            waitingForKey: true
        });
    }

    async run() {
        try {
            console.log('🔮 تشغيل بوت العراف...');
            
            // اختبار الاتصال
            const me = await this.bot.telegram.getMe();
            console.log('✅ تم الاتصال بالبوت:', me.username);

            // تشغيل البوت
            await this.bot.launch({
                dropPendingUpdates: true,
                allowedUpdates: ['message', 'callback_query']
            });

            console.log('✅ البوت جاهز للاستخدام');
            return true;
        } catch (error) {
            console.error('❌ خطأ في تشغيل البوت:', error.message);
            throw error;
        }
    }
}

module.exports = OpenRouterBot;