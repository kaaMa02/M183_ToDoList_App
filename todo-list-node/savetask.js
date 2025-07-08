const db = require('./fw/db');

async function getHtml(req) {
    let html = '';
    let taskId = req.body.id || '';
    const title = req.body.title;
    const state = req.body.state;
    const userid = req.session.userid; // use session not cookies!

    const conn = await db.connectDB();

    try {
        if (taskId) {
            const [check] = await conn.query('SELECT UserID FROM tasks WHERE ID = ?', [taskId]);
            if (!check.length || check[0].UserID !== userid) {
                return "<span class='info info-error'>Unauthorized update attempt</span>";
            }

            await conn.query('UPDATE tasks SET title = ?, state = ? WHERE ID = ?', [title, state, taskId]);
        } else {
            await conn.query('INSERT INTO tasks (title, state, userID) VALUES (?, ?, ?)', [title, state, userid]);
        }

        html += "<span class='info info-success'>Update successful</span>";
    } catch (err) {
        console.error(err);
        html += "<span class='info info-error'>Error during update</span>";
    }

    return html;
}

module.exports = { html: getHtml };