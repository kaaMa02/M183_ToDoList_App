const db = require('../fw/db');
const bcrypt = require('bcrypt');

// View all users
async function getUsers(search = '', sort = 'username', direction = 'asc') {
    try {
        const conn = await db.connectDB();

        let baseQuery = `
            SELECT users.ID as id, users.username, roles.title as role, roles.ID as roleid,
                   EXISTS (SELECT 1 FROM permissions WHERE permissions.userID = users.ID) AS active
            FROM users
            LEFT JOIN permissions ON users.ID = permissions.userID
            LEFT JOIN roles ON permissions.roleID = roles.ID
            WHERE users.username LIKE ?
        `;

        const allowedSort = ['username', 'role'];
        const allowedDirection = ['asc', 'desc'];
        const orderBy = allowedSort.includes(sort) ? sort : 'username';
        const dir = allowedDirection.includes(direction.toLowerCase()) ? direction.toUpperCase() : 'ASC';

        baseQuery += ` ORDER BY ${orderBy === 'role' ? 'roles.title' : 'users.username'} ${dir}`;

        const [rows] = await conn.query(baseQuery, [`%${search}%`]);
        return rows;
    } catch (err) {
        console.error(err);
        throw new Error("Error loading users");
    }
}

// Render form to create user
function createForm(req, res) {
    res.render('admin/create', {
        csrfToken: req.csrfToken()
    });
}

// Handle user creation
async function createUser(req, res) {
    const { username, password } = req.body;
    let conn = await db.connectDB();
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [userInsert] = await conn.query(
            `INSERT INTO users (username, password) VALUES (?, ?)`, 
            [username, hashedPassword]
        );
        const newUserId = userInsert.insertId;
        const selectedRole = req.body.role || 2;
        await conn.query(`INSERT INTO permissions (userID, roleID) VALUES (?, ?)`, [newUserId, selectedRole]);

        res.redirect('/admin/users');
    } catch (e) {
        console.error(e);
        res.status(500).send("Internal Server Error");
    }
}

// Render edit form
async function editForm(req, res) {
    let conn = await db.connectDB();
    try {
        const [userResult] = await conn.query(`
            SELECT users.ID as id, users.username, users.password, roles.ID as roleid
            FROM users
            INNER JOIN permissions ON users.ID = permissions.userID
            INNER JOIN roles ON permissions.roleID = roles.ID
            WHERE users.ID = ?`, [req.params.id]);

        const user = userResult[0];
        res.render('admin/edit', {
            user,
            csrfToken: req.csrfToken()
        });
    } catch (e) {
        console.error(e);
        res.status(500).send("Internal Server Error");
    }
}


// Handle user update
async function updateUser(req, res) {
    const { username, password, role } = req.body;
    const userId = req.params.id;
    let conn = await db.connectDB();

    try {
        if (password && password.trim() !== "") {
            const hashedPassword = await bcrypt.hash(password, 10);
            await conn.query(`UPDATE users SET username = ?, password = ? WHERE ID = ?`, [username, hashedPassword, userId]);
        } else {
            await conn.query(`UPDATE users SET username = ? WHERE ID = ?`, [username, userId]);
        }

        await conn.query(`UPDATE permissions SET roleID = ? WHERE userID = ?`, [role, userId]);
        res.redirect('/admin/users');
    } catch (e) {
        console.error(e);
        res.status(500).send("Internal Server Error");
    }
}


// Deactivate user
async function deactivateUser(req, res) {
    let conn = await db.connectDB();
    try {
        await conn.query(`DELETE FROM permissions WHERE userID = ?`, [req.params.id]);
        res.redirect('/admin/users');
    } catch (e) {
        console.error(e);
        res.status(500).send("Internal Server Error");
    }
}

// Delete user
async function deleteUser(req, res) {
    let conn = await db.connectDB();
    try {
        await conn.query(`DELETE FROM users WHERE ID = ?`, [req.params.id]);
        res.redirect('/admin/users');
    } catch (e) {
        console.error(e);
        res.status(500).send("Internal Server Error");
    }
}

module.exports = {
    getUsers,
    createForm,
    createUser,
    editForm,
    updateUser,
    deactivateUser,
    deleteUser
};