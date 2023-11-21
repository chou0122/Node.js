import express from "express";
import db from "./../utils/connect-mysql.js";
import upload from "./../utils/upload-imgs.js";

const router = express.Router();

const getListData = async (req) => {
  const perPage = 20; // 每頁幾筆
  let page = +req.query.page || 1;
  let totalRows = 0;
  let totalPages = 0;
  let rows = [];

  let output = {
    success: false,
    page,
    perPage,
    rows,
    totalRows,
    totalPages,

    redirect: "",
    info: "",
  };

  if (page < 1) {
    output.redirect = `?page=1`;
    output.info = `頁碼值小於 1`;
    return output;
  }

  const t_sql = "SELECT COUNT(1) totalRows FROM address_book";
  [[{ totalRows }]] = await db.query(t_sql);
  totalPages = Math.ceil(totalRows / perPage);
  if (totalRows > 0) {
    if (page > totalPages) {
      output.redirect = `?page=${totalPages}`;
      output.info = `頁碼值大於總頁數`;
      return { ...output, totalRows, totalPages };
    }

    const sql = `SELECT * FROM address_book ORDER BY sid DESC 
    LIMIT ${(page - 1) * perPage}, ${perPage}`;
    [rows] = await db.query(sql);
    output = { ...output, success: true, rows, totalRows, totalPages };
  }

  return output;
};

router.get("/", async (req, res) => {
  res.locals.pageName = "ab-list";
  const output = await getListData(req);
  if (output.redirect) {
    return res.redirect(output.redirect);
  }

  res.render("address-book/list", output);
});

router.get("/api", async (req, res) => {
  res.json(await getListData(req));
});

router.get("/add", async (req, res) => {
  res.render("address-book/add");
});
router.post("/add", upload.none(), async (req, res) => {
  const output = {
    success: false,
    postData: req.body, // 除錯用
  };

  const { name, email, mobile, birthday, address } = req.body;
  const sql =
    "INSERT INTO `address_book`(`name`, `email`, `mobile`, `birthday`, `address`, `created_at`) VALUES (?, ?, ?, ?, ?, NOW() )";

  try {
    const [result] = await db.query(sql, [
      name,
      email,
      mobile,
      birthday,
      address,
    ]);
    output.result = result;
    output.success = !! result.affectedRows;

  } catch (ex) {
    output.exception = ex;
  }

  /*
  const sql = "INSERT INTO `address_book` SET ?";
  // INSERT INTO `address_book` SET `name`='abc',
  req.body.created_at = new Date();
  const [result] = await db.query(sql, [req.body]);
  */

  // {
  //   "fieldCount": 0,
  //   "affectedRows": 1,  # 影響的列數
  //   "insertId": 1021,   # 取得的 PK
  //   "info": "",
  //   "serverStatus": 2,
  //   "warningStatus": 0,
  //   "changedRows": 0    # 修改時真正有變動的資料筆數
  // }

  res.json(output);
});

export default router;
