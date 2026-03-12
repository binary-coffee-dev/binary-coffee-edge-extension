const Storage = {
    async get(key, fallback = null) {
        const result = await chrome.storage.local.get(key);
        return result[key] ?? fallback;
    },

    async set(key, value) {
        await chrome.storage.local.set({ [key]: value });
    },

    async remove(key) {
        await chrome.storage.local.remove(key);
    },

    async getToken() {
        return this.get('jwt', null);
    },

    async setToken(jwt) {
        await this.set('jwt', jwt);
    },

    async clearToken() {
        await this.remove('jwt');
        await this.remove('user');
    },

    async getUser() {
        return this.get('user', null);
    },

    async setUser(user) {
        await this.set('user', user);
    },

    async getCached(key, ttlMs = 5 * 60 * 1000) {
        const entry = await this.get(`cache_${key}`);
        if (!entry) return null;
        if (Date.now() - entry.ts > ttlMs) {
            await this.remove(`cache_${key}`);
            return null;
        }
        return entry.data;
    },

    async setCache(key, data) {
        await this.set(`cache_${key}`, { data, ts: Date.now() });
    },

    async getDarkMode() {
        return this.get('darkMode', false);
    },

    async setDarkMode(enabled) {
        await this.set('darkMode', enabled);
    },

    async getNotificationsEnabled() {
        return this.get('notificationsEnabled', true);
    },

    async setNotificationsEnabled(enabled) {
        await this.set('notificationsEnabled', enabled);
    },

    async getLastSeenPostDate() {
        return this.get('lastSeenPostDate', null);
    },

    async setLastSeenPostDate(date) {
        await this.set('lastSeenPostDate', date);
    }
};
