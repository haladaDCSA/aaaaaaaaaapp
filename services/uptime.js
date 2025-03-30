const axios = require('axios');

class UptimeService {
    constructor(url) {
        this.url = url;
        this.interval = null;
    }

    start() {
        // إرسال طلب كل 5 دقائق
        this.interval = setInterval(async () => {
            try {
                const response = await axios.get(this.url + '/health');
                console.log('✅ تم تحديث الحالة:', response.data.status);
            } catch (error) {
                console.error('❌ خطأ في تحديث الحالة:', error.message);
            }
        }, 5 * 60 * 1000);
    }

    stop() {
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}

module.exports = UptimeService;
