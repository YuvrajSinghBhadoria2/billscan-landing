const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;
const FORMSPREE_URL = 'https://formspree.io/f/xzdnqoqn';

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
        const response = await fetch(FORMSPREE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        if (response.ok) {
            console.log(`New signup: ${email}`);
            res.json({ success: true, message: "You're on the list!" });
        } else {
            res.json({ success: false, error: 'Failed to save' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.json({ success: false, error: 'Server error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
