const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const path = require('path');

const header = require('./fw/header');
const footer = require('./fw/footer');
const login = require('./login');
const index = require('./index');
const adminUser = require('./admin/users');
const editTask = require('./edit');
const saveTask = require('./savetask');
const search = require('./search');
const searchProvider = require('./search/v2/index');
const MySQLStore = require('express-mysql-session')(session);
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = 3000;

const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME 
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(cookieParser());
app.use(session({
    store: sessionStore,
    secret: 'aVeryStrongSecretHere', // change in production
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // true in production with HTTPS
        maxAge: 1000 * 60 * 60 // 1 hour
    }
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// CSRF
app.use(csurf());
app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

// Session & role check
function activeUserSession(req) {
    return req.session && req.session.username && req.session.userid;
}

function isAdmin(req, res, next) {
    if (activeUserSession(req) && req.session.roleid === '1') {
        next();
    } else {
        res.status(403).send('Access denied. Admins only.');
    }
}

// Routes
app.get('/', async (req, res) => {
    if (activeUserSession(req)) {
        const html = await wrapContent(await index.html(req), req);
        res.send(html);
    } else {
        res.redirect('/login');
    }
});

app.post('/', async (req, res) => {
    if (activeUserSession(req)) {
        const html = await wrapContent(await index.html(req), req);
        res.send(html);
    } else {
        res.redirect('/login');
    }
});

// Admin
app.get('/admin/users', isAdmin, async (req, res) => {
    try {
        const search = req.query.search || '';
        const sort = req.query.sort || 'username';
        const direction = req.query.direction === 'desc' ? 'desc' : 'asc';
        const users = await adminUser.getUsers(search, sort, direction);
        res.render('admin/dashboard', { users, search, sort, direction, csrfToken: req.csrfToken() });
    } catch (err) {
        console.error(err);
        res.status(500).send("Could not load user list.");
    }
});

app.get('/admin/users/data', isAdmin, async (req, res) => {
    try {
        const search = req.query.search || '';
        const sort = req.query.sort || 'username';
        const users = await adminUser.getUsers(search, sort);
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load users' });
    }
});

app.get('/admin/users/create', isAdmin, adminUser.createForm);
app.post('/admin/users/create', isAdmin, adminUser.createUser);
app.get('/admin/users/edit/:id', isAdmin, adminUser.editForm);
app.post('/admin/users/edit/:id', isAdmin, adminUser.updateUser);
app.post('/admin/users/deactivate/:id', isAdmin, adminUser.deactivateUser);
app.post('/admin/users/delete/:id', isAdmin, adminUser.deleteUser);

// Task
app.get('/edit', async (req, res) => {
    if (activeUserSession(req)) {
        const html = await wrapContent(await editTask.html(req), req);
        res.send(html);
    } else {
        res.redirect('/');
    }
});

app.post('/savetask', async (req, res) => {
    if (activeUserSession(req)) {
        const html = await wrapContent(await saveTask.html(req), req);
        res.send(html);
    } else {
        res.redirect('/');
    }
});

// Show login form
app.get('/login', async (req, res) => {
  const html = await wrapContent(login.getHtml(req.csrfToken()), req);
  res.send(html);
});

// Handle login form submission
app.post('/login', async (req, res) => {
  const content = await login.handleLogin(req, res);

  if (content.user && content.user.userid !== 0) {
    req.session.username = content.user.username;
    req.session.userid = content.user.userid;
    req.session.roleid = String(content.user.roleid);
    res.redirect('/');
  } else {
    const html = await wrapContent(content.html, req);
    res.send(html);
  }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.clearCookie('connect.sid');
    res.redirect('/login');
});

// Profile
app.get('/profile', (req, res) => {
    if (activeUserSession(req)) {
        res.send(`Welcome, ${req.session.username}! <a href="/logout">Logout</a>`);
    } else {
        res.send('Please login to view this page');
    }
});

const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 requests
  message: "Too many searches, slow down!"
});

// Search
app.post('/search', searchLimiter, async (req, res) => {
    const html = await search.html(req);
    res.send(html);
});

app.get('/search/v2/', async (req, res) => {
    const result = await searchProvider.search(req);
    res.send(result);
});

// Server start
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Helpers
async function wrapContent(content, req) {
    const headerHtml = await header({
        username: req.session.username,
        roleid: req.session.roleid
    });
    return headerHtml + content + footer;
}