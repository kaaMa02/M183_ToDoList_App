const db = require('./db');

async function getHtml({ username, roleid }) {
    let content = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TBZ 'Secure' App</title>
    <link rel="stylesheet" href="/style.css" />
</head>
<body>
    <header>
        <div>This is the insecure m183 test app</div>`;

    if (username) {
        content += `<nav>
            <ul>
                <li><a href="/">Tasks</a></li>`;
        if (roleid === '1') {
            content += `<li><a href="/admin/users">User List</a></li>`;
        }
        content += `<li><a href="/logout">Logout</a></li>
            </ul>
        </nav>`;
    }

    content += `</header><main>`;
    return content;
}

module.exports = getHtml;