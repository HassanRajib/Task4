const express = require('express');
const mysql2 = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql2.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'users'
});

app.post('/users', (req, res) => {
    const sql = "INSERT INTO userm (name, email, password) VALUES (?)";
    const values = [
        req.body.name,
        req.body.email,
        req.body.password
    ];
    db.query(sql, [values], (err, data) => {
        if (err) {return res.json("Error");}
        return res.json(data);
    });
});

app.get('/users', (req, res) => {
    const sql = "SELECT * from userm";
    db.query(sql, (err, data) => {
        if (err) res.json(err);
        return res.json(data);
    });
});

app.post('/users/:action', async (req, res) => {
    const { action } = req.params;
    const { userIds } = req.body;
  
    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ message: 'Invalid user IDs.' });
    }
  
    try {
      let query;
      if (action === 'block') {
        query = 'UPDATE users SET status = "blocked" WHERE id IN (?)';
      } else if (action === 'unblock') {
        query = 'UPDATE users SET status = "active" WHERE id IN (?)';
      } else if (action === 'delete') {
        query = 'DELETE FROM users WHERE id IN (?)';
      } else {
        return res.status(400).json({ message: 'Invalid action.' });
      }
  
      await db.query(query, [userIds]);
      res.status(200).json({ message: `${action} successful.` });
    } catch (error) {
      console.error('Error performing action:', error);
      res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  });
  

  // Login from server table/
  app.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      const [rows] = await db.execute('SELECT * FROM userm WHERE email = ?', [email]);
  
      if (rows.length === 0) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      const user = rows[0];
  
      // Check password (assumes passwords are hashed with bcrypt)
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }
  
      // Check if the user is blocked
      if (user.status === 'blocked') {
        return res.status(403).json({ message: 'Account is blocked' });
      }
  
      // Generate a token (optional)
      const token = 'sampleToken'; // Replace with actual token generation logic
  
      res.status(200).json({ token });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  

app.listen(3001, () => {    
    console.log('Server running on port 3001');
});