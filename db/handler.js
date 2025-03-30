class DatabaseHandler {
    constructor() {
        this.users = new Map();
    }

    async getApiKey(userId) {
        const user = this.users.get(userId);
        return user?.apiKey;
    }

    async updateApiKey(userId, apiKey) {
        this.users.set(userId, { 
            ...this.users.get(userId),
            apiKey,
            updatedAt: new Date()
        });
        return true;
    }

    async updateUserModels(userId, models) {
        this.users.set(userId, {
            ...this.users.get(userId),
            models,
            updatedAt: new Date()
        });
        return true;
    }

    async getCurrentModel(userId) {
        const user = this.users.get(userId);
        return user?.currentModel;
    }

    async updateCurrentModel(userId, modelId) {
        this.users.set(userId, {
            ...this.users.get(userId),
            currentModel: modelId,
            updatedAt: new Date()
        });
        return true;
    }
}

module.exports = DatabaseHandler;
