document.addEventListener('DOMContentLoaded', () => {
  const pasteBtn = document.getElementById('pasteButton');
  const urlInput = document.getElementById('youtubeUrl');
  const form = document.getElementById('converterForm');
  const loading = document.getElementById('loading');

  pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      urlInput.value = text || '';
    } catch (err) {
      alert('Gagal membaca clipboard: ' + err);
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const url = form.url.value;
    
    loading.classList.remove('hidden');
    
    try {
      const response = await fetch('/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `url=${encodeURIComponent(url)}`
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      const contentDisp = response.headers.get('Content-Disposition') || '';
      const filename = decodeURIComponent(
        contentDisp
          .split("filename*=UTF-8''")[1]
          .replace(/"/g, '')
      );

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename || 'download.mp3';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);

    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      loading.classList.add('hidden');
      form.reset();
    }
  });
});
