(function(){
      const speakBtn = document.getElementById('speakBtn');
      const status = document.getElementById('status');
      const tableSpan = document.getElementById('tableId');
      const kategori = document.getElementById('kategori');
      let voices = [];
      let hasStarted = false;

      function getParam(name){ const url = new URL(location.href); return url.searchParams.get(name); }
      const tableId = getParam('table') || 'Giriş'; tableSpan.textContent = tableId;

      function loadVoices() {
        voices = speechSynthesis.getVoices();
        if(voices.length > 0) {
            status.textContent = "Hazır. Otomatik başlatılıyor...";
            speakBtn.disabled = false;
            if(!hasStarted) attemptAutoStart();
        }
      }
      if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = loadVoices;
      loadVoices();

      function attemptAutoStart(){
        readMenu().then(()=> hasStarted=true).catch(()=>{
            status.textContent = "Ses için ekrana dokunun.";
            const unlock = () => {
                if(!hasStarted) { readMenu(); hasStarted=true; }
                ['click','touchstart','scroll'].forEach(e => document.body.removeEventListener(e, unlock));
            };
            ['click','touchstart','scroll'].forEach(e => document.body.addEventListener(e, unlock));
        });
      }

      function speakText(text){
        return new Promise((resolve, reject)=>{
          const u = new SpeechSynthesisUtterance(text);
          u.lang = "tr-TR"; u.rate = 1.05;
          const trVoice = voices.find(v => v.lang.includes('tr')) || voices[0];
          if(trVoice) u.voice = trVoice;
          u.onend = resolve; 
          u.onerror = (e) => e.error === 'not-allowed' ? reject(e) : resolve();
          speechSynthesis.speak(u);
        });
      }

      const map = {"Cappuccino":"Kapuçino", "Mocha":"Moka", "Waffle":"Vafıl", "Brownie":"Bıravni", "Club":"Kılab", "Frozen":"Frozın", "Magnolia":"Manolya"};

      async function readMenu(){
        if(hasStarted && speechSynthesis.speaking) return;
        hasStarted = true; speechSynthesis.cancel();
        
        speakBtn.disabled = true; speakBtn.textContent = "🔊 Okunuyor...";
        status.textContent = "Menü okunuyor...";
        
        try {
            await speakText("Hoşgeldiniz. Menüyü sunuyorum.");
            const cats = kategori.querySelectorAll(":scope > li");
            for(const cat of cats){
                if(!hasStarted) break;
                
                cat.querySelector("ins strong").style.color = "var(--highlight)";
                cat.querySelector("ins strong").style.borderColor = "var(--highlight)";
                cat.scrollIntoView({behavior:"smooth", block:"center"});
                
                let catText = cat.querySelector("ins strong").innerText;
                const emojiSpan = cat.querySelector(".emoji");
                if (emojiSpan) {
                    catText = catText.replace(emojiSpan.innerText, "").trim();
                }
                await speakText(catText);
                

                const items = cat.querySelectorAll("ul > li");
                for(const item of items){
                   if(!hasStarted) break;
                   
                   item.style.backgroundColor = "#fff3e0"; 
                   item.style.transform = "scale(1.02)";
                   
                   let text = item.querySelector(".item-name").innerText;
                   let price = item.querySelector(".price-tag").innerText.replace("₺", " lira");
                   for(let k in map) text = text.replace(new RegExp(k, "gi"), map[k]);
                   
                   await speakText(text + ", " + price);
                   
                   item.style.backgroundColor = "transparent"; item.style.transform = "scale(1)";
                }
                cat.querySelector("ins strong").style.color = "";
                cat.querySelector("ins strong").style.borderColor = "";
            }
            status.textContent = "Tamamlandı."; speakBtn.textContent = "🔊 Tekrar Oku";
        } catch(e){ console.warn(e); } finally { speakBtn.disabled = false; hasStarted = false; }
      }

      speakBtn.addEventListener("click", readMenu);
    })();