const BG_API_URL = 'https://api.binarycoffee.dev/graphql';

chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create('checkNewPosts', { periodInMinutes: 15 });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === 'checkNewPosts') {
        await checkForNewPosts();
    }
});

async function checkForNewPosts() {
    try {
        const { notificationsEnabled, lastSeenPostDate } = await chrome.storage.local.get([
            'notificationsEnabled', 'lastSeenPostDate'
        ]);

        if (notificationsEnabled === false) {
            chrome.action.setBadgeText({ text: '' });
            return;
        }

        const res = await fetch(BG_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `query {
                    posts(pagination: { limit: 5 }, sort: ["publishedAt:desc"], filters: { enable: { eq: true } }) {
                        data { id, attributes { title, name, publishedAt } }
                    }
                }`
            })
        });

        if (!res.ok) return;
        const json = await res.json();
        if (json.errors) return;

        const posts = json.data.posts.data;
        if (!posts.length) return;

        const latestDate = posts[0].attributes.publishedAt;

        if (lastSeenPostDate) {
            const newPosts = posts.filter(p => p.attributes.publishedAt > lastSeenPostDate);
            const count = newPosts.length;

            if (count > 0) {
                chrome.action.setBadgeText({ text: String(count) });
                chrome.action.setBadgeBackgroundColor({ color: '#2a9d6f' });

                chrome.notifications.create('newPost', {
                    type: 'basic',
                    iconUrl: 'icons/icon128.png',
                    title: 'Binary Coffee',
                    message: count === 1
                        ? `Nuevo articulo: ${newPosts[0].attributes.title}`
                        : `${count} nuevos articulos publicados`
                });
            }
        } else {
            await chrome.storage.local.set({ lastSeenPostDate: latestDate });
        }
    } catch (e) {
        // Silent fail for background checks
    }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'clearBadge') {
        chrome.action.setBadgeText({ text: '' });
    }
    if (msg.type === 'extractToken') {
        extractTokenFromSite().then(sendResponse);
        return true;
    }
});

async function extractTokenFromSite() {
    try {
        const tabs = await chrome.tabs.query({ url: 'https://binarycoffee.dev/*' });
        if (!tabs.length) return null;

        const results = await chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            func: () => {
                for (const key of ['jwt', 'token', 'access_token', 'jwtToken']) {
                    const val = localStorage.getItem(key);
                    if (val) return val;
                }
                return null;
            }
        });
        return results[0]?.result || null;
    } catch {
        return null;
    }
}
