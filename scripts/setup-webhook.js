require('dotenv').config();
const axios = require('axios');
const { HttpsProxyAgent } = require('https-proxy-agent');

async function setupWebhook() {
    const token = process.env.TELEGRAM_TOKEN;
    const webhookUrl = "https://67e82123c3c77d8aa9025154--clinquant-croissant-f1a712.netlify.app/.netlify/functions/bot";
    
    // إعدادات الاتصال
    const config = {
        timeout: 15000,
        headers: { 'Content-Type': 'application/json' }
    };

    // إضافة دعم البروكسي إذا كان متوفراً
    if (process.env.HTTPS_PROXY) {
        config.httpsAgent = new HttpsProxyAgent(process.env.HTTPS_PROXY);
        console.log('🔄 استخدام البروكسي:', process.env.HTTPS_PROXY);
    }

    try {
        console.log('🔄 جاري التحقق من حالة Bot...');
        
        // التحقق من حالة البوت
        const getMe = await axios.get(
            `https://api.telegram.org/bot${token}/getMe`,
            config
        );

        if (!getMe.data.ok) {
            throw new Error('فشل الاتصال بالبوت. تأكد من صحة التوكن');
        }

        console.log(`✅ تم الاتصال بالبوت: @${getMe.data.result.username}`);

        // تعيين Webhook
        console.log('🔄 جاري إعداد Webhook...');
        const setWebhook = await axios.post(
            `https://api.telegram.org/bot${token}/setWebhook`,
            { 
                url: webhookUrl,
                drop_pending_updates: true
            },
            config
        );

        if (setWebhook.data.ok) {
            console.log('✅ تم تعيين Webhook بنجاح');
            console.log('📡 عنوان Webhook:', webhookUrl);
            
            // التحقق من حالة Webhook
            const webhookInfo = await axios.get(
                `https://api.telegram.org/bot${token}/getWebhookInfo`,
                config
            );
            
            if (webhookInfo.data.ok) {
                console.log('\n📊 معلومات Webhook:');
                console.log(JSON.stringify(webhookInfo.data.result, null, 2));
            }
        } else {
            throw new Error(setWebhook.data.description);
        }
    } catch (error) {
        console.error('\n❌ خطأ:', error.message);
        console.log('\n🔍 للمساعدة:');
        console.log('1. تأكد من اتصال الإنترنت');
        console.log('2. جرب استخدام VPN عبر تعيين HTTPS_PROXY في ملف .env');
        console.log('3. تأكد من صحة التوكن:', token);
        process.exit(1);
    }
}

setupWebhook();
