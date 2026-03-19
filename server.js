const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.post("/api/chat", (req, res) => {
  const message = req.body.message || "";

  const reply = "Odpowiedź AI: " + message;

  res.send(reply);
});

app.listen(PORT, () => {
  console.log("Server działa na porcie " + PORT);
});
