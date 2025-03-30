require('dotenv').config();
const OpenRouterAPI = require('./services/openrouter');
const { SUPPORTED_MODELS } = require('./models');

async function main() {
    const modelName = process.argv[2] || 'llama';
    const message = process.argv[3] || 'اختبار الاتصال';

    try {
        console.log('🔄 جاري الاتصال...');
        const api = new OpenRouterAPI(process.env.OPENROUTER_API_KEY);
        
        // Validate API key first
        await api.validateApiKey();
        console.log('✅ تم التحقق من المفتاح');

        // Find model
        const model = Object.values(SUPPORTED_MODELS).find(m => 
            m.id.toLowerCase().includes(modelName.toLowerCase()));

        if (!model) {
            throw new Error(`النموذج ${modelName} غير موجود`);
        }

        console.log(`🤖 استخدام نموذج: ${model.name}`);
        const response = await api.sendMessage(message, model.id);
        console.log('\nالرد:', response);
    } catch (error) {
        console.error('❌ خطأ:', error.message);
        process.exit(1);
    }
}

main();
