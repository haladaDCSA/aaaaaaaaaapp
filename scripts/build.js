const fs = require('fs').promises;
const path = require('path');

async function build() {
    try {
        console.log('🔄 Starting build process...');

        // Create all required directories
        const dirs = [
            'public',
            'netlify/functions',
            '.netlify/functions'
        ];

        for (const dir of dirs) {
            await fs.mkdir(path.join(__dirname, '..', dir), { recursive: true });
            console.log(`✅ Created directory: ${dir}`);
        }

        // Ensure bot.js exists in source directory
        const botJsSource = path.join(__dirname, '..', 'netlify', 'functions', 'bot.js');
        const botJsDest = path.join(__dirname, '..', '.netlify', 'functions', 'bot.js');

        await fs.copyFile(botJsSource, botJsDest);
        console.log('✅ Copied bot.js to functions directory');

        // Create index.html
        const indexHtml = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <title>بوت العراف 🔮</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="text-align: center; font-family: system-ui; padding: 2rem;">
    <h1>🔮 بوت العراف</h1>
    <p>الخادم يعمل بنجاح</p>
    <p><a href="https://t.me/al3raf_bot">@al3raf_bot</a></p>
</body>
</html>`;

        await fs.writeFile(
            path.join(__dirname, '..', 'public', 'index.html'),
            indexHtml
        );
        console.log('✅ Created index.html');

        console.log('✅ Build completed successfully');
    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
}

build();
