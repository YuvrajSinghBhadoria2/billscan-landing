const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Google Sheets Webhook URL - Replace with your own
const GOOGLE_SHEETS_URL = process.env.GOOGLE_SHEETS_URL || 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Signup endpoint
app.post('/api/signup', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email required' });
    }

    try {
        // Check for duplicates
        const getResponse = await fetch(GOOGLE_SHEETS_URL);
        const getResult = await getResponse.json();
        
        if (getResult.signups) {
            const existingEmails = getResult.signups.map(s => s.email.toLowerCase());
            if (existingEmails.includes(email.toLowerCase())) {
                return res.json({ success: false, error: 'Email already exists' });
            }
        }

        // Add new signup
        const postResponse = await fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, date: new Date().toISOString() })
        });

        const postData = await postResponse.json();

        if (postData.success) {
            console.log(`New signup: ${email}`);
            res.json({ success: true, message: "You're on the list!" });
        } else {
            res.json({ success: false, error: postData.error || 'Failed to save' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.json({ success: false, error: 'Server error' });
    }
});

// Get all signups
app.get('/api/signups', async (req, res) => {
    try {
        const response = await fetch(GOOGLE_SHEETS_URL);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error:', error);
        res.json({ count: 0, signups: [] });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
