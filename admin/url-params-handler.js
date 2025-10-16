// URL参数处理脚本
document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    const password = urlParams.get('password');
    
    if (username) {
        const usernameField = document.getElementById('username');
        if (usernameField) {
            usernameField.value = username;
        }
    }
    
    if (password) {
        const passwordField = document.getElementById('password');
        if (passwordField) {
            passwordField.value = password;
        }
    }
    
    // 如果URL中有用户名和密码，自动尝试登录
    if (username && password) {
        setTimeout(() => {
            if (window.adminApp && typeof window.adminApp.login === 'function') {
                window.adminApp.login();
            }
        }, 500);
    }
});