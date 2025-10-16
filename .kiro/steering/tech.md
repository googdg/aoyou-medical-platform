# Technology Stack & Build System

## Backend Stack
- **Runtime**: Node.js 16+ with Express.js framework
- **Database**: SQLite (production.db) with sqlite3 driver
- **Authentication**: JWT tokens + bcryptjs for password hashing
- **File Upload**: Multer for media management
- **Security**: Helmet, CORS, rate limiting (rate-limiter-flexible)
- **Session Management**: express-session
- **Content Processing**: Marked (Markdown), DOMPurify (sanitization)

## Frontend Stack
- **Core**: Vanilla HTML5, CSS3, ES6+ JavaScript (no frameworks)
- **Architecture**: Modular JavaScript classes with service-oriented design
- **Internationalization**: Custom i18n system with JSON translations
- **Performance**: Service Worker, lazy loading, image optimization
- **Accessibility**: WCAG compliance with custom enhancer
- **Responsive**: Mobile-first CSS with breakpoints

## Key JavaScript Modules
- `APIClient`: HTTP client with caching, retry logic, interceptors
- `BlogPost/BlogCategory`: Data models with validation
- `I18nManager`: Translation and language switching
- `ContentLoader`: Dynamic content loading and sync
- `PerformanceOptimizer`: Lazy loading and caching
- `AccessibilityEnhancer`: A11y features and keyboard navigation

## Development Commands

### Local Development
```bash
npm install          # Install dependencies
npm run dev         # Development mode with nodemon
npm start           # Production mode
npm test            # Run tests (Jest)
```

### Production Deployment
```bash
npm run start:production    # Production with PORT=80
npm run pm2:start          # Start with PM2
npm run pm2:restart        # Restart PM2 process
```

### Docker Deployment
```bash
docker-compose up -d       # Full stack with Redis, Nginx
docker-compose --profile monitoring up -d  # Include Prometheus/Grafana
```

## Environment Configuration
- Copy `.env.example` to `.env` and configure
- Required: `JWT_SECRET`, `SESSION_SECRET`
- Optional: Redis, S3, monitoring services
- Default admin: username `admin`, password `admin123`

## Database Schema
- **users**: Admin authentication
- **posts**: Multi-language blog posts with SEO fields
- **categories**: Hierarchical categories
- **media**: File upload metadata
- **homepage**: Dynamic homepage content

## Security Features
- Rate limiting (100 req/min general, 5 login attempts/15min)
- CSRF protection
- Content Security Policy
- Input sanitization with DOMPurify
- Secure session cookies
- JWT token expiration (24h)

## Performance Optimizations
- Service Worker caching
- Image lazy loading with WebP support
- CSS/JS compression
- Database query optimization
- Static asset caching
- Response compression (gzip)