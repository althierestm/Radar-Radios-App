// Links com transmissões super estáveis
const radios = [
    // Sua rádio: tirei o ".m3u" para o navegador conseguir ler o áudio direto
    { id: "minha-radio", name: "Minha Rádio Web", freq: "87.9", city: "Web Rádio", url: "https://stream.zeno.fm/qrothx4gudetv" },
    { id: "antena1", name: "Antena 1 FM", freq: "94.7", city: "São Paulo - SP", url: "https://antena1.crossradio.com.br/stream/1/" },
    { id: "massa-fm", name: "Massa FM", freq: "92.9", city: "São Paulo - SP", url: "https://cast.upx.com:8043/stream" },
    { id: "atividade-fm", name: "Rádio Atividade FM", freq: "97.3", city: "Muriaé - MG", url: "https://stm1.xcast.com.br:7054/stream" },
    { id: "alpha-fm", name: "Alpha FM", freq: "101.7", city: "São Paulo - SP", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/ALPHA_FMAAC.aac" },
    { id: "jb-fm", name: "JB FM", freq: "99.9", city: "Rio de Janeiro - RJ", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/JBPFMAAC.aac" }
];

let currentIndex = 0;
let favoritas = JSON.parse(localStorage.getItem("radar_favoritas")) || [];

const audio = document.getElementById("audio-stream");
const playBtn = document.getElementById("btn-play");
const playIcon = document.getElementById("play-icon");
const freqValor = document.getElementById("freq-valor");
const estacaoNome = document.getElementById("estacao-nome");
const statusConexao = document.getElementById("status-conexao");
const volumeSlider = document.getElementById("volume-slider");
const dialStrip = document.getElementById("dial-strip");
const dialContainer = document.getElementById("dial-container");
const favIcon = document.getElementById("fav-icon");

// --- 1. GERADOR DE CHIADO COM VOLUME VINCULADO ---
let audioCtx;
let noiseNode;
let noiseGain;
let noiseActiveMultiplier = 0; // Controla se o chiado deve ter som (0.3) ou ficar mudo (0)

function initChiado() {
    if (audioCtx) return; 
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    const bufferSize = audioCtx.sampleRate * 2; 
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;

    noiseGain = audioCtx.createGain();
    noiseGain.gain.value = 0; 

    noiseNode.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noiseNode.start();
}

function playChiado() {
    if (!audioCtx) initChiado();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    noiseActiveMultiplier = 0.3;
    const currentVol = parseFloat(volumeSlider.value);
    noiseGain.gain.setTargetAtTime(currentVol * noiseActiveMultiplier, audioCtx.currentTime, 0.1); 
}

function stopChiado() {
    if (noiseGain) {
        noiseActiveMultiplier = 0;
        noiseGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1); 
    }
}

// Parar chiado ao tocar a rádio
audio.addEventListener('playing', () => {
    stopChiado();
    statusConexao.innerText = "AO VIVO";
    playIcon.className = "fa-solid fa-pause";
});

// Atualiza o volume tanto da rádio quanto do chiado simultaneamente
volumeSlider.addEventListener("input", (e) => {
    const vol = parseFloat(e.target.value);
    audio.volume = vol;
    if (noiseGain) {
        noiseGain.gain.setTargetAtTime(vol * noiseActiveMultiplier, audioCtx.currentTime, 0.1);
    }
});

// --- 2. CONFIGURAÇÃO DA RÉGUA (DIAL) INFINITA ---
const minFreq = 60.0;
const maxFreq = 130.0;
const tickWidth = 14; 

for (let f = minFreq; f <= maxFreq; f += 0.1) {
    let freqFixed = Number(f.toFixed(1));
    const tick = document.createElement("div");
    
    let type = "minor";
    let showText = "";
    
    if (Math.abs(freqFixed % 1) < 0.05) {
        type = "major";
        showText = freqFixed.toFixed(0);
    } else if (Math.abs((freqFixed * 10) % 5) < 0.5) {
        type = "medium";
    }
    
    tick.className = `dial-tick ${type}`;
    tick.innerHTML = `<span>${showText}</span><div class="line"></div>`;
    dialStrip.appendChild(tick);
}

function atualizarPosicaoDial(freqStr) {
    const freq = parseFloat(freqStr);
    const totalTracos = (freq - minFreq) / 0.1;
    const deslocamentoPx = totalTracos * tickWidth;
    dialStrip.style.transform = `translateX(${-deslocamentoPx}px)`;
}

// --- 3. LÓGICA DE ARRASTAR ---
let isDragging = false;
let startX = 0;
let initialTranslateX = 0;

dialContainer.addEventListener('pointerdown', (e) => {
    isDragging = true;
    startX = e.clientX;
    
    const style = window.getComputedStyle(dialStrip);
    const matrix = new WebKitCSSMatrix(style.transform);
    initialTranslateX = matrix.m41; 
    
    dialStrip.style.transition = 'none'; 
    
    audio.pause();
    playChiado();
    playIcon.className = "fa-solid fa-play";
    statusConexao.innerText = "Sintonizando...";
});

window.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    
    const currentX = e.clientX;
    const diferencaX = currentX - startX;
    let novoTranslateX = initialTranslateX + diferencaX;
    
    const minTranslate = -((maxFreq - minFreq) / 0.1) * tickWidth;
    if (novoTranslateX > 0) novoTranslateX = 0;
    if (novoTranslateX < minTranslate) novoTranslateX = minTranslate;

    dialStrip.style.transform = `translateX(${novoTranslateX}px)`;

    const freqAtual = minFreq + (Math.abs(novoTranslateX) / tickWidth) * 0.1;
    freqValor.innerText = freqAtual.toFixed(1);
    estacaoNome.innerText = "Buscando sinal...";
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
        estacaoNome.innerText = "Sem Sinal";
        statusConexao.innerText = "Chiado estático";
        favIcon.classList.replace("fa-solid", "fa-regular");
    }
});

// --- 4. FUNÇÕES GERAIS DO PLAYER ---
function verificarFavorito(id) {
    if (favoritas.includes(id)) {
        favIcon.classList.replace("fa-regular", "fa-solid");
    } else {
        favIcon.classList.replace("fa-solid", "fa-regular");
    }
}

function carregarRadio(index) {
    const radio = radios[index];
    freqValor.innerText = radio.freq;
    estacaoNome.innerText = radio.name;
    audio.src = radio.url;
    statusConexao.innerText = "Conectando...";
    atualizarPosicaoDial(radio.freq);
    verificarFavorito(radio.id);
    renderizarFavoritas();
}

playBtn.addEventListener("click", () => {
    if (audio.paused) {
        if (estacaoNome.innerText !== "Sem Sinal") {
            statusConexao.innerText = "Conectando...";
            audio.play();
        }
    } else {
        audio.pause();
        stopChiado();
        statusConexao.innerText = "Pausado";
        playIcon.className = "fa-solid fa-play";
    }
});

document.getElementById("btn-next").addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % radios.length;
    carregarRadio(currentIndex);
    if (!audio.paused || playIcon.classList.contains("fa-pause")) audio.play();
});

document.getElementById("btn-prev").addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + radios.length) % radios.length;
    carregarRadio(currentIndex);
    if (!audio.paused || playIcon.classList.contains("fa-pause")) audio.play();
});

// --- 5. FAVORITOS, CONFIGURAÇÕES E MODAIS ---
document.getElementById("btn-fav").addEventListener("click", () => {
    if (estacaoNome.innerText === "Sem Sinal") return; 
    const radioAtual = radios[currentIndex];
    if (favoritas.includes(radioAtual.id)) {
        favoritas = favoritas.filter(id => id !== radioAtual.id);
    } else {
        favoritas.push(radioAtual.id);
    }
    localStorage.setItem("radar_favoritas", JSON.stringify(favoritas));
    verificarFavorito(radioAtual.id);
    renderizarFavoritas();
});

window.showTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
}

function renderizarFavoritas() {
    const listaFav = document.getElementById("favoritas-list");
    listaFav.innerHTML = "";
    if (favoritas.length === 0) {
        listaFav.innerHTML = "<p style='text-align:center; padding: 20px; color: #666;'>Nenhuma rádio favorita.</p>";
        return;
    }
    radios.filter(r => favoritas.includes(r.id)).forEach(r => {
        const li = document.createElement("li");
        li.className = "station-item";
        li.innerHTML = `<div><strong>${r.name}</strong> (${r.freq} FM)<br><small style="color:#888">${r.city}</small></div>`;
        li.addEventListener("click", () => {
            currentIndex = radios.findIndex(rad => rad.id === r.id);
            carregarRadio(currentIndex);
            document.getElementById("modal-config").classList.remove("active");
            audio.play();
        });
        listaFav.appendChild(li);
    });
}

const modalEstacoes = document.getElementById("modal-estacoes");
const modalConfig = document.getElementById("modal-config");
document.getElementById("btn-lista").addEventListener("click", () => { abrirListaGeral(); modalEstacoes.classList.add("active"); });
document.getElementById("btn-mais-regioes").addEventListener("click", () => { abrirListaGeral(); modalEstacoes.classList.add("active"); });
document.querySelectorAll(".fechar-modal").forEach(btn => btn.addEventListener("click", () => modalEstacoes.classList.remove("active")));
document.querySelectorAll(".fechar-config").forEach(btn => btn.addEventListener("click", () => modalConfig.classList.remove("active")));
document.getElementById("btn-config").addEventListener("click", () => { renderizarFavoritas(); modalConfig.classList.add("active"); });

function abrirListaGeral() {
    const lista = document.getElementById("station-list");
    lista.innerHTML = "";
    radios.forEach((r, idx) => {
        const li = document.createElement("li");
        li.className = "station-item";
        li.innerHTML = `<div><strong>${r.name}</strong> (${r.freq} FM)<br><small style="color:#888">${r.city}</small></div>`;
        li.addEventListener("click", () => {
            currentIndex = idx;
            carregarRadio(currentIndex);
            modalEstacoes.classList.remove("active");
            audio.play();
        });
        lista.appendChild(li);
    });
}

// Inicializa no Start
carregarRadio(0);
