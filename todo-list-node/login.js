const db = require('./fw/db');
const bcrypt = require('bcrypt');

async function handleLogin(req, res) {
    let msg = '';
    let user = { 'username': '', 'userid': 0 };

    if (req.body && req.body.username && req.body.password) {
    const result = await validateLogin(req.body.username, req.body.password);

    if (result.valid) {
        user.username = req.body.username;
        user.userid = result.userId;
        user.roleid = result.roleId;
        msg = result.msg;
    } else {
        msg = result.msg;
    }
}
    return { 'html': msg + getHtml(req.csrfToken()), 'user': user };
}

async function validateLogin(username, password) {
    let result = { valid: false, msg: '', userId: 0, roleId: 0 };
    const dbConnection = await db.connectDB();

    const sql = `
        SELECT users.ID as id, users.username, users.password, roles.ID as roleid
        FROM users
        JOIN permissions ON users.ID = permissions.userID
        JOIN roles ON permissions.roleID = roles.ID
        WHERE users.username = ?
    `;

    try {
        const [results] = await dbConnection.query(sql, [username]);

        if(results.length > 0) {
            const db_id = results[0].id;
            const db_password = results[0].password;

            const match = await bcrypt.compare(password, db_password);
            if (match) {
                result.valid = true;
                result.userId = db_id;
                result.roleId = results[0].roleid;
                result.msg = 'login correct';
            } else {
                result.msg = 'Username or password is incorrect';
            }
        } else {
            result.msg = 'Username or password is incorrect';
        }
    } catch (err) {
        console.log(err);
    }

    return result;
}

function getHtml(csrfToken = '') {
    return `
    <h2>Login</h2>
    <form id="form" method="POST" action="/login">
        <input type="hidden" name="_csrf" value="${csrfToken}">
        <div class="form-group">
            <label for="username">Username</label>
            <input type="text" class="form-control size-medium" name="username" id="username">
        </div>
        <div class="form-group">
            <label for="password">Password</label>
            <input type="password" class="form-control size-medium" name="password" id="password">
        </div>
        <div class="form-group">
            <label for="submit" ></label>
            <input id="submit" type="submit" class="btn size-auto" value="Login" />
        </div>
    </form>`;
}

module.exports = {
    handleLogin: handleLogin,
    getHtml: getHtml,
};