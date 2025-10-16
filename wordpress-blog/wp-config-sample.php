<?php
/**
 * WordPress 基础配置文件
 * 
 * 这个文件包含了 WordPress 的基本配置信息
 * 在 Docker 环境中，大部分配置会通过环境变量自动设置
 */

// ** MySQL 设置 - 这些信息来自你的主机 ** //
/** WordPress 数据库名称 */
define('DB_NAME', getenv('WORDPRESS_DB_NAME') ?: 'wordpress');

/** MySQL 数据库用户名 */
define('DB_USER', getenv('WORDPRESS_DB_USER') ?: 'wordpress');

/** MySQL 数据库密码 */
define('DB_PASSWORD', getenv('WORDPRESS_DB_PASSWORD') ?: 'wordpress_password');

/** MySQL 主机 */
define('DB_HOST', getenv('WORDPRESS_DB_HOST') ?: 'db:3306');

/** 创建数据表时默认的文字编码 */
define('DB_CHARSET', 'utf8mb4');

/** 数据库整理类型 */
define('DB_COLLATE', '');

/**
 * 身份认证密钥与盐
 * 
 * 你可以通过 WordPress.org 密钥生成服务生成这些密钥
 * https://api.wordpress.org/secret-key/1.1/salt/
 */
define('AUTH_KEY',         'put your unique phrase here');
define('SECURE_AUTH_KEY',  'put your unique phrase here');
define('LOGGED_IN_KEY',    'put your unique phrase here');
define('NONCE_KEY',        'put your unique phrase here');
define('AUTH_SALT',        'put your unique phrase here');
define('SECURE_AUTH_SALT', 'put your unique phrase here');
define('LOGGED_IN_SALT',   'put your unique phrase here');
define('NONCE_SALT',       'put your unique phrase here');

/**
 * WordPress 数据表前缀
 */
$table_prefix = getenv('WORDPRESS_TABLE_PREFIX') ?: 'wp_';

/**
 * 开发者专用：WordPress 调试模式
 */
define('WP_DEBUG', false);
define('WP_DEBUG_LOG', false);
define('WP_DEBUG_DISPLAY', false);

/**
 * WordPress 语言设置
 */
define('WPLANG', 'zh_CN');

/**
 * WordPress 文件权限
 */
define('FS_METHOD', 'direct');

/**
 * 内存限制
 */
define('WP_MEMORY_LIMIT', '256M');

/**
 * 自动更新设置
 */
define('WP_AUTO_UPDATE_CORE', true);

/* 好了！请不要再继续编辑。请保存本文件。使用愉快！ */

/** WordPress 目录的绝对路径 */
if ( !defined('ABSPATH') )
    define('ABSPATH', dirname(__FILE__) . '/');

/** 设置 WordPress 变量和包含文件 */
require_once(ABSPATH . 'wp-settings.php');