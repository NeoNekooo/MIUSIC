document.getElementById('converterForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const loading = document.getElementById('loading');
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
  
      // Ambil nama file dari header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filename = decodeURIComponent(
        contentDisposition
          .split('filename*=UTF-8\'\'')[1]
          .replace(/"/g, '')
      );
  
      // Proses download
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename; // Gunakan nama dari server
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
  
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      loading.classList.add('hidden');
      form.reset();
    }
  });