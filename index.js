const fs = require("node:fs/promises");
const express = require("express");
const path = require("node:path");
const app = express();
app.use(express.json());
const port = 3000;
// let users = [];
const filePath = path.resolve("./users.json");
async function getUsers() {
  let users = [];
  try {
    const data = await fs.readFile(filePath);
    if (data !== "") {
      users = JSON.parse(data);
    } else {
      users = [];
    }
    return users;
  } catch (error) {
    console.log(error);
    return [];
  }
}

async function saveUser(users) {
  await fs.writeFile(filePath, JSON.stringify(users, null, 2));
}

// get all users
app.get("/user", async (req, res, next) => {
  const users = await getUsers();

  res.json(users);
});

// Add a new user
app.post("/user", async (req, res, next) => {
  let user = req.body;
  let users = await getUsers();
  const existUser = users.find((user) => user.email === user.email);
  if (existUser) {
    return res.status(400).json({ message: "User already exists" });
  }
  if (users.length < 1) {
    user.id = 1;
  } else {
    user.id = users.at(-1).id + 1;
  }
  users.push(user);
  await saveUser(users);
  res.status(201).json({
    message: "User added successfully",
    success: true,
    data: user,
  });
});

// Update user data
app.patch("/user/:id", express.json(), (req, res, next) => {
  const userId = req.params.id;
  const { id, ...newData } = req.body;
  fs.readFile("users.json", "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error read file" });
    }
    if (data !== "") {
      users = JSON.parse(data);
    } else {
      return res.json({
        success: false,
        message: "no users found",
      });
    }
  });
  //check if the id is correct
  const userIndex = users.findIndex((user) => user.id == userId);

  if (userIndex === -1) {
    return res.status(404).json({
      message: "user Id not found",
      success: false,
    });
  }
  const updatedData = Object.keys(newData);
  users[userIndex] = {
    ...users[userIndex],
    ...newData,
  };

  fs.writeFileSync("users.json", JSON.stringify(users));

  res.json({
    message: `User (${updatedData.join(", ")}) updated successfully`,
  });
});

// delete user data
app.delete("/user/:id", (req, res, next) => {
  const userId = req.params.id;
  fs.readFile("users.json", "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error read file" });
    }
    if (data !== "") {
      users = JSON.parse(data);
    } else {
      return res.json({
        success: false,
        message: "no users found",
      });
    }
  });
  //check if the id is correct
  const userIndex = users.findIndex((user) => user.id == userId);

  if (userIndex === -1) {
    return res.status(404).json({
      message: "user Id not found",
      success: false,
    });
  }
  users.splice(userIndex, 1);

  fs.writeFileSync("users.json", JSON.stringify(users));

  res.json({
    message: "User deleted successfully",
  });
});

// get user by name
app.get("/user/getByName", (req, res, next) => {
  const name = req.query.name;
  fs.readFile("users.json", "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ message: "Error read file" });
    }
    if (data !== "") {
      users = JSON.parse(data);
    }
    const user = users.find((user) =>
      user.name.toLowerCase().includes(name.toLowerCase())
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  });
});

app.listen(port, () => {
  console.log("The server is running on port:", port);
});
