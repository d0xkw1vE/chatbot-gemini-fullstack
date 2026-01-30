import 'dotenv/config';
import express from 'express';
import { GoogleGenAI } from "@google/genai";

const app = express();

// Inisialisasi Google GenAI dengan API Key dari environment variable
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// **Set your default Gemini model here:**
// Menggunakan gemini-1.5-flash karena lebih stabil dan tersedia umum
const GEMINI_MODEL = "gemini-2.5-flash";
app.use
app.use(express.json());

app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;

    try {
        if (!Array.isArray(conversation)) {
            throw new Error('Messages must be an array!');
        }

        const contents = conversation.map(msg => ({
            role: msg.role, // hanya "user" atau "model"
            parts: [{ text: msg.text || msg.content }]
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents,
            config: {
                temperature: 0.9,
                systemInstruction: `
Kamu adalah AI chef ramah dan berpengalaman.
Kamu membantu pengguna memasak dengan cara yang praktis, sederhana, dan menyenangkan.

Gaya menjawab:
- Bahasa Indonesia santai dan sopan
- Fokus ke solusi praktis
- Beri tips kecil agar masakan lebih enak
- Jika bahan tidak lengkap, beri alternatif

Batasan:
- Hanya menjawab seputar masak, resep, dan dapur
- Tidak menjawab topik di luar kuliner
        `
            }
        });

        res.status(200).json({ result: response.text });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});


// Konfigurasi Port dan Menjalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server ready on http://localhost:${PORT}`);
});
