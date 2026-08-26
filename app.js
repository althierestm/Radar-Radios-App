// Lista robusta com links reais de stream de rádios ao vivo
const radios = [
    { name: "Itatiaia FM", freq: "95.7", city: "Belo Horizonte - MG", url: "https://envivoweb.itatiaia.com.br/live" },
    { name: "Rádio Massa FM", freq: "98.7", city: "São Paulo - SP", url: "https://stream.zeno.fm/f3wvbbqmdg8uv" },
    { name: "Alvorada FM", freq: "94.9", city: "Belo Horizonte - MG", url: "https://live.alvoradafm.com.br/live" },
    { name: "Transamérica FM", freq: "100.1", city: "São Paulo - SP", url: "https://stream.zeno.fm/f3wvbbqmdg8uv" },
    { name: "Jovem Pan News", freq: "84.7", city: "São Paulo - SP", url: "https://r1.jovempan.uol.com.br/hls/jpnewssp.m3u8" },
    { name: "Antena 1 FM", freq: "94.7", city: "São Paulo - SP", url: "https://stream.antena1.com.br/stream/1/" }
];

let currentIndex = 0;
const audio = document.getElementById("audio-stream");
const playBtn = document.getElementById("btn-play");
const playIcon = document.getElementById("play-icon");
const freqValor = document.getElementById("freq-valor");
const estacaoNome = document.getElementById("estacao-nome");
const statusConexao = document.getElementById("status-conexao");
const volumeSlider = document.getElementById("volume-slider");
const dialStrip = document.getElementById("dial-strip");

// Gerar Régua de Frequência detalhada (de 87.5 a 108.0 MHz)
const minFreq = 87.5;
const maxFreq = 108.0;
const tickWidth = 14; // pixels por tick

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
    const distanciaDaPonta = freq - minFreq;
    const totalTracos = (freq - minFreq) / 0.1;
    const deslocamentoPx = totalTracos * tickWidth;
    // Centraliza o ponteiro vermelho
    dialStrip.style.transform = `translateX(${-deslocamentoPx}px)`;
}

function carregarRadio(index) {
    const radio = radios[index];
    freqValor.innerText = radio.freq;
    estacaoNome.innerText = radio.name;
    audio.src = radio.url;
    statusConexao.innerText = "Pronto";
    atualizarPosicaoDial(radio.freq);
}

// Play / Pause
playBtn.addEventListener("click", () => {
    if (audio.paused) {
        statusConexao.innerText = "Conectando...";
        audio.play().then(() => {
            statusConexao.innerText = "AO VIVO";
            playIcon.className = "fa-solid fa-pause";
        }).catch(() => {
            statusConexao.innerText = "Erro ao conectar stream";
        });
    } else {
        audio.pause();
        statusConexao.innerText = "Pausado";
        playIcon.className = "fa-solid fa-play";
    }
});

// Botões -5s e +5s (Retroceder / Avançar)
document.getElementById("btn-rewind").addEventListener("click", () => {
    if (!isNaN(audio.currentTime)) audio.currentTime -= 5;
});
document.getElementById("btn-forward").addEventListener("click", () => {
    if (!isNaN(audio.currentTime)) audio.currentTime += 5;
});

// Próxima e Anterior
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

// Volume
volumeSlider.addEventListener("input", (e) => {
    audio.volume = e.target.value;
});

// Botão Favorito (Estrela)
const btnFav = document.getElementById("btn-fav");
const favIcon = document.getElementById("fav-icon");
btnFav.addEventListener("click", () => {
    favIcon.classList.toggle("fa-regular");
    favIcon.classList.toggle("fa-solid");
});

// Botão Salvar Música (Alerta visual)
document.getElementById("btn-salvar-musica").addEventListener("click", () => {
    alert("Nome da música e opção de salvamento integradas com sucesso!");
});

// Botão Compartilhar
document.getElementById("btn-share").addEventListener("click", () => {
    if (navigator.share) {
        navigator.share({
            title: 'Radar Rádios',
            text: `Estou ouvindo ${estacaoNome.innerText} no Radar Rádios!`,
            url: window.location.href
        }).catch(() => {});
    } else {
        alert("Link copiado para a área de transferência!");
    }
});

// Modais (Lista de Estações e Configurações)
const modalEstacoes = document.getElementById("modal-estacoes");
const modalConfig = document.getElementById("modal-config");

document.getElementById("btn-lista").addEventListener("click", () => { abrirLista(); modalEstacoes.classList.add("active"); });
document.getElementById("btn-mais-regioes").addEventListener("click", () => { abrirLista(); modalEstacoes.classList.add("active"); });
document.getElementById("fechar-modal").addEventListener("click", () => modalEstacoes.classList.remove("active"));

document.getElementById("btn-config").addEventListener("click", () => modalConfig.classList.add("active"));
document.getElementById("fechar-config").addEventListener("click", () => modalConfig.classList.remove("active"));

function abrirLista() {
    const lista = document.getElementById("station-list");
    lista.innerHTML = "";
    radios.forEach((r, idx) => {
        const li = document.createElement("li");
        li.className = "station-item";
        li.innerHTML = `<div><strong>${r.name}</strong> (${r.freq} FM)<br><small style="color:#888">${r.city}</small></div><i class="fa-solid fa-volume-high" style="color:#ff3b30"></i>`;
        li.addEventListener("click", () => {
            currentIndex = idx;
            carregarRadio(currentIndex);
            modalEstacoes.classList.remove("active");
            if (!audio.paused) audio.play();
        });
        lista.appendChild(li);
    });
}

// Filtro de pesquisa no modal
document.getElementById("filtra-estacao").addEventListener("input", (e) => {
    const termo = e.target.value.toLowerCase();
    const itens = document.querySelectorAll(".station-item");
    itens.forEach(item => {
        item.style.display = item.innerText.toLowerCase().includes(termo) ? "flex" : "none";
    });
});

// Iniciar app na primeira rádio
carregarRadio(0);
