const knowledgeBase = {
    astrology: {
        zodiacSigns: {
            'الحمل': { dates: '21/3 - 19/4', element: 'نار', qualities: ['شجاع', 'متحمس', 'قيادي'] },
            'الثور': { dates: '20/4 - 20/5', element: 'تراب', qualities: ['صبور', 'عملي', 'موثوق'] },
            // ...existing zodiac signs...
        },
        planets: {
            'الشمس': { influence: 'الشخصية والإرادة', rulesSign: 'الأسد' },
            'القمر': { influence: 'العواطف والمشاعر', rulesSign: 'السرطان' },
            // ...existing planets...
        },
        aspects: {
            'التربيع': { angle: 90, influence: 'تحدي وتوتر' },
            'المثلث': { angle: 120, influence: 'توافق وانسجام' },
            // ...existing aspects...
        }
    },
    spirituality: {
        crystals: {
            'العقيق': { properties: ['الحماية', 'القوة', 'الثقة'], chakra: 'الجذر' },
            'الكوارتز': { properties: ['الشفاء', 'التوازن', 'الطاقة'], chakra: 'التاج' },
            // ...existing crystals...
        },
        chakras: {
            'الجذر': { location: 'قاعدة العمود الفقري', element: 'الأرض', color: 'أحمر' },
            'التاج': { location: 'قمة الرأس', element: 'الوعي الكوني', color: 'بنفسجي' },
            // ...existing chakras...
        }
    },
    dreamSymbols: {
        elements: {
            'ماء': ['التطهير', 'العواطف', 'اللاوعي'],
            'نار': ['التحول', 'الطاقة', 'الإرادة'],
            // ...existing elements...
        },
        animals: {
            'أسد': ['القوة', 'السلطة', 'الشجاعة'],
            'عصفور': ['الحرية', 'الروح', 'الرسائل'],
            // ...existing animals...
        }
    }
};

module.exports = knowledgeBase;
