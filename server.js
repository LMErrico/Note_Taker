const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware for parsing JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static('public'));

// Route for serving the landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route for serving the notes page
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'notes.html'));
});

// API route for getting all notes
app.get('/api/notes', (req, res) => {
  // Read the notes from a JSON file (db.json)
  fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    const notes = JSON.parse(data);
    res.json(notes);
  });
});

// API route for creating a new note
app.post('/api/notes', (req, res) => {
  // Read existing notes
  fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    const notes = JSON.parse(data);
    // Generate a unique ID for the new note (you may use a UUID library for this)
    const newNote = {
      id: Date.now().toString(),
      title: req.body.title,
      text: req.body.text,
    };

    // Add the new note to the list of notes
    notes.push(newNote);

    // Write the updated notes back to the JSON file
    fs.writeFile(
      path.join(__dirname, 'db', 'db.json'),
      JSON.stringify(notes),
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json(newNote);
      }
    );
  });
});

// API route for deleting a note by ID
app.delete('/api/notes/:id', (req, res) => {
  const noteId = req.params.id;

  // Read existing notes
  fs.readFile(path.join(__dirname, 'db', 'db.json'), 'utf8', (err, data) => {
    if (err) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    const notes = JSON.parse(data);

    // Find the index of the note to delete
    const noteIndex = notes.findIndex((note) => note.id === noteId);
    if (noteIndex === -1) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Remove the note from the list of notes
    notes.splice(noteIndex, 1);

    // Write the updated notes back to the JSON file
    fs.writeFile(
      path.join(__dirname, 'db', 'db.json'),
      JSON.stringify(notes),
      (err) => {
        if (err) {
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json({ message: 'Note deleted' });
      }
    );
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});