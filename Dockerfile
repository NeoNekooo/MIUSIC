# Gunakan image Node.js berbasis Debian yang bisa install Python
FROM node:20-bullseye

# Install Python 3, ffmpeg, dan dependensi yang diperlukan
RUN apt-get update && \
    apt-get install -y \
    python3 \
    python3-pip \
    ffmpeg \  # Diperlukan untuk operasi download video
    curl && \
    rm -rf /var/lib/apt/lists/*

# Install yt-dlp secara global
RUN pip3 install yt-dlp

# Buat folder kerja
WORKDIR /app

# Salin file package.json terlebih dahulu untuk caching
COPY package*.json ./

# Install dependensi node
RUN npm install

# Salin semua file ke dalam container
COPY . .

# Pastikan direktori bin untuk youtube-dl-exec ada
RUN mkdir -p node_modules/youtube-dl-exec/bin

# Download yt-dlp binary ke lokasi yang diharapkan oleh package
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o node_modules/youtube-dl-exec/bin/yt-dlp && \
    chmod a+rx node_modules/youtube-dl-exec/bin/yt-dlp  # Beri izin eksekusi

# Jalankan server
CMD ["node", "server.js"]