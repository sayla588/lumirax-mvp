// 多语言手动优化（配合Google Translate）
function updateLanguageDisplay() {
    const selectedLang = document.querySelector('.goog-te-combo')?.value || 'zh-CN';
    let lang = 'zh';
    if (selectedLang.includes('en')) lang = 'en';
    else if (selectedLang.includes('ja')) lang = 'ja';
    else if (selectedLang.includes('ko')) lang = 'ko';

    document.querySelectorAll('[data-lang]').forEach(el => {
        el.style.display = 'none';
        if (el.getAttribute('data-lang') === lang) {
            el.style.display = '';
        }
    });
}

// Google Translate加载后自动执行
document.addEventListener('DOMContentLoaded', () => {
    const checkTranslate = setInterval(() => {
        if (document.querySelector('.goog-te-combo')) {
            updateLanguageDisplay();
            document.querySelector('.goog-te-combo').addEventListener('change', updateLanguageDisplay);
            clearInterval(checkTranslate);
        }
    }, 500);
});
