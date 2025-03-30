const { Markup } = require('telegraf');

const SUPPORTED_MODELS = {
    'الخرائط الفلكية العراف': {
        model: 'nvidia/llama-3.1-nemotron-70b-instruct:free',
        description: 'التنجيم والخرائط الفلكية',
        prompt: 'أنت عراف متخصص في التحليل الفلكي والتنجيم'
    },
    'التاروت وتفسير الأحلام جولنار': {
        model: 'google/gemini-2.0-pro-exp-02-05:free',
        description: 'تفسير الأحلام والتاروت',
        prompt: 'أنت مفسر أحلام متخصص في التاروت والبطاقات'
    },
    'الطاقة والأحجار الكريمة برليدس': {
        model: 'qwen/qwen2.5-vl-72b-instruct:free',
        description: 'الطاقة والتأثيرات',
        prompt: 'أنت خبير في علوم الطاقة والأحجار الكريمة'
    },
    'الروحانية ريجمش': {
        model: 'cognitivecomputations/dolphin3.0-r1-mistral-24b:free',
        description: 'الروحانية والتأمل',
        prompt: 'أنت عراف حكيم متخصص في الروحانيات والتأمل'
    }
};

const modelsKeyboard = Markup.keyboard([
    ['الخرائط الفلكية العراف'],
    ['التاروت وتفسير الأحلام جولنار'],
    ['الطاقة والأحجار الكريمة برليدس'],
    ['الروحانية ريجمش'],
    ['تغيير مفتاح OpenRouter'],
    ['المساعدة']
]).resize();

const getModelInfo = (category) => {
    return SUPPORTED_MODELS[category] || null;
};

module.exports = { SUPPORTED_MODELS, modelsKeyboard, getModelInfo };
