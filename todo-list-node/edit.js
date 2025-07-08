const db = require('./fw/db');

async function getHtml(req) {
    let title = '';
    let state = '';
    let taskId = req.query.id || '';
    const options = ["Open", "In Progress", "Done"];
    let html = '';

    if (taskId) {
        const conn = await db.connectDB();
        const [result] = await conn.query('SELECT ID, title, state FROM tasks WHERE ID = ?', [taskId]);
        if (result.length > 0) {
            title = result[0].title;
            state = result[0].state;
        }
        html += `<h1>Edit Task</h1>`;
    } else {
        html += `<h1>Create Task</h1>`;
    }

    html += `
    <form id="form" method="post" action="savetask">
        <input type="hidden" name="id" value="${taskId}" />
        <div class="form-group">
            <label for="title">Description</label>
            <input type="text" class="form-control size-medium" name="title" id="title" value="${escapeHtml(title)}">
        </div>
        <div class="form-group">
            <label for="state">State</label>
            <select name="state" id="state" class="size-auto">`;

    for (const element of options) {
        const selected = state === element.toLowerCase() ? 'selected' : '';
        html += `<option value="${element.toLowerCase()}" ${selected}>${element}</option>`;
    }

    html += `
            </select>
        </div>
        <div class="form-group">
            <label for="submit"></label>
            <input id="submit" type="submit" class="btn size-auto" value="Submit" />
        </div>
    </form>
    <script>
        $(document).ready(function () {
            $('#form').validate({
                rules: {
                    title: { required: true }
                },
                messages: {
                    title: 'Please enter a description.',
                },
                submitHandler: function (form) {
                    form.submit();
                }
            });
        });
    </script>`;

    return html;
}

function escapeHtml(text) {
    return text.replace(/[&<>"']/g, function (char) {
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return map[char];
    });
}

module.exports = { html: getHtml };