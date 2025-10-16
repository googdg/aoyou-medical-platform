/**
 * Blog Data Models
 * Defines the structure and validation for blog-related data
 */

/**
 * Blog Post Model
 */
class BlogPost {
    constructor(data) {
        this.id = data.id || '';
        this.title = data.title || {};
        this.slug = data.slug || {};
        this.excerpt = data.excerpt || {};
        this.content = data.content || {};
        this.author = data.author || '';
        this.publishDate = data.publishDate || new Date().toISOString().split('T')[0];
        this.lastModified = data.lastModified || this.publishDate;
        this.tags = data.tags || [];
        this.category = data.category || '';
        this.language = data.language || ['en'];
        this.featured = data.featured || false;
        this.published = data.published || false;
        this.readingTime = data.readingTime || {};
        this.seo = data.seo || {};
        
        // Validate required fields
        this.validate();
    }

    /**
     * Validate the blog post data
     * @throws {Error} If validation fails
     */
    validate() {
        if (!this.id) {
            throw new Error('Blog post ID is required');
        }
        
        if (!this.title || Object.keys(this.title).length === 0) {
            throw new Error('Blog post title is required');
        }
        
        if (!this.content || Object.keys(this.content).length === 0) {
            throw new Error('Blog post content is required');
        }
        
        if (!this.author) {
            throw new Error('Blog post author is required');
        }
        
        // Validate date format
        if (!this.isValidDate(this.publishDate)) {
            throw new Error('Invalid publish date format. Use YYYY-MM-DD');
        }
        
        if (!this.isValidDate(this.lastModified)) {
            throw new Error('Invalid last modified date format. Use YYYY-MM-DD');
        }
    }

    /**
     * Check if a date string is valid
     * @param {string} dateString - Date in YYYY-MM-DD format
     * @returns {boolean} True if valid
     */
    isValidDate(dateString) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        if (!regex.test(dateString)) return false;
        
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    /**
     * Get title in specified language
     * @param {string} language - Language code
     * @returns {string} Title in the specified language
     */
    getTitle(language = 'en') {
        return this.title[language] || this.title[Object.keys(this.title)[0]] || '';
    }

    /**
     * Get excerpt in specified language
     * @param {string} language - Language code
     * @returns {string} Excerpt in the specified language
     */
    getExcerpt(language = 'en') {
        return this.excerpt[language] || this.excerpt[Object.keys(this.excerpt)[0]] || '';
    }

    /**
     * Get content in specified language
     * @param {string} language - Language code
     * @returns {string} Content in the specified language
     */
    getContent(language = 'en') {
        return this.content[language] || this.content[Object.keys(this.content)[0]] || '';
    }

    /**
     * Get slug in specified language
     * @param {string} language - Language code
     * @returns {string} Slug in the specified language
     */
    getSlug(language = 'en') {
        return this.slug[language] || this.slug[Object.keys(this.slug)[0]] || this.id;
    }

    /**
     * Get reading time in specified language
     * @param {string} language - Language code
     * @returns {number} Reading time in minutes
     */
    getReadingTime(language = 'en') {
        return this.readingTime[language] || this.readingTime[Object.keys(this.readingTime)[0]] || 0;
    }

    /**
     * Get SEO meta description in specified language
     * @param {string} language - Language code
     * @returns {string} Meta description
     */
    getMetaDescription(language = 'en') {
        return this.seo.metaDescription?.[language] || 
               this.seo.metaDescription?.[Object.keys(this.seo.metaDescription || {})[0]] || 
               this.getExcerpt(language);
    }

    /**
     * Check if post is available in specified language
     * @param {string} language - Language code
     * @returns {boolean} True if available
     */
    isAvailableInLanguage(language) {
        return this.language.includes(language);
    }

    /**
     * Get formatted publish date
     * @param {string} locale - Locale for formatting (optional)
     * @returns {string} Formatted date
     */
    getFormattedPublishDate(locale = 'en-US') {
        const date = new Date(this.publishDate);
        return date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Get URL-friendly slug
     * @param {string} language - Language code
     * @returns {string} URL-friendly slug
     */
    getUrlSlug(language = 'en') {
        const slug = this.getSlug(language);
        return slug.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    }

    /**
     * Convert to JSON
     * @returns {Object} JSON representation
     */
    toJSON() {
        return {
            id: this.id,
            title: this.title,
            slug: this.slug,
            excerpt: this.excerpt,
            content: this.content,
            author: this.author,
            publishDate: this.publishDate,
            lastModified: this.lastModified,
            tags: this.tags,
            category: this.category,
            language: this.language,
            featured: this.featured,
            published: this.published,
            readingTime: this.readingTime,
            seo: this.seo
        };
    }
}

/**
 * Blog Category Model
 */
class BlogCategory {
    constructor(data) {
        this.id = data.id || '';
        this.name = data.name || {};
        this.description = data.description || {};
        this.slug = data.slug || {};
        
        this.validate();
    }

    /**
     * Validate the category data
     * @throws {Error} If validation fails
     */
    validate() {
        if (!this.id) {
            throw new Error('Category ID is required');
        }
        
        if (!this.name || Object.keys(this.name).length === 0) {
            throw new Error('Category name is required');
        }
    }

    /**
     * Get name in specified language
     * @param {string} language - Language code
     * @returns {string} Name in the specified language
     */
    getName(language = 'en') {
        return this.name[language] || this.name[Object.keys(this.name)[0]] || '';
    }

    /**
     * Get description in specified language
     * @param {string} language - Language code
     * @returns {string} Description in the specified language
     */
    getDescription(language = 'en') {
        return this.description[language] || this.description[Object.keys(this.description)[0]] || '';
    }

    /**
     * Get slug in specified language
     * @param {string} language - Language code
     * @returns {string} Slug in the specified language
     */
    getSlug(language = 'en') {
        return this.slug[language] || this.slug[Object.keys(this.slug)[0]] || this.id;
    }

    /**
     * Convert to JSON
     * @returns {Object} JSON representation
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            slug: this.slug
        };
    }
}

/**
 * Blog Metadata Model
 */
class BlogMetadata {
    constructor(data) {
        this.totalPosts = data.totalPosts || 0;
        this.lastUpdated = data.lastUpdated || new Date().toISOString().split('T')[0];
        this.languages = data.languages || ['en'];
        this.defaultLanguage = data.defaultLanguage || 'en';
        this.version = data.version || '1.0.0';
        this.author = data.author || '';
        this.description = data.description || {};
        this.keywords = data.keywords || [];
    }

    /**
     * Get description in specified language
     * @param {string} language - Language code
     * @returns {string} Description in the specified language
     */
    getDescription(language = 'en') {
        return this.description[language] || this.description[this.defaultLanguage] || '';
    }

    /**
     * Check if language is supported
     * @param {string} language - Language code
     * @returns {boolean} True if supported
     */
    isLanguageSupported(language) {
        return this.languages.includes(language);
    }

    /**
     * Convert to JSON
     * @returns {Object} JSON representation
     */
    toJSON() {
        return {
            totalPosts: this.totalPosts,
            lastUpdated: this.lastUpdated,
            languages: this.languages,
            defaultLanguage: this.defaultLanguage,
            version: this.version,
            author: this.author,
            description: this.description,
            keywords: this.keywords
        };
    }
}

/**
 * Utility functions for blog data
 */
class BlogUtils {
    /**
     * Calculate reading time based on content
     * @param {string} content - Blog post content
     * @param {number} wordsPerMinute - Average reading speed (default: 200)
     * @returns {number} Reading time in minutes
     */
    static calculateReadingTime(content, wordsPerMinute = 200) {
        const wordCount = content.trim().split(/\s+/).length;
        const readingTime = Math.ceil(wordCount / wordsPerMinute);
        return Math.max(1, readingTime); // Minimum 1 minute
    }

    /**
     * Generate slug from title
     * @param {string} title - Title to convert
     * @returns {string} URL-friendly slug
     */
    static generateSlug(title) {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    }

    /**
     * Extract excerpt from content
     * @param {string} content - Full content
     * @param {number} maxLength - Maximum excerpt length (default: 160)
     * @returns {string} Excerpt
     */
    static generateExcerpt(content, maxLength = 160) {
        // Remove markdown formatting
        const plainText = content
            .replace(/#{1,6}\s+/g, '') // Remove headers
            .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
            .replace(/\*(.*?)\*/g, '$1') // Remove italic
            .replace(/`(.*?)`/g, '$1') // Remove inline code
            .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
            .replace(/\n+/g, ' ') // Replace newlines with spaces
            .trim();

        if (plainText.length <= maxLength) {
            return plainText;
        }

        // Find the last complete word within the limit
        const truncated = plainText.substring(0, maxLength);
        const lastSpace = truncated.lastIndexOf(' ');
        
        return lastSpace > 0 
            ? truncated.substring(0, lastSpace) + '...'
            : truncated + '...';
    }

    /**
     * Validate blog post data structure
     * @param {Object} postData - Raw post data
     * @returns {boolean} True if valid
     */
    static validatePostData(postData) {
        try {
            new BlogPost(postData);
            return true;
        } catch (error) {
            console.error('Post validation failed:', error.message);
            return false;
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BlogPost, BlogCategory, BlogMetadata, BlogUtils };
} else if (typeof window !== 'undefined') {
    window.BlogPost = BlogPost;
    window.BlogCategory = BlogCategory;
    window.BlogMetadata = BlogMetadata;
    window.BlogUtils = BlogUtils;
}