const { put, list } = require('@vercel/blob');

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

    try {
        // Check for duplicates
        const { blobs } = await list({ prefix: 'emails/', access: 'private' });
        const existingEmails = blobs.map(blob => blob.pathname.replace('emails/', ''));
        
        if (existingEmails.includes(email.toLowerCase())) {
            return res.json({ success: false, error: 'Email already exists' });
        }

        // Add new email
        await put(`emails/${email.toLowerCase()}`, JSON.stringify({ email, date: new Date().toISOString() }), {
            contentType: 'application/json',
            access: 'private',
        });

        console.log(`New signup: ${email}`);
        res.json({ success: true, message: "You're on the list!" });
    } catch (error) {
        console.error('Error:', error.message);
        console.error('Stack:', error.stack);
        res.json({ success: false, error: error.message });
    }
};