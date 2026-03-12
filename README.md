# Binary Coffee Articles

A Microsoft Edge extension to browse, search, and interact with articles from the [Binary Coffee](https://binarycoffee.dev) developer community blog — right from your browser toolbar.

![Manifest V3](https://img.shields.io/badge/Manifest-V3-blue)
![Edge Extension](https://img.shields.io/badge/Platform-Microsoft%20Edge-0078D7)
![Version](https://img.shields.io/badge/Version-2.0-green)

## Features

- **Article Feed** — Browse the latest posts with cover images, author info, tags, and stats (views, likes, comments)
- **Full-text Search** — Instantly filter articles by title or content
- **Tag Filtering** — Click any tag to filter posts by topic
- **Article Detail View** — Read article previews with rendered markdown, then open the full post on Binary Coffee
- **Dark Mode** — Toggle between light and dark themes, with preference saved across sessions
- **User Authentication** — Log in with your Binary Coffee account to unlock interactive features
- **Like Articles** — Like and unlike posts directly from the extension
- **Comments** — Read and post comments on articles (requires login)
- **New Article Notifications** — Get notified when new articles are published via browser notifications
- **User Profile** — View your posts, stats, and account details
- **Infinite Scroll** — Automatically loads more articles as you scroll down

## Tech Stack

- **Manifest V3** — Modern Chrome extension architecture
- **Vanilla JavaScript** — No frameworks or external dependencies
- **GraphQL API** — Connects to Binary Coffee's Strapi v4 backend
- **Feather-style SVG Icons** — Clean, lightweight inline icons throughout the UI
- **Chrome Storage API** — Persistent settings and token management
- **Alarms API** — Periodic background checks for new content

## Project Structure

```
binary-coffee-edge-extension/
├── manifest.json          # Extension manifest (V3)
├── background.js          # Service worker for notifications
├── popup/
│   ├── index.html         # Popup UI with multiple views
│   └── style.css          # Styles with dark mode support
├── scripts/
│   ├── api.js             # GraphQL API layer
│   ├── app.js             # Main UI application logic
│   └── storage.js         # Chrome storage wrapper with caching
└── icons/
    ├── icon16.png
    ├── icon48.png
    ├── icon64.png
    └── icon128.png
```

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/stescobedo92/binary-coffee-edge-extension.git
   ```
2. Open `edge://extensions/` in Microsoft Edge
3. Enable **Developer mode**
4. Click **Load unpacked** and select the project folder

## Permissions

| Permission | Purpose |
|---|---|
| `storage` | Save user preferences, auth tokens, and cached data |
| `alarms` | Schedule periodic checks for new articles |
| `notifications` | Alert users when new articles are published |
| `scripting` | Runtime script injection support |

## License

This project is open source. See the repository for license details.
