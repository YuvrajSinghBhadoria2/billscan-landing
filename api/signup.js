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

    const GOOGLE_SHEETS_URL = process.env.GOOGLE_SHEETS_URL || 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

    try {
        // First, GET existing emails to check for duplicates
        const getResponse = await fetch(GOOGLE_SHEETS_URL);
        const getResult = await getResponse.json();
        
        if (getResult.signups) {
            const existingEmails = getResult.signups.map(s => s.email.toLowerCase());
            if (existingEmails.includes(email.toLowerCase())) {
                return res.json({ success: false, error: 'Email already exists' });
            }
        }

        // If not duplicate, POST to add
        const postResponse = await fetch(GOOGLE_SHEETS_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, date: new Date().toISOString() })
        });

        const postData = await postResponse.json();

        if (postData.success) {
            res.json({ success: true, message: "You're on the list!" });
        } else {
            res.json({ success: false, error: postData.error || 'Failed to save' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.json({ success: false, error: 'Server error' });
    }
};
