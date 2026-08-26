// Links REAIS (Incluindo as da sua região)
const radios = [
    { id: "radar-fm", name: "Rádio Radar FM", freq: "87.9", city: "Muriaé - MG", url: "https://servidor31.brlogic.com:8318/live" },
    { id: "atividade-fm", name: "Rádio Atividade FM", freq: "97.3", city: "Muriaé - MG", url: "https://stm1.xcast.com.br:7054/stream" },
    { id: "antena1", name: "Antena 1 FM", freq: "94.7", city: "São Paulo - SP", url: "https://stream.antena1.com.br/stream/1/" },
    { id: "alpha-fm", name: "Alpha FM", freq: "101.7", city: "São Paulo - SP", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/ALPHA_FMAAC.aac" },
    { id: "jb-fm", name: "JB FM", freq: "99.9", city: "Rio de Janeiro - RJ", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/JBPFMAAC.aac" },
    { id: "metropolitana", name: "Metropolitana FM", freq: "98.5", city: "São Paulo - SP", url: "https://metropolitana.crossradio.com.br/stream/1/" }
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

// --- 1. GERADOR DE CHIADO (ESTÁTICA) COM WEB AUDIO API ---
let audioCtx;
let noiseNode;
let noiseGain;

function initChiado() {
    if (audioCtx) return; // Já foi iniciado
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // Cria 2 segundos de ruído branco
    const bufferSize = audioCtx.sampleRate * 2; 
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    // Filtro para parecer chiado de rádio antigo
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1200;

    noiseGain = audioCtx.createGain();
    noiseGain.gain.value = 0; // Começa mudo

    noiseNode.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(audioCtx.destination);
    noiseNode.start();
}

function playChiado() {
    if (!audioCtx) initChiado();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    noiseGain.gain.setTargetAtTime(0.3, audioCtx.currentTime, 0.1); // Aumenta o volume suavemente
}

function stopChiado() {
    if (noiseGain) {
        noiseGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1); // Zera o volume suavemente
    }
}

// Parar o chiado quando a rádio de fato começar a tocar ao vivo
audio.addEventListener('playing', () => {
    stopChiado();
    statusConexao.innerText = "AO VIVO";
    playIcon.className = "fa-solid fa-pause";
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

// --- 3. LÓGICA DE ARRASTAR (DRAG & DROP / TOUCH) ---
let isDragging = false;
let startX = 0;
let initialTranslateX = 0;

dialContainer.addEventListener('pointerdown', (e) => {
    isDragging = true;
    startX = e.clientX;
    
    // Captura a posição exata de onde a régua está agora
    const style = window.getComputedStyle(dialStrip);
    const matrix = new WebKitCSSMatrix(style.transform);
    initialTranslateX = matrix.m41; // Pega o valor do translateX
    
    dialStrip.style.transition = 'none'; // Remove animação para não ter lag ao arrastar
    
    // Pausa a rádio atual e solta o chiado
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
    
    // Limites para não arrastar para fora da régua
    const minTranslate = -((maxFreq - minFreq) / 0.1) * tickWidth;
    if (novoTranslateX > 0) novoTranslateX = 0;
    if (novoTranslateX < minTranslate) novoTranslateX = minTranslate;

    dialStrip.style.transform = `translateX(${novoTranslateX}px)`;

    // Calcula e mostra a frequência dinamicamente enquanto arrasta
    const freqAtual = minFreq + (Math.abs(novoTranslateX) / tickWidth) * 0.1;
    freqValor.innerText = freqAtual.toFixed(1);
    estacaoNome.innerText = "Buscando sinal...";
});

window.addEventListener('pointerup', () => {
    if (!isDragging) return;
    isDragging = false;
    dialStrip.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    
    // Arredonda a frequência para alinhar perfeitamente com um tracinho
    const freqSintonizada = parseFloat(freqValor.innerText);
    atualizarPosicaoDial(freqSintonizada);

    // Verifica se existe rádio nessa frequência
    const indexDaRadioEncontrada = radios.findIndex(r => parseFloat(r.freq) === freqSintonizada);

    if (indexDaRadioEncontrada !== -1) {
        // ACHOU! Carrega a rádio e dá o Play automático
        currentIndex = indexDaRadioEncontrada;
        carregarRadio(currentIndex);
        audio.play().catch(() => { statusConexao.innerText = "Erro ao conectar"; });
    } else {
        // NÃO ACHOU RÁDIO: Deixa chiando
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

volumeSlider.addEventListener("input", (e) => audio.volume = e.target.value);

// --- 5. FAVORITOS, CONFIGURAÇÕES E MODAIS ---
document.getElementById("btn-fav").addEventListener("click", () => {
    if (estacaoNome.innerText === "Sem Sinal") return; // Não favorita chiado
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

// Modais
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
