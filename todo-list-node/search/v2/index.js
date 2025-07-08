const db = require('../../fw/db');

async function search(req) {
    if (req.query.userid === undefined || req.query.terms === undefined){
        return "Not enough information to search";
    }

    const userid = parseInt(req.query.userid);
    const terms = `%${req.query.terms}%`;

    const sql = "SELECT ID, title, state FROM tasks WHERE userID = ? AND title LIKE ?";
    const stmt = await db.executeStatement(sql, [userid, terms]);

    let result = '';
    if (stmt.length > 0) {
        stmt.forEach(row => {
            result += `${row.title} (${row.state})<br />`;
        });
    }

    return result;
}

module.exports = { search };