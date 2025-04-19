# Gunakan image Node.js berbasis Debian yang bisa install Python
FROM node:20-bullseye

# Install Python 3 dan yt-dlp
RUN apt-get update && \
    apt-get install -y python3 python3-pip && \
    pip3 install yt-dlp

# Buat folder kerja
WORKDIR /app

# Salin semua file ke dalam container
COPY . .

# Install dependensi node
RUN npm install

# Jalankan server
CMD ["node", "server.js"]
