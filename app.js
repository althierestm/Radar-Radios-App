// Links REAIS que funcionam direto no navegador e inclusão de emissoras locais
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
const favIcon = document.getElementById("fav-icon");

// Gerar Régua "Infinita" (De 60.0 a 130.0 MHz)
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
    statusConexao.innerText = "Pronto";
    atualizarPosicaoDial(radio.freq);
    verificarFavorito(radio.id);
    renderizarFavoritas();
}

// Play / Pause (Agora com ícone sólido sem fundo)
playBtn.addEventListener("click", () => {
    if (audio.paused) {
        statusConexao.innerText = "Conectando...";
        audio.play().then(() => {
            statusConexao.innerText = "AO VIVO";
            playIcon.className = "fa-solid fa-pause";
        }).catch(() => {
            statusConexao.innerText = "Stream temporariamente indisponível";
        });
    } else {
        audio.pause();
        statusConexao.innerText = "Pausado";
        playIcon.className = "fa-solid fa-play";
    }
});

// Botões -5s e +5s
document.getElementById("btn-rewind").addEventListener("click", () => {
    if (!isNaN(audio.currentTime)) audio.currentTime -= 5;
});
document.getElementById("btn-forward").addEventListener("click", () => {
    if (!isNaN(audio.currentTime)) audio.currentTime += 5;
});

document.getElementById("btn-next").addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % radios.length;
    carregarRadio(currentIndex);
    if (!audio.paused) audio.play();
});

document.getElementById("btn-prev").addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + radios.length) % radios.length;
    carregarRadio(currentIndex);
    if (!audio.paused) audio.play();
});

volumeSlider.addEventListener("input", (e) => audio.volume = e.target.value);

// Sistema de Favoritar Rádios
document.getElementById("btn-fav").addEventListener("click", () => {
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

// Abas de Configuração
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
        listaFav.innerHTML = "<p style='text-align:center; padding: 20px; color: #666;'>Nenhuma rádio favoritada ainda.</p>";
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
            if (!audio.paused) audio.play();
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

document.getElementById("btn-config").addEventListener("click", () => {
    renderizarFavoritas();
    modalConfig.classList.add("active");
});

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
            if (!audio.paused) audio.play();
        });
        lista.appendChild(li);
    });
}

// Busca / Filtro
document.getElementById("filtra-estacao").addEventListener("input", (e) => {
    const termo = e.target.value.toLowerCase();
    document.querySelectorAll("#station-list .station-item").forEach(item => {
        item.style.display = item.innerText.toLowerCase().includes(termo) ? "flex" : "none";
    });
});

// Inicialização
carregarRadio(0);
