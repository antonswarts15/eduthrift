// IMPORTANT: Load environment variables FIRST, before any other requires
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const pudoService = require('./pudoService');
const paymentsRouter = require('./routes/payments');
// const ImageCompressionService = require('./services/imageCompression');

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'https://admin.eduthrift.co.za',
    'https://admin.eduthrift.co.za',
    'https://eduthrift.co.za',
    'https://www.eduthrift.co.za',
    'http://localhost:3000',
    'http://localhost:3001',  // Admin UI
    'http://localhost:5173',  // Vite dev server default
    'http://localhost:5174',  // Vite dev server alternate
    'http://localhost:4173',  // Vite preview server
    'http://localhost:4174',  // Vite preview server (alternate)
    'http://localhost:8100',  // Ionic/Capacitor dev server
    'http://frontend'  // Docker internal network
  ],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'eduthrift',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Test database connection on startup with retry logic
const testConnection = async (retries = 10, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const connection = await pool.getConnection();
      console.log('Database connected successfully');
      connection.release();
      return;
    } catch (error) {
      console.log(`Database connection attempt ${i + 1}/${retries} failed:`, error.message);
      if (i === retries - 1) {
        console.error('All database connection attempts failed. Exiting...');
        process.exit(1);
      }
      console.log(`Retrying in ${delay/1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

testConnection();

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// File upload configuration - item photos (public)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

// Document upload storage - seller documents (protected)
const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/documents/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files allowed'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFilter
});

const documentUpload = multer({
  storage: documentStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: imageFilter
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Input sanitization
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.replace(/[\r\n\t]/g, '').trim();
};

// Serve uploaded files - item photos are public, documents require auth
app.use('/uploads/documents', (req, res, next) => {
  // Require valid JWT to access seller documents
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required to view documents' });
  }

  jwt.verify(token, JWT_SECRET, async (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });

    try {
      // Allow admins, or the document owner
      const [users] = await pool.execute('SELECT user_type FROM users WHERE id = ?', [user.userId]);
      if (users.length === 0) return res.status(403).json({ error: 'User not found' });

      const userType = users[0].user_type;
      if (userType === 'admin') {
        return next(); // Admins can view all documents
      }

      // Non-admins can only access their own documents
      const [ownerCheck] = await pool.execute(
        'SELECT id FROM users WHERE id = ? AND (id_document_url LIKE ? OR proof_of_address_url LIKE ?)',
        [user.userId, `%${req.path}%`, `%${req.path}%`]
      );
      if (ownerCheck.length > 0) {
        return next();
      }

      return res.status(403).json({ error: 'Access denied' });
    } catch (dbErr) {
      return res.status(500).json({ error: 'Authorization check failed' });
    }
  });
}, express.static('uploads/documents'));

// Item photos remain publicly accessible
app.use('/uploads', express.static('uploads'));

// Payment routes
app.use('/payments', paymentsRouter);

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, userType, schoolName, suburb, town, province } = req.body;
    
    // Validate required fields
    if (!email || !password || !firstName || !phone || !suburb || !town || !province) {
      return res.status(400).json({ error: 'Missing required fields: email, password, firstName, phone, suburb, town, province' });
    }
    
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const passwordHash = await bcrypt.hash(password, 10);
    
    const [result] = await pool.execute(
      'INSERT INTO users (email, password_hash, first_name, last_name, phone, user_type, school_name, suburb, town, province) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [email, passwordHash, firstName, lastName || '', phone, userType || 'both', schoolName || '', suburb, town, province]
    );
    
    const token = jwt.sign({ userId: result.insertId, email }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ token, user: { id: result.insertId, email, firstName, lastName } });
  } catch (error) {
    console.error('Registration error:', sanitizeInput(error.message));
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ 
      token, 
      user: { 
        id: user.id, 
        email: user.email, 
        firstName: user.first_name, 
        lastName: user.last_name 
      } 
    });
  } catch (error) {
    console.error('Login error:', sanitizeInput(error.message));
    res.status(500).json({ error: 'Login failed' });
  }
});

// Google OAuth login
app.post('/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify Google token
    const response = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${token}`);
    const { email, given_name, family_name, id } = response.data;
    
    // Check if user exists
    let [users] = await pool.execute('SELECT * FROM users WHERE email = ? OR google_id = ?', [email, id]);
    
    let user;
    if (users.length === 0) {
      // Create new user
      const [result] = await pool.execute(
        'INSERT INTO users (email, first_name, last_name, google_id, user_type) VALUES (?, ?, ?, ?, ?)',
        [email, given_name, family_name, id, 'both']
      );
      user = { id: result.insertId, email, first_name: given_name, last_name: family_name };
    } else {
      user = users[0];
      // Update Google ID if not set
      if (!user.google_id) {
        await pool.execute('UPDATE users SET google_id = ? WHERE id = ?', [id, user.id]);
      }
    }
    
    const jwtToken = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ 
      token: jwtToken, 
      user: { 
        id: user.id, 
        email: user.email, 
        firstName: user.first_name, 
        lastName: user.last_name 
      } 
    });
  } catch (error) {
    console.error('Google auth error:', sanitizeInput(error.message));
    res.status(500).json({ error: 'Google authentication failed' });
  }
});

// Facebook OAuth login
app.post('/auth/facebook', async (req, res) => {
  try {
    const { token } = req.body;
    
    // Verify Facebook token
    const response = await axios.get(`https://graph.facebook.com/me?fields=id,email,first_name,last_name&access_token=${token}`);
    const { email, first_name, last_name, id } = response.data;
    
    // Check if user exists
    let [users] = await pool.execute('SELECT * FROM users WHERE email = ? OR facebook_id = ?', [email, id]);
    
    let user;
    if (users.length === 0) {
      // Create new user
      const [result] = await pool.execute(
        'INSERT INTO users (email, first_name, last_name, facebook_id, user_type) VALUES (?, ?, ?, ?, ?)',
        [email, first_name, last_name, id, 'both']
      );
      user = { id: result.insertId, email, first_name, last_name };
    } else {
      user = users[0];
      // Update Facebook ID if not set
      if (!user.facebook_id) {
        await pool.execute('UPDATE users SET facebook_id = ? WHERE id = ?', [id, user.id]);
      }
    }
    
    const jwtToken = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
    
    res.json({ 
      token: jwtToken, 
      user: { 
        id: user.id, 
        email: user.email, 
        firstName: user.first_name, 
        lastName: user.last_name 
      } 
    });
  } catch (error) {
    console.error('Facebook auth error:', sanitizeInput(error.message));
    res.status(500).json({ error: 'Facebook authentication failed' });
  }
});

app.get('/auth/profile', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.user.userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const user = users[0];
    res.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone,
      userType: user.user_type,
      schoolName: user.school_name,
      town: user.town,
      suburb: user.suburb,
      province: user.province,
      status: user.status,
      verificationStatus: user.verification_status,
      sellerVerified: user.verification_status === 'verified',
      idDocumentUrl: user.id_document_url,
      proofOfAddressUrl: user.proof_of_address_url
    });
  } catch (error) {
    console.error('Profile error:', sanitizeInput(error.message));
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

app.put('/auth/profile', authenticateToken, async (req, res) => {
  try {
    const { firstName, lastName, phone, schoolName, town, suburb, province } = req.body;

    // Convert undefined to null to avoid MySQL errors
    const params = [
      firstName || null,
      lastName || null,
      phone || null,
      schoolName || null,
      town || null,
      suburb || null,
      province || null,
      req.user.userId
    ];

    await pool.execute(
      'UPDATE users SET first_name = ?, last_name = ?, phone = ?, school_name = ?, town = ?, suburb = ?, province = ? WHERE id = ?',
      params
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', sanitizeInput(error.message));
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password (authenticated user)
app.put('/auth/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const [users] = await pool.execute('SELECT password_hash FROM users WHERE id = ?', [req.user.userId]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const validPassword = await bcrypt.compare(currentPassword, users[0].password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.execute('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.user.userId]);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', sanitizeInput(error.message));
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Banking details endpoint (for sellers only)
app.put('/auth/banking-details', authenticateToken, async (req, res) => {
  try {
    // Check if user is a seller
    const [userCheck] = await pool.execute(
      'SELECT user_type FROM users WHERE id = ?',
      [req.user.userId]
    );
    
    if (userCheck.length === 0 || !['seller', 'both'].includes(userCheck[0].user_type)) {
      return res.status(403).json({ error: 'Only sellers can add banking details' });
    }
    
    const { bankName, accountNumber, branchCode, accountType } = req.body;
    
    await pool.execute(
      'UPDATE users SET bank_name = ?, bank_account_number = ?, bank_branch_code = ?, bank_account_type = ? WHERE id = ?',
      [bankName, accountNumber, branchCode, accountType, req.user.userId]
    );
    
    res.json({ message: 'Banking details saved successfully' });
  } catch (error) {
    console.error('Banking details error:', error.message);
    res.status(500).json({ error: 'Failed to save banking details' });
  }
});

// Document upload with proper validation
// Document upload with compression
app.post('/auth/upload-documents', authenticateToken, documentUpload.fields([
  { name: 'idDocument', maxCount: 1 },
  { name: 'proofOfAddress', maxCount: 1 }
]), async (req, res) => {
  try {
    const updates = {};

    if (req.files.idDocument) {
      updates.id_document_url = `/uploads/documents/${req.files.idDocument[0].filename}`;
    }

    if (req.files.proofOfAddress) {
      updates.proof_of_address_url = `/uploads/documents/${req.files.proofOfAddress[0].filename}`;
    }
    
    if (Object.keys(updates).length > 0) {
      const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updates), req.user.userId];

      await pool.execute(
        `UPDATE users SET ${setClause} WHERE id = ?`,
        values
      );

      // Auto-set verification_status to 'pending' if both documents are now uploaded
      const [user] = await pool.execute(
        'SELECT id_document_url, proof_of_address_url, verification_status FROM users WHERE id = ?',
        [req.user.userId]
      );
      if (user[0]?.id_document_url && user[0]?.proof_of_address_url && user[0].verification_status !== 'verified') {
        await pool.execute(
          'UPDATE users SET verification_status = ? WHERE id = ?',
          ['pending', req.user.userId]
        );
      }
    }

    res.json({
      message: 'Documents uploaded successfully',
      uploaded: updates
    });
  } catch (error) {
    console.error('Document upload error:', error.message);
    res.status(500).json({ error: 'Failed to upload documents' });
  }
});

// Individual document upload routes
app.post('/auth/upload-id-document', authenticateToken, documentUpload.single('idDocument'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No ID document file provided' });
    }
    const idDocumentUrl = `/uploads/documents/${req.file.filename}`;
    await pool.execute('UPDATE users SET id_document_url = ? WHERE id = ?', [idDocumentUrl, req.user.userId]);

    // Auto-set verification_status to 'pending' if both documents are now uploaded
    const [user] = await pool.execute(
      'SELECT proof_of_address_url, verification_status FROM users WHERE id = ?',
      [req.user.userId]
    );
    if (user[0]?.proof_of_address_url && user[0].verification_status !== 'verified') {
      await pool.execute(
        'UPDATE users SET verification_status = ? WHERE id = ?',
        ['pending', req.user.userId]
      );
    }

    res.json({ message: 'ID document uploaded successfully', url: idDocumentUrl });
  } catch (error) {
    console.error('ID document upload error:', error.message);
    res.status(500).json({ error: 'Failed to upload ID document' });
  }
});

app.post('/auth/upload-proof-of-residence', authenticateToken, documentUpload.single('proofOfResidence'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No proof of residence file provided' });
    }
    const proofUrl = `/uploads/documents/${req.file.filename}`;
    await pool.execute('UPDATE users SET proof_of_address_url = ? WHERE id = ?', [proofUrl, req.user.userId]);

    // Auto-set verification_status to 'pending' if both documents are now uploaded
    const [user] = await pool.execute(
      'SELECT id_document_url, verification_status FROM users WHERE id = ?',
      [req.user.userId]
    );
    if (user[0]?.id_document_url && user[0].verification_status !== 'verified') {
      await pool.execute(
        'UPDATE users SET verification_status = ? WHERE id = ?',
        ['pending', req.user.userId]
      );
    }

    res.json({ message: 'Proof of residence uploaded successfully', url: proofUrl });
  } catch (error) {
    console.error('Proof of residence upload error:', error.message);
    res.status(500).json({ error: 'Failed to upload proof of residence' });
  }
});

// Serve a protected document via authenticated API (for use in <img> tags via blob URLs)
app.get('/auth/document/:userId/:type', authenticateToken, async (req, res) => {
  try {
    const { userId, type } = req.params;

    // Only admins or the document owner can access
    const [users] = await pool.execute('SELECT user_type FROM users WHERE id = ?', [req.user.userId]);
    if (users.length === 0) return res.status(403).json({ error: 'Access denied' });

    const isAdmin = users[0].user_type === 'admin';
    const isOwner = String(req.user.userId) === String(userId);
    if (!isAdmin && !isOwner) return res.status(403).json({ error: 'Access denied' });

    const column = type === 'id' ? 'id_document_url' : 'proof_of_address_url';
    const [docResult] = await pool.execute(`SELECT ${column} as doc_url FROM users WHERE id = ?`, [userId]);
    if (docResult.length === 0 || !docResult[0].doc_url) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const filePath = path.join(__dirname, docResult[0].doc_url);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Document file not found' });
    }

    res.sendFile(filePath);
  } catch (error) {
    console.error('Document serve error:', error.message);
    res.status(500).json({ error: 'Failed to serve document' });
  }
});

// Items routes with location-based search
app.get('/items', async (req, res) => {
  try {
    const { category, subcategory, sport, phase, subject, condition, minPrice, maxPrice, school, userLocation } = req.query;

    let query = 'SELECT * FROM items WHERE status = "available"';
    const params = [];

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }
    if (subcategory) {
      query += ' AND subcategory = ?';
      params.push(subcategory);
    }
    if (sport) {
      query += ' AND sport = ?';
      params.push(sport);
    }
    if (phase) {
      query += ' AND phase = ?';
      params.push(phase);
    }
    if (subject) {
      query += ' AND subject = ?';
      params.push(subject);
    }
    if (condition) {
      query += ' AND condition_grade = ?';
      params.push(condition);
    }
    if (minPrice) {
      query += ' AND price >= ?';
      params.push(minPrice);
    }
    if (maxPrice) {
      query += ' AND price <= ?';
      params.push(maxPrice);
    }
    if (school) {
      query += ' AND (school_name LIKE ? OR club_name LIKE ?)';
      params.push(`%${school}%`, `%${school}%`);
    }
    
    // Location-based search prioritization
    if (userLocation) {
      const [userTown, userProvince] = userLocation.split(',');
      if (userTown && userProvince) {
        // Join with users table to get seller location and prioritize local items
        query = query.replace('SELECT * FROM items', 
          `SELECT items.*, users.town as seller_town, users.province as seller_province,
           CASE 
             WHEN users.town = ? AND users.province = ? THEN 1
             WHEN users.province = ? THEN 2
             ELSE 3
           END as location_priority`);
        query = query.replace('FROM items WHERE', 'FROM items JOIN users ON items.user_id = users.id WHERE');
        params.unshift(userTown.trim(), userProvince.trim(), userProvince.trim());
        query += ' ORDER BY location_priority ASC, created_at DESC';
      } else {
        query += ' ORDER BY created_at DESC';
      }
    } else {
      query += ' ORDER BY created_at DESC';
    }

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user's own items
app.get('/items/mine', authenticateToken, async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM items WHERE user_id = ?';
    const params = [req.user.userId];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error fetching user items:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/items', authenticateToken, async (req, res) => {
  try {
    // Check if seller is verified
    const [userCheck] = await pool.execute(
      'SELECT verification_status FROM users WHERE id = ? AND user_type IN ("seller", "both")',
      [req.user.userId]
    );
    
    if (userCheck.length === 0 || userCheck[0].verification_status !== 'verified') {
      return res.status(403).json({ error: 'Seller verification required to list items' });
    }
    const {
      item_type_id, school_name, club_name, team, size, gender,
      condition_grade, price, front_photo, back_photo, description,
      category, subcategory, sport, item_name, quantity, school, name
    } = req.body;

    // Calculate expiry date (30 days from now)
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 1);
    const expiryDateStr = expiryDate.toISOString().split('T')[0];

    // Handle different field naming from frontend
    const finalItemName = item_name || name;
    const finalSchoolName = school_name || school;
    const finalQuantity = quantity || 1;

    const query = `
      INSERT INTO items (
        user_id, item_type_id, item_name, category, subcategory, sport,
        school_name, club_name, team, size, gender,
        condition_grade, price, front_photo, back_photo, description,
        quantity, expiry_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'available')
    `;

    const params = [
      req.user.userId,
      item_type_id || null,
      finalItemName,
      category,
      subcategory || null,
      sport || null,
      finalSchoolName,
      club_name || null,
      team || null,
      size,
      gender,
      condition_grade,
      price,
      front_photo,
      back_photo,
      description || `${finalItemName} from ${finalSchoolName || club_name || 'Unknown'}`,
      finalQuantity,
      expiryDateStr
    ];

    const [result] = await pool.execute(query, params);

    // Check for wishlist matches and send notifications
    if (finalItemName && category) {
      const [wishlistMatches] = await pool.execute(`
        SELECT w.*, u.first_name, u.last_name
        FROM wishlist w
        JOIN users u ON w.user_id = u.id
        WHERE w.notify_when_available = TRUE
        AND w.item_name = ?
        AND w.category = ?
        AND (w.subcategory IS NULL OR w.subcategory = ?)
        AND (w.sport IS NULL OR w.sport = ?)
        AND (w.school_name IS NULL OR w.school_name = ?)
        AND (w.size IS NULL OR w.size = ?)
        AND (w.gender IS NULL OR w.gender = ?)
        AND (w.max_price IS NULL OR w.max_price >= ?)
      `, [finalItemName, category, subcategory, sport, finalSchoolName, size, gender, price]);

      // Send notifications to matching wishlist users
      for (const match of wishlistMatches) {
        await pool.execute(
          'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
          [
            match.user_id,
            'Wishlist Item Available!',
            `${finalItemName} is now available for R${price} at ${finalSchoolName || club_name || 'a school'}`,
            'wishlist_match'
          ]
        );
      }
    }

    res.json({ id: result.insertId, message: 'Item created successfully' });
  } catch (error) {
    console.error('Error creating item:', sanitizeInput(error.message));
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

app.put('/items/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const allowedFields = {
      item_name: req.body.item_name,
      school_name: req.body.school_name,
      club_name: req.body.club_name,
      team: req.body.team,
      size: req.body.size,
      gender: req.body.gender,
      condition_grade: req.body.condition_grade,
      price: req.body.price,
      description: req.body.description,
      quantity: req.body.quantity
    };

    const setClauses = [];
    const params = [];

    for (const [key, value] of Object.entries(allowedFields)) {
      if (value !== undefined) {
        setClauses.push(`${key} = ?`);
        params.push(value);
      }
    }

    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(id, req.user.userId);

    const [result] = await pool.execute(
      `UPDATE items SET ${setClauses.join(', ')} WHERE id = ? AND user_id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found or unauthorized' });
    }

    res.json({ message: 'Item updated successfully' });
  } catch (error) {
    console.error('Error updating item:', sanitizeInput(error.message));
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/items/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute(
      'DELETE FROM items WHERE id = ? AND user_id = ?',
      [id, req.user.userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Item not found or unauthorized' });
    }
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', sanitizeInput(error.message));
    res.status(500).json({ error: 'Internal server error' });
  }
});

// File upload routes with compression
app.post('/upload/images', authenticateToken, upload.array('images', 2), (req, res) => {
  try {
    const files = req.files.map(file => ({
      filename: file.filename,
      url: `/uploads/${file.filename}`
    }));
    res.json({ files });
  } catch (error) {
    console.error('Upload error:', sanitizeInput(error.message));
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Cart routes
app.post('/cart', authenticateToken, async (req, res) => {
  try {
    const { item_id } = req.body;
    
    await pool.execute(
      'INSERT INTO cart (user_id, item_id) VALUES (?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + 1',
      [req.user.userId, item_id]
    );
    
    res.json({ message: 'Item added to cart' });
  } catch (error) {
    console.error('Cart error:', sanitizeInput(error.message));
    res.status(500).json({ error: 'Failed to add to cart' });
  }
});

app.get('/cart', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT c.*, i.*, it.name as item_name, u.first_name as seller_name
      FROM cart c
      JOIN items i ON c.item_id = i.id
      JOIN item_types it ON i.item_type_id = it.id
      JOIN users u ON i.user_id = u.id
      WHERE c.user_id = ?
    `, [req.user.userId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Cart fetch error:', sanitizeInput(error.message));
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
});

app.delete('/cart/:itemId', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;
    
    await pool.execute(
      'DELETE FROM cart WHERE user_id = ? AND item_id = ?',
      [req.user.userId, itemId]
    );
    
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Cart remove error:', sanitizeInput(error.message));
    res.status(500).json({ error: 'Failed to remove from cart' });
  }
});

// Orders routes
app.post('/orders', authenticateToken, async (req, res) => {
  try {
    const { items, shipping_address, total_amount, platform_fee, payment_method, payment_reference } = req.body;
    
    for (const item of items) {
      const [itemData] = await pool.execute('SELECT * FROM items WHERE id = ?', [item.id]);
      if (itemData.length === 0) continue;
      
      const itemInfo = itemData[0];
      const orderTotal = item.price || itemInfo.price;
      const fee = orderTotal * 0.1; // 10% platform fee
      const sellerAmount = orderTotal - fee;
      
      const [orderResult] = await pool.execute(
        'INSERT INTO orders (buyer_id, seller_id, item_id, total_amount, platform_fee, seller_amount, shipping_address, payment_method, payment_reference, payment_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [req.user.userId, itemInfo.user_id, item.id, orderTotal, fee, sellerAmount, shipping_address, payment_method || 'paystack', payment_reference, 'pending']
      );
      
      // Create escrow transaction with expected delivery date
      const expectedDeliveryDate = new Date();
      expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 5); // 5 days expected delivery
      
      await pool.execute(
        'INSERT INTO escrow_transactions (order_id, buyer_id, seller_id, total_amount, platform_fee, seller_amount, payment_reference, expected_delivery_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [orderResult.insertId, req.user.userId, itemInfo.user_id, orderTotal, fee, sellerAmount, payment_reference, expectedDeliveryDate.toISOString().split('T')[0]]
      );
      
      await pool.execute('UPDATE items SET status = "sold" WHERE id = ?', [item.id]);
      await pool.execute('DELETE FROM cart WHERE user_id = ? AND item_id = ?', [req.user.userId, item.id]);
    }
    
    res.json({ message: 'Orders created successfully' });
  } catch (error) {
    console.error('Order error:', sanitizeInput(error.message));
    res.status(500).json({ error: 'Failed to create orders' });
  }
});

app.get('/orders', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT o.*, i.*, it.name as item_name, 
             buyer.first_name as buyer_name, seller.first_name as seller_name
      FROM orders o
      JOIN items i ON o.item_id = i.id
      JOIN item_types it ON i.item_type_id = it.id
      JOIN users buyer ON o.buyer_id = buyer.id
      JOIN users seller ON o.seller_id = seller.id
      WHERE o.buyer_id = ? OR o.seller_id = ?
      ORDER BY o.created_at DESC
    `, [req.user.userId, req.user.userId]);
    
    res.json(rows);
  } catch (error) {
    console.error('Orders fetch error:', sanitizeInput(error.message));
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// Wishlist routes
app.get('/wishlist', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM wishlist WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Wishlist fetch error:', sanitizeInput(error.message));
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
});

app.post('/wishlist', authenticateToken, async (req, res) => {
  try {
    const { item_name, category, subcategory, sport, school_name, size, gender, max_price, notify_when_available } = req.body;
    
    const [result] = await pool.execute(
      'INSERT INTO wishlist (user_id, item_name, category, subcategory, sport, school_name, size, gender, max_price, notify_when_available) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.userId, item_name, category, subcategory, sport, school_name, size, gender, max_price, notify_when_available]
    );
    
    res.json({ id: result.insertId, message: 'Item added to wishlist' });
  } catch (error) {
    console.error('Wishlist add error:', sanitizeInput(error.message));
    res.status(500).json({ error: 'Failed to add to wishlist' });
  }
});

app.delete('/wishlist/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute(
      'DELETE FROM wishlist WHERE id = ? AND user_id = ?',
      [id, req.user.userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Wishlist item not found' });
    }
    
    res.json({ message: 'Item removed from wishlist' });
  } catch (error) {
    console.error('Wishlist remove error:', sanitizeInput(error.message));
    res.status(500).json({ error: 'Failed to remove from wishlist' });
  }
});

// Notifications routes
app.get('/notifications', authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.userId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Notifications fetch error:', sanitizeInput(error.message));
    res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

app.post('/notifications', authenticateToken, async (req, res) => {
  try {
    const { title, message, type } = req.body;
    
    const [result] = await pool.execute(
      'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
      [req.user.userId, title, message, type || 'general']
    );
    
    res.json({ id: result.insertId, message: 'Notification created' });
  } catch (error) {
    console.error('Notification create error:', sanitizeInput(error.message));
    res.status(500).json({ error: 'Failed to create notification' });
  }
});

app.put('/notifications/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [id, req.user.userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Notification update error:', sanitizeInput(error.message));
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

app.delete('/notifications/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [result] = await pool.execute(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [id, req.user.userId]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Notification delete error:', sanitizeInput(error.message));
    res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// Schools routes
app.get('/schools', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT name FROM schools ORDER BY name');
    res.json(rows.map(row => row.name));
  } catch (error) {
    console.error('Error fetching schools:', sanitizeInput(error.message));
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Shipping routes (Pudo API)
app.get('/shipping/pickup-points', async (req, res) => {
  try {
    const { type, lat, lng, search, order_closest } = req.query;
    const params = new URLSearchParams();
    
    if (lat && lng) {
      params.append('latitude', lat);
      params.append('longitude', lng);
      params.append('radius', '20');
    }
    if (search) params.append('search', search);

    const response = await axios.get(`https://sandbox.pudo.co.za/api/lockers?${params}`, {
      headers: {
        'Authorization': `Bearer ${process.env.PUDO_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Pudo API error:', sanitizeInput(error.message));
    // Return mock data on error
    res.json([
      {
        pickup_point_id: 'PL001',
        name: 'PudoLocker - Sandton City',
        address: 'Sandton City Mall, Johannesburg',
        lat: -26.1076,
        lng: 28.0567,
        type: 'locker',
        provider: 'pudo'
      },
      {
        pickup_point_id: 'PL002',
        name: 'PudoLocker - Eastgate',
        address: 'Eastgate Shopping Centre, Johannesburg',
        lat: -26.1891,
        lng: 28.1631,
        type: 'locker',
        provider: 'pudo'
      }
    ]);
  }
});

app.post('/shipping/rates', async (req, res) => {
  try {
    const response = await axios.post('https://sandbox.pudo.co.za/api/quotes', req.body, {
      headers: {
        'Authorization': `Bearer ${process.env.PUDO_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error('Pudo rates error:', sanitizeInput(error.message));
    // Return mock rates on error
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const dayAfter = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    res.json([
      {
        service_level_code: 'PUDO_STD',
        service_level_name: 'PudoLocker Standard',
        total_cost: 35,
        delivery_date: dayAfter
      },
      {
        service_level_code: 'PUDO_EXP',
        service_level_name: 'PudoLocker Express',
        total_cost: 55,
        delivery_date: tomorrow
      }
    ]);
  }
});

app.post('/shipping/create-shipment', authenticateToken, async (req, res) => {
  try {
    const response = await axios.post('https://sandbox.pudo.co.za/api/orders', req.body, {
      headers: {
        'Authorization': `Bearer ${process.env.PUDO_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Pudo create shipment error:', sanitizeInput(error.message));
    // Return mock success on error
    res.json({
      success: true,
      shipment_id: `SHP-${Date.now()}`,
      tracking_reference: `TRK-${Date.now()}`,
      message: 'Shipment created successfully'
    });
  }
});

// Pudo API routes
app.get('/pudo/pickup-points', async (req, res) => {
  try {
    const { latitude, longitude, radius, limit } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const result = await pudoService.getPickupPoints({
      latitude,
      longitude,
      radius: radius ? parseInt(radius) : 10,
      limit: limit ? parseInt(limit) : 20
    });

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(result.statusCode || 500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Pudo pickup points error:', sanitizeInput(error.message));
    res.status(500).json({ error: 'Failed to fetch Pudo pickup points' });
  }
});

app.post('/pudo/rates', async (req, res) => {
  try {
    const { origin_suburb, destination_suburb, parcel_weight, parcel_dimensions } = req.body;

    if (!origin_suburb || !destination_suburb || !parcel_weight) {
      return res.status(400).json({ error: 'origin_suburb, destination_suburb, and parcel_weight are required' });
    }

    const result = await pudoService.getShippingRates({
      origin_suburb,
      destination_suburb,
      parcel_weight,
      parcel_dimensions
    });

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(result.statusCode || 500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Pudo rates error:', sanitizeInput(error.message));
    res.status(500).json({ error: 'Failed to get Pudo shipping rates' });
  }
});

app.post('/pudo/create-shipment', authenticateToken, async (req, res) => {
  try {
    const result = await pudoService.createShipment(req.body);

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(result.statusCode || 500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Pudo create shipment error:', sanitizeInput(error.message));
    res.status(500).json({ error: 'Failed to create Pudo shipment' });
  }
});

app.get('/pudo/track/:trackingNumber', async (req, res) => {
  try {
    const { trackingNumber } = req.params;

    if (!trackingNumber) {
      return res.status(400).json({ error: 'Tracking number is required' });
    }

    const result = await pudoService.trackShipment(trackingNumber);

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(result.statusCode || 500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Pudo tracking error:', sanitizeInput(error.message));
    res.status(500).json({ error: 'Failed to track Pudo shipment' });
  }
});

app.get('/pudo/locker/:lockerId/availability', async (req, res) => {
  try {
    const { lockerId } = req.params;

    if (!lockerId) {
      return res.status(400).json({ error: 'Locker ID is required' });
    }

    const result = await pudoService.getLockerAvailability(lockerId);

    if (result.success) {
      res.json(result.data);
    } else {
      res.status(result.statusCode || 500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Pudo locker availability error:', sanitizeInput(error.message));
    res.status(500).json({ error: 'Failed to get Pudo locker availability' });
  }
});

app.get('/schools/nearby', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    // For now, return all schools - in production, implement geolocation filtering
    const [rows] = await pool.execute('SELECT name, city, province FROM schools ORDER BY name LIMIT 10');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching nearby schools:', sanitizeInput(error.message));
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Admin middleware
const requireAdmin = async (req, res, next) => {
  try {
    // Query database to verify admin status
    const [users] = await pool.execute(
      'SELECT user_type FROM users WHERE id = ?',
      [req.user.userId]
    );

    if (users.length === 0 || users[0].user_type !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Attach user type for use in routes
    req.user.userType = users[0].user_type;
    next();
  } catch (error) {
    console.error('Admin authorization error:', error.message);
    return res.status(500).json({ error: 'Authorization check failed' });
  }
};

// Admin routes
app.get('/admin/sellers/pending', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.execute(`
      SELECT id, email, first_name, last_name, phone, id_number,
             school_name, street_address, town, suburb, province,
             id_document_url, proof_of_address_url,
             bank_name, bank_account_number, bank_branch_code, bank_account_type,
             verification_status, created_at
      FROM users
      WHERE user_type IN ('seller', 'both')
        AND (verification_status = 'pending'
             OR (verification_status IS NULL AND id_document_url IS NOT NULL AND proof_of_address_url IS NOT NULL))
      ORDER BY created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Admin sellers error:', error.message);
    res.status(500).json({ error: 'Failed to fetch pending sellers' });
  }
});

app.put('/admin/sellers/:id/verify', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute(
      'UPDATE users SET verification_status = "verified" WHERE id = ?',
      [id]
    );
    res.json({ message: 'Seller verified successfully' });
  } catch (error) {
    console.error('Admin verify seller error:', error.message);
    res.status(500).json({ error: 'Failed to verify seller' });
  }
});

app.put('/admin/sellers/:id/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute(
      'UPDATE users SET verification_status = "rejected" WHERE id = ?',
      [id]
    );
    res.json({ message: 'Seller rejected successfully' });
  } catch (error) {
    console.error('Admin reject seller error:', error.message);
    res.status(500).json({ error: 'Failed to reject seller' });
  }
});

app.get('/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { search, role } = req.query;
    let query = `SELECT id, email, first_name, last_name, phone, id_number,
                 user_type, status, verification_status,
                 school_name, street_address, town, suburb, province,
                 bank_name, bank_account_number, bank_branch_code, bank_account_type,
                 id_document_url, proof_of_address_url,
                 created_at
                 FROM users WHERE 1=1`;
    const params = [];

    if (search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (role && role !== 'all') {
      query += ' AND user_type = ?';
      params.push(role);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Admin users error:', error.message);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.put('/admin/users/:id/reset-password', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await bcrypt.hash(tempPassword, 10);
    
    await pool.execute(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, id]
    );
    
    res.json({ message: 'Password reset successfully', tempPassword });
  } catch (error) {
    console.error('Admin reset password error:', error.message);
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

app.put('/admin/users/:id/suspend', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute(
      'UPDATE users SET status = "suspended" WHERE id = ?',
      [id]
    );
    res.json({ message: 'User suspended successfully' });
  } catch (error) {
    console.error('Admin suspend user error:', error.message);
    res.status(500).json({ error: 'Failed to suspend user' });
  }
});

app.put('/admin/users/:id/reactivate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute(
      'UPDATE users SET status = "active" WHERE id = ?',
      [id]
    );
    res.json({ message: 'User reactivated successfully' });
  } catch (error) {
    console.error('Admin reactivate user error:', error.message);
    res.status(500).json({ error: 'Failed to reactivate user' });
  }
});

app.delete('/admin/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.execute('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error.message);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.get('/admin/payments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT o.id as order_id, o.total_amount, o.platform_fee, o.seller_amount,
             o.payment_status, o.payment_method, o.created_at,
             buyer.first_name as buyer_name, seller.first_name as seller_name,
             et.status as escrow_status, et.released_at
      FROM orders o
      JOIN users buyer ON o.buyer_id = buyer.id
      JOIN users seller ON o.seller_id = seller.id
      LEFT JOIN escrow_transactions et ON o.id = et.order_id
      WHERE 1=1
    `;
    const params = [];
    
    if (status && status !== 'all') {
      query += ' AND o.payment_status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY o.created_at DESC';
    
    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Admin payments error:', error.message);
    res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// Dashboard statistics endpoint
app.get('/admin/dashboard/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get total users count (excluding deleted)
    const [totalUsersResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM users WHERE status != ?',
      ['deleted']
    );

    // Get active users count
    const [activeUsersResult] = await pool.execute(
      'SELECT COUNT(*) as active FROM users WHERE status = ?',
      ['active']
    );

    // Get pending seller verifications count
    const [pendingVerificationsResult] = await pool.execute(
      `SELECT COUNT(*) as pending FROM users
       WHERE user_type IN ('seller', 'both')
       AND (verification_status = 'pending'
            OR (verification_status IS NULL AND id_document_url IS NOT NULL AND proof_of_address_url IS NOT NULL))`
    );

    // Get sales statistics (using 'delivered' status as completed orders)
    const [salesStatsResult] = await pool.execute(
      `SELECT
         COALESCE(SUM(total_amount), 0) as total_sales,
         COUNT(*) as total_orders
       FROM orders
       WHERE status IN ('delivered', 'shipped')`
    );

    // Calculate approximate platform fees (10% of sales)
    const platformFees = salesStatsResult[0].total_sales * 0.10;

    // Get recent transactions (last 30 days)
    const [recentTransactionsResult] = await pool.execute(
      `SELECT COUNT(*) as recent
       FROM orders
       WHERE status IN ('delivered', 'shipped')
       AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)`
    );

    const stats = {
      totalUsers: totalUsersResult[0].total,
      activeUsers: activeUsersResult[0].active,
      pendingVerifications: pendingVerificationsResult[0].pending,
      totalSales: salesStatsResult[0].total_sales,
      platformFees: platformFees,
      totalOrders: salesStatsResult[0].total_orders,
      recentTransactions: recentTransactionsResult[0].recent
    };

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error.message);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Role management endpoint
app.put('/admin/users/:id/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { userType } = req.body;

    // Validate user type
    const validTypes = ['seller', 'buyer', 'both', 'admin'];
    if (!validTypes.includes(userType)) {
      return res.status(400).json({ error: 'Invalid user type. Must be one of: seller, buyer, both, admin' });
    }

    // Check if user exists
    const [users] = await pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check for active listings if downgrading from seller
    if (userType === 'buyer') {
      const [items] = await pool.execute(
        'SELECT COUNT(*) as count FROM items WHERE user_id = ? AND status = ?',
        [id, 'available']
      );

      if (items[0].count > 0) {
        return res.status(400).json({
          error: 'Cannot change role. User has active listings. Please remove or archive them first.'
        });
      }
    }

    // Determine verification status based on new role
    let verificationStatus = 'verified';
    if (userType === 'seller' || userType === 'both') {
      // If upgrading to seller, set to pending if not already verified
      if (users[0].verification_status !== 'verified') {
        verificationStatus = 'pending';
      } else {
        verificationStatus = users[0].verification_status;
      }
    }

    // Update user type and verification status
    await pool.execute(
      'UPDATE users SET user_type = ?, verification_status = ? WHERE id = ?',
      [userType, verificationStatus, id]
    );

    // Fetch updated user data
    const [updatedUser] = await pool.execute(
      `SELECT id, email, first_name, last_name, phone, user_type, status,
       verification_status, created_at FROM users WHERE id = ?`,
      [id]
    );

    res.json({
      message: 'User role updated successfully',
      user: {
        id: updatedUser[0].id,
        email: updatedUser[0].email,
        firstName: updatedUser[0].first_name,
        lastName: updatedUser[0].last_name,
        phone: updatedUser[0].phone,
        userType: updatedUser[0].user_type,
        status: updatedUser[0].status,
        verificationStatus: updatedUser[0].verification_status,
        createdAt: updatedUser[0].created_at
      }
    });
  } catch (error) {
    console.error('Role update error:', error.message);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

const PayFastService = require('./services/payfast');
const AutoRefundService = require('./services/autoRefund');

// Initialize auto-refund service
const autoRefundService = new AutoRefundService(pool);

// PayFast webhook endpoint
app.post('/payfast/notify', async (req, res) => {
  try {
    const data = req.body;
    
    if (!PayFastService.verifySignature(data)) {
      return res.status(400).send('Invalid signature');
    }

    const orderId = data.m_payment_id;
    const paymentStatus = data.payment_status;
    const sellerId = data.custom_str1;
    const sellerAmount = parseFloat(data.custom_str2);
    const platformFee = parseFloat(data.custom_str3);

    if (paymentStatus === 'COMPLETE') {
      // Update order payment status
      await pool.execute(
        'UPDATE orders SET payment_status = "completed", payment_reference = ? WHERE id = ?',
        [data.pf_payment_id, orderId]
      );

      // Update escrow transaction
      await pool.execute(
        'UPDATE escrow_transactions SET status = "funded", payment_reference = ? WHERE order_id = ?',
        [data.pf_payment_id, orderId]
      );

      console.log(`Payment completed for order ${orderId}, funds held in escrow`);
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('PayFast webhook error:', error);
    res.status(500).send('Error');
  }
});

// Release escrow when delivery confirmed
app.post('/escrow/release/:orderId', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const [escrowData] = await pool.execute(
      'SELECT * FROM escrow_transactions WHERE order_id = ? AND status = "funded"',
      [orderId]
    );

    if (escrowData.length === 0) {
      return res.status(404).json({ error: 'Escrow transaction not found' });
    }

    const escrow = escrowData[0];
    
    // Get seller banking details
    const [sellerData] = await pool.execute(
      'SELECT * FROM users WHERE id = ?',
      [escrow.seller_id]
    );

    // Release payment to seller
    const releaseResult = await PayFastService.releaseEscrowPayment({
      sellerId: escrow.seller_id,
      amount: escrow.seller_amount,
      reference: escrow.payment_reference,
      bankDetails: sellerData[0].bank_details
    });

    if (releaseResult.success) {
      // Update escrow status
      await pool.execute(
        'UPDATE escrow_transactions SET status = "released", released_at = NOW() WHERE id = ?',
        [escrow.id]
      );

      // Update order status
      await pool.execute(
        'UPDATE orders SET status = "completed" WHERE id = ?',
        [orderId]
      );

      res.json({ message: 'Escrow payment released successfully' });
    } else {
      res.status(500).json({ error: 'Failed to release escrow payment' });
    }
  } catch (error) {
    console.error('Escrow release error:', error);
    res.status(500).json({ error: 'Failed to release escrow' });
  }
});

// Dispute endpoints
app.post('/disputes', authenticateToken, async (req, res) => {
  try {
    const { orderId, disputeType, description } = req.body;
    
    // Get order details
    const [orderData] = await pool.execute(
      'SELECT buyer_id, seller_id FROM orders WHERE id = ? AND buyer_id = ?',
      [orderId, req.user.userId]
    );
    
    if (orderData.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orderData[0];
    const result = await autoRefundService.createDispute({
      orderId,
      buyerId: order.buyer_id,
      sellerId: order.seller_id,
      disputeType,
      description
    });
    
    if (result.success) {
      res.json({ message: 'Dispute created successfully', disputeId: result.disputeId });
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    console.error('Dispute creation error:', error);
    res.status(500).json({ error: 'Failed to create dispute' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});