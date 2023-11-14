import "dotenv/config";
import express from "express";

const app = express();

//定義路由
app.get("/",(req,res) => {
    res.send(`<h1>abc</h1>`);
});

const port = process.env.WEB_PORT || 3001;

app.get(express.static('public'));
app.get(express.static('node_modules/bootstrap/dist'));
app.get(express.static('node_modules/jquery/dist'));

//註冊樣板引擎
app.set("view engine","ejs");
//設定view路徑(不一定要設)
app.set("views","我的路徑");


//連線錯誤
app.use((req, res) => {
    res.status(404).send(`<h1>走錯路了</h1>`);
});


app.listen(port,()=>{
    console.log(`express server: ${port} 啟動`);
});


