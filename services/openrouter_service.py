import httpx
from typing import Dict, Any
import asyncio
import logging

logger = logging.getLogger(__name__)

class OpenRouterService:
    def __init__(self, api_key: str):
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://t.me/al3raf_bot"
        }
        self._client = httpx.AsyncClient(timeout=30.0)
        self._cache = {}

    async def analyze(self, message: str, type: str = 'عام') -> str:
        cache_key = f"{type}:{message}"
        if cache_key in self._cache:
            return self._cache[cache_key]

        try:
            response = await self._client.post(
                'https://openrouter.ai/api/v1/chat/completions',
                headers=self.headers,
                json=self._build_payload(message, type)
            )
            
            response.raise_for_status()
            result = response.json()
            content = result['choices'][0]['message']['content']
            
            # Cache for 5 minutes
            self._cache[cache_key] = content
            return content
            
        except Exception as e:
            logger.error(f"OpenRouter Error: {str(e)}")
            raise Exception("عذراً، حدث خطأ في التحليل. حاول مرة أخرى")

    def _build_payload(self, message: str, type: str) -> Dict[str, Any]:
        model = self._get_model_for_type(type)
        return {
            "model": model,
            "messages": [
                {
                    "role": "system",
                    "content": self._get_prompt_for_type(type)
                },
                {
                    "role": "user",
                    "content": message
                }
            ],
            "temperature": 0.7,
            "max_tokens": 1000
        }

    def _get_model_for_type(self, type: str) -> str:
        models = {
            'تنجيم': 'nvidia/llama-3.1-nemotron-70b-instruct:free',
            'شخصي': 'microsoft/phi-3-medium-128k-instruct:free',
            'عالمي': 'google/learnlm-1.5-pro-experimental:free',
            'روحاني': 'cognitivecomputations/dolphin3.0-r1-mistral-24b:free'
        }
        return models.get(type, models['تنجيم'])

    def _get_prompt_for_type(self, type: str) -> str:
        prompts = {
            'تنجيم': 'أنت عراف متخصص في التحليل الفلكي والخرائط الفلكية',
            'شخصي': 'أنت محلل متخصص في تحليل الشخصية والأبراج',
            'عالمي': 'أنت عراف متخصص في تحليل الأحداث العالمية والتوقعات الكبرى',
            'روحاني': 'أنت عراف روحاني متخصص في تحليل الطاقات والتوقعات العاطفية'
        }
        return prompts.get(type, prompts['تنجيم'])

    async def close(self):
        await self._client.aclose()
