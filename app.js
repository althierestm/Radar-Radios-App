const radios = [
    { id: "radar-fm", name: "Radar FM", freq: "87.9", city: "Muriaé - MG", url: "https://stream.zeno.fm/qrothx4gudetv" },
    { id: "atividade-fm", name: "Atividade FM", freq: "87.9", city: "Canudos - BA", url: "https://1.stmip.net:8070/stream" },
    { id: "radio-muriae", name: "Rádio Muriaé", freq: "99.5", city: "Muriaé - MG", url: "https://5a57bda70564a.streamlock.net/muriaeamhd/muriaeamhd.stream/playlist.m3u8" },
    { id: "muriae-play", name: "Rádio Muriaé Play", freq: "99.5", city: "Muriaé - MG", url: "https://stream.zeno.fm/d42wceognggtv" },
    { id: "jere-fm", name: "JERE FM", freq: "106.9", city: "Jeremoabo - BA", url: "https://1.stmip.net:2044/stream" },
    { id: "hunter-80s", name: "Hunter Anos 80", freq: "106.9", city: "Brasília - DF", url: "https://hls.hunter.fm/80s/64.m3u8?shtl=OR99PlKze7mgR_U1AF_NVQZ0.dLFtA%2FSwg6Gi%2Fh77nRQTbBFiELSZm%2BOueXvqQcHVqGs" },
    { id: "energia-97", name: "Energia 97", freq: "97.7", city: "São Paulo - SP", url: "https://streaming.inweb.com.br/energia" },
    { id: "salvador-fm", name: "Salvador FM", freq: "92.3", city: "Salvador - BA", url: "https://streaming.livespanel.com:9230/ssafm9230" },
    { id: "hunter-pop", name: "Hunter Pop", freq: "92.3", city: "Brasília - DF", url: "https://hls.hunter.fm/pop/64.m3u8?shtl=OR99PlKze7mgR_U1AF_NVQZ0.dLFtA%2FSwg6Gi%2Fh77nRQTbBFiELSZm%2BOueXvqQcHVqGs" },
    { id: "hunter-pagode", name: "Hunter Pagode", freq: "94.1", city: "Brasília - DF", url: "https://hls.hunter.fm/pagode/64.m3u8?shtl=rLegrEjjYDLNiSScageIw8HO.tFEvhucVcOviAxNp1EnuCrAm7v1GpVOQdCA6q2VZ0CA" },
    { id: "hunter-sertanejo", name: "Hunter Sertanejo", freq: "90.5", city: "Brasília - DF", url: "https://hls.hunter.fm/sertanejo/64.m3u8?shtl=rLegrEjjYDLNiSScageIw8HO.tFEvhucVcOviAxNp1EnuCrAm7v1GpVOQdCA6q2VZ0CA" },
    { id: "hunter-hits", name: "Hunter Hits Brasil", freq: "101.3", city: "Brasília - DF", url: "https://hls.hunter.fm/hitsbrasil/64.m3u8?shtl=7KWu3SjMvgY-GhV1-8B6b9rB.lpykqpyxgqfSK4vGJSb3tqheOVp2UggEshcePVZJDVw" },
    { id: "hunter-pisadinha", name: "Hunter Pisadinha", freq: "98.1", city: "Brasília - DF", url: "https://hls.hunter.fm/pisadinha/64.m3u8?shtl=rLegrEjjYDLNiSScageIw8HO.tFEvhucVcOviAxNp1EnuCrAm7v1GpVOQdCA6q2VZ0CA" },
    { id: "hunter-kpop", name: "Hunter K-Pop", freq: "102.5", city: "Brasília - DF", url: "https://stream.hunter.fm/kpop/64.m3u8" },
    { id: "hunter-pop2k", name: "Hunter Pop 2K", freq: "104.5", city: "Brasília - DF", url: "https://hls.hunter.fm/pop2k/64.m3u8?shtl=OR99PlKze7mgR_U1AF_NVQZ0.dLFtA%2FSwg6Gi%2Fh77nRQTbBFiELSZm%2BOueXvqQcHVqGs" },
    { id: "hunter-gospel", name: "Hunter Gospel", freq: "103.1", city: "Brasília - DF", url: "https://hls.hunter.fm/gospel/64.m3u8?shtl=OR99PlKze7mgR_U1AF_NVQZ0.dLFtA%2FSwg6Gi%2Fh77nRQTbBFiELSZm%2BOueXvqQcHVqGs" },
    { id: "hunter-moda", name: "Hunter Moda Sertaneja", freq: "105.7", city: "Brasília - DF", url: "https://hls.hunter.fm/modasertaneja/64.m3u8?shtl=OR99PlKze7mgR_U1AF_NVQZ0.dLFtA%2FSwg6Gi%2Fh77nRQTbBFiELSZm%2BOueXvqQcHVqGs" },
    { id: "hunter-tropical", name: "Hunter Tropical", freq: "107.9", city: "Brasília - DF", url: "https://hls.hunter.fm/tropical/64.m3u8?shtl=OR99PlKze7mgR_U1AF_NVQZ0.dLFtA%2FSwg6Gi%2Fh77nRQTbBFiELSZm%2BOueXvqQcHVqGs" },
    { id: "hunter-rock", name: "Hunter Rock", freq: "96.7", city: "Brasília - DF", url: "https://hls.hunter.fm/rock/64.m3u8?shtl=OR99PlKze7mgR_U1AF_NVQZ0.dLFtA%2FSwg6Gi%2Fh77nRQTbBFiELSZm%2BOueXvqQcHVqGs" },
    { id: "hunter-lofi", name: "Hunter LoFi", freq: "107.5", city: "Brasília - DF", url: "https://stream.hunter.fm/lofi/64.m3u8" },
    { id: "radio-pop", name: "Rádio POP", freq: "88.5", city: "Web", url: "https://virtues.live:8254/stream" },
    { id: "euclides-cunha", name: "Euclides da Cunha FM", freq: "91.1", city: "Euclides da Cunha - BA", url: "https://servidor25-2.brlogic.com:8024/live" },
    { id: "gospel-inter", name: "Gospel Internacional", freq: "95.5", city: "Web", url: "https://stream.vagalume.fm/hls/1470245767122628/aac.m3u8" },
    { id: "antena-1", name: "Antena 1", freq: "94.7", city: "São Paulo - SP", url: "https://antenaone.crossradio.com.br/stream/1" },
    { id: "jp-fm", name: "Jovem Pan FM", freq: "100.9", city: "São Paulo - SP", url: "https://stream.zeno.fm/c45wbq2us3buv" },
    { id: "jp-news", name: "Jovem Pan News", freq: "76.7", city: "São Paulo - SP", url: "https://stream.zeno.fm/vlcraijc6yiuv" },
    { id: "brado-radio", name: "Brado Rádio", freq: "93.1", city: "Web", url: "https://servidor17-5.brlogic.com:8300/live" },
    { id: "gaviao-fm", name: "Gavião FM", freq: "89.9", city: "Web", url: "https://stm11.xcast.com.br:11000" },
    { id: "web-jp", name: "Web Rádio JP", freq: "100.1", city: "Web", url: "https://stream.zeno.fm/a7klgcfvvw9uv" },
    { id: "cidade-ba", name: "Rádio Cidade BA", freq: "95.9", city: "Bahia", url: "https://streaming.livespanel.com:20959/cidadefmlem" },
    { id: "mix-bahia", name: "Mix Bahia", freq: "89.3", city: "Bahia", url: "https://8175.brasilstream.com.br/stream" },
    { id: "lairton-teclas", name: "Lairton Teclas", freq: "91.7", city: "Web", url: "https://live20.bozztv.com/akamaissh101/ssh101/ltrecords/playlist.m3u8" },
    { id: "onda-beat", name: "Radio Onda Beat", freq: "101.1", city: "Litoral", url: "https://www.quinsanbroadcast.com.br:8040/101FM_LITORAL" }
];

let currentIndex = 0;
let favoritas = JSON.parse(localStorage.getItem("radar_favoritas")) || [];
let sleepTimerInterval = null;
let targetTime = null;
let wakeLock = null; 

const audio = document.getElementById("audio-stream");
audio.volume = 1.0; 

const playBtn = document.getElementById("btn-play");
const playIcon = document.getElementById("play-icon");
const freqValor = document.getElementById("freq-valor");
const estacaoNome = document.getElementById("estacao-nome");
const statusConexao = document.getElementById("status-conexao");
const dialStrip = document.getElementById("dial-strip");
const dialContainer = document.getElementById("dial-container");
const favIcon = document.getElementById("fav-icon");
const airplayBtn = document.getElementById("airplay-btn");
const timerDisplay = document.getElementById("timer-display");
const btnMultiRadio = document.getElementById("btn-multi-radio");

const themeToggle = document.getElementById("theme-toggle");
const noiseToggle = document.getElementById("noise-toggle");
const wakelockToggle = document.getElementById("wakelock-toggle");

// --- COMPARTILHAR ---
document.getElementById("btn-share").addEventListener("click", () => {
    if (navigator.share) {
        navigator.share({
            title: 'Radar Rádios',
            text: `Estou ouvindo ${estacaoNome.innerText} no Radar Rádios!`,
            url: window.location.href
        }).catch(() => {});
    } else { alert("O compartilhamento nativo não é suportado por este navegador."); }
});

// --- SHAZAM BOTÃO ---
document.getElementById("btn-shazam").addEventListener("click", () => {
    window.location.href = "shazam://";
    setTimeout(() => {
        if(document.visibilityState === 'visible') {
            alert("Se o Shazam não abriu automaticamente, certifique-se de que o aplicativo está instalado no dispositivo.");
        }
    }, 1500);
});

// --- CRONÔMETRO (SLEEP TIMER) LIVE ---
function updateTimerDisplay() {
    const now = new Date().getTime();
    const diff = targetTime - now;
    if (diff <= 0) {
        clearInterval(sleepTimerInterval);
        audio.pause(); stopChiado();
        statusConexao.innerText = "Temporizador Finalizado";
        playIcon.className = "fa-solid fa-play";
        timerDisplay.classList.add("hidden");
    } else {
        const totalSecs = Math.floor(diff / 1000);
        const hours = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60);
        const secs = totalSecs % 60;
        timerDisplay.innerText = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}
document.getElementById("btn-timer-open").addEventListener("click", () => { document.getElementById("modal-timer").classList.add("active"); });
document.querySelectorAll(".fechar-modal-timer").forEach(btn => btn.addEventListener("click", () => document.getElementById("modal-timer").classList.remove("active")));

document.querySelectorAll(".timer-option").forEach(item => {
    item.addEventListener("click", (e) => {
        const minutos = parseInt(e.currentTarget.getAttribute("data-time"));
        clearInterval(sleepTimerInterval);
        if (minutos > 0) {
            targetTime = new Date().getTime() + minutos * 60 * 1000;
            updateTimerDisplay();
            timerDisplay.classList.remove("hidden");
            sleepTimerInterval = setInterval(updateTimerDisplay, 1000);
            alert(`A rádio desligará em ${minutos} minutos.`);
        } else {
            timerDisplay.classList.add("hidden");
        }
        document.getElementById("modal-timer").classList.remove("active");
    });
});

// --- TELA DE BLOQUEIO / MEDIA SESSION API ---
function atualizarTelaDeBloqueio(radio) {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: 'Radar Rádios',
            artist: `${radio.name} - ${radio.city} - AO VIVO`,
            album: 'Rádios Online',
            artwork: [{ src: 'https://raw.githubusercontent.com/althierestm/Radar-Radios-App/main/Logo%20R%C3%A1dioFM.png', sizes: '512x512', type: 'image/png' }]
        });
        navigator.mediaSession.setActionHandler('play', () => { audio.play(); playIcon.className = "fa-solid fa-pause"; });
        navigator.mediaSession.setActionHandler('pause', () => { audio.pause(); stopChiado(); playIcon.className = "fa-solid fa-play"; });
        navigator.mediaSession.setActionHandler('previoustrack', () => { document.getElementById("btn-prev").click(); });
        navigator.mediaSession.setActionHandler('nexttrack', () => { document.getElementById("btn-next").click(); });
    }
}

// --- TEMA E WAKELOCK ---
if (localStorage.getItem("radar_theme") === "light") { document.body.classList.add("light-theme"); themeToggle.checked = true; }
themeToggle.addEventListener("change", (e) => {
    if (e.target.checked) { document.body.classList.add("light-theme"); localStorage.setItem("radar_theme", "light"); } 
    else { document.body.classList.remove("light-theme"); localStorage.setItem("radar_theme", "dark"); }
});

const requestWakeLock = async () => { try { wakeLock = await navigator.wakeLock.request('screen'); } catch (err) {} };
const releaseWakeLock = async () => { if (wakeLock !== null) { await wakeLock.release(); wakeLock = null; } };
wakelockToggle.addEventListener("change", (e) => { if (e.target.checked) { requestWakeLock(); } else { releaseWakeLock(); } });
document.addEventListener('visibilitychange', async () => { if (wakelockToggle.checked && document.visibilityState === 'visible') { await requestWakeLock(); } });
document.getElementById("btn-whatsapp").addEventListener("click", () => { window.open("https://wa.me/?text=Olá! Tenho uma sugestão incrível de rádio para o aplicativo Radar Rádios:", '_blank'); });

// --- AIRPLAY E CHIADO ---
airplayBtn.addEventListener("click", () => {
    if (window.WebKitPlaybackTargetAvailabilityEvent) { audio.webkitShowPlaybackTargetPicker(); } 
    else if (audio.remote && audio.remote.prompt) { audio.remote.prompt(); } 
    else { alert("A transmissão AirPlay não é suportada neste navegador."); }
});
audio.addEventListener('webkitcurrentplaybacktargetiswirelesschanged', () => { airplayBtn.classList.toggle("active", audio.webkitCurrentPlaybackTargetIsWireless); });

let audioCtx, noiseNode, noiseGain, noiseFilter;
function initChiado() {
    if (audioCtx) return; 
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = audioCtx.sampleRate * 2; const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0); for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    noiseNode = audioCtx.createBufferSource(); noiseNode.buffer = buffer; noiseNode.loop = true;
    noiseFilter = audioCtx.createBiquadFilter(); noiseFilter.type = 'bandpass'; noiseFilter.frequency.value = 1200;
    noiseGain = audioCtx.createGain(); noiseGain.gain.value = 0; 
    noiseNode.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(audioCtx.destination);
    noiseNode.start();
}
function playChiado() {
    if (!noiseToggle.checked) return; 
    if (!audioCtx) initChiado();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    noiseGain.gain.setTargetAtTime(0.3, audioCtx.currentTime, 0.1); 
}
function stopChiado() { if (noiseGain) noiseGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1); }
audio.addEventListener('playing', () => {
    stopChiado(); const radio = radios[currentIndex];
    statusConexao.innerText = `${radio.name} - ${radio.city} - AO VIVO`;
    playIcon.className = "fa-solid fa-pause";
    atualizarTelaDeBloqueio(radio); 
});

// --- LÓGICA DO DIAL E ARRASTAR ---
const minFreq = 70.0; const maxFreq = 110.0; const tickWidth = 14; 
for (let f = minFreq; f <= maxFreq; f += 0.1) {
    let freqFixed = Number(f.toFixed(1)); const tick = document.createElement("div");
    let type = "minor"; let showText = "";
    if (Math.abs(freqFixed % 1) < 0.05) { type = "major"; showText = freqFixed.toFixed(0); } 
    else if (Math.abs((freqFixed * 10) % 5) < 0.5) { type = "medium"; }
    tick.className = `dial-tick ${type}`;
    tick.innerHTML = `<span>${showText}</span><div class="line"></div>`;
    dialStrip.appendChild(tick);
}
function atualizarPosicaoDial(freqStr) {
    const totalTracos = (parseFloat(freqStr) - minFreq) / 0.1;
    dialStrip.style.transform = `translateX(${-(totalTracos * tickWidth)}px)`;
}

let isDragging = false; let startX = 0; let initialTranslateX = 0;
dialContainer.addEventListener('pointerdown', (e) => {
    isDragging = true; startX = e.clientX;
    initialTranslateX = new WebKitCSSMatrix(window.getComputedStyle(dialStrip).transform).m41; 
    dialStrip.style.transition = 'none'; 
    audio.pause(); playChiado(); playIcon.className = "fa-solid fa-play";
    statusConexao.innerText = "Sintonizando...";
    btnMultiRadio.style.opacity = "0"; // Esconde botão de conflito ao arrastar
});
window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    let novoTranslateX = initialTranslateX + (e.clientX - startX);
    const minTranslate = -((maxFreq - minFreq) / 0.1) * tickWidth;
    if (novoTranslateX > 0) novoTranslateX = 0;
    if (novoTranslateX < minTranslate) novoTranslateX = minTranslate;
    dialStrip.style.transform = `translateX(${novoTranslateX}px)`;
    const freqAtual = minFreq + (Math.abs(novoTranslateX) / tickWidth) * 0.1;
    freqValor.innerText = freqAtual.toFixed(1);
    estacaoNome.innerText = "Buscando sinal...";
    if (noiseFilter) noiseFilter.frequency.value = 800 + Math.abs(Math.sin(novoTranslateX * 0.1)) * 1500;
});
window.addEventListener('pointerup', () => {
    if (!isDragging) return;
    isDragging = false; dialStrip.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    const freqSintonizada = parseFloat(freqValor.innerText);
    atualizarPosicaoDial(freqSintonizada);
    
    const encontradas = radios.filter(r => parseFloat(r.freq) === freqSintonizada);
    
    if (encontradas.length > 0) {
        currentIndex = radios.findIndex(r => r.id === encontradas[0].id); 
        carregarRadio(currentIndex);
        audio.play().catch(() => { statusConexao.innerText = "Erro ao conectar"; });
    } else {
        estacaoNome.innerText = ""; statusConexao.innerText = "";
        favIcon.classList.replace("fa-solid", "fa-regular");
        btnMultiRadio.style.opacity = "0";
        if (noiseFilter) noiseFilter.frequency.value = 1000;
    }
});

// --- LÓGICA DE MÚLTIPLAS RÁDIOS NA MESMA FREQUÊNCIA ---
btnMultiRadio.addEventListener("click", () => {
    const currentFreq = parseFloat(radios[currentIndex].freq);
    const duplicates = radios.filter(r => parseFloat(r.freq) === currentFreq);
    
    document.getElementById("multi-modal-title").innerText = `Sintonia ${currentFreq.toFixed(1)} FM`;
    const list = document.getElementById("multi-station-list");
    list.innerHTML = "";
    
    duplicates.forEach(r => {
        const li = document.createElement("li"); li.className = "station-item";
        li.innerHTML = `<div><strong>${r.name}</strong><br><small style="color:var(--text-muted)">${r.city}</small></div>`;
        li.addEventListener("click", () => { 
            currentIndex = radios.findIndex(rad => rad.id === r.id); 
            carregarRadio(currentIndex); 
            document.getElementById("modal-multi").classList.remove("active"); 
            audio.play(); 
        });
        list.appendChild(li);
    });
    document.getElementById("modal-multi").classList.add("active");
});
document.querySelectorAll(".fechar-modal-multi").forEach(btn => btn.addEventListener("click", () => document.getElementById("modal-multi").classList.remove("active")));

function carregarRadio(index) {
    const radio = radios[index];
    freqValor.innerText = radio.freq; estacaoNome.innerText = ""; statusConexao.innerText = "Sintonizando...";
    audio.src = radio.url; atualizarPosicaoDial(radio.freq); verificarFavorito(radio.id); renderizarFavoritas();
    atualizarTelaDeBloqueio(radio);

    // Exibe o botão se a frequência possuir mais de uma rádio
    const duplicates = radios.filter(r => parseFloat(r.freq) === parseFloat(radio.freq));
    if (duplicates.length > 1) {
        btnMultiRadio.innerText = `Outras em ${radio.freq} FM`;
        btnMultiRadio.style.opacity = "1";
        btnMultiRadio.style.pointerEvents = "auto";
    } else {
        btnMultiRadio.style.opacity = "0";
        btnMultiRadio.style.pointerEvents = "none";
    }
}

// --- FUNÇÕES GERAIS E MODAIS ---
function verificarFavorito(id) {
    if (favoritas.includes(id)) { favIcon.classList.replace("fa-regular", "fa-solid"); } 
    else { favIcon.classList.replace("fa-solid", "fa-regular"); }
}
playBtn.addEventListener("click", () => {
    if (audio.paused) {
        if (estacaoNome.innerText !== "Sem Sinal") { statusConexao.innerText = "Sintonizando..."; audio.play(); }
    } else { audio.pause(); stopChiado(); statusConexao.innerText = "Pausado"; playIcon.className = "fa-solid fa-play"; }
});
document.getElementById("btn-next").addEventListener("click", () => { currentIndex = (currentIndex + 1) % radios.length; carregarRadio(currentIndex); if (!audio.paused || playIcon.classList.contains("fa-pause")) audio.play(); });
document.getElementById("btn-prev").addEventListener("click", () => { currentIndex = (currentIndex - 1 + radios.length) % radios.length; carregarRadio(currentIndex); if (!audio.paused || playIcon.classList.contains("fa-pause")) audio.play(); });
document.getElementById("btn-fav").addEventListener("click", () => {
    if (estacaoNome.innerText === "Sem Sinal") return; 
    const radioAtual = radios[currentIndex];
    if (favoritas.includes(radioAtual.id)) { favoritas = favoritas.filter(id => id !== radioAtual.id); } 
    else { favoritas.push(radioAtual.id); }
    localStorage.setItem("radar_favoritas", JSON.stringify(favoritas));
    verificarFavorito(radioAtual.id); renderizarFavoritas();
});

carregarRadio(0);

// Listas
function renderizarFavoritas() {
    const listaFav = document.getElementById("favoritas-list"); listaFav.innerHTML = "";
    if (favoritas.length === 0) { listaFav.innerHTML = "<p style='text-align:center; padding: 20px; color: var(--text-muted); font-size: 14px;'>Nenhuma rádio favorita.</p>"; return; }
    radios.filter(r => favoritas.includes(r.id)).forEach(r => {
        const li = document.createElement("li"); li.className = "station-item";
        li.innerHTML = `<div><strong>${r.name}</strong> (${r.freq} FM)<br><small style="color:var(--text-muted)">${r.city}</small></div>`;
        li.addEventListener("click", () => { currentIndex = radios.findIndex(rad => rad.id === r.id); carregarRadio(currentIndex); document.getElementById("modal-config").classList.remove("active"); audio.play(); });
        listaFav.appendChild(li);
    });
}
const modalEstacoes = document.getElementById("modal-estacoes");
const modalConfig = document.getElementById("modal-config");
document.getElementById("btn-lista").addEventListener("click", () => { abrirListaGeral(); modalEstacoes.classList.add("active"); });
document.querySelectorAll(".fechar-modal").forEach(btn => btn.addEventListener("click", () => modalEstacoes.classList.remove("active")));
document.querySelectorAll(".fechar-config").forEach(btn => btn.addEventListener("click", () => modalConfig.classList.remove("active")));
document.getElementById("btn-config").addEventListener("click", () => { renderizarFavoritas(); modalConfig.classList.add("active"); });
function abrirListaGeral() {
    const lista = document.getElementById("station-list"); lista.innerHTML = "";
    radios.forEach((r, idx) => {
        const li = document.createElement("li"); li.className = "station-item";
        li.innerHTML = `<div><strong>${r.name}</strong> (${r.freq} FM)<br><small style="color:var(--text-muted)">${r.city}</small></div>`;
        li.addEventListener("click", () => { currentIndex = idx; carregarRadio(currentIndex); modalEstacoes.classList.remove("active"); audio.play(); });
        lista.appendChild(li);
    });
}
