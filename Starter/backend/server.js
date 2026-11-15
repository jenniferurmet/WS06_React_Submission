
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const pagesRouter = require('./routes/pages');
const postsRouter = require('./routes/posts');

const app = express();
const PORT = process.env.PORT || 3000;
const publicDir = path.join(__dirname, 'public');

// Connect to MongoDB
async function connectToDatabase() {
  if (!process.env.MONGODB_URI) {
    console.warn(
      'MONGODB_URI is missing. Create a .env file in backend/ before testing database features.'
    );
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'blog'
    });

    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

// Middleware
app.locals.publicDir = publicDir;

app.use(express.json());
app.use(express.static(publicDir));

// Routes
app.use('/', pagesRouter);
app.use('/api/posts', postsRouter);

// Handle 404 errors
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      message: 'API route not found'
    });
  }

  res.status(404).sendFile(path.join(publicDir, '404.html'));
});

// Handle server errors
app.use((error, req, res, next) => {
  console.error(error.stack);

  if (req.path.startsWith('/api/')) {
    return res.status(500).json({
      message: 'Internal server error'
    });
  }

  res.status(500).sendFile(path.join(publicDir, '500.html'));
});

// Start server
connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
      console.log('Mounted routers:');
      console.log('  / -> routes/pages.js');
      console.log('  /api/posts -> routes/posts.js');
    });
  })
  .catch((error) => {
    console.error('Failed to start server:', error.message);
    process.exitCode = 1;
  });
