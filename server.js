const express = require('express')
const mysql = require('mysql2')
const bcrypt = require('bcrypt')
const app = express()
const port = 3000

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Cs12345678",
  database: "shopdee"
});
//จัดการข้อผิดพลาดโดยบันทึกรายละเอียดของข้อผิดพลาดไว้ใน log เพื่อการตรวจสอบภายหลัง
db.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.stack);
    return;
  }
  console.log('Connected to database');
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/product', function (req, res) {
  const { productName, productDetail, price, cost, quantity } = req.body;
  //ป้องกันการโจมตีผ่านคำสั่ง SQL command (SQL Injection)
  let sql = "INSERT INTO product (productName, productDetail, price, cost, quantity) VALUES (?, ?, ?, ?, ?)";
  
  db.query(sql, [productName, productDetail, price, cost, quantity], function (err, result) {
    if (err) {
      console.error('Error inserting product:', err);
      return res.send({ 'message': 'บันทึกข้อมูลไม่สำเร็จ', 'status': false });
    }
    res.send({ 'message': 'บันทึกข้อมูลสำเร็จ', 'status': true });
  });
});

app.get('/product/:id', function (req, res) {
  const productID = req.params.id;
  //ป้องกันการโจมตีผ่านคำสั่ง SQL command (SQL Injection)
  let sql = "SELECT * FROM product WHERE productID = ?";
  
  db.query(sql, [productID], function (err, result) {
    if (err) {
      console.error('Error fetching product:', err);
      return res.send({ 'message': 'ไม่สามารถดึงข้อมูลได้', 'status': false });
    }
    res.send(result);
  });
});

app.post('/login', async function (req, res) {
  const { username, password } = req.body;
  //ป้องกันการโจมตีผ่านคำสั่ง SQL command (SQL Injection)
  let sql = "SELECT * FROM customer WHERE username = ? AND isActive = 1";
  
  db.query(sql, [username], async function (err, result) {
    if (err) {
      console.error('Error during login:', err);
      return res.send({ 'message': 'เกิดข้อผิดพลาด', 'status': false });
    }

    if (result.length > 0) {
      let customer = result[0];
      //การเข้ารหัสรหัสผ่านด้วย bcrypt 
      const match = await bcrypt.compare(password, customer.password);

      if (match) {
        customer['message'] = "เข้าสู่ระบบสำเร็จ";
        customer['status'] = true;
        res.send(customer);
      } else {
        res.send({ "message": "กรุณาระบุรหัสผ่านใหม่อีกครั้ง", "status": false });
      }
    } else {
      res.send({ "message": "ไม่พบผู้ใช้งาน", "status": false });
    }
  });
});

app.listen(port, function () {
  console.log(`server listening on port ${port}`);
});