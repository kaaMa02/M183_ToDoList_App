const db = require('../fw/db');

async function getHtml(req) {
    let html = `
    <section id="list">
        <a href="edit">Create Task</a>
        <table>
            <tr>
                <th>ID</th>
                <th>Description</th>
                <th>State</th>
                <th></th>
            </tr>`;

    const conn = await db.connectDB();
    const userid = req.session.userid;  // Use session instead of cookie!
    const [result] = await conn.query('SELECT ID, title, state FROM tasks WHERE UserID = ?', [userid]);

    result.forEach(row => {
        html += `
            <tr>
                <td>${row.ID}</td>
                <td class="wide">${escapeHtml(row.title)}</td>
                <td>${ucfirst(row.state)}</td>
                <td>
                    <a href="edit?id=${row.ID}">edit</a> | <a href="delete?id=${row.ID}">delete</a>
                </td>
            </tr>`;
    });

    html += `
        </table>
    </section>`;

    return html;
}

function escapeHtml(text) {
    return text.replace(/[&<>"']/g, function (char) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return map[char];
    });
}

function ucfirst(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = { html: getHtml };