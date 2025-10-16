// SEO Optimization Module
// 添加结构化数据标记、优化页面标题和描述、实现Open Graph标签

class SEOOptimizer {
    constructor(blogDataManager, i18nManager) {
        this.blogDataManager = blogDataManager;
        this.i18nManager = i18nManager;
        this.currentLanguage = 'en';
        this.siteConfig = {
            siteName: 'Stevn - Personal Blog',
            siteUrl: window.location.origin,
            author: 'Stevn - Product Manager & Digital Health Expert',
            description: 'Personal blog of Stevn - Mobile healthcare expert, community organizer, and product manager sharing insights on digital health innovation and tech community building',
            keywords: ['mobile healthcare', 'digital health', 'product manager', 'tech community', 'shanghai developer', 'women techmarkers', 'devfest', 'healthcare innovation', 'community organizer'],
            twitterHandle: '@yourusername',
            facebookAppId: '',
            linkedinProfile: 'https://linkedin.com/in/yourprofile'
        };
        
        this.init();
    }

    init() {
        this.currentLanguage = this.i18nManager ? this.i18nManager.getCurrentLanguage() : 'en';
        this.addStructuredData();
        this.optimizeMetaTags();
        this.addOpenGraphTags();
        this.addTwitterCardTags();
        this.addCanonicalLinks();
        this.setupDynamicSEO();
        this.addSitemap();
        this.addRobotsTxt();
        
        console.log('SEO optimization initialized');
    }

    // 添加结构化数据标记
    addStructuredData() {
        // 网站基本信息的结构化数据
        this.addWebsiteStructuredData();
        
        // 个人信息的结构化数据
        this.addPersonStructuredData();
        
        // 博客文章的结构化数据
        this.addBlogStructuredData();
        
        // 面包屑导航的结构化数据
        this.addBreadcrumbStructuredData();
    }

    // 添加网站结构化数据
    addWebsiteStructuredData() {
        const websiteData = {
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": this.siteConfig.siteName,
            "url": this.siteConfig.siteUrl,
            "description": this.siteConfig.description,
            "inLanguage": this.currentLanguage,
            "author": {
                "@type": "Person",
                "name": this.siteConfig.author
            },
            "potentialAction": {
                "@type": "SearchAction",
                "target": {
                    "@type": "EntryPoint",
                    "urlTemplate": `${this.siteConfig.siteUrl}/?search={search_term_string}`
                },
                "query-input": "required name=search_term_string"
            }
        };

        this.addStructuredDataScript('website-data', websiteData);
    }

    // 添加个人信息结构化数据
    addPersonStructuredData() {
        const personData = {
            "@context": "https://schema.org",
            "@type": "Person",
            "name": this.siteConfig.author,
            "url": this.siteConfig.siteUrl,
            "sameAs": [
                this.siteConfig.linkedinProfile,
                `https://twitter.com/${this.siteConfig.twitterHandle.replace('@', '')}`
            ],
            "jobTitle": "Web Developer",
            "worksFor": {
                "@type": "Organization",
                "name": "Freelance"
            },
            "knowsAbout": [
                "Web Development",
                "JavaScript",
                "HTML",
                "CSS",
                "React",
                "Node.js"
            ]
        };

        this.addStructuredDataScript('person-data', personData);
    }

    // 添加博客结构化数据
    addBlogStructuredData() {
        if (!this.blogDataManager || !this.blogDataManager.isDataLoaded()) {
            return;
        }

        const posts = this.blogDataManager.getPublishedPosts(this.currentLanguage);
        
        if (posts.length === 0) {
            return;
        }

        // 博客整体信息
        const blogData = {
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": `${this.siteConfig.siteName} - Blog`,
            "description": "Thoughts, insights, and experiences from my journey in technology and development",
            "url": `${this.siteConfig.siteUrl}#blog`,
            "author": {
                "@type": "Person",
                "name": this.siteConfig.author
            },
            "inLanguage": this.currentLanguage,
            "blogPost": posts.slice(0, 10).map(post => this.createBlogPostStructuredData(post))
        };

        this.addStructuredDataScript('blog-data', blogData);
    }

    // 创建单篇博客文章的结构化数据
    createBlogPostStructuredData(post) {
        return {
            "@type": "BlogPosting",
            "headline": post.getTitle(this.currentLanguage),
            "description": post.getExcerpt(this.currentLanguage),
            "url": `${this.siteConfig.siteUrl}#post/${post.getSlug(this.currentLanguage)}`,
            "datePublished": post.publishDate,
            "dateModified": post.lastModified || post.publishDate,
            "author": {
                "@type": "Person",
                "name": post.author || this.siteConfig.author
            },
            "publisher": {
                "@type": "Person",
                "name": this.siteConfig.author
            },
            "keywords": post.tags.join(', '),
            "wordCount": this.estimateWordCount(post.getContent(this.currentLanguage)),
            "timeRequired": `PT${post.getReadingTime(this.currentLanguage)}M`,
            "inLanguage": this.currentLanguage,
            "isPartOf": {
                "@type": "Blog",
                "name": `${this.siteConfig.siteName} - Blog`
            }
        };
    }

    // 添加面包屑导航结构化数据
    addBreadcrumbStructuredData() {
        const breadcrumbData = {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": this.siteConfig.siteUrl
                },
                {
                    "@type": "ListItem",
                    "position": 2,
                    "name": "Blog",
                    "item": `${this.siteConfig.siteUrl}#blog`
                }
            ]
        };

        this.addStructuredDataScript('breadcrumb-data', breadcrumbData);
    }

    // 添加结构化数据脚本
    addStructuredDataScript(id, data) {
        // 移除现有的脚本（如果存在）
        const existingScript = document.getElementById(id);
        if (existingScript) {
            existingScript.remove();
        }

        const script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(data, null, 2);
        document.head.appendChild(script);
    }

    // 优化Meta标签
    optimizeMetaTags() {
        // 基本meta标签
        this.updateMetaTag('description', this.siteConfig.description);
        this.updateMetaTag('keywords', this.siteConfig.keywords.join(', '));
        this.updateMetaTag('author', this.siteConfig.author);
        this.updateMetaTag('robots', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');
        
        // 语言相关
        this.updateMetaTag('language', this.currentLanguage);
        document.documentElement.lang = this.currentLanguage;
        
        // 移动端优化
        this.updateMetaTag('viewport', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
        this.updateMetaTag('mobile-web-app-capable', 'yes');
        this.updateMetaTag('apple-mobile-web-app-capable', 'yes');
        this.updateMetaTag('apple-mobile-web-app-status-bar-style', 'default');
        
        // 安全相关
        this.updateMetaTag('referrer', 'strict-origin-when-cross-origin');
        
        // 性能相关
        this.addLinkTag('dns-prefetch', '//fonts.googleapis.com');
        this.addLinkTag('dns-prefetch', '//fonts.gstatic.com');
        this.addLinkTag('preconnect', 'https://fonts.googleapis.com', true);
        this.addLinkTag('preconnect', 'https://fonts.gstatic.com', true);
    }

    // 添加Open Graph标签
    addOpenGraphTags() {
        const ogTags = {
            'og:type': 'website',
            'og:site_name': this.siteConfig.siteName,
            'og:title': this.siteConfig.siteName,
            'og:description': this.siteConfig.description,
            'og:url': this.siteConfig.siteUrl,
            'og:image': `${this.siteConfig.siteUrl}/images/og-image.jpg`,
            'og:image:width': '1200',
            'og:image:height': '630',
            'og:image:alt': `${this.siteConfig.siteName} - Preview Image`,
            'og:locale': this.currentLanguage === 'zh' ? 'zh_CN' : 'en_US'
        };

        if (this.siteConfig.facebookAppId) {
            ogTags['fb:app_id'] = this.siteConfig.facebookAppId;
        }

        Object.entries(ogTags).forEach(([property, content]) => {
            this.updateMetaTag(property, content, 'property');
        });
    }

    // 添加Twitter Card标签
    addTwitterCardTags() {
        const twitterTags = {
            'twitter:card': 'summary_large_image',
            'twitter:site': this.siteConfig.twitterHandle,
            'twitter:creator': this.siteConfig.twitterHandle,
            'twitter:title': this.siteConfig.siteName,
            'twitter:description': this.siteConfig.description,
            'twitter:image': `${this.siteConfig.siteUrl}/images/twitter-card.jpg`,
            'twitter:image:alt': `${this.siteConfig.siteName} - Preview Image`
        };

        Object.entries(twitterTags).forEach(([name, content]) => {
            this.updateMetaTag(name, content, 'name');
        });
    }

    // 添加规范链接
    addCanonicalLinks() {
        // 主页规范链接
        this.updateLinkTag('canonical', this.siteConfig.siteUrl);
        
        // 多语言链接
        const languages = ['en', 'zh'];
        languages.forEach(lang => {
            const hreflang = lang === 'zh' ? 'zh-CN' : lang;
            this.addLinkTag('alternate', `${this.siteConfig.siteUrl}?lang=${lang}`, false, {
                hreflang: hreflang
            });
        });
        
        // 默认语言链接
        this.addLinkTag('alternate', this.siteConfig.siteUrl, false, {
            hreflang: 'x-default'
        });
    }

    // 设置动态SEO
    setupDynamicSEO() {
        // 监听页面变化
        this.setupPageChangeListener();
        
        // 监听语言变化
        if (this.i18nManager) {
            this.i18nManager.addObserver((newLanguage) => {
                this.currentLanguage = newLanguage;
                this.updateSEOForLanguage(newLanguage);
            });
        }
    }

    // 设置页面变化监听器
    setupPageChangeListener() {
        // 监听URL hash变化
        window.addEventListener('hashchange', () => {
            this.updateSEOForCurrentPage();
        });

        // 监听历史记录变化
        window.addEventListener('popstate', () => {
            this.updateSEOForCurrentPage();
        });
    }

    // 更新当前页面的SEO
    updateSEOForCurrentPage() {
        const hash = window.location.hash;
        
        if (hash.startsWith('#post/')) {
            this.updateSEOForBlogPost(hash);
        } else if (hash === '#blog') {
            this.updateSEOForBlogPage();
        } else {
            this.updateSEOForHomePage();
        }
    }

    // 更新博客文章页面的SEO
    updateSEOForBlogPost(hash) {
        if (!this.blogDataManager) return;

        const slug = hash.replace('#post/', '');
        const post = this.blogDataManager.getPostBySlug(slug, this.currentLanguage);
        
        if (!post) return;

        const title = `${post.getTitle(this.currentLanguage)} - ${this.siteConfig.siteName}`;
        const description = post.getExcerpt(this.currentLanguage);
        const url = `${this.siteConfig.siteUrl}${hash}`;
        const image = post.featuredImage || `${this.siteConfig.siteUrl}/images/og-image.jpg`;

        // 更新页面标题
        document.title = title;

        // 更新meta标签
        this.updateMetaTag('description', description);
        this.updateMetaTag('keywords', post.tags.join(', '));

        // 更新Open Graph标签
        this.updateMetaTag('og:type', 'article', 'property');
        this.updateMetaTag('og:title', title, 'property');
        this.updateMetaTag('og:description', description, 'property');
        this.updateMetaTag('og:url', url, 'property');
        this.updateMetaTag('og:image', image, 'property');

        // 更新Twitter Card标签
        this.updateMetaTag('twitter:title', title, 'name');
        this.updateMetaTag('twitter:description', description, 'name');
        this.updateMetaTag('twitter:image', image, 'name');

        // 更新规范链接
        this.updateLinkTag('canonical', url);

        // 添加文章特定的结构化数据
        const articleData = {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            ...this.createBlogPostStructuredData(post),
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": url
            }
        };

        this.addStructuredDataScript('current-article-data', articleData);
    }

    // 更新博客页面的SEO
    updateSEOForBlogPage() {
        const title = `Blog - ${this.siteConfig.siteName}`;
        const description = 'Thoughts, insights, and experiences from my journey in technology and development';
        const url = `${this.siteConfig.siteUrl}#blog`;

        document.title = title;
        this.updateMetaTag('description', description);
        this.updateMetaTag('og:title', title, 'property');
        this.updateMetaTag('og:description', description, 'property');
        this.updateMetaTag('og:url', url, 'property');
        this.updateMetaTag('twitter:title', title, 'name');
        this.updateMetaTag('twitter:description', description, 'name');
        this.updateLinkTag('canonical', url);
    }

    // 更新首页的SEO
    updateSEOForHomePage() {
        document.title = this.siteConfig.siteName;
        this.updateMetaTag('description', this.siteConfig.description);
        this.updateMetaTag('og:title', this.siteConfig.siteName, 'property');
        this.updateMetaTag('og:description', this.siteConfig.description, 'property');
        this.updateMetaTag('og:url', this.siteConfig.siteUrl, 'property');
        this.updateMetaTag('twitter:title', this.siteConfig.siteName, 'name');
        this.updateMetaTag('twitter:description', this.siteConfig.description, 'name');
        this.updateLinkTag('canonical', this.siteConfig.siteUrl);
    }

    // 更新语言相关的SEO
    updateSEOForLanguage(language) {
        this.currentLanguage = language;
        document.documentElement.lang = language;
        this.updateMetaTag('language', language);
        
        const locale = language === 'zh' ? 'zh_CN' : 'en_US';
        this.updateMetaTag('og:locale', locale, 'property');
        
        // 重新生成结构化数据
        this.addStructuredData();
    }

    // 添加站点地图
    addSitemap() {
        // 创建XML站点地图内容
        const sitemapContent = this.generateSitemapXML();
        
        // 添加站点地图链接
        this.addLinkTag('sitemap', '/sitemap.xml', false, {
            type: 'application/xml'
        });
        
        // 如果可能，创建站点地图文件（这通常需要服务器端支持）
        console.log('Sitemap XML generated:', sitemapContent);
    }

    // 生成站点地图XML
    generateSitemapXML() {
        const urls = [
            {
                loc: this.siteConfig.siteUrl,
                lastmod: new Date().toISOString().split('T')[0],
                changefreq: 'weekly',
                priority: '1.0'
            },
            {
                loc: `${this.siteConfig.siteUrl}#blog`,
                lastmod: new Date().toISOString().split('T')[0],
                changefreq: 'weekly',
                priority: '0.8'
            }
        ];

        // 添加博客文章URL
        if (this.blogDataManager && this.blogDataManager.isDataLoaded()) {
            const posts = this.blogDataManager.getPublishedPosts(this.currentLanguage);
            posts.forEach(post => {
                urls.push({
                    loc: `${this.siteConfig.siteUrl}#post/${post.getSlug(this.currentLanguage)}`,
                    lastmod: post.lastModified || post.publishDate,
                    changefreq: 'monthly',
                    priority: '0.6'
                });
            });
        }

        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
        
        urls.forEach(url => {
            xml += '  <url>\n';
            xml += `    <loc>${url.loc}</loc>\n`;
            xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
            xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
            xml += `    <priority>${url.priority}</priority>\n`;
            xml += '  </url>\n';
        });
        
        xml += '</urlset>';
        return xml;
    }

    // 添加robots.txt
    addRobotsTxt() {
        const robotsContent = this.generateRobotsTxt();
        console.log('Robots.txt generated:', robotsContent);
    }

    // 生成robots.txt内容
    generateRobotsTxt() {
        return `User-agent: *
Allow: /

# Sitemap
Sitemap: ${this.siteConfig.siteUrl}/sitemap.xml

# Crawl-delay
Crawl-delay: 1

# Disallow admin areas (if any)
Disallow: /admin/
Disallow: /private/

# Allow search engines to index images
Allow: /images/
Allow: /assets/`;
    }

    // 工具方法：更新meta标签
    updateMetaTag(name, content, attribute = 'name') {
        let meta = document.querySelector(`meta[${attribute}="${name}"]`);
        
        if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute(attribute, name);
            document.head.appendChild(meta);
        }
        
        meta.setAttribute('content', content);
    }

    // 工具方法：更新link标签
    updateLinkTag(rel, href) {
        let link = document.querySelector(`link[rel="${rel}"]`);
        
        if (!link) {
            link = document.createElement('link');
            link.rel = rel;
            document.head.appendChild(link);
        }
        
        link.href = href;
    }

    // 工具方法：添加link标签
    addLinkTag(rel, href, crossorigin = false, additionalAttrs = {}) {
        const link = document.createElement('link');
        link.rel = rel;
        link.href = href;
        
        if (crossorigin) {
            link.crossOrigin = 'anonymous';
        }
        
        Object.entries(additionalAttrs).forEach(([key, value]) => {
            link.setAttribute(key, value);
        });
        
        document.head.appendChild(link);
    }

    // 工具方法：估算字数
    estimateWordCount(content) {
        if (!content) return 0;
        
        // 移除HTML标签和Markdown语法
        const cleanContent = content
            .replace(/<[^>]*>/g, ' ')
            .replace(/[#*`_~\[\]()]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        
        // 对于中文内容，按字符计算；对于英文内容，按单词计算
        if (/[\u4e00-\u9fff]/.test(cleanContent)) {
            return cleanContent.replace(/\s/g, '').length;
        } else {
            return cleanContent.split(/\s+/).filter(word => word.length > 0).length;
        }
    }

    // 获取SEO状态
    getSEOStatus() {
        return {
            currentLanguage: this.currentLanguage,
            pageTitle: document.title,
            metaDescription: document.querySelector('meta[name="description"]')?.content,
            canonicalUrl: document.querySelector('link[rel="canonical"]')?.href,
            structuredDataScripts: document.querySelectorAll('script[type="application/ld+json"]').length,
            openGraphTags: document.querySelectorAll('meta[property^="og:"]').length,
            twitterCardTags: document.querySelectorAll('meta[name^="twitter:"]').length
        };
    }

    // 验证SEO设置
    validateSEO() {
        const issues = [];
        
        // 检查页面标题
        if (!document.title || document.title.length < 10) {
            issues.push('Page title is missing or too short');
        }
        
        if (document.title.length > 60) {
            issues.push('Page title is too long (over 60 characters)');
        }
        
        // 检查meta描述
        const description = document.querySelector('meta[name="description"]');
        if (!description || !description.content) {
            issues.push('Meta description is missing');
        } else if (description.content.length < 120) {
            issues.push('Meta description is too short (under 120 characters)');
        } else if (description.content.length > 160) {
            issues.push('Meta description is too long (over 160 characters)');
        }
        
        // 检查规范链接
        if (!document.querySelector('link[rel="canonical"]')) {
            issues.push('Canonical link is missing');
        }
        
        // 检查Open Graph标签
        const requiredOGTags = ['og:title', 'og:description', 'og:image', 'og:url'];
        requiredOGTags.forEach(tag => {
            if (!document.querySelector(`meta[property="${tag}"]`)) {
                issues.push(`${tag} Open Graph tag is missing`);
            }
        });
        
        // 检查结构化数据
        if (document.querySelectorAll('script[type="application/ld+json"]').length === 0) {
            issues.push('No structured data found');
        }
        
        return {
            isValid: issues.length === 0,
            issues: issues,
            score: Math.max(0, 100 - (issues.length * 10))
        };
    }

    // 销毁方法
    destroy() {
        // 移除添加的结构化数据脚本
        document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
            if (script.id && script.id.includes('-data')) {
                script.remove();
            }
        });
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SEOOptimizer;
}