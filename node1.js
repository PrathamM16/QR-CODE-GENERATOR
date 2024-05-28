const express = require('express');
const QRCode = require('qrcode');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up multer for handling file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Simple in-memory database
const subscriptions = [];

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Serve static files from the public directory
app.use(express.static('public'));

// Serve HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index1.html');
});


app.post('/generateQR', async (req, res) => {
    const { name, email, phoneNumber, subscription, image } = req.body;
    const details = `Name: ${name}, Email: ${email}, Phone Number: ${phoneNumber}, Subscription: ${subscription}, Image: ${image}`;

    try {
        const qrCode = await QRCode.toDataURL(details);
        res.json({ qrCode });
    } catch (err) {
        console.error('Error generating QR code:', err);
        res.status(500).json({ error: 'Error generating QR code' });
    }
});

app.post('/subscribe', upload.single('image'), (req, res) => {
    const { name, email, phoneNumber, subscription } = req.body;
    const image = req.file ? req.file.filename : null; 

    subscriptions.push({ name, email, phoneNumber, subscription, image });
    res.json({ message: 'Subscription successful' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
