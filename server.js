// Personal Blog CMS Server
const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs').promises;
const { marked } = require('marked');
const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// 初始化DOMPurify
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// 应用配置
const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const SESSION_SECRET = process.env.SESSION_SECRET || 'your-super-secret-session-key-change-in-production';

// 数据库初始化
const db = new sqlite3.Database('./blog.db');

// 中间件配置
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "data:", "https:"],
            scriptSrc: ["'self'"]
        }
    }
}));

app.use(compression());
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 'https://yourdomain.com' : 'http://localhost:3000',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 会话配置
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24小时
    }
}));

// 静态文件服务
app.use('/admin', express.static(path.join(__dirname, 'admin')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/data', express.static(path.join(__dirname, 'data')));
app.use(express.static(path.join(__dirname, 'public')));

// 速率限制
const rateLimiter = new RateLimiterMemory({
    keyGenerator: (req) => req.ip,
    points: 100, // 请求数量
    duration: 60, // 每60秒
});

const authLimiter = new RateLimiterMemory({
    keyGenerator: (req) => req.ip,
    points: 5, // 登录尝试次数
    duration: 900, // 15分钟
});

// 文件上传配置
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, 'uploads');
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('只允许上传图片文件'));
        }
    }
});

// 数据库初始化
function initDatabase() {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            // 用户表
            db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                role TEXT DEFAULT 'admin',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
            
            // 文章表
            db.run(`CREATE TABLE IF NOT EXISTS posts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title_en TEXT NOT NULL,
                title_zh TEXT NOT NULL,
                slug_en TEXT UNIQUE NOT NULL,
                slug_zh TEXT UNIQUE NOT NULL,
                content_en TEXT NOT NULL,
                content_zh TEXT NOT NULL,
                excerpt_en TEXT,
                excerpt_zh TEXT,
                category TEXT NOT NULL,
                tags TEXT, -- JSON array
                featured BOOLEAN DEFAULT 0,
                published BOOLEAN DEFAULT 0,
                author_id INTEGER,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                published_at DATETIME,
                FOREIGN KEY (author_id) REFERENCES users (id)
            )`);
            
            // 分类表
            db.run(`CREATE TABLE IF NOT EXISTS categories (
                id TEXT PRIMARY KEY,
                name_en TEXT NOT NULL,
                name_zh TEXT NOT NULL,
                description_en TEXT,
                description_zh TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
            
            // 媒体文件表
            db.run(`CREATE TABLE IF NOT EXISTS media (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                original_name TEXT NOT NULL,
                mime_type TEXT NOT NULL,
                size INTEGER NOT NULL,
                path TEXT NOT NULL,
                alt_text TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
            
            // 主页内容表
            db.run(`CREATE TABLE IF NOT EXISTS homepage (
                id INTEGER PRIMARY KEY,
                content TEXT NOT NULL,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )`);
            
            // 创建默认管理员账户
            const defaultPassword = bcrypt.hashSync('admin123', 10);
            db.run(`INSERT OR IGNORE INTO users (username, email, password, role) 
                    VALUES ('admin', 'admin@example.com', ?, 'admin')`, [defaultPassword]);
            
            // 创建默认分类
            db.run(`INSERT OR IGNORE INTO categories (id, name_en, name_zh, description_en, description_zh) 
                    VALUES 
                    ('technology', 'Technology', '技术', 'Technology related posts', '技术相关文章'),
                    ('life', 'Life', '生活', 'Life and personal posts', '生活和个人文章'),
                    ('thoughts', 'Thoughts', '思考', 'Personal thoughts and reflections', '个人思考和感悟')`);
            
            resolve();
        });
    });
}

// 认证中间件
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: '访问令牌缺失' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: '无效的访问令牌' });
        }
        req.user = user;
        next();
    });
}

// 速率限制中间件
async function rateLimitMiddleware(req, res, next) {
    try {
        await rateLimiter.consume(req.ip);
        next();
    } catch (rejRes) {
        res.status(429).json({ error: '请求过于频繁，请稍后再试' });
    }
}

// API路由

// 登录
app.post('/api/auth/login', async (req, res) => {
    try {
        await authLimiter.consume(req.ip);
        
        const { username, password } = req.body;
        
        if (!username || !password) {
            return res.status(400).json({ error: '用户名和密码不能为空' });
        }
        
        db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, username], (err, user) => {
            if (err) {
                return res.status(500).json({ error: '数据库错误' });
            }
            
            if (!user || !bcrypt.compareSync(password, user.password)) {
                return res.status(401).json({ error: '用户名或密码错误' });
            }
            
            const token = jwt.sign(
                { id: user.id, username: user.username, role: user.role },
                JWT_SECRET,
                { expiresIn: '24h' }
            );
            
            res.json({
                message: '登录成功',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
        });
    } catch (rejRes) {
        res.status(429).json({ error: '登录尝试过于频繁，请15分钟后再试' });
    }
});

// 获取当前用户信息
app.get('/api/auth/me', authenticateToken, (req, res) => {
    db.get('SELECT id, username, email, role, created_at FROM users WHERE id = ?', [req.user.id], (err, user) => {
        if (err) {
            return res.status(500).json({ error: '数据库错误' });
        }
        
        if (!user) {
            return res.status(404).json({ error: '用户不存在' });
        }
        
        res.json({ user });
    });
});

// 文章管理API

// 获取所有文章
app.get('/api/posts', rateLimitMiddleware, (req, res) => {
    const { page = 1, limit = 10, category, published, search } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `SELECT p.*, u.username as author_name FROM posts p 
                 LEFT JOIN users u ON p.author_id = u.id`;
    let countQuery = `SELECT COUNT(*) as total FROM posts p`;
    let params = [];
    let conditions = [];
    
    if (category) {
        conditions.push('p.category = ?');
        params.push(category);
    }
    
    if (published !== undefined) {
        conditions.push('p.published = ?');
        params.push(published === 'true' ? 1 : 0);
    }
    
    if (search) {
        conditions.push('(p.title_en LIKE ? OR p.title_zh LIKE ? OR p.content_en LIKE ? OR p.content_zh LIKE ?)');
        const searchTerm = `%${search}%`;
        params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }
    
    if (conditions.length > 0) {
        const whereClause = ' WHERE ' + conditions.join(' AND ');
        query += whereClause;
        countQuery += whereClause;
    }
    
    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    // 获取总数
    db.get(countQuery, params.slice(0, -2), (err, countResult) => {
        if (err) {
            return res.status(500).json({ error: '数据库错误' });
        }
        
        // 获取文章列表
        db.all(query, params, (err, posts) => {
            if (err) {
                return res.status(500).json({ error: '数据库错误' });
            }
            
            // 解析tags JSON
            const processedPosts = posts.map(post => ({
                ...post,
                tags: post.tags ? JSON.parse(post.tags) : []
            }));
            
            res.json({
                posts: processedPosts,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult.total,
                    pages: Math.ceil(countResult.total / limit)
                }
            });
        });
    });
});

// 获取单个文章
app.get('/api/posts/:id', rateLimitMiddleware, (req, res) => {
    const { id } = req.params;
    
    db.get(`SELECT p.*, u.username as author_name FROM posts p 
            LEFT JOIN users u ON p.author_id = u.id 
            WHERE p.id = ?`, [id], (err, post) => {
        if (err) {
            return res.status(500).json({ error: '数据库错误' });
        }
        
        if (!post) {
            return res.status(404).json({ error: '文章不存在' });
        }
        
        // 解析tags JSON
        post.tags = post.tags ? JSON.parse(post.tags) : [];
        
        res.json({ post });
    });
});

// 创建文章
app.post('/api/posts', authenticateToken, rateLimitMiddleware, (req, res) => {
    const {
        title_en, title_zh, slug_en, slug_zh,
        content_en, content_zh, excerpt_en, excerpt_zh,
        category, tags, featured, published
    } = req.body;
    
    if (!title_en || !title_zh || !slug_en || !slug_zh || !content_en || !content_zh || !category) {
        return res.status(400).json({ error: '必填字段不能为空' });
    }
    
    const tagsJson = JSON.stringify(tags || []);
    const publishedAt = published ? new Date().toISOString() : null;
    
    db.run(`INSERT INTO posts (
        title_en, title_zh, slug_en, slug_zh,
        content_en, content_zh, excerpt_en, excerpt_zh,
        category, tags, featured, published, author_id, published_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
        title_en, title_zh, slug_en, slug_zh,
        content_en, content_zh, excerpt_en, excerpt_zh,
        category, tagsJson, featured ? 1 : 0, published ? 1 : 0,
        req.user.id, publishedAt
    ], function(err) {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
                return res.status(400).json({ error: 'slug已存在' });
            }
            return res.status(500).json({ error: '数据库错误' });
        }
        
        res.status(201).json({
            message: '文章创建成功',
            postId: this.lastID
        });
    });
});

// 更新文章
app.put('/api/posts/:id', authenticateToken, rateLimitMiddleware, (req, res) => {
    const { id } = req.params;
    const {
        title_en, title_zh, slug_en, slug_zh,
        content_en, content_zh, excerpt_en, excerpt_zh,
        category, tags, featured, published
    } = req.body;
    
    if (!title_en || !title_zh || !slug_en || !slug_zh || !content_en || !content_zh || !category) {
        return res.status(400).json({ error: '必填字段不能为空' });
    }
    
    const tagsJson = JSON.stringify(tags || []);
    const publishedAt = published ? new Date().toISOString() : null;
    
    db.run(`UPDATE posts SET 
        title_en = ?, title_zh = ?, slug_en = ?, slug_zh = ?,
        content_en = ?, content_zh = ?, excerpt_en = ?, excerpt_zh = ?,
        category = ?, tags = ?, featured = ?, published = ?,
        updated_at = CURRENT_TIMESTAMP, published_at = ?
        WHERE id = ?`,
    [
        title_en, title_zh, slug_en, slug_zh,
        content_en, content_zh, excerpt_en, excerpt_zh,
        category, tagsJson, featured ? 1 : 0, published ? 1 : 0,
        publishedAt, id
    ], function(err) {
        if (err) {
            if (err.code === 'SQLITE_CONSTRAINT') {
                return res.status(400).json({ error: 'slug已存在' });
            }
            return res.status(500).json({ error: '数据库错误' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: '文章不存在' });
        }
        
        res.json({ message: '文章更新成功' });
    });
});

// 删除文章
app.delete('/api/posts/:id', authenticateToken, rateLimitMiddleware, (req, res) => {
    const { id } = req.params;
    
    db.run('DELETE FROM posts WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: '数据库错误' });
        }
        
        if (this.changes === 0) {
            return res.status(404).json({ error: '文章不存在' });
        }
        
        res.json({ message: '文章删除成功' });
    });
});

// 分类管理API

// 获取所有分类
app.get('/api/categories', rateLimitMiddleware, (req, res) => {
    db.all('SELECT * FROM categories ORDER BY id', (err, categories) => {
        if (err) {
            return res.status(500).json({ error: '数据库错误' });
        }
        
        res.json({ categories });
    });
});

// 媒体管理API

// 上传文件
app.post('/api/media/upload', authenticateToken, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: '没有上传文件' });
    }
    
    const { filename, originalname, mimetype, size, path: filePath } = req.file;
    const { alt_text } = req.body;
    
    db.run(`INSERT INTO media (filename, original_name, mime_type, size, path, alt_text)
            VALUES (?, ?, ?, ?, ?, ?)`,
    [filename, originalname, mimetype, size, `/uploads/${filename}`, alt_text || ''],
    function(err) {
        if (err) {
            return res.status(500).json({ error: '数据库错误' });
        }
        
        res.status(201).json({
            message: '文件上传成功',
            media: {
                id: this.lastID,
                filename,
                original_name: originalname,
                mime_type: mimetype,
                size,
                path: `/uploads/${filename}`,
                alt_text: alt_text || ''
            }
        });
    });
});

// 获取媒体文件列表
app.get('/api/media', authenticateToken, rateLimitMiddleware, (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    
    db.get('SELECT COUNT(*) as total FROM media', (err, countResult) => {
        if (err) {
            return res.status(500).json({ error: '数据库错误' });
        }
        
        db.all('SELECT * FROM media ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [parseInt(limit), offset], (err, media) => {
            if (err) {
                return res.status(500).json({ error: '数据库错误' });
            }
            
            res.json({
                media,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: countResult.total,
                    pages: Math.ceil(countResult.total / limit)
                }
            });
        });
    });
});

// 仪表板统计API
app.get('/api/dashboard/stats', authenticateToken, rateLimitMiddleware, (req, res) => {
    const stats = {};
    
    // 获取文章统计
    db.get('SELECT COUNT(*) as total FROM posts', (err, postCount) => {
        if (err) {
            return res.status(500).json({ error: '数据库错误' });
        }
        stats.totalPosts = postCount.total;
        
        db.get('SELECT COUNT(*) as published FROM posts WHERE published = 1', (err, publishedCount) => {
            if (err) {
                return res.status(500).json({ error: '数据库错误' });
            }
            stats.publishedPosts = publishedCount.published;
            
            db.get('SELECT COUNT(*) as media FROM media', (err, mediaCount) => {
                if (err) {
                    return res.status(500).json({ error: '数据库错误' });
                }
                stats.totalMedia = mediaCount.media;
                
                // 获取最近文章
                db.all(`SELECT title_en, title_zh, created_at, published FROM posts 
                        ORDER BY created_at DESC LIMIT 5`, (err, recentPosts) => {
                    if (err) {
                        return res.status(500).json({ error: '数据库错误' });
                    }
                    stats.recentPosts = recentPosts;
                    
                    res.json({ stats });
                });
            });
        });
    });
});

// 主页内容API
app.get('/api/homepage', rateLimitMiddleware, (req, res) => {
    db.get('SELECT content FROM homepage WHERE id = 1', (err, row) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: '数据库错误' });
        }
        
        if (row) {
            try {
                const content = JSON.parse(row.content);
                res.json({ success: true, content: content });
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                res.json({ success: false, message: '数据解析错误' });
            }
        } else {
            // 返回默认内容
            res.json({ success: true, content: {} });
        }
    });
});

// 保存主页内容API
app.post('/api/homepage', authenticateToken, rateLimitMiddleware, (req, res) => {
    const content = req.body;
    
    if (!content) {
        return res.status(400).json({ success: false, message: '内容不能为空' });
    }
    
    const contentJson = JSON.stringify(content);
    
    // 使用UPSERT操作
    db.run(`INSERT OR REPLACE INTO homepage (id, content, updated_at) VALUES (1, ?, datetime('now'))`, 
        [contentJson], 
        function(err) {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ success: false, message: '保存失败' });
            }
            
            console.log('Homepage content saved successfully');
            res.json({ success: true, message: '主页内容保存成功' });
        }
    );
});

// 主页内容管理API (旧版本，保持兼容性)
app.post('/api/homepage/update', authenticateToken, rateLimitMiddleware, async (req, res) => {
    try {
        const { site, welcome } = req.body;
        
        // 读取当前的i18n.json文件
        const i18nPath = path.join(__dirname, 'data', 'i18n.json');
        let i18nData;
        
        try {
            const i18nContent = await fs.readFile(i18nPath, 'utf8');
            i18nData = JSON.parse(i18nContent);
        } catch (error) {
            return res.status(500).json({ error: '无法读取国际化文件' });
        }
        
        // 更新中文内容
        if (site) {
            i18nData.zh.site = { ...i18nData.zh.site, ...site };
        }
        
        if (welcome) {
            i18nData.zh.welcome = { ...i18nData.zh.welcome, ...welcome };
        }
        
        // 同时更新英文内容（可以根据需要调整）
        if (site) {
            // 这里可以添加英文翻译逻辑，暂时保持原有内容
            if (site.title) i18nData.en.site.title = site.title;
        }
        
        // 保存更新后的文件
        try {
            await fs.writeFile(i18nPath, JSON.stringify(i18nData, null, 2), 'utf8');
        } catch (error) {
            return res.status(500).json({ error: '保存文件失败' });
        }
        
        res.json({ message: '主页内容更新成功' });
        
    } catch (error) {
        console.error('主页更新错误:', error);
        res.status(500).json({ error: '更新主页内容失败' });
    }
});

// 主页路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// 静态文件路由（用于CSS、JS等）
app.get('/styles.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'styles.css'));
});

app.get('/script.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'script.js'));
});

app.get('/script-simple.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'script-simple.js'));
});

app.get('/js/:filename', (req, res) => {
    res.sendFile(path.join(__dirname, 'js', req.params.filename));
});

app.get('/css/:filename', (req, res) => {
    res.sendFile(path.join(__dirname, 'css', req.params.filename));
});

app.get('/images/:filename', (req, res) => {
    res.sendFile(path.join(__dirname, 'images', req.params.filename));
});

// 测试页面路由
app.get('/final-check.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'final-check.html'));
});

app.get('/search-test.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'search-test.html'));
});

app.get('/navigation-test.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'navigation-test.html'));
});

// 管理后台页面路由
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: '文件大小超过限制（5MB）' });
        }
    }
    
    res.status(500).json({ error: '服务器内部错误' });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({ error: '接口不存在' });
});

// 启动服务器
async function startServer() {
    try {
        // 创建必要的目录
        await fs.mkdir(path.join(__dirname, 'uploads'), { recursive: true });
        await fs.mkdir(path.join(__dirname, 'admin'), { recursive: true });
        
        // 初始化数据库
        await initDatabase();
        
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 Personal Blog CMS Server running on port ${PORT}`);
            console.log(`🌐 Website: http://localhost:${PORT}`);
            console.log(`📊 Admin Panel: http://localhost:${PORT}/admin`);
            console.log(`🔑 Default Admin Account:`);
            console.log(`   Username: admin`);
            console.log(`   Password: admin123`);
            console.log(`⚠️  Please change the default password after first login!`);
            console.log(`\n📡 External Access:`);
            console.log(`   Make sure to configure your firewall and router for external access`);
            console.log(`   External URL will be: http://YOUR_PUBLIC_IP:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});

startServer();