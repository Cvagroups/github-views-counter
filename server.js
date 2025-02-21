const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const app = express();
const port = 3000;

// SQLite Database Setup
const db = new sqlite3.Database("./views.db", (err) => {
    if (err) {
        console.error(err.message);
    } else {
        console.log("Connected to SQLite database.");
        db.run("CREATE TABLE IF NOT EXISTS views (repo TEXT PRIMARY KEY, count INTEGER)");
    }
});

// Route to Track and Show Views
app.get("/view/:repo", (req, res) => {
    const repo = req.params.repo;

    db.get("SELECT count FROM views WHERE repo = ?", [repo], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).send("Database error");
            return;
        }

        let count = row ? row.count + 1 : 1;
        if (row) {
            db.run("UPDATE views SET count = ? WHERE repo = ?", [count, repo]);
        } else {
            db.run("INSERT INTO views (repo, count) VALUES (?, ?)", [repo, count]);
        }

        res.send(`
            <html>
            <head>
                <title>GitHub Views Counter</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                        background-color: #f4f4f4;
                        padding: 20px;
                    }
                    .counter-box {
                        background: white;
                        padding: 20px;
                        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
                        border-radius: 10px;
                        display: inline-block;
                        margin-top: 20px;
                        transition: transform 0.3s ease;
                    }
                    .counter-box:hover {
                        transform: scale(1.05);
                    }
                    .repo-badge {
                        display: inline-block;
                        background-color: #007bff;
                        color: white;
                        padding: 6px 12px;
                        border-radius: 20px;
                        font-weight: bold;
                        margin-bottom: 10px;
                    }
                    .counter {
                        font-size: 28px;
                        font-weight: bold;
                        color: #007bff;
                    }
                </style>
            </head>
            <body>
                <h2>GitHub Views Counter</h2>
                <div class="counter-box">
                    <p class="repo-badge">${repo}</p>
                    <p class="counter">👀 Views: ${count}</p>
                </div>
                <script>
                    setTimeout(() => { location.reload(); }, 5000);
                </script>
            </body>
            </html>
        `);
    });
});

// Start the Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
