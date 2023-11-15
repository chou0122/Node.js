import "dotenv/config";
import express from "express";
import sales from "./data/sales.json" assert { type: "json" };

const app = express();

app.set("view engine", "ejs");

// 定義路由
app.get("/", (req, res) => {
  res.render("home", { name: "Shinder" });
});

app.get("/json-sales", (req, res) => {
  res.render("json-sales", { sales });
});

app.get("/try-qs", (req, res) => {
  res.json(req.query);
});

const urlencodedParser = express.urlencoded({extended: false})
app.post("/try-post", [urlencodedParser], (req, res) => {
  console.log('req.body:', req.body)
  res.json(req.body);
});

// 設定靜態內容的資料夾
app.use(express.static("public"));
app.use("/bootstrap", express.static("node_modules/bootstrap/dist"));
app.use("/jquery", express.static("node_modules/jquery/dist"));

// *************** 404 page *** 所有的路由都要放在此之前
app.use((req, res) => {
  res.status(404).send(`<h1>你迷路了嗎</h1>`);
});

const port = process.env.WEB_PORT || 3001;

app.listen(port, () => {
  console.log(`express server: ${port}`);
});
