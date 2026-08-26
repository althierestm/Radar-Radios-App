const radios = [
    { id: "radar-fm", name: "Radar FM", freq: "87.9", city: "Muriaé - MG", url: "https://stream.zeno.fm/qrothx4gudetv" },
    { id: "hunter-sertanejo", name: "Hunter Sertanejo", freq: "90.5", city: "Brasília - DF", url: "https://live.hunter.fm/sertanejo_stream?ag=mp3" },
    { id: "hunter-pop", name: "Hunter Pop", freq: "92.3", city: "Brasília - DF", url: "https://live.hunter.fm/pop_stream?ag=mp3" },
    { id: "hunter-pagode", name: "Hunter Pagode", freq: "94.1", city: "Brasília - DF", url: "https://live.hunter.fm/pagode_stream?ag=mp3" },
    { id: "hunter-rock", name: "Hunter Rock", freq: "96.7", city: "Brasília - DF", url: "https://live.hunter.fm/rock_stream?ag=mp3" },
    { id: "hunter-master", name: "Hunter Master", freq: "98.5", city: "Brasília - DF", url: "https://live.hunter.fm/master_stream?ag=mp3" },
    { id: "hunter-mpb", name: "Hunter MPB", freq: "99.9", city: "Brasília - DF", url: "https://live.hunter.fm/mpb_stream?ag=mp3" },
    { id: "hunter-hits", name: "Hunter Hits Brasil", freq: "101.3", city: "Brasília - DF", url: "https://live.hunter.fm/hitsbrasil_stream?ag=mp3" },
    { id: "hunter-gospel", name: "Hunter Gospel", freq: "103.1", city: "Brasília - DF", url: "https://live.hunter.fm/gospel_stream?ag=mp3" },
    { id: "hunter-pop2k", name: "Hunter Pop 2K", freq: "104.5", city: "Brasília - DF", url: "https://live.hunter.fm/pop2k_stream?ag=mp3" },
    { id: "hunter-moda", name: "Hunter Moda Sertaneja", freq: "105.7", city: "Brasília - DF", url: "https://live.hunter.fm/modasertaneja_stream?ag=mp3" },
    { id: "hunter-80s", name: "Hunter 80s", freq: "106.9", city: "Brasília - DF", url: "https://live.hunter.fm/80s_stream?ag=mp3" },
    { id: "hunter-lofi", name: "Hunter LoFi", freq: "107.5", city: "Brasília - DF", url: "https://live.hunter.fm/lofi_stream?ag=mp3" },
    { id: "hunter-tropical", name: "Hunter Tropical", freq: "107.9", city: "Brasília - DF", url: "https://live.hunter.fm/tropical_stream?ag=mp3" }
];

let currentIndex = 0;
let favoritas = JSON.parse(localStorage.getItem("radar_favoritas")) || [];

const audio = document.getElementById("audio-stream");
audio.volume = 1.0; // Volume interno fixo no máximo

const playBtn = document.getElementById("btn-play");
const playIcon = document.getElementById("play-icon");
const freqValor = document.getElementById("freq-valor");
const estacaoNome = document.getElementById("estacao-nome");
const statusConexao = document.getElementById("status-conexao");
const dialStrip = document.getElementById("dial-strip");
const dialContainer = document.getElementById("dial-container");
const favIcon = document.getElementById("fav-icon");
const airplayBtn = document.getElementById("airplay-btn");

// --- AIRPLAY FUNCIONAL ---
airplayBtn.addEventListener("click", () => {
    // Tenta usar a API da Apple (Safari/iOS)
    if (window.WebKitPlaybackTargetAvailabilityEvent) {
        audio.webkitShowPlaybackTargetPicker();
    } 
    // Tenta usar a API de Cast Remoto (Chrome/Android)
    else if (audio.remote && audio.remote.prompt) {
        audio.remote.prompt();
    } 
    // Fallback caso o navegador não suporte
    else {
        alert("A transmissão AirPlay/Cast não é suportada nativamente por este navegador.");
    }
});

// Muda a cor do ícone se a transmissão iniciar
audio.addEventListener('webkitcurrentplaybacktargetiswirelesschanged', (e) => {
    if (audio.webkitCurrentPlaybackTargetIsWireless) {
        airplayBtn.classList.add("active");
    } else {
        airplayBtn.classList.remove("active");
    }
});

// --- GERADOR DE CHIADO ---
let audioCtx;
let noiseNode;
let noiseGain;
let noiseFilter;

function initChiado() {
    if (audioCtx) return; 
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = audioCtx.sampleRate * 2; 
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    
    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;
    noiseFilter = audioCtx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 1200;
    noiseGain = audioCtx.createGain();
    noiseGain.gain.value = 0; 

    noiseNode.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noiseNode.start();
}

function playChiado() {
    if (!audioCtx) initChiado();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    noiseGain.gain.setTargetAtTime(0.3, audioCtx.currentTime, 0.1); // Volume do chiado travado
}

function stopChiado() {
    if (noiseGain) noiseGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1); 
}

audio.addEventListener('playing', () => {
    stopChiado();
    const radio = radios[currentIndex];
    statusConexao.innerText = `${radio.name} - ${radio.city} - AO VIVO`;
    playIcon.className = "fa-solid fa-pause";
});

// --- CONFIGURAÇÃO DA RÉGUA (DIAL) ---
const minFreq = 80.0;
const maxFreq = 110.0;
const tickWidth = 14; 

for (let f = minFreq; f <= maxFreq; f += 0.1) {
    let freqFixed = Number(f.toFixed(1));
    const tick = document.createElement("div");
    let type = "minor";
    let showText = "";
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

// --- LÓGICA DE ARRASTAR ---
let isDragging = false;
let startX = 0;
let initialTranslateX = 0;

dialContainer.addEventListener('pointerdown', (e) => {
    isDragging = true;
    startX = e.clientX;
    const style = window.getComputedStyle(dialStrip);
    initialTranslateX = new WebKitCSSMatrix(style.transform).m41; 
    dialStrip.style.transition = 'none'; 
    
    audio.pause();
    playChiado();
    playIcon.className = "fa-solid fa-play";
    
    statusConexao.innerText = "Sintonizando...";
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
    isDragging = false;
    dialStrip.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    
    const freqSintonizada = parseFloat(freqValor.innerText);
    atualizarPosicaoDial(freqSintonizada);

    const indexDaRadioEncontrada = radios.findIndex(r => parseFloat(r.freq) === freqSintonizada);

    if (indexDaRadioEncontrada !== -1) {
        currentIndex = indexDaRadioEncontrada;
        carregarRadio(currentIndex);
        audio.play().catch(() => { statusConexao.innerText = "Erro ao conectar"; });
    } else {
        estacaoNome.innerText = "";
        statusConexao.innerText = "";
        favIcon.classList.replace("fa-solid", "fa-regular");
        if (noiseFilter) noiseFilter.frequency.value = 1000;
    }
});

// --- FUNÇÕES GERAIS ---
function verificarFavorito(id) {
    if (favoritas.includes(id)) { favIcon.classList.replace("fa-regular", "fa-solid"); } 
    else { favIcon.classList.replace("fa-solid", "fa-regular"); }
}

function carregarRadio(index) {
    const radio = radios[index];
    freqValor.innerText = radio.freq;
    estacaoNome.innerText = "";
    statusConexao.innerText = "Sintonizando...";
    
    audio.src = radio.url;
    atualizarPosicaoDial(radio.freq);
    verificarFavorito(radio.id);
    renderizarFavoritas();
}

playBtn.addEventListener("click", () => {
    if (audio.paused) {
        if (estacaoNome.innerText !== "Sem Sinal") {
            statusConexao.innerText = "Sintonizando...";
            audio.play();
        }
    } else {
        audio.pause();
        stopChiado();
        statusConexao.innerText = "Pausado";
        playIcon.className = "fa-solid fa-play";
    }
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

// Inicializa
carregarRadio(0);

// Restante dos Modais
window.showTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}
function renderizarFavoritas() {
    const listaFav = document.getElementById("favoritas-list");
    listaFav.innerHTML = "";
    if (favoritas.length === 0) { listaFav.innerHTML = "<p style='text-align:center; padding: 20px; color: #666;'>Nenhuma rádio favorita.</p>"; return; }
    radios.filter(r => favoritas.includes(r.id)).forEach(r => {
        const li = document.createElement("li"); li.className = "station-item";
        li.innerHTML = `<div><strong>${r.name}</strong> (${r.freq} FM)<br><small style="color:#888">${r.city}</small></div>`;
        li.addEventListener("click", () => {
            currentIndex = radios.findIndex(rad => rad.id === r.id);
            carregarRadio(currentIndex); document.getElementById("modal-config").classList.remove("active"); audio.play();
        });
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
        li.innerHTML = `<div><strong>${r.name}</strong> (${r.freq} FM)<br><small style="color:#888">${r.city}</small></div>`;
        li.addEventListener("click", () => {
            currentIndex = idx; carregarRadio(currentIndex); modalEstacoes.classList.remove("active"); audio.play();
        });
        lista.appendChild(li);
    });
}
