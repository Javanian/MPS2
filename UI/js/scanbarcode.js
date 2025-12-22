
// import { loaddatapg } from './script.js';

const scanBtn = document.getElementById('scanBtn');
    const inputEl = document.getElementById('orderinput');
    const videoEl = document.getElementById('video');
    const preview = document.getElementById('preview');

    let codeReader;

    scanBtn.addEventListener('click', async () => {
      if(!codeReader){ codeReader = new ZXing.BrowserMultiFormatReader(); }
      preview.style.display = 'flex';
      try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(d => d.kind === 'videoinput');
        const deviceId = videoDevices.length ? videoDevices[0].deviceId : null;

        if(!deviceId){
          alert('Tidak ada kamera ditemukan');
          return;
        }

        await codeReader.decodeFromVideoDevice(deviceId, videoEl,  (result, err) => {
          if(result){
            inputEl.value = result.getText();
            codeReader.reset();
            preview.style.display = 'none';
             loaddatapg();
          }
        });
      }catch(err){
        alert('Gagal akses kamera: ' + err);
        
      }
    });

        preview.addEventListener('click', () => {
  if (codeReader) codeReader.reset();
  preview.style.display = 'none';
});