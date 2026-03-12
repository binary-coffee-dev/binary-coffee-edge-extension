// SVG Icons (Feather-style, 14x14)
const Icons = {
    heart: (filled) => `<svg width="12" height="12" viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    comment: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    eye: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    moon: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
    sun: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
    user: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    bellOn: `<svg class="menu-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>`,
    bellOff: `<svg class="menu-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M18.63 13A17.89 17.89 0 0 1 18 8"/><path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/><path d="M18 8a6 6 0 0 0-9.33-5"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`,
    externalLink: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
    close: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
};

const App = {
    state: {
        currentView: 'feed',
        posts: [],
        start: 0,
        limit: 15,
        search: '',
        tagFilter: '',
        loading: false,
        user: null,
        selectedPost: null
    },

    // === INIT ===

    async init() {
        chrome.runtime.sendMessage({ type: 'clearBadge' });

        const [darkMode, user] = await Promise.all([
            Storage.getDarkMode(),
            Storage.getUser()
        ]);

        if (darkMode) document.body.classList.add('dark');
        if (user) this.state.user = user;

        this.bindEvents();
        this.updateAuthUI();
        this.loadTags();
        this.loadPosts();
        this.updateLastSeen();
    },

    async updateLastSeen() {
        await Storage.setLastSeenPostDate(new Date().toISOString());
    },

    // === EVENTS ===

    bindEvents() {
        $('#btn-search').addEventListener('click', () => this.toggleSearch());
        $('#btn-dark-mode').addEventListener('click', () => this.toggleDarkMode());
        $('#btn-profile').addEventListener('click', () => this.showView('profile'));
        $('#search-input').addEventListener('input', debounce(e => this.onSearch(e.target.value), 400));
        $('#search-close').addEventListener('click', () => this.toggleSearch());
        $('#load-more').addEventListener('click', () => this.loadMore());
        $('#btn-login').addEventListener('click', () => this.login());
        $('#btn-login-site').addEventListener('click', () => this.loginViaSite());
        $('#btn-logout').addEventListener('click', () => this.logout());
        $('#btn-my-posts').addEventListener('click', () => this.showMyPosts());
        $('#btn-my-stats').addEventListener('click', () => this.showView('stats'));
        $('#btn-create-post').addEventListener('click', () => this.showView('create'));
        $('#btn-notifications').addEventListener('click', () => this.toggleNotifications());
        $('#btn-subscribe').addEventListener('click', () => this.toggleSubscription());
        $('#btn-back-feed').addEventListener('click', () => this.showView('feed'));
        $('#btn-back-feed2').addEventListener('click', () => this.showView('feed'));
        $('#btn-back-feed3').addEventListener('click', () => this.showView('feed'));
        $('#btn-back-profile').addEventListener('click', () => this.showView('profile'));
        $('#btn-back-profile2').addEventListener('click', () => this.showView('profile'));
        $('#form-create').addEventListener('submit', e => this.submitPost(e));
        $('#form-comment').addEventListener('submit', e => this.submitComment(e));
    },

    // === VIEWS ===

    showView(name) {
        document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
        $(`#view-${name}`).classList.remove('hidden');
        this.state.currentView = name;

        if (name === 'profile') this.renderProfile();
        if (name === 'stats') this.loadStats();
    },

    // === SEARCH & FILTER ===

    toggleSearch() {
        const bar = $('#search-bar');
        bar.classList.toggle('hidden');
        if (!bar.classList.contains('hidden')) {
            $('#search-input').focus();
        } else {
            $('#search-input').value = '';
            this.state.search = '';
            this.state.tagFilter = '';
            document.querySelectorAll('.tag-chip').forEach(c => c.classList.remove('active'));
            this.resetAndLoad();
        }
    },

    onSearch(value) {
        this.state.search = value;
        this.resetAndLoad();
    },

    onTagFilter(tag) {
        this.state.tagFilter = this.state.tagFilter === tag ? '' : tag;
        document.querySelectorAll('.tag-chip').forEach(c => {
            c.classList.toggle('active', c.dataset.tag === this.state.tagFilter);
        });
        this.resetAndLoad();
    },

    async loadTags() {
        try {
            const tags = await Api.getTags();
            const container = $('#tag-filters');
            container.innerHTML = '';
            tags.slice(0, 12).forEach(t => {
                const chip = document.createElement('button');
                chip.className = 'tag-chip';
                chip.textContent = t.attributes.name;
                chip.dataset.tag = t.attributes.name;
                chip.addEventListener('click', () => this.onTagFilter(t.attributes.name));
                container.appendChild(chip);
            });
        } catch { /* silent */ }
    },

    // === POSTS ===

    resetAndLoad() {
        this.state.start = 0;
        this.state.posts = [];
        $('#post-container').innerHTML = '';
        this.loadPosts();
    },

    async loadPosts() {
        if (this.state.loading) return;
        this.state.loading = true;
        const loader = $('#loading');
        const loadMore = $('#load-more');

        if (this.state.start === 0) loader.classList.remove('hidden');
        loadMore.classList.add('hidden');

        try {
            const posts = await Api.getPosts({
                limit: this.state.limit,
                start: this.state.start,
                search: this.state.search,
                tag: this.state.tagFilter
            });

            loader.classList.add('hidden');
            this.state.posts.push(...posts);
            this.renderPosts(posts, this.state.start);
            this.state.start += posts.length;

            if (posts.length >= this.state.limit) {
                loadMore.classList.remove('hidden');
            }
        } catch (err) {
            loader.classList.add('hidden');
            if (this.state.start === 0) {
                $('#post-container').innerHTML = `
                    <div class="error-message">
                        <p>Error al cargar: ${err.message}</p>
                        <button onclick="App.resetAndLoad()" class="btn-retry">Reintentar</button>
                    </div>`;
            }
        }
        this.state.loading = false;
    },

    loadMore() {
        this.loadPosts();
    },

    renderPosts(posts, startIndex) {
        const container = $('#post-container');
        posts.forEach((post, i) => {
            container.appendChild(this.createPostEl(post, startIndex + i));
        });
    },

    createPostEl(post, index) {
        const a = post.attributes;
        const author = a.author?.data?.attributes;
        const authorId = a.author?.data?.id;
        const isLoggedIn = !!this.state.user;

        const div = document.createElement('div');
        div.className = 'post';
        div.dataset.postId = post.id;

        const bannerUrl = Api.bannerUrl(a.banner);
        const bannerHtml = bannerUrl
            ? `<div class="post-banner"><img src="${bannerUrl}" alt="" loading="lazy"/></div>`
            : '';

        const avatarUrl = Api.avatarUrl(author);
        const avatarHtml = avatarUrl
            ? `<img class="post-avatar" src="${avatarUrl}" alt="${author?.username || ''}" loading="lazy"/>`
            : '';

        const tagsHtml = (a.tags?.data || []).slice(0, 3).map(t =>
            `<span class="tag" data-tag="${t.attributes.name}">${t.attributes.name}</span>`
        ).join('');

        const desc = truncateText(a.body, 80);

        div.innerHTML = `
            <div class="post-number">${index + 1}</div>
            <div class="post-content">
                ${bannerHtml}
                <a class="post-link" href="${Api.postUrl(a.name)}" target="_blank" rel="noopener noreferrer">
                    <h3 class="post-name">${escapeHtml(a.title)}</h3>
                </a>
                <div class="post-meta">
                    ${avatarHtml}
                    <span class="post-author" data-author-id="${authorId || ''}">${escapeHtml(author?.username || 'Anonimo')}</span>
                    <span class="post-date">${formatDate(a.publishedAt || a.createdAt)}</span>
                </div>
                <div class="post-stats">
                    <span>${Icons.eye} ${a.views || 0}</span>
                    <button class="btn-like ${isLoggedIn ? '' : 'disabled'}" data-post-id="${post.id}">
                        ${Icons.heart(false)} ${a.likes || 0}
                    </button>
                    <button class="btn-comment-toggle" data-post-name="${a.name}">
                        ${Icons.comment} ${a.comments || 0}
                    </button>
                </div>
                ${desc ? `<p class="post-data">${escapeHtml(desc)}</p>` : ''}
                ${tagsHtml ? `<div class="post-tags">${tagsHtml}</div>` : ''}
            </div>
        `;

        // Like button
        div.querySelector('.btn-like')?.addEventListener('click', e => {
            e.preventDefault();
            if (isLoggedIn) this.toggleLike(post.id, e.currentTarget);
        });

        // Comment button -> show detail
        div.querySelector('.btn-comment-toggle')?.addEventListener('click', e => {
            e.preventDefault();
            this.showPostDetail(a.name);
        });

        // Tag click -> filter
        div.querySelectorAll('.tag').forEach(tag => {
            tag.addEventListener('click', () => this.onTagFilter(tag.dataset.tag));
        });

        // Author click -> filter
        div.querySelector('.post-author')?.addEventListener('click', () => {
            if (authorId) {
                this.state.search = '';
                $('#search-input').value = '';
                this.state.tagFilter = '';
                this.showView('feed');
                this.filterByAuthor(authorId, author?.username);
            }
        });

        // Hover for similar posts
        let hoverTimer;
        div.addEventListener('mouseenter', () => {
            hoverTimer = setTimeout(() => this.showSimilar(post.id, div), 800);
        });
        div.addEventListener('mouseleave', () => {
            clearTimeout(hoverTimer);
            div.querySelector('.similar-tooltip')?.remove();
        });

        return div;
    },

    // === SIMILAR POSTS TOOLTIP ===

    async showSimilar(postId, parentEl) {
        try {
            const similar = await Api.getSimilarPosts(postId, 3);
            if (!similar.length) return;
            if (!parentEl.matches(':hover')) return;

            const existing = parentEl.querySelector('.similar-tooltip');
            if (existing) return;

            const tooltip = document.createElement('div');
            tooltip.className = 'similar-tooltip';
            tooltip.innerHTML = `
                <div class="similar-title">Posts similares</div>
                ${similar.map(s => `
                    <a href="${Api.postUrl(s.attributes.name)}" target="_blank" rel="noopener noreferrer" class="similar-item">
                        ${escapeHtml(s.attributes.title)}
                    </a>
                `).join('')}
            `;
            parentEl.appendChild(tooltip);
        } catch { /* silent */ }
    },

    // === LIKES ===

    async toggleLike(postId, btn) {
        try {
            const isLiked = btn.classList.contains('liked');
            if (isLiked) {
                await Api.unlikePost(postId);
                btn.classList.remove('liked');
            } else {
                await Api.likePost(postId);
                btn.classList.add('liked');
            }
            const count = parseInt(btn.textContent.replace(/\D/g, '')) + (isLiked ? -1 : 1);
            btn.innerHTML = `${Icons.heart(!isLiked)} ${count}`;
        } catch { /* silent */ }
    },

    // === POST DETAIL & COMMENTS ===

    async showPostDetail(postName) {
        this.showView('detail');
        const container = $('#detail-content');
        container.innerHTML = '<div class="detail-loading">Cargando...</div>';

        try {
            const post = await Api.getPostByName(postName);
            if (!post) throw new Error('Post no encontrado');

            this.state.selectedPost = post;
            const a = post.attributes;
            const author = a.author?.data?.attributes;
            const comments = a.commentsList?.data || [];

            container.innerHTML = `
                <h2 class="detail-title">${escapeHtml(a.title)}</h2>
                <div class="post-meta">
                    <span class="post-author">${escapeHtml(author?.username || '')}</span>
                    <span class="post-date">${formatDate(a.publishedAt)}</span>
                    <span>${a.readingTime || 0} min lectura</span>
                </div>
                <div class="detail-stats">
                    <span>${Icons.eye} ${a.views}</span> · <span>${Icons.heart(false)} ${a.likes}</span> · <span>${Icons.comment} ${a.comments}</span>
                </div>
                <a href="${Api.postUrl(a.name)}" target="_blank" class="btn-read-full">Leer completo ${Icons.externalLink}</a>
                <div class="comments-section">
                    <h3>Comentarios (${comments.length})</h3>
                    ${comments.length === 0 ? '<p class="no-comments">Sin comentarios aun</p>' : ''}
                    ${comments.map(c => this.renderComment(c)).join('')}
                </div>
            `;

            $('#form-comment').classList.toggle('hidden', !this.state.user);
            $('#comment-post-id').value = post.id;
        } catch (err) {
            container.innerHTML = `<p class="error-message">Error: ${err.message}</p>`;
        }
    },

    renderComment(comment) {
        const a = comment.attributes;
        const author = a.author?.data?.attributes;
        const avatarUrl = Api.avatarUrl(author);
        return `
            <div class="comment">
                <div class="comment-header">
                    ${avatarUrl ? `<img class="comment-avatar" src="${avatarUrl}" alt=""/>` : ''}
                    <span class="comment-author">${escapeHtml(author?.username || 'Anonimo')}</span>
                    <span class="comment-date">${formatDate(a.createdAt)}</span>
                </div>
                <p class="comment-body">${escapeHtml(a.body)}</p>
            </div>
        `;
    },

    async submitComment(e) {
        e.preventDefault();
        const postId = $('#comment-post-id').value;
        const body = $('#comment-body').value.trim();
        if (!body || !postId) return;

        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Enviando...';

        try {
            await Api.createComment(postId, body);
            $('#comment-body').value = '';
            await this.showPostDetail(this.state.selectedPost.attributes.name);
        } catch (err) {
            alert('Error al comentar: ' + err.message);
        }
        btn.disabled = false;
        btn.textContent = 'Comentar';
    },

    // === FILTER BY AUTHOR ===

    filterByAuthor(authorId, username) {
        this.state.start = 0;
        this.state.posts = [];
        $('#post-container').innerHTML = `
            <div class="filter-banner">
                Posts de <strong>${escapeHtml(username)}</strong>
                <button class="btn-clear-filter" onclick="App.clearAuthorFilter()">${Icons.close}</button>
            </div>`;
        this.state.loading = true;
        const loader = $('#loading');
        loader.classList.remove('hidden');

        Api.getPosts({ limit: 25, start: 0, authorId }).then(posts => {
            loader.classList.add('hidden');
            this.state.loading = false;
            posts.forEach((p, i) => {
                $('#post-container').appendChild(this.createPostEl(p, i));
            });
            if (!posts.length) {
                $('#post-container').innerHTML += '<p class="no-results">Sin posts encontrados</p>';
            }
        }).catch(() => {
            loader.classList.add('hidden');
            this.state.loading = false;
        });
    },

    clearAuthorFilter() {
        this.resetAndLoad();
    },

    // === AUTH ===

    async login() {
        const token = $('#token-input').value.trim();
        if (!token) return;

        $('#btn-login').disabled = true;
        $('#btn-login').textContent = 'Verificando...';

        try {
            await Storage.setToken(token);
            const user = await Api.getMe();
            this.state.user = user;
            await Storage.setUser(user);
            this.updateAuthUI();
            this.showView('profile');
        } catch (err) {
            await Storage.clearToken();
            this.state.user = null;
            alert('Token invalido: ' + err.message);
        }
        $('#btn-login').disabled = false;
        $('#btn-login').textContent = 'Iniciar sesion';
    },

    async loginViaSite() {
        window.open('https://binarycoffee.dev', '_blank');
        $('#login-site-hint').classList.remove('hidden');
        $('#btn-detect-token').classList.remove('hidden');
        $('#btn-detect-token').addEventListener('click', async () => {
            const token = await chrome.runtime.sendMessage({ type: 'extractToken' });
            if (token) {
                $('#token-input').value = token;
                await this.login();
            } else {
                alert('No se encontro la sesion. Asegurate de haber iniciado sesion en binarycoffee.dev');
            }
        });
    },

    async logout() {
        await Storage.clearToken();
        this.state.user = null;
        this.updateAuthUI();
        this.showView('feed');
    },

    updateAuthUI() {
        const user = this.state.user;
        const profileIcon = $('#btn-profile');
        if (user) {
            const av = Api.avatarUrl(user);
            profileIcon.innerHTML = av
                ? `<img src="${av}" alt="" class="header-avatar"/>`
                : Icons.user;
        } else {
            profileIcon.innerHTML = Icons.user;
        }
    },

    // === PROFILE ===

    renderProfile() {
        const user = this.state.user;
        const loggedIn = $('#profile-logged-in');
        const loggedOut = $('#profile-logged-out');

        if (user) {
            loggedIn.classList.remove('hidden');
            loggedOut.classList.add('hidden');
            const av = Api.avatarUrl(user);
            $('#profile-avatar').src = av || '';
            $('#profile-avatar').classList.toggle('hidden', !av);
            $('#profile-username').textContent = user.username;
            $('#profile-email').textContent = user.email || '';
        } else {
            loggedIn.classList.add('hidden');
            loggedOut.classList.remove('hidden');
        }
    },

    // === MY POSTS ===

    async showMyPosts() {
        if (!this.state.user) return;
        this.showView('my-posts');
        const container = $('#my-posts-container');
        container.innerHTML = '<div class="detail-loading">Cargando tus posts...</div>';

        try {
            const posts = await Api.getPosts({ limit: 50, authorId: this.state.user.id });
            container.innerHTML = '';
            if (!posts.length) {
                container.innerHTML = '<p class="no-results">No tienes posts publicados</p>';
                return;
            }
            posts.forEach((p, i) => container.appendChild(this.createPostEl(p, i)));
        } catch (err) {
            container.innerHTML = `<p class="error-message">Error: ${err.message}</p>`;
        }
    },

    // === STATS ===

    async loadStats() {
        if (!this.state.user) {
            this.showView('profile');
            return;
        }
        const container = $('#stats-content');
        container.innerHTML = '<div class="detail-loading">Calculando estadisticas...</div>';

        try {
            const posts = await Api.getPosts({ limit: 100, authorId: this.state.user.id });
            const totalViews = posts.reduce((s, p) => s + (parseInt(p.attributes.views) || 0), 0);
            const totalLikes = posts.reduce((s, p) => s + (parseInt(p.attributes.likes) || 0), 0);
            const totalComments = posts.reduce((s, p) => s + (parseInt(p.attributes.comments) || 0), 0);
            const topPost = posts.sort((a, b) => (b.attributes.views || 0) - (a.attributes.views || 0))[0];

            container.innerHTML = `
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${posts.length}</div>
                        <div class="stat-label">Posts</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${totalViews.toLocaleString()}</div>
                        <div class="stat-label">Views totales</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${totalLikes}</div>
                        <div class="stat-label">Likes totales</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${totalComments}</div>
                        <div class="stat-label">Comentarios</div>
                    </div>
                </div>
                ${topPost ? `
                    <div class="top-post">
                        <h4>Post mas popular</h4>
                        <a href="${Api.postUrl(topPost.attributes.name)}" target="_blank" rel="noopener noreferrer">
                            ${escapeHtml(topPost.attributes.title)}
                        </a>
                        <span>${topPost.attributes.views} views</span>
                    </div>
                ` : ''}
            `;
        } catch (err) {
            container.innerHTML = `<p class="error-message">Error: ${err.message}</p>`;
        }
    },

    // === CREATE POST ===

    async submitPost(e) {
        e.preventDefault();
        if (!this.state.user) return;

        const title = $('#post-title').value.trim();
        const body = $('#post-body').value.trim();
        if (!title || !body) return;

        const btn = e.target.querySelector('button[type="submit"]');
        btn.disabled = true;
        btn.textContent = 'Creando...';

        try {
            const post = await Api.createPost(title, body);
            alert(`Borrador creado: "${post.attributes.title}". Revisalo en binarycoffee.dev para publicarlo.`);
            $('#post-title').value = '';
            $('#post-body').value = '';
            this.showView('feed');
        } catch (err) {
            alert('Error: ' + err.message);
        }
        btn.disabled = false;
        btn.textContent = 'Crear borrador';
    },

    // === DARK MODE ===

    async toggleDarkMode() {
        const isDark = document.body.classList.toggle('dark');
        await Storage.setDarkMode(isDark);
        $('#btn-dark-mode').innerHTML = isDark ? Icons.sun : Icons.moon;
    },

    // === NOTIFICATIONS ===

    async toggleNotifications() {
        const current = await Storage.getNotificationsEnabled();
        const next = !current;
        await Storage.setNotificationsEnabled(next);
        $('#btn-notifications').innerHTML = next ? `${Icons.bellOn} Notificaciones: ON` : `${Icons.bellOff} Notificaciones: OFF`;
    },

    // === SUBSCRIPTION ===

    async toggleSubscription() {
        if (!this.state.user?.email) {
            alert('Se requiere un email para suscribirse');
            return;
        }
        try {
            await Api.subscribe(this.state.user.email);
            alert('Suscrito correctamente');
        } catch (err) {
            alert('Error: ' + err.message);
        }
    }
};

// === UTILITY FUNCTIONS ===

function $(selector) {
    return document.querySelector(selector);
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
}

function truncateText(text, maxLen) {
    if (!text) return '';
    const clean = text.replace(/[#*_`>\[\]()!]/g, '').replace(/\n+/g, ' ').trim();
    return clean.length > maxLen ? clean.substring(0, maxLen) + '...' : clean;
}

function debounce(fn, ms) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => fn(...args), ms);
    };
}

document.addEventListener('DOMContentLoaded', () => App.init());
