const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const CSV_FILE = path.join(__dirname, 'signups.csv');

// Initialize CSV if it doesn't exist
if (!fs.existsSync(CSV_FILE)) {
    fs.writeFileSync(CSV_FILE, 'email,date\n');
}

// Serve static files
app.use(express.static(__dirname));

// API endpoint to collect emails
app.post('/api/signup', (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email required' });
    }

    // Check if email already exists
    const data = fs.readFileSync(CSV_FILE, 'utf8');
    const lines = data.trim().split('\n').slice(1); // Skip header
    const existingEmails = lines.map(line => line.split(',')[0].toLowerCase());
    
    if (existingEmails.includes(email.toLowerCase())) {
        return res.json({ success: false, error: 'Email already exists' });
    }

    const date = new Date().toISOString();
    const row = `${email},${date}\n`;
    
    fs.appendFileSync(CSV_FILE, row);
    console.log(`New signup: ${email} at ${date}`);
    
    res.json({ success: true, message: 'You\'re on the list!' });
});

// Get all signups
app.get('/api/signups', (req, res) => {
    const data = fs.readFileSync(CSV_FILE, 'utf8');
    const lines = data.trim().split('\n').slice(1); // Skip header
    res.json({ count: lines.length, signups: lines });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Signups stored in: ${CSV_FILE}`);
});
