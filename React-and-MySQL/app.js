const express = require('express');
const mysql = require('mysql');
const cors = require('cors'); // Import cors

const app = express();

app.use(cors()); // Kích hoạt CORS cho tất cả các yêu cầu
app.use(express.json());

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'sapassword',
  database: 'reactmysql'
});

connection.connect(function(err) {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL');
});
// Lấy danh sách người dùng
app.get('/api/users', (req, res) => {
    const sql = "SELECT * FROM users";
    connection.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.json({ users: results });
    });
});

 
// Đăng ký người dùng
app.post('/api/register', (req, res) => {
    console.log(req.body); // In ra request body để kiểm tra
    const { username, email, password, avatar } = req.body;

    var sql = "INSERT INTO users (username, email, password, avatar) VALUES (?, ?, ?, ?)";
    connection.query(sql, [username, email, password, avatar], function(err, results) {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.status(400).json({ message: 'Username or email already exists' });
            }
            console.error('Error inserting user:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.status(201).json({ message: 'User registered successfully', userId: results.insertId });
    });
});



app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    var sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    
    connection.query(sql, [username, password], function(err, results) {
        if (err) {
            return res.status(500).json({ message: 'Internal server error' });
        }
        if (results.length > 0) {
            // Giả định rằng thông tin người dùng bao gồm link ảnh
            return res.json({ 
                avatar: results[0].avatar, // Trả về link ảnh
                username: results[0].username // Trả về tên người dùng nếu cần
            }); 
        } else {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
    });
});



 
// cập nhật 
// Lấy thông tin người dùng theo ID
app.get('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const sql = "SELECT * FROM users WHERE id = ?";
    connection.query(sql, [id], (err, results) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(results[0]); // Trả về người dùng đầu tiên
    });
});


// Cập nhật thông tin người dùng
app.put('/api/users/:id', (req, res) => {
    const { id } = req.params;
    const { username, email, avatar } = req.body;

    const sql = "UPDATE users SET username = ?, email = ?, avatar = ? WHERE id = ?";
    connection.query(sql, [username, email, avatar, id], (err, results) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        if (results.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User updated successfully' });
    });
});


// Xóa người dùng
app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    var sql = "DELETE FROM users WHERE id = ?";
    connection.query(sql, [id], function(err, results) {
        if (err) {
            console.error('Error deleting user:', err);
            return res.status(500).json({ message: 'Internal server error' });
        }
        res.json({ message: 'User deleted successfully' });
    });
});


// Khởi động server
app.listen(4000, () => {
  console.log('App listening on port 4000');
});
