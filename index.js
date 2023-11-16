// import "dotenv/config";
import express from "express";
import session from "express-session";
import dayjs from "dayjs";
import moment from "moment-timezone";
import sales from "./data/sales.json" assert { type: "json" };
// import multer from "multer";
// const upload = multer({ dest: "tmp_uploads/" });
import upload from "./utils/upload-imgs.js";
import db from "./utils/connect-mysql.js";

import admin2Router from "./routes/admin2.js";
import addressBookRouter from "./routes/address-book.js";
const app = express();

app.set("view engine", "ejs");

// top-level middlewares
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  session({
    saveUninitialized: false,
    resave: false,
    secret: "kdgdf9485498KIUGLKIU45490",
  })
);

// 自訂頂層 middleware
app.use((req, res, next) => {
  res.locals.title = "小新的網站";

  next();
});
// 定義路由
app.get("/", (req, res) => {
  res.locals.title = "首頁 | " + res.locals.title;

  res.render("home", { name: process.env.DB_NAME });
});

app.get("/json-sales", (req, res) => {
  res.locals.title = "JSON資料 | " + res.locals.title;
  res.render("json-sales", { sales });
});

app.get("/try-qs", (req, res) => {
  res.json(req.query);
});

app.post("/try-post", (req, res) => {
  console.log("req.body:", req.body);
  res.json(req.body);
});

app.get("/try-post-form", (req, res) => {
  res.render("try-post-form");
});
app.post("/try-post-form", (req, res) => {
  res.render("try-post-form", req.body);
});

app.post("/try-upload", upload.single("avatar"), (req, res) => {
  res.json(req.file);
});

app.post("/try-uploads", upload.array("photos"), (req, res) => {
  res.json(req.files);
});

app.get("/my-params1/hello", (req, res) => {
  res.json({ hello: "shin" });
});

app.get("/my-params1/:action?/:id?", (req, res) => {
  res.json(req.params);
});

app.get(/^\/m\/09\d{2}-?\d{3}-?\d{3}$/i, (req, res) => {
  let u = req.url.slice(3).split("?")[0];
  u = u.split("-").join("");

  res.send({ u });
});

app.use("/admins", admin2Router);
app.use("/address-book", addressBookRouter);
app.get("/try-sess", (req, res) => {
  req.session.n = req.session.n || 0;
  req.session.n++;
  res.json(req.session);
});

app.get("/try-moment", (req, res) => {
  const fm = "YYYY-MM-DD HH:mm:ss";
  const m1 = moment();
  const m2 = moment("12-10-11");
  const m3 = moment("12-10-11", "DD-MM-YY");
  const d1 = dayjs();
  const d2 = dayjs("2023-11-15");
  const a1 = new Date();
  const a2 = new Date("2023-11-15");

  res.json({
    m1: m1.format(fm),
    m2: m2.format(fm),
    m3: m3.format(fm),
    m1a: m1.tz("Europe/Berlin").format(fm),
    d1: d1.format(fm),
    d2: d2.format(fm),
    a1,
    a2,
  });
});

app.get("/try-db", async (req, res) => {
  const [results, fields] = await db.query(
    `SELECT * FROM \`categories\` LIMIT 5`
  );
  res.json(results);
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
