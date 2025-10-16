// Production Environment Configuration
// 配置生产环境设置、设置数据库和文件存储、优化前后端资源文件

const ProductionConfig = {
    // 环境设置
    environment: {
        NODE_ENV: 'production',
        DEBUG: false,
        LOG_LEVEL: 'info'
    },

    // 服务器配置
    server: {
        host: process.env.HOST || '0.0.0.0',
        port: process.env.PORT || 3001,
        ssl: {
            enabled: process.env.SSL_ENABLED === 'true',
            cert: process.env.SSL_CERT_PATH,
            key: process.env.SSL_KEY_PATH
        },
        compression: true,
        cors: {
            origin: process.env.ALLOWED_ORIGINS ? 
                   process.env.ALLOWED_ORIGINS.split(',') : 
                   ['https://yourdomain.com'],
            credentials: true
        }
    },

    // 数据库配置
    database: {
        // SQLite配置（开发和小型部署）
        sqlite: {
            filename: process.env.DB_PATH || './data/production.db',
            options: {
                verbose: false,
                fileMustExist: false
            }
        },
        
        // MongoDB配置（可选）
        mongodb: {
            uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/personal-blog',
            options: {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                maxPoolSize: 10,
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000
            }
        },
        
        // MySQL配置（可选）
        mysql: {
            host: process.env.DB_HOST || 'localhost',
            port: process.env.DB_PORT || 3306,
            user: process.env.DB_USER || 'blog_user',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'personal_blog',
            connectionLimit: 10,
            acquireTimeout: 60000,
            timeout: 60000
        }
    },

    // 安全配置
    security: {
        jwtSecret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
        sessionSecret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-this-in-production',
        bcryptRounds: 12,
        
        // 速率限制
        rateLimit: {
            windowMs: 15 * 60 * 1000, // 15分钟
            max: 100, // 每个IP最多100个请求
            message: 'Too many requests from this IP, please try again later.'
        },
        
        // CSRF保护
        csrf: {
            enabled: true,
            cookieName: '_csrf',
            secretLength: 24
        },
        
        // 内容安全策略
        csp: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "https:"],
                scriptSrc: ["'self'"],
                connectSrc: ["'self'"],
                frameSrc: ["'none'"],
                objectSrc: ["'none'"]
            }
        }
    },

    // 文件存储配置
    storage: {
        // 本地存储
        local: {
            uploadDir: process.env.UPLOAD_DIR || './uploads',
            maxFileSize: 5 * 1024 * 1024, // 5MB
            allowedTypes: [
                'image/jpeg',
                'image/png', 
                'image/gif',
                'image/webp',
                'application/pdf'
            ]
        },
        
        // AWS S3配置（可选）
        s3: {
            enabled: process.env.S3_ENABLED === 'true',
            bucket: process.env.S3_BUCKET,
            region: process.env.S3_REGION || 'us-east-1',
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            cdnUrl: process.env.S3_CDN_URL
        },
        
        // Cloudinary配置（可选）
        cloudinary: {
            enabled: process.env.CLOUDINARY_ENABLED === 'true',
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            apiSecret: process.env.CLOUDINARY_API_SECRET
        }
    },

    // 缓存配置
    cache: {
        // Redis配置
        redis: {
            enabled: process.env.REDIS_ENABLED === 'true',
            host: process.env.REDIS_HOST || 'localhost',
            port: process.env.REDIS_PORT || 6379,
            password: process.env.REDIS_PASSWORD,
            db: process.env.REDIS_DB || 0,
            ttl: 3600 // 1小时
        },
        
        // 内存缓存
        memory: {
            enabled: true,
            maxSize: 100, // 最大缓存项数
            ttl: 300 // 5分钟
        }
    },

    // 邮件配置
    email: {
        smtp: {
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        },
        from: process.env.EMAIL_FROM || 'noreply@yourdomain.com',
        templates: {
            dir: './email-templates'
        }
    },

    // 日志配置
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: 'combined',
        
        // 文件日志
        file: {
            enabled: true,
            filename: './logs/app.log',
            maxSize: '10m',
            maxFiles: 5,
            datePattern: 'YYYY-MM-DD'
        },
        
        // 错误日志
        error: {
            enabled: true,
            filename: './logs/error.log',
            level: 'error'
        },
        
        // 外部日志服务（可选）
        external: {
            enabled: process.env.EXTERNAL_LOGGING === 'true',
            service: process.env.LOG_SERVICE, // 'winston-cloudwatch', 'loggly', etc.
            config: {
                // 服务特定配置
            }
        }
    },

    // 监控配置
    monitoring: {
        // 健康检查
        healthCheck: {
            enabled: true,
            endpoint: '/health',
            interval: 30000 // 30秒
        },
        
        // 性能监控
        performance: {
            enabled: true,
            sampleRate: 0.1 // 10%采样率
        },
        
        // 错误追踪
        errorTracking: {
            enabled: process.env.ERROR_TRACKING === 'true',
            service: process.env.ERROR_SERVICE, // 'sentry', 'bugsnag', etc.
            dsn: process.env.ERROR_TRACKING_DSN
        }
    },

    // 备份配置
    backup: {
        enabled: true,
        schedule: '0 2 * * *', // 每天凌晨2点
        retention: 7, // 保留7天
        destinations: {
            local: {
                enabled: true,
                path: './backups'
            },
            s3: {
                enabled: process.env.BACKUP_S3_ENABLED === 'true',
                bucket: process.env.BACKUP_S3_BUCKET,
                prefix: 'backups/'
            }
        }
    },

    // CDN配置
    cdn: {
        enabled: process.env.CDN_ENABLED === 'true',
        provider: process.env.CDN_PROVIDER, // 'cloudflare', 'aws', 'azure'
        baseUrl: process.env.CDN_BASE_URL,
        
        // 静态资源配置
        static: {
            maxAge: 31536000, // 1年
            immutable: true
        },
        
        // 图片优化
        imageOptimization: {
            enabled: true,
            formats: ['webp', 'avif'],
            quality: 80,
            progressive: true
        }
    },

    // SEO配置
    seo: {
        sitemap: {
            enabled: true,
            path: '/sitemap.xml',
            changefreq: 'weekly',
            priority: 0.8
        },
        
        robots: {
            enabled: true,
            path: '/robots.txt'
        },
        
        analytics: {
            googleAnalytics: process.env.GA_TRACKING_ID,
            googleTagManager: process.env.GTM_ID,
            baiduAnalytics: process.env.BAIDU_ANALYTICS_ID
        }
    },

    // 国际化配置
    i18n: {
        defaultLanguage: 'en',
        supportedLanguages: ['en', 'zh'],
        fallbackLanguage: 'en',
        
        // 语言检测
        detection: {
            order: ['querystring', 'cookie', 'header'],
            caches: ['cookie']
        }
    },

    // API配置
    api: {
        version: 'v1',
        prefix: '/api',
        
        // API文档
        docs: {
            enabled: process.env.API_DOCS_ENABLED === 'true',
            path: '/api-docs',
            title: 'Personal Blog API',
            version: '1.0.0'
        },
        
        // 分页配置
        pagination: {
            defaultLimit: 10,
            maxLimit: 100
        }
    },

    // 前端资源优化
    frontend: {
        // 资源压缩
        compression: {
            enabled: true,
            level: 6,
            threshold: 1024
        },
        
        // 资源合并
        bundling: {
            enabled: true,
            css: {
                minify: true,
                autoprefixer: true
            },
            js: {
                minify: true,
                sourceMaps: false
            }
        },
        
        // 缓存策略
        caching: {
            static: {
                maxAge: 31536000, // 1年
                etag: true
            },
            dynamic: {
                maxAge: 300, // 5分钟
                etag: true
            }
        }
    },

    // 部署配置
    deployment: {
        // 进程管理
        pm2: {
            enabled: true,
            instances: process.env.PM2_INSTANCES || 'max',
            maxMemoryRestart: '500M',
            minUptime: '10s',
            maxRestarts: 10
        },
        
        // Docker配置
        docker: {
            enabled: process.env.DOCKER_ENABLED === 'true',
            image: 'node:18-alpine',
            port: 3001,
            healthCheck: {
                test: ['CMD', 'curl', '-f', 'http://localhost:3001/health'],
                interval: '30s',
                timeout: '10s',
                retries: 3
            }
        },
        
        // 负载均衡
        loadBalancer: {
            enabled: process.env.LB_ENABLED === 'true',
            strategy: 'round-robin',
            healthCheck: true
        }
    }
};

// 环境变量验证
function validateEnvironment() {
    const required = [
        'NODE_ENV',
        'JWT_SECRET',
        'SESSION_SECRET'
    ];
    
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
        console.error('Missing required environment variables:', missing);
        process.exit(1);
    }
}

// 配置初始化
function initializeConfig() {
    // 验证环境变量
    validateEnvironment();
    
    // 创建必要的目录
    const fs = require('fs');
    const path = require('path');
    
    const dirs = [
        './data',
        './logs',
        './uploads',
        './backups',
        './static'
    ];
    
    dirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
    
    console.log('Production configuration initialized');
}

// 导出配置
module.exports = ProductionConfig;

// 如果直接运行此文件，初始化配置
if (require.main === module) {
    initializeConfig();
}