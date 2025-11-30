const path = require('path');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const storyDir = path.join(__dirname, 'story');
const filePath = path.join(storyDir, 'text.txt');

app.use(bodyParser.json());

// Utility function to ensure the story directory & file exist
function ensureStoryFileExists() {
  return new Promise((resolve, reject) => {
    fs.mkdir(storyDir, { recursive: true }, (dirErr) => {
      if (dirErr) return reject(dirErr);

      fs.access(filePath, fs.constants.F_OK, (fileErr) => {
        if (fileErr) {
          // File does not exist → create empty text.txt
          fs.writeFile(filePath, '', (writeErr) => {
            if (writeErr) return reject(writeErr);
            return resolve();
          });
        } else {
          // File exists
          return resolve();
        }
      });
    });
  });
}

// ========== GET /story ==========
app.get('/story', async (req, res) => {
  try {
    await ensureStoryFileExists();
    fs.readFile(filePath, (err, data) => {
      if (err) {
        return res.status(500).json({ message: 'Failed to open file.' });
      }
      res.status(200).json({ story: data.toString() });
    });
  } catch (e) {
    res.status(500).json({ message: 'Failed to initialize story file.' });
  }
});

// ========== POST /story ==========
app.post('/story', async (req, res) => {
  // 1. Validate the existence and type of req.body.text
  const newText = req.body && typeof req.body.text === 'string'
    ? req.body.text
    : null;

  if (!newText || newText.trim().length === 0) {
    return res.status(422).json({ message: 'Text must not be empty!' });
  }

  try {
    await ensureStoryFileExists();
    fs.appendFile(filePath, newText.trim() + '\n', (err) => {
      if (err) {
        return res.status(500).json({ message: 'Storing the text failed.' });
      }
      res.status(201).json({ message: 'Text was stored!' });
    });
  } catch (e) {
    res.status(500).json({ message: 'Failed to initialize story file.' });
  }
});

// To simulate an application crash
app.get('/error', () => { 
  process.exit(1);
});

app.listen(3000);
