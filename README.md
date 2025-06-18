# 🛡️ LB2 Phase 1 - Secure ToDo App

This project is a hardened version of a Node.js ToDo app built for **LB2 Phase 1 – Penetration Testing and Security Implementation**.  
It addresses vulnerabilities in the original app by applying secure coding practices and protecting critical features.

---

## 🛠️ Tools Required
Before getting started, make sure the following tools are installed:

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [VS Code](https://code.visualstudio.com/) or any code editor
- A modern browser (e.g., Chrome/Firefox) with **DevTools** (press `F12`)

---

## 🚀 Getting Started

### 1. 📥 Clone the Project

```bash
git clone <repository-url>
```

### 2. 📁 Open the Project Folder "M183_ToDoList_App"

<p>recommended IDE: VSCode</p>

## 3. 📦 Installation
Open the integrated terminal in VSCode/IDE you are using. Make sure you are inside the todo-liste-node folder: 
```bash
cd todo-liste-node
```

Install the required Node.js packages:
```bash
npm install
```

Start the app using Docker:
```bash
docker-compose up --build -d
```
This will start the Node.js app and the database. Access the app at:
```bash
localhost
```


## 👤 Default Login Credentials

| Role  | Username  | Password       |
| ----- | --------- | -------------- |
| Admin | admin1    | Awesome.Pass34 |
| User  | user1     | Amazing.Pass23 |


## ✅ Security Features Implemented

| # | Security Feature                | Status |
| - | ------------------------------- | ------ |
| 1 | Secure Session-Based Login      | ✅ Done |
| 2 | CSRF Protection (using `csurf`) | ✅ Done |
| 3 | XSS Prevention (`ejs` escaping) | ✅ Done |
| 4 | User Authentication + AuthZ     | ✅ Done |
| 5 | Admin CRUD (Create, Edit, etc.) | ✅ Done |
| 6 | Sort & Search Users             | ✅ Done |
| 7 | Password Hashing (bcrypt)       | ✅ Done |
| 8 | Access Control on Routes        | ✅ Done |


