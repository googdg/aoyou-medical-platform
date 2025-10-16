/**
 * Blog Data Management Module
 * Handles loading, filtering, and managing blog post data
 */

class BlogDataManager {
    constructor() {
        this.posts = [];
        this.categories = [];
        this.tags = [];
        this.metadata = {};
        this.currentLanguage = 'en';
        this.isLoaded = false;
    }

    /**
     * Load blog data from JSON file
     * @returns {Promise<boolean>} Success status
     */
    async loadData() {
        try {
            const response = await fetch('./data/blog-posts.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            this.posts = data.posts || [];
            this.categories = data.categories || [];
            this.tags = data.tags || [];
            this.metadata = data.metadata || {};
            
            // Set default language from metadata
            if (this.metadata.defaultLanguage) {
                this.currentLanguage = this.metadata.defaultLanguage;
            }
            
            this.isLoaded = true;
            return true;
        } catch (error) {
            console.error('Error loading blog data:', error);
            this.isLoaded = false;
            return false;
        }
    }

    /**
     * Get all published posts
     * @param {string} language - Language code (optional)
     * @returns {Array} Array of published posts
     */
    getPublishedPosts(language = null) {
        const lang = language || this.currentLanguage;
        return this.posts
            .filter(post => post.published && post.language.includes(lang))
            .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
    }

    /**
     * Get featured posts
     * @param {string} language - Language code (optional)
     * @returns {Array} Array of featured posts
     */
    getFeaturedPosts(language = null) {
        return this.getPublishedPosts(language)
            .filter(post => post.featured);
    }

    /**
     * Get post by ID
     * @param {string} id - Post ID
     * @returns {Object|null} Post object or null if not found
     */
    getPostById(id) {
        return this.posts.find(post => post.id === id) || null;
    }

    /**
     * Get post by slug
     * @param {string} slug - Post slug
     * @param {string} language - Language code (optional)
     * @returns {Object|null} Post object or null if not found
     */
    getPostBySlug(slug, language = null) {
        const lang = language || this.currentLanguage;
        return this.posts.find(post => 
            post.slug[lang] === slug && post.language.includes(lang)
        ) || null;
    }

    /**
     * Get posts by category
     * @param {string} categoryId - Category ID
     * @param {string} language - Language code (optional)
     * @returns {Array} Array of posts in the category
     */
    getPostsByCategory(categoryId, language = null) {
        return this.getPublishedPosts(language)
            .filter(post => post.category === categoryId);
    }

    /**
     * Get posts by tag
     * @param {string} tag - Tag name
     * @param {string} language - Language code (optional)
     * @returns {Array} Array of posts with the tag
     */
    getPostsByTag(tag, language = null) {
        return this.getPublishedPosts(language)
            .filter(post => post.tags.includes(tag));
    }

    /**
     * Search posts by title and content
     * @param {string} query - Search query
     * @param {string} language - Language code (optional)
     * @returns {Array} Array of matching posts
     */
    searchPosts(query, language = null) {
        const lang = language || this.currentLanguage;
        const searchTerm = query.toLowerCase();
        
        return this.getPublishedPosts(lang).filter(post => {
            const title = post.title[lang]?.toLowerCase() || '';
            const excerpt = post.excerpt[lang]?.toLowerCase() || '';
            const content = post.content[lang]?.toLowerCase() || '';
            const tags = post.tags.join(' ').toLowerCase();
            
            return title.includes(searchTerm) || 
                   excerpt.includes(searchTerm) || 
                   content.includes(searchTerm) ||
                   tags.includes(searchTerm);
        });
    }

    /**
     * Get all categories
     * @returns {Array} Array of categories
     */
    getCategories() {
        return this.categories;
    }

    /**
     * Get category by ID
     * @param {string} categoryId - Category ID
     * @returns {Object|null} Category object or null if not found
     */
    getCategoryById(categoryId) {
        return this.categories.find(cat => cat.id === categoryId) || null;
    }

    /**
     * Get all tags
     * @returns {Array} Array of tags
     */
    getTags() {
        return this.tags;
    }

    /**
     * Get posts count by category
     * @param {string} language - Language code (optional)
     * @returns {Object} Object with category counts
     */
    getPostCountsByCategory(language = null) {
        const posts = this.getPublishedPosts(language);
        const counts = {};
        
        this.categories.forEach(category => {
            counts[category.id] = posts.filter(post => post.category === category.id).length;
        });
        
        return counts;
    }

    /**
     * Get posts count by tag
     * @param {string} language - Language code (optional)
     * @returns {Object} Object with tag counts
     */
    getPostCountsByTag(language = null) {
        const posts = this.getPublishedPosts(language);
        const counts = {};
        
        this.tags.forEach(tag => {
            counts[tag] = posts.filter(post => post.tags.includes(tag)).length;
        });
        
        return counts;
    }

    /**
     * Set current language
     * @param {string} language - Language code
     */
    setLanguage(language) {
        if (this.metadata.languages && this.metadata.languages.includes(language)) {
            this.currentLanguage = language;
        }
    }

    /**
     * Get current language
     * @returns {string} Current language code
     */
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    /**
     * Get available languages
     * @returns {Array} Array of available language codes
     */
    getAvailableLanguages() {
        return this.metadata.languages || ['en'];
    }

    /**
     * Get metadata
     * @returns {Object} Metadata object
     */
    getMetadata() {
        return this.metadata;
    }

    /**
     * Check if data is loaded
     * @returns {boolean} Load status
     */
    isDataLoaded() {
        return this.isLoaded;
    }

    /**
     * Get recent posts
     * @param {number} limit - Number of posts to return
     * @param {string} language - Language code (optional)
     * @returns {Array} Array of recent posts
     */
    getRecentPosts(limit = 5, language = null) {
        return this.getPublishedPosts(language).slice(0, limit);
    }

    /**
     * Get related posts based on tags and category
     * @param {Object} post - Reference post
     * @param {number} limit - Number of related posts to return
     * @param {string} language - Language code (optional)
     * @returns {Array} Array of related posts
     */
    getRelatedPosts(post, limit = 3, language = null) {
        const lang = language || this.currentLanguage;
        const allPosts = this.getPublishedPosts(lang);
        
        // Exclude the current post
        const otherPosts = allPosts.filter(p => p.id !== post.id);
        
        // Score posts based on shared tags and category
        const scoredPosts = otherPosts.map(p => {
            let score = 0;
            
            // Same category gets higher score
            if (p.category === post.category) {
                score += 3;
            }
            
            // Shared tags get points
            const sharedTags = p.tags.filter(tag => post.tags.includes(tag));
            score += sharedTags.length;
            
            return { post: p, score };
        });
        
        // Sort by score and return top results
        return scoredPosts
            .sort((a, b) => b.score - a.score)
            .slice(0, limit)
            .map(item => item.post);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlogDataManager;
} else if (typeof window !== 'undefined') {
    window.BlogDataManager = BlogDataManager;
}