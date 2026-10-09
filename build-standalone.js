const fs = require('fs');

const mainCss = fs.readFileSync('css/main.css', 'utf8');
const compCss = fs.readFileSync('css/components.css', 'utf8');
const dashCss = fs.readFileSync('css/dashboard.css', 'utf8');

const dataJs = fs.readFileSync('js/data.js', 'utf8');
const storeJs = fs.readFileSync('js/store.js', 'utf8');
const audioJs = fs.readFileSync('js/audio-engine.js', 'utf8');
const adminJs = fs.readFileSync('js/admin.js', 'utf8');
const custJs = fs.readFileSync('js/customer.js', 'utf8');
const appJs = fs.readFileSync('js/app.js', 'utf8');

let html = fs.readFileSync('index.html', 'utf8');

// Replace CSS links
const cssPattern = /<!-- Stylesheets -->[\s\S]*?<link rel="stylesheet" href="css\/dashboard\.css">/;
const cssReplacement = `<!-- Embedded Stylesheets -->\n  <style>\n${mainCss}\n${compCss}\n${dashCss}\n  </style>`;
html = html.replace(cssPattern, cssReplacement);

// Replace JS scripts
const jsPattern = /<!-- Core JavaScript Modules -->[\s\S]*?<script src="js\/app\.js"><\/script>/;
const jsReplacement = `<!-- Core JavaScript Modules (Bundled) -->\n  <script>\n${dataJs}\n${storeJs}\n${audioJs}\n${adminJs}\n${custJs}\n${appJs}\n  </script>`;
html = html.replace(jsPattern, jsReplacement);

fs.writeFileSync('standalone.html', html, 'utf8');
console.log('standalone.html created successfully! Size:', fs.statSync('standalone.html').size, 'bytes');
