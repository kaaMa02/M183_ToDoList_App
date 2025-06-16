const tasklist = require('./user/tasklist');
const bgSearch = require('./user/backgroundsearch');

async function getHtml(req) {
    let taskListHtml = await tasklist.html(req);
    let bgSearchHtml = await bgSearch.html(req);

    return `<h2>Welcome, ${req.session.username}!</h2>` + taskListHtml + '<hr />' + bgSearchHtml;
}

module.exports = {
    html: getHtml
}