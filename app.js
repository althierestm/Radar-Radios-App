// Lista inicial de rádios (incluindo opções de Minas Gerais e Brasil)
const radios = [
    { name: "Rádio Massa FM", freq: "98.7", city: "São Paulo - SP", url: "https://stream.zeno.fm/f3wvbbqmdg8uv" },
    { name: "Itatiaia FM", freq: "95.7", city: "Belo Horizonte - MG", url: "https://envivoweb.itatiaia.com.br/live" },
    { name: "Rádio Radar FM", freq: "87.9", city: "Muriaé - MG", url: "https://stream.zeno.fm/0000000000000" }, // Exemplo
    { name: "Transamérica FM", freq: "100.1", city: "São Paulo - SP", url: "https://stream.zeno.fm/f3wvbbqmdg8uv" },
    { name: "Alvorada FM", freq: "94.9", city: "Belo Horizonte - MG", url: "https://live.alvoradafm.com.br/live" }
];

let currentIndex = 0;
const audio = document.getElementById("audio-stream");
const playBtn = document.getElementById("btn-play");
const playIcon = document.getElementById("play-icon");
const freqValor = document.getElementById("freq-valor");
const estacaoNome = document.getElementById("estacao-nome");
const statusConexao = document.getElementById("status-conexao");
const volumeSlider = document.getElementById("volume-slider");

// Gerar marcações do Dial (de 87.5 a 108.0)
const dialRulers = document.getElementById("dial-rulers");
for (let f = 87.5; f <= 108.0; f += 0.2) {
    const mark = document.createElement("div");
    const isMajor = Number.isInteger(f) || Math.round(f * 10) % 10 === 0;
    mark.className = `dial-mark ${isMajor ? 'major' : ''}`;
    mark.innerHTML = `<span>${isMajor ? f.toFixed(0) : ''}</span><div class="line"></div>`;
    dialRulers.appendChild(mark);
}

function carregarRadio(index) {
    const radio = radios[index];
    freqValor.innerText = radio.freq;
    estacaoNome.innerText = radio.name;
    audio.src = radio.url;
    statusConexao.innerText = "Pronto";
}

// Controles Play/Pause
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

// Volume
volumeSlider.addEventListener("input", (e) => {
    audio.volume = e.target.value;
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

// Modal de Estações
const modal = document.getElementById("modal-estacoes");
document.getElementById("btn-lista").addEventListener("click", () => {
    popularListaModal();
    modal.classList.add("active");
});
document.getElementById("fechar-modal").addEventListener("click", () => {
    modal.classList.remove("active");
});

function popularListaModal() {
    const lista = document.getElementById("station-list");
    lista.innerHTML = "";
    radios.forEach((r, idx) => {
        const li = document.createElement("li");
        li.className = "station-item";
        li.innerHTML = `<span><strong>${r.name}</strong> (${r.freq} FM)</span> <small>${r.city}</small>`;
        li.addEventListener("click", () => {
            currentIndex = idx;
            carregarRadio(currentIndex);
            modal.classList.remove("active");
            if (!audio.paused) audio.play();
        });
        lista.appendChild(li);
    });
}

// Inicializar primeira rádio
carregarRadio(0);
