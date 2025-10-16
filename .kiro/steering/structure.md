# Project Structure & Organization

## Root Directory Layout
```
├── server.js              # Main Express server entry point
├── index.html             # Frontend homepage
├── styles.css             # Main stylesheet
├── script.js              # Main frontend script
├── script-simple.js       # Simplified script version
├── sw.js                  # Service Worker for PWA
├── package.json           # Dependencies and scripts
├── ecosystem.config.js    # PM2 configuration
├── docker-compose.yml     # Docker orchestration
├── Dockerfile             # Container build instructions
└── .env.example           # Environment variables template
```

## Frontend Structure
```
├── js/                    # Modular JavaScript components
│   ├── api-client.js      # HTTP client with caching/retry
│   ├── blog-models.js     # Data models and validation
│   ├── blog-data.js       # Blog data management
│   ├── i18n.js           # Internationalization manager
│   ├── content-loader.js  # Dynamic content loading
│   ├── sync-manager.js    # Content synchronization
│   ├── performance-optimizer.js  # Lazy loading, caching
│   ├── accessibility-enhancer.js # A11y features
│   ├── navigation-enhancer.js    # Navigation UX
│   ├── search-engine.js   # Client-side search
│   ├── seo-optimizer.js   # SEO enhancements
│   ├── image-optimizer.js # Image processing
│   └── device-compatibility.js   # Cross-device support
├── css/                   # Modular stylesheets
│   ├── accessibility-styles.css  # A11y specific styles
│   └── search-styles.css  # Search component styles
└── images/                # Static images and assets
```

## Backend Admin Structure
```
├── admin/                 # Admin panel frontend
│   ├── index.html        # Admin dashboard
│   ├── admin.js          # Admin application logic
│   ├── admin.css         # Admin-specific styles
│   └── *-test.html       # Individual feature tests
```

## Data & Configuration
```
├── data/                  # JSON data files
│   ├── blog-posts.json   # Blog content (fallback)
│   └── i18n.json         # Translation strings
├── uploads/               # User uploaded media files
├── blog.db               # SQLite database file
└── .kiro/                # Kiro IDE configuration
    └── steering/         # AI assistant guidance
```

## Testing Structure
```
├── test/                  # Test suites
│   └── integration-test.js # Full integration tests
├── test-all-features.sh   # Comprehensive test script
├── *-test.html           # Individual feature test pages
├── debug-*.html          # Debug and verification pages
└── final-check.html      # Final deployment check
```

## Naming Conventions

### Files
- **Kebab-case**: `content-loader.js`, `blog-models.js`
- **Descriptive**: Files clearly indicate their purpose
- **Test suffix**: `*-test.html` for test pages
- **Debug prefix**: `debug-*` for debugging tools

### JavaScript Classes
- **PascalCase**: `APIClient`, `BlogPost`, `I18nManager`
- **Descriptive names**: Classes indicate their responsibility
- **Manager suffix**: For service classes (`I18nManager`, `SyncManager`)

### CSS Classes
- **BEM methodology**: `.blog-post__title`, `.nav-item--active`
- **Semantic naming**: Classes describe content, not appearance
- **Component-based**: Styles organized by component

### API Endpoints
- **RESTful**: `/api/posts`, `/api/categories`, `/api/media`
- **Versioned**: `/api/v1/` for future API versions
- **Resource-based**: URLs represent resources, not actions

## Code Organization Patterns

### Frontend Architecture
- **Service Layer**: `APIClient` handles all HTTP communication
- **Model Layer**: `BlogPost`, `BlogCategory` for data validation
- **View Layer**: DOM manipulation in dedicated modules
- **Manager Pattern**: Centralized services (`I18nManager`, `SyncManager`)

### Backend Architecture
- **MVC Pattern**: Routes → Controllers → Models → Database
- **Middleware Chain**: Authentication, rate limiting, validation
- **Service Layer**: Reusable business logic functions
- **Error Handling**: Centralized error middleware

### File Dependencies
- **Core first**: Load essential modules before features
- **Async loading**: Non-critical scripts loaded with `defer`
- **Dependency injection**: Services passed to dependent modules
- **Event-driven**: Loose coupling via custom events

## Development Workflow
1. **Feature branches**: Create branch for each feature
2. **Test pages**: Create `*-test.html` for new features
3. **Integration tests**: Update `integration-test.js`
4. **Documentation**: Update relevant steering files
5. **Deployment**: Use `test-all-features.sh` before deploy