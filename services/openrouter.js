const axios = require('axios');
const { SUPPORTED_MODELS } = require('../models');

let currentApiKey = process.env.OPENROUTER_API_KEY;
let lastErrorTime = 0;
const ERROR_THRESHOLD = 60000; // 60 seconds

const DEFAULT_MODELS = {
    'nvidia/llama-3.1-nemotron-70b-instruct:free': 'الخرائط الفلكية العراف',
    'google/gemini-2.0-pro-exp-02-05:free': 'التاروت وتفسير الأحلام جولنار',
    'qwen/qwen2.5-vl-72b-instruct:free': 'الطاقة والأحجار الكريمة برليدس',
    'cognitivecomputations/dolphin3.0-r1-mistral-24b:free': 'الروحانية ريجمش'
};

class OpenRouterAPI {
    constructor(apiKey) {
        this.apiKey = apiKey || process.env.OPENROUTER_API_KEY;
        this.headers = {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://al3raf-bot.com',
            'X-Title': 'Al3raf Bot'
        };
    }

    async validateKey() {
        try {
            const testMessage = {
                model: 'nvidia/llama-3.1-nemotron-70b-instruct:free',
                messages: [{ role: 'user', content: 'Test' }],
                temperature: 0,
                max_tokens: 1
            };

            const response = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                testMessage,
                { headers: this.headers, timeout: 10000 }
            );

            if (response.status === 200) {
                return true;
            }
            return false;
        } catch (error) {
            console.error('Key validation error:', error);
            return false;
        }
    }

    async generateResponse(model, prompt) {
        try {
            // تحقق من صلاحية المفتاح قبل الاستخدام
            if (Date.now() - lastErrorTime > ERROR_THRESHOLD) {
                const isValid = await this.validateKey();
                if (!isValid) {
                    throw new Error('الرجاء تحديث مفتاح OpenRouter باستخدام /changekey');
                }
            }

            const response = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    model: model,
                    messages: [
                        {
                            role: 'system',
                            content: this._get_prompt_for_type(model)
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    top_p: 0.9,
                    presence_penalty: 0.6,
                    frequency_penalty: 0.5,
                    max_tokens: 2000
                },
                { headers: this.headers }
            );

            if (response.data && response.data.choices && response.data.choices.length > 0) {
                const message = response.data.choices[0].message;
                if (message && message.content) {
                    return message.content;
                }
            }

            console.error('Invalid response format:', response.data);
            throw new Error('Invalid response format from OpenRouter');

        } catch (error) {
            console.error('Error in generateResponse:', error);
            lastErrorTime = Date.now();
            throw error;
        }
    }

    async setApiKey(newApiKey) {
        try {
            const api = new OpenRouterAPI(newApiKey);
            const isValid = await api.validateKey();
            
            if (isValid) {
                this.apiKey = newApiKey;
                this.headers.Authorization = `Bearer ${newApiKey}`;
                currentApiKey = newApiKey;
                return { success: true, message: 'تم تغيير المفتاح بنجاح' };
            }
            return { success: false, message: 'المفتاح غير صالح' };
        } catch (error) {
            return { success: false, message: 'فشل في تغيير المفتاح: ' + error.message };
        }
    }

    _get_prompt_for_type(model) {
        const prompts = {
            'nvidia/llama-3.1-nemotron-70b-instruct:free': 'أنت عراف متخصص في التحليل الفلكي والتنجيم',
            'google/gemini-2.0-pro-exp-02-05:free': 'أنت مفسر أحلام متخصص في التاروت والبطاقات',
            'qwen/qwen2.5-vl-72b-instruct:free': 'أنت خبير في علوم الطاقة والأحجار الكريمة',
            'cognitivecomputations/dolphin3.0-r1-mistral-24b:free': 'أنت عراف حكيم متخصص في الروحانيات والتأمل'
        };

        return prompts[model] || 'أنت خبير في التحليل والتنجيم';
    }

    async getCompletion(model, messages) {
        try {
            const response = await axios.post(
                'https://openrouter.ai/api/v1/chat/completions',
                {
                    model: model,
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 2000
                },
                { headers: this.headers }
            );

            if (response.data && response.data.choices && response.data.choices.length > 0) {
                return response.data.choices[0].message.content;
            }
            throw new Error('Failed to get completion');
        } catch (error) {
            console.error('Error in getCompletion:', error);
            throw error;
        }
    }
}

module.exports = OpenRouterAPI;
