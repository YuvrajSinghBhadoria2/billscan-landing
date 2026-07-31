const fs = require('fs');
const path = require('path');

const CSV_FILE = path.join('/tmp', 'signups.csv');

// Initialize CSV if it doesn't exist
if (!fs.existsSync(CSV_FILE)) {
    fs.writeFileSync(CSV_FILE, 'email,date\n');
}

module.exports = async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email required' });
    }

    // Read existing emails
    let data = '';
    try {
        data = fs.readFileSync(CSV_FILE, 'utf8');
    } catch (err) {
        fs.writeFileSync(CSV_FILE, 'email,date\n');
        data = 'email,date\n';
    }

    const lines = data.trim().split('\n').slice(1);
    const existingEmails = lines.map(line => line.split(',')[0].toLowerCase());

    if (existingEmails.includes(email.toLowerCase())) {
        return res.json({ success: false, error: 'Email already exists' });
    }

    const date = new Date().toISOString();
    const row = `${email},${date}\n`;

    fs.appendFileSync(CSV_FILE, row);
    console.log(`New signup: ${email} at ${date}`);

    res.json({ success: true, message: "You're on the list!" });
};
