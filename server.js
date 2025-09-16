const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const faceapi = require('face-api.js');
const canvas = require('canvas');

const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 🔧 Pasta de uploads
const uploadPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath);
app.use('/uploads', express.static(uploadPath));

// 🔧 Configurar multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadPath),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// 🔧 Conectar ao MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/calcadao', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('✅ Conectado ao MongoDB'));

// 🔧 Schema
const userSchema = new mongoose.Schema({
    login: { type: String, required: true, unique: true },
    name: String,
    email: String,
    password: String,
    userType: { type: String, enum: ['pf', 'pj'], default: 'pf' },
    documentFile: String,
    selfieFile: String,
    isVerified: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// 🔧 Carregar modelos IA
async function loadModels() {
    const modelsPath = path.join(__dirname, 'models');
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
    await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
    await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);
}
loadModels();

// 📌 CADASTRO
app.post('/api/register', upload.single('document'), async (req, res) => {
    try {
        const { login, name, email, password, userType } = req.body;
        const userExists = await User.findOne({ login });
        if (userExists) return res.status(400).json({ error: 'Login já cadastrado' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            login,
            name,
            email,
            password: hashedPassword,
            userType,
            documentFile: req.file?.filename || null
        });

        res.status(201).json({ message: 'Usuário cadastrado com sucesso', user: { id: newUser._id } });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao cadastrar usuário', details: err.message });
    }
});

// 📌 LOGIN
app.post('/api/login', async (req, res) => {
    try {
        const { login, password } = req.body;
        const user = await User.findOne({ login });
        if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(401).json({ error: 'Senha incorreta' });

        const token = jwt.sign({ id: user._id }, 'segredo123', { expiresIn: '2h' });

        res.json({ token, user: { id: user._id, name: user.name, isVerified: user.isVerified } });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao fazer login', details: err.message });
    }
});

// 📌 VERIFICAÇÃO COM SELFIE
app.post('/api/verify-identity/:id', upload.single('selfie'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
        if (!user.documentFile) return res.status(400).json({ error: 'Documento não encontrado' });

        const documentPath = path.join(uploadPath, user.documentFile);
        const selfiePath = req.file.path;

        const docImg = await canvas.loadImage(documentPath);
        const selfieImg = await canvas.loadImage(selfiePath);

        const docDesc = await faceapi.detectSingleFace(docImg).withFaceLandmarks().withFaceDescriptor();
        const selfieDesc = await faceapi.detectSingleFace(selfieImg).withFaceLandmarks().withFaceDescriptor();

        if (!docDesc || !selfieDesc) return res.status(400).json({ error: 'Não foi possível detectar rosto em uma das imagens' });

        const distance = faceapi.euclideanDistance(docDesc.descriptor, selfieDesc.descriptor);

        if (distance < 0.6) {
            user.selfieFile = req.file.filename;
            user.isVerified = true;
            await user.save();
            return res.json({ message: 'Identidade verificada com sucesso', similarity: (1 - distance).toFixed(2) });
        } else {
            return res.status(401).json({ error: 'Rostos não coincidem', similarity: (1 - distance).toFixed(2) });
        }
    } catch (err) {
        res.status(500).json({ error: 'Erro ao verificar identidade', details: err.message });
    }
});

// 📌 CONSULTAR STATUS
app.get('/api/user/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Erro ao buscar usuário', details: err.message });
    }
});

// 📌 REVALIDAR SELFIE
app.put('/api/request-revalidation/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

        user.selfieFile = null;
        user.isVerified = false;
        await user.save();

        res.json({ message: 'Status de verificação reiniciado. Nova selfie necessária.' });
    } catch (err) {
        res.status(500).json({ error: 'Erro ao solicitar nova verificação', details: err.message });
    }
});

app.listen(3000, () => console.log('🚀 Servidor rodando na porta 3000'));
