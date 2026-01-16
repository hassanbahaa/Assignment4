const fs = require("node:fs");
const express = require("express");
const app = express();
const port = 3000;
let users = [];
app.post("/user", express.json(), (req, res, next) => {
  let body = req.body;
  fs.readFile("users.json", "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error read file" });
    }
    if (data !== "") {
      users = JSON.parse(data);
    }
    const existUser = users.find((user) => user.email === body.email);
    if (existUser) {
      return res.status(400).json({ message: "User already exists" });
    }
    if (users.length < 1) {
      body.id = 1;
    } else {
      body.id = users.at(-1).id + 1;
    }
    users.push(body);

    fs.writeFile("users.json", JSON.stringify(users), (err) => {
      if (err) {
        return res.status(500).json({ message: "Error writing file" });
      }

      res.status(201).json({ message: "User added successfully" });
    });
  });
});

app.listen(port, () => {
  console.log("The server is running on port:", port);
});
