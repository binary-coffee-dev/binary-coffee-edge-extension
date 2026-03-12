const API_URL = 'https://api.binarycoffee.dev/graphql';
const SITE_URL = 'https://binarycoffee.dev';

const Api = {
    async graphql(query, variables = {}, auth = false) {
        const headers = { 'Content-Type': 'application/json' };
        if (auth) {
            const token = await Storage.getToken();
            if (token) headers['Authorization'] = `Bearer ${token}`;
        }
        const res = await fetch(API_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify({ query, variables })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.errors) throw new Error(json.errors[0].message);
        return json.data;
    },

    // === POSTS ===

    async getPosts({ limit = 25, start = 0, sort = 'publishedAt:desc', search = '', tag = '', authorId = '' } = {}) {
        const filters = { enable: { eq: true } };
        if (search) filters.title = { containsi: search };
        if (tag) filters.tags = { name: { eq: tag } };
        if (authorId) filters.author = { id: { eq: authorId } };

        const data = await this.graphql(`
            query($limit: Int, $start: Int, $sort: [String], $filters: PostFiltersInput) {
                posts(pagination: { limit: $limit, start: $start }, sort: $sort, filters: $filters) {
                    data {
                        id
                        attributes {
                            title
                            name
                            body
                            views
                            likes
                            comments
                            createdAt
                            publishedAt
                            banner { data { attributes { url, formats } } }
                            author { data { id, attributes { username, avatar { data { attributes { url, formats } } } } } }
                            tags { data { id, attributes { name } } }
                        }
                    }
                }
            }
        `, { limit, start, sort: [sort], filters });
        return data.posts.data;
    },

    async getPostByName(name) {
        const data = await this.graphql(`
            query($name: String!) {
                posts(filters: { name: { eq: $name } }) {
                    data {
                        id
                        attributes {
                            title, name, body, views, likes, comments, readingTime, createdAt, publishedAt
                            banner { data { attributes { url, formats } } }
                            author { data { id, attributes { username, avatar { data { attributes { url, formats } } } } } }
                            tags { data { id, attributes { name } } }
                            commentsList { data { id, attributes {
                                body, createdAt
                                author { data { attributes { username, avatar { data { attributes { url } } } } } }
                            } } }
                        }
                    }
                }
            }
        `, { name });
        return data.posts.data[0] || null;
    },

    async getSimilarPosts(postId, limit = 3) {
        const data = await this.graphql(`
            query($id: ID!, $limit: Int) {
                postsSimilar(id: $id, limit: $limit) {
                    data { id, attributes { title, name, likes, views } }
                }
            }
        `, { id: postId, limit });
        return data.postsSimilar?.data || [];
    },

    async createPost(title, body, tags = []) {
        const data = await this.graphql(`
            mutation($data: PostInput!) {
                createPost(data: $data) {
                    data { id, attributes { title, name } }
                }
            }
        `, { data: { title, body, name: this.slugify(title), tags, enable: false } }, true);
        return data.createPost.data;
    },

    // === LIKES ===

    async likePost(postId) {
        return this.graphql(`
            mutation($post: ID!) { createLikePost(post: $post) { data { id } } }
        `, { post: postId }, true);
    },

    async unlikePost(postId) {
        return this.graphql(`
            mutation($post: ID!) { removeLikePost(post: $post) { data { id } } }
        `, { post: postId }, true);
    },

    // === COMMENTS ===

    async createComment(postId, body) {
        return this.graphql(`
            mutation($data: CommentInput!) {
                createComment(data: $data) { data { id } }
            }
        `, { data: { body, post: postId } }, true);
    },

    // === TAGS ===

    async getTags() {
        const cached = await Storage.getCached('tags', 30 * 60 * 1000);
        if (cached) return cached;
        const data = await this.graphql(`
            query { tags(pagination: { limit: 100 }) { data { id, attributes { name } } } }
        `);
        const tags = data.tags.data;
        await Storage.setCache('tags', tags);
        return tags;
    },

    // === AUTH ===

    async getMe() {
        const data = await this.graphql(`query { me { id, username, email, avatar { url } } }`, {}, true);
        return data.me;
    },

    async loginWithProvider(provider, code) {
        const data = await this.graphql(`
            mutation($provider: String!, $code: String!) {
                loginWithProvider(provider: $provider, code: $code)
            }
        `, { provider, code });
        return data.loginWithProvider;
    },

    // === SUBSCRIPTION ===

    async subscribe(email) {
        return this.graphql(`mutation($email: String!) { subscribe(email: $email) }`, { email }, true);
    },

    async unsubscribe(email) {
        return this.graphql(`mutation($email: String!) { unsubscribe(email: $email) }`, { email }, true);
    },

    // === HELPERS ===

    slugify(text) {
        return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    },

    postUrl(name) {
        return `${SITE_URL}/post/${name}`;
    },

    avatarUrl(author) {
        if (author?.avatar?.data?.attributes) {
            const attrs = author.avatar.data.attributes;
            const url = attrs.formats?.thumbnail?.url || attrs.url;
            if (url) return url.startsWith('http') ? url : `https://api.binarycoffee.dev${url}`;
        }
        if (author?.username) return `https://github.com/${author.username}.png?size=28`;
        return null;
    },

    bannerUrl(banner) {
        if (!banner?.data?.attributes) return null;
        const attrs = banner.data.attributes;
        const url = attrs.formats?.small?.url || attrs.formats?.thumbnail?.url || attrs.url;
        if (!url) return null;
        return url.startsWith('http') ? url : `https://api.binarycoffee.dev${url}`;
    }
};
