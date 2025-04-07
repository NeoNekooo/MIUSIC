const express = require('express');
const youtubedl = require('youtube-dl-exec');
const path = require('path');
const fs = require('fs');
const app = express();

// Konfigurasi dasar
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Fungsi utilitas
const tempDir = path.join(__dirname, 'temp');
const sanitizeTitle = (title) => {
  return title
    .replace(/[\\/*?"<>|:#]/g, '') // Hapus karakter ilegal
    .replace(/\s{2,}/g, ' ')       // Rapikan spasi ganda
    .trim()
    .substring(0, 80)              // Batasi panjang
    .replace(/\s+/g, '_');         // Ganti spasi dengan underscore
};

// Setup folder temporary
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Routes
app.get('/', (req, res) => {
  res.render('index', { title: 'YT to MP3 Converter' });
});

app.post('/convert', async (req, res) => {
  try {
    const url = req.body.url;
    
    // 1. Ambil metadata video
    const metadata = await youtubedl(url, {
      dumpSingleJson: true,
      noCheckCertificates: true,
      referer: 'https://www.youtube.com/',
      verbose: true
    });

    // 2. Generate nama file aman
    const baseName = sanitizeTitle(metadata.title);
    const fileName = `${baseName}_${Date.now()}.mp3`;
    const outputPath = path.join(tempDir, fileName);

    // 3. Proses konversi
    await youtubedl(url, {
      extractAudio: true,
      audioFormat: 'mp3',
      output: outputPath,
      noCheckCertificates: true,
      forceOverwrites: true,
      addHeader: [
        'referer:youtube.com',
        'user-agent:Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      ]
    });

    // 4. Set header download
    res.header({
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
      'Content-Type': 'audio/mpeg'
    });

    // 5. Stream dan bersihkan file
    const fileStream = fs.createReadStream(outputPath);
    fileStream.pipe(res);
    
    fileStream.on('end', () => {
      fs.unlink(outputPath, (err) => {
        if (err) console.error('⚠️ Gagal hapus file temp:', err);
      });
    });

  } catch (error) {
    console.error('🚨 Error:', error);
    res.status(500).send(`❌ Gagal konversi: ${error.message}`);
  }
});

// Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server aktif di http://localhost:${PORT}`);
});