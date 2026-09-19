const radiosRaw = [
    { id: "radar-fm", name: "Radar FM", freq: "87.9", city: "Muriaé - MG", genre: "Eclética", url: "https://stream.zeno.fm/qrothx4gudetv" },
    { id: "radio-muriae", name: "Rádio Muriaé", freq: "99.5", city: "Muriaé - MG", genre: "Jornalismo", url: "https://5a57bda70564a.streamlock.net/muriaeamhd/muriaeamhd.stream/playlist.m3u8" },
    { id: "muriae-play", name: "Rádio Muriaé Play", freq: "99.5", city: "Muriaé - MG", genre: "Hits", url: "https://stream.zeno.fm/d42wceognggtv" },
    { id: "jere-fm", name: "JERE FM", freq: "106.9", city: "Jeremoabo - BA", genre: "Eclética", url: "https://1.stmip.net:2044/stream" },
    { id: "hunter-80s", name: "Hunter Anos 80", freq: "106.9", city: "Brasília - DF", genre: "Flashback", url: "https://hls.hunter.fm/80s/64.m3u8?shtl=OR99PlKze7mgR_U1AF_NVQZ0.dLFtA%2FSwg6Gi%2Fh77nRQTbBFiELSZm%2BOueXvqQcHVqGs" },
    { id: "energia-97", name: "Energia 97", freq: "97.7", city: "São Paulo - SP", genre: "Eletrônica/Pop", url: "https://streaming.inweb.com.br/energia" },
    { id: "salvador-fm", name: "Salvador FM", freq: "92.3", city: "Salvador - BA", genre: "Eclética", url: "https://streaming.livespanel.com:9230/ssafm9230" },
    { id: "hunter-pop", name: "Hunter Pop", freq: "92.3", city: "Brasília - DF", genre: "Pop", url: "https://hls.hunter.fm/pop/64.m3u8?shtl=OR99PlKze7mgR_U1AF_NVQZ0.dLFtA%2FSwg6Gi%2Fh77nRQTbBFiELSZm%2BOueXvqQcHVqGs" },
    { id: "hunter-pagode", name: "Hunter Pagode", freq: "94.1", city: "Brasília - DF", genre: "Samba/Pagode", url: "https://hls.hunter.fm/pagode/64.m3u8?shtl=rLegrEjjYDLNiSScageIw8HO.tFEvhucVcOviAxNp1EnuCrAm7v1GpVOQdCA6q2VZ0CA" },
    { id: "hunter-sertanejo", name: "Hunter Sertanejo", freq: "90.5", city: "Brasília - DF", genre: "Sertanejo", url: "https://hls.hunter.fm/sertanejo/64.m3u8?shtl=rLegrEjjYDLNiSScageIw8HO.tFEvhucVcOviAxNp1EnuCrAm7v1GpVOQdCA6q2VZ0CA" },
    { id: "hunter-hits", name: "Hunter Hits", freq: "101.3", city: "Brasília - DF", genre: "Hits Brasil", url: "https://hls.hunter.fm/hitsbrasil/64.m3u8?shtl=7KWu3SjMvgY-GhV1-8B6b9rB.lpykqpyxgqfSK4vGJSb3tqheOVp2UggEshcePVZJDVw" },
    { id: "hunter-pisadinha", name: "Hunter Pisadinha", freq: "98.1", city: "Brasília - DF", genre: "Forró", url: "https://hls.hunter.fm/pisadinha/64.m3u8?shtl=rLegrEjjYDLNiSScageIw8HO.tFEvhucVcOviAxNp1EnuCrAm7v1GpVOQdCA6q2VZ0CA" },
    { id: "hunter-kpop", name: "Hunter K-Pop", freq: "102.5", city: "Brasília - DF", genre: "K-Pop", url: "https://stream.hunter.fm/kpop/64.m3u8" },
    { id: "hunter-pop2k", name: "Hunter Pop 2K", freq: "104.5", city: "Brasília - DF", genre: "Pop 2000", url: "https://hls.hunter.fm/pop2k/64.m3u8?shtl=OR99PlKze7mgR_U1AF_NVQZ0.dLFtA%2FSwg6Gi%2Fh77nRQTbBFiELSZm%2BOueXvqQcHVqGs" },
    { id: "hunter-gospel", name: "Hunter Gospel", freq: "103.1", city: "Brasília - DF", genre: "Gospel", url: "https://hls.hunter.fm/gospel/64.m3u8?shtl=OR99PlKze7mgR_U1AF_NVQZ0.dLFtA%2FSwg6Gi%2Fh77nRQTbBFiELSZm%2BOueXvqQcHVqGs" },
    { id: "hunter-moda", name: "Hunter Moda", freq: "105.7", city: "Brasília - DF", genre: "Sertanejo Raiz", url: "https://hls.hunter.fm/modasertaneja/64.m3u8?shtl=OR99PlKze7mgR_U1AF_NVQZ0.dLFtA%2FSwg6Gi%2Fh77nRQTbBFiELSZm%2BOueXvqQcHVqGs" },
    { id: "hunter-tropical", name: "Hunter Tropical", freq: "107.9", city: "Brasília - DF", genre: "Brasilidades", url: "https://hls.hunter.fm/tropical/64.m3u8?shtl=OR99PlKze7mgR_U1AF_NVQZ0.dLFtA%2FSwg6Gi%2Fh77nRQTbBFiELSZm%2BOueXvqQcHVqGs" },
    { id: "hunter-rock", name: "Hunter Rock", freq: "96.7", city: "Brasília - DF", genre: "Rock", url: "https://hls.hunter.fm/rock/64.m3u8?shtl=OR99PlKze7mgR_U1AF_NVQZ0.dLFtA%2FSwg6Gi%2Fh77nRQTbBFiELSZm%2BOueXvqQcHVqGs" },
    { id: "hunter-lofi", name: "Hunter LoFi", freq: "107.5", city: "Brasília - DF", genre: "Lo-Fi", url: "https://stream.hunter.fm/lofi/64.m3u8" },
    { id: "radio-pop", name: "Rádio POP", freq: "88.5", city: "Web", genre: "Pop", url: "https://virtues.live:8254/stream" },
    { id: "euclides-cunha", name: "Euclides da Cunha", freq: "91.1", city: "Euclides da Cunha - BA", genre: "Eclética", url: "https://servidor25-2.brlogic.com:8024/live" },
    { id: "gospel-inter", name: "Gospel Inter", freq: "95.5", city: "Web", genre: "Gospel", url: "https://stream.vagalume.fm/hls/1470245767122628/aac.m3u8" },
    { id: "antena-1", name: "Antena 1", freq: "94.7", city: "São Paulo - SP", genre: "Adulto Contemporâneo", url: "https://antenaone.crossradio.com.br/stream/1" },
    { id: "jp-fm", name: "Jovem Pan FM", freq: "100.9", city: "São Paulo - SP", genre: "Pop/Hits", url: "https://stream.zeno.fm/c45wbq2us3buv" },
    { id: "jp-news", name: "Jovem Pan News", freq: "76.7", city: "São Paulo - SP", genre: "Notícias", url: "https://stream.zeno.fm/vlcraijc6yiuv" },
    { id: "brado-radio", name: "Brado Rádio", freq: "93.1", city: "Web", genre: "Notícias", url: "https://servidor17-5.brlogic.com:8300/live" },
    { id: "web-jp", name: "Web Rádio JP", freq: "100.1", city: "Web", genre: "Eclética", url: "https://stream.zeno.fm/a7klgcfvvw9uv" },
    { id: "cidade-ba", name: "Rádio Cidade BA", freq: "95.9", city: "Bahia", genre: "Pop/Hits", url: "https://streaming.livespanel.com:20959/cidadefmlem" },
    { id: "mix-bahia", name: "Mix Bahia", freq: "89.3", city: "Bahia", genre: "Pop", url: "https://8175.brasilstream.com.br/stream" },
    { id: "lairton-teclas", name: "Lairton Teclas", freq: "91.7", city: "Web", genre: "Variedades", url: "https://stream.zeno.fm/rv1w865yaphvv" },
    { id: "onda-beat", name: "Radio Onda Beat", freq: "101.1", city: "Litoral", genre: "Hits", url: "https://www.quinsanbroadcast.com.br:8040/101FM_LITORAL" },
    { id: "brazilian-fm", name: "Brazilian FM", freq: "107.7", city: "Web", genre: "Eclética", url: "http://s17.maxcast.com.br:8228/live" },
    { id: "96fm-natal", name: "96 FM Natal", freq: "96.7", city: "Natal - RN", genre: "Pop", url: "http://centova10.ciclanohost.com.br:6258/;" },
    { id: "arapuan-fm", name: "Arapuan FM", freq: "95.3", city: "João Pessoa - PB", genre: "Eclética", url: "https://streaming.engelhosting.com.br:10026/stream" },
    { id: "mix-1079", name: "Mix FM", freq: "107.9", city: "Web", genre: "Pop", url: "https://playerservices.streamtheworld.com/pls/WLNKFMAAC.pls?source=TuneIn" },
    { id: "wlni", name: "WLNI", freq: "105.9", city: "Web", genre: "Notícias", url: "https://ice66.securenetsystems.net/WLNI?playSessionID=BB4B565D-8260-47E9-BF1E5A6D474DAC8C&source=TuneIn" },
    { id: "on-charts", name: "ON Charts", freq: "102.1", city: "Web", genre: "Hits", url: "http://0n-charts.radionetz.de/0n-charts.aac" },
    { id: "radio-96", name: "Rádio 96 FM", freq: "96.1", city: "Web", genre: "Eclética", url: "http://cast2.youngtech.radio.br:8130/radio" },
    { id: "radio-videira", name: "Rádio Videira", freq: "88.1", city: "Videira - SC", genre: "Eclética", url: "https://5a2b083e9f360.streamlock.net/radiovideira/radiovideira.stream/playlist.m3u8" },
    { id: "vicosa-95", name: "Rádio Viçosa", freq: "95.1", city: "Viçosa - MG", genre: "Eclética", url: "https://stm1.streamproarte.com.br:7494/stream" },
    { id: "country-88", name: "Country 88", freq: "88.1", city: "Web", genre: "Country", url: "https://goldenwest.leanstream.co/CKMWFM?args=tunein_03" },
    { id: "plaisir-1055", name: "Plaisir", freq: "105.5", city: "Web", genre: "Eclética", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/CKLD_FM.mp3" },
    { id: "chiru-fm", name: "Rádio Chiru FM", freq: "104.3", city: "Web", genre: "Eclética", url: "https://stm01.virtualcast.com.br:8366/live" },
    { id: "highway-1", name: "Highway 1 Radio", freq: "99.1", city: "Web", genre: "Eclética", url: "https://bonneville.cdnstream1.com/2625_48.aac?aw_0_1st.playerid=TuneIn&aw_0_1st.skey=1729796666&lat=41.8874&lon=-87.6318&aw_0_1st.abtest=&aw_0_1st.stationId=s309452&aw_0_1st.premium=false&source=TuneIn&aw_0_1st.platform=tunein&aw_0_1st.genre_id=g115&aw_0_1st.class=music&aw_0_1st.ads_partner_alias=ce.Other&aw_0_azn.planguage=en&aw_0_1st.is_ondemand=false&aw_0_1st.topicId=na&aw_0_1st.affiliateIds=a38448%2ca40075&aw_0_1st.bandId=16" },
    { id: "nash-1025", name: "NASH FM", freq: "102.5", city: "Web", genre: "Country", url: "http://playerservices.streamtheworld.com/pls/WMDHFM.pls?tdtok=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiIsImtpZCI6ImZTeXA4In0.eyJpc3MiOiJ0aXNydiIsInN1YiI6IjIxMDY0IiwiaWF0IjoxNzI5Nzk2NzM3LCJ0ZC1yZWciOmZhbHNlfQ.c-VYAhk9TDNaRgzNUaZkjt2dWPFhtzNLPcUJeNDZZMA&DIST=TuneIn&TGT=TuneIn&maxServers=2&partnertok=eyJhbGciOiJIUzI1NiIsImtpZCI6InR1bmVpbiIsInR5cCI6IkpXVCJ9.eyJ0cnVzdGVkX3BhcnRuZXIiOnRydWUsImxhdCI6IjQxLjg4NzQiLCJsb25nIjoiLTg3LjYzMTgiLCJpYXQiOjE3Mjk3OTY3MzcsImlzcyI6InRpc3J2In0.Fqat5l-9mx8wuXdHH1ZbmZsg9ubwSCcskZH5Lv7Fm6I" },
    { id: "peaceful-piano", name: "Peaceful Piano", freq: "103.3", city: "Web", genre: "Clássica", url: "https://peacefulpiano.stream.publicradio.org/peacefulpiano.aac?srcid=tunein" },
    { id: "brian-fm-wanaka", name: "Brian FM Wanaka", freq: "100.5", city: "Web", genre: "Rock", url: "http://ais-sa1.streamon.fm/7657_128k.aac" },
    { id: "brian-fm-chch", name: "Brian FM Christchurch", freq: "105.3", city: "Web", genre: "Rock", url: "http://ais-sa1.streamon.fm/7409_128k.aac" },
    { id: "rtl-2000er", name: "89.0 RTL", freq: "89.1", city: "Web", genre: "Pop", url: "https://stream.89.0rtl.de/2000er/mp3-256/tunein/" },
    { id: "maxximum", name: "Maxximum", freq: "97.3", city: "Web", genre: "Eletrônica", url: "http://stream.rcs.revma.com/nwhyn2c6p98uv.mp3" },
    { id: "children", name: "YourClassical Children", freq: "91.5", city: "Web", genre: "Clássica", url: "https://classicalkids.stream.publicradio.org/classicalkids.aac?srcid=tunein" },
    { id: "rnb-radio", name: "RnB Radio", freq: "90.1", city: "Web", genre: "R&B", url: "https://listen.radioking.com/radio/181987/stream/223822" },
    { id: "capital-sp", name: "Rádio Capital", freq: "77.5", city: "São Paulo - SP", genre: "Jornalismo", url: "https://ice.fabricahost.com.br/capitalfmsp" },
    { id: "cruz-alta", name: "Rádio Cruz Alta", freq: "103.5", city: "Cruz Alta - RS", genre: "Eclética", url: "http://cast2.youngtech.radio.br:8150/radio" },
    { id: "norte-fm", name: "Norte FM", freq: "101.5", city: "Brasília - DF", genre: "Notícias", url: "https://live8.livemus.com.br:27246/stream" },
    { id: "purcell", name: "PURCELL", freq: "102.7", city: "Web", genre: "Eclética", url: "https://tunein-live-b.cdnstream1.com/3788_128.mp3?aw_0_1st.skey=1729809658&lat=36.6676&lon=-78.3875&aw_0_1st.abtest=&aw_0_1st.stationId=s221680&aw_0_1st.premium=false&source=TuneIn&aw_0_1st.platform=tunein&aw_0_1st.genre_id=g5&aw_0_1st.class=music&aw_0_1st.ads_partner_alias=ce.Other&aw_0_azn.planguage=en&aw_0_1st.is_ondemand=false&aw_0_1st.topicId=na&aw_0_1st.affiliateIds=a40075%2ca38725&aw_0_1st.bandId=16" },
    { id: "diario-sertao", name: "Diário do Sertão", freq: "97.5", city: "Cajazeiras - PB", genre: "Notícias", url: "http://wz3.dnip.com.br/pdsertao/pdsertao.stream/playlist.m3u8" },
    { id: "transamerica-aju", name: "Transamérica", freq: "90.5", city: "Aracaju - SE", genre: "Pop/Hits", url: "https://ice.fabricahost.com.br/transamericaaracaju" },
    { id: "radio-brasil", name: "Rádio Brasil", freq: "104.1", city: "Web", genre: "Eclética", url: "http://r13.ciclano.io:8417/stream" },
    { id: "viola-viva", name: "Viola Viva", freq: "99.3", city: "Web", genre: "Sertanejo", url: "https://centova.euroti.com.br:20055/stream" },
    { id: "wljf", name: "WLJF", freq: "100.7", city: "Web", genre: "Gospel", url: "http://stream.abacast.net/playlist/loveandfaith-wljffmaac-ibc2.m3u?source=TuneIn" }
];

const uniqueRadios = [];
const seenNames = new Set();
radiosRaw.forEach(r => {
    const normName = r.name.trim().toLowerCase();
    if (!seenNames.has(normName)) {
        seenNames.add(normName);
        uniqueRadios.push(r);
    }
});

const radios = uniqueRadios.sort((a, b) => parseFloat(a.freq) - parseFloat(b.freq));

let currentIndex = 0;
let favoritas = JSON.parse(localStorage.getItem("radar_favoritas")) || [];
let sleepTimerInterval = null;
let targetTime = null;
let wakeLock = null; 
let wasPlayingBeforeBackground = false;

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
const areaBuscaFreq = document.getElementById("area-busca-freq");

const themeToggle = document.getElementById("theme-toggle");
const voiceToggle = document.getElementById("voice-toggle");
const noiseToggle = document.getElementById("noise-toggle");
const hapticToggle = document.getElementById("haptic-toggle");
const wakelockToggle = document.getElementById("wakelock-toggle");

window.showTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    event.currentTarget.classList.add('active');
    if(tabId === 'tab-config-perfil') renderProfile();
};

const splashScreen = document.getElementById("splash-screen");
document.getElementById("btn-entrar").addEventListener("click", () => {
    splashScreen.classList.add("hidden");
    initChiado(); playChiado();
    audio.play().catch(() => { statusConexao.innerText = "Erro ao conectar"; });
});

const indexInicialRadar = radios.findIndex(r => r.id === "radar-fm");
currentIndex = indexInicialRadar !== -1 ? indexInicialRadar : 0;

function normalizeStr(str) { return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }

let userStats = JSON.parse(localStorage.getItem("radar_stats")) || {
    listeningTimeMS: 0, currentMonth: new Date().getMonth(),
    stationsListened: {}, genresListened: {}, statesListened: {}, freqsListened: {}
};

if (userStats.currentMonth !== new Date().getMonth()) {
    userStats.listeningTimeMS = 0; userStats.currentMonth = new Date().getMonth();
}

let profileTimer;
let currentStationTime = 0;
let currentStationTracked = false;

function getTop(obj) { return Object.entries(obj).sort((a,b) => b[1]-a[1])[0]?.[0] || "Nenhum"; }

function getDynamicPhrase() {
    let phrases = [];
    let totalHours = userStats.listeningTimeMS / 3600000;
    let topGenre = getTop(userStats.genresListened);
    let uniqueCount = Object.keys(userStats.stationsListened).length;

    if (topGenre !== "Nenhum") phrases.push(`Você é um ouvinte que curte muito ${topGenre} ein!`);
    if (totalHours > 5) phrases.push("Você é um verdadeiro entusiasta de Rádio mesmo!");
    if (uniqueCount > 10) phrases.push("Um explorador nato! Já sintonizou várias estações diferentes.");
    phrases.push("A companhia perfeita para o seu dia a dia musical.");

    let idx = new Date().getDay() % phrases.length;
    return phrases[idx] || "A companhia perfeita para o seu dia a dia musical.";
}

function renderProfile() {
    const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
    const nomeMes = meses[userStats.currentMonth];
    let totalMinutos = Math.floor(userStats.listeningTimeMS / 60000);
    let tempoStr = totalMinutos < 60 ? `${totalMinutos}m` : `${Math.floor(totalMinutos/60)}h ${totalMinutos%60}m`;
    const topRadio = getTop(userStats.stationsListened);
    const topGenre = getTop(userStats.genresListened);
    const topState = getTop(userStats.statesListened);
    const topFreq = getTop(userStats.freqsListened);
    const totalStations = Object.keys(userStats.stationsListened).length;

    document.getElementById("perfil-frase").innerText = getDynamicPhrase();

    document.getElementById("perfil-dashboard").innerHTML = `
        <div class="perfil-card">
            <i class="fa-solid fa-clock"></i>
            <span class="perfil-value">${tempoStr}</span>
            <span class="perfil-label">Tempo em ${nomeMes}</span>
        </div>
        <div class="perfil-card">
            <i class="fa-solid fa-tower-broadcast"></i>
            <span class="perfil-value">${totalStations}</span>
            <span class="perfil-label">Rádios Descobertas</span>
        </div>
        <div class="perfil-card full-width">
            <i class="fa-solid fa-heart"></i>
            <div class="perfil-text-group">
                <span class="perfil-value">${topRadio}</span>
                <span class="perfil-label">Sua Estação Mais Ouvida</span>
            </div>
        </div>
        <div class="perfil-card">
            <i class="fa-solid fa-music"></i>
            <span class="perfil-value">${topGenre}</span>
            <span class="perfil-label">Gênero Favorito</span>
        </div>
        <div class="perfil-card">
            <i class="fa-solid fa-map-location-dot"></i>
            <span class="perfil-value">${topState}</span>
            <span class="perfil-label">Região Mais Ouvida</span>
        </div>
        <div class="perfil-card">
            <i class="fa-solid fa-wave-square"></i>
            <span class="perfil-value">${topFreq !== "Nenhum" ? topFreq + ' MHz' : 'Nenhuma'}</span>
            <span class="perfil-label">Sintonia Favorita</span>
        </div>
    `;
}

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        wasPlayingBeforeBackground = !audio.paused;
    } else if (document.visibilityState === 'visible') {
        if (wasPlayingBeforeBackground && audio.paused) {
            const currentSrc = audio.src;
            audio.src = "";
            setTimeout(() => { audio.src = currentSrc; audio.play().catch(()=>{}); }, 50);
        }
    }
});

function tocarComVoz(radio) {
    if (!voiceToggle.checked || !('speechSynthesis' in window)) {
        audio.play().catch(() => { statusConexao.innerText = "Erro ao conectar"; });
        return;
    }

    window.speechSynthesis.cancel();
    audio.pause();
    stopChiado();
    statusConexao.innerText = "ASSISTENTE DE VOZ...";

    let freqFalada = radio.freq.replace('.', ' ponto ');
    let texto = `${freqFalada} Megahertz... ${radio.name}`;

    let msg = new SpeechSynthesisUtterance(texto);
    msg.lang = 'pt-BR';
    msg.rate = 1.1;

    msg.onend = () => {
        statusConexao.innerText = "CONECTANDO...";
        audio.play().catch(() => { statusConexao.innerText = "Erro ao conectar"; });
    };
    msg.onerror = () => {
        audio.play().catch(() => { statusConexao.innerText = "Erro ao conectar"; });
    };

    window.speechSynthesis.speak(msg);
}

function abrirBusca() {
    document.getElementById("modal-estacoes").classList.add("active");
    const lista = document.getElementById("station-list"); 
    lista.innerHTML = "";
    radios.forEach((r, idx) => {
        const li = document.createElement("li"); li.className = "station-item";
        li.style.display = "none"; 
        li.innerHTML = `<div><strong>${r.name}</strong> (${r.freq} MHz)<br><small style="color:var(--text-muted)">${r.city} • ${r.genre}</small></div>`;
        li.addEventListener("click", () => { currentIndex = idx; carregarRadio(currentIndex); document.getElementById("modal-estacoes").classList.remove("active"); tocarComVoz(radios[currentIndex]); });
        lista.appendChild(li);
    });
    const inputBusca = document.getElementById("filtra-estacao");
    inputBusca.value = "";
    setTimeout(() => { inputBusca.focus(); }, 100);
}
areaBuscaFreq.addEventListener("click", abrirBusca);
document.getElementById("btn-lista").addEventListener("click", abrirBusca);
let touchStartY = 0;
areaBuscaFreq.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, {passive: true});
areaBuscaFreq.addEventListener('touchend', e => { if (e.changedTouches[0].clientY - touchStartY > 40) abrirBusca(); }, {passive: true});
document.getElementById("filtra-estacao").addEventListener("input", (e) => {
    const termo = normalizeStr(e.target.value);
    const itens = document.querySelectorAll("#station-list .station-item");
    if (termo.length === 0) { itens.forEach(item => item.style.display = "none"); return; }
    itens.forEach(item => { item.style.display = normalizeStr(item.innerText).includes(termo) ? "flex" : "none"; });
});

document.getElementById("btn-share").addEventListener("click", () => {
    if (navigator.share) { navigator.share({ title: 'Radar Rádios', text: `Estou ouvindo ${radios[currentIndex].name} no Radar Rádios!`, url: window.location.href }).catch(() => {});
    } else { alert("Compartilhamento não suportado."); }
});
document.getElementById("btn-shazam").addEventListener("click", () => {
    window.location.href = "shazam://";
    setTimeout(() => { if(document.visibilityState === 'visible') alert("Instale o Shazam para identificar músicas automaticamente."); }, 1500);
});

function updateTimerDisplay() {
    const now = new Date().getTime(); const diff = targetTime - now;
    if (diff <= 0) {
        clearInterval(sleepTimerInterval); audio.pause(); stopChiado();
        statusConexao.innerText = "TEMPORIZADOR FINALIZADO"; playIcon.className = "fa-solid fa-play";
        timerDisplay.classList.add("hidden");
    } else {
        const totalSecs = Math.floor(diff / 1000); const hours = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60); const secs = totalSecs % 60;
        timerDisplay.innerText = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}
document.getElementById("btn-timer-open").addEventListener("click", () => document.getElementById("modal-timer").classList.add("active"));
document.getElementById("btn-config-timer").addEventListener("click", () => { document.getElementById("modal-config").classList.remove("active"); document.getElementById("modal-timer").classList.add("active"); });
document.querySelectorAll(".fechar-modal-timer").forEach(btn => btn.addEventListener("click", () => document.getElementById("modal-timer").classList.remove("active")));

document.querySelectorAll(".timer-option").forEach(item => {
    item.addEventListener("click", (e) => {
        const minutos = parseInt(e.currentTarget.getAttribute("data-time"));
        clearInterval(sleepTimerInterval);
        if (minutos > 0) {
            targetTime = new Date().getTime() + minutos * 60 * 1000;
            updateTimerDisplay(); timerDisplay.classList.remove("hidden");
            sleepTimerInterval = setInterval(updateTimerDisplay, 1000);
            alert(`A rádio desligará em ${minutos} minutos.`);
        } else { timerDisplay.classList.add("hidden"); }
        document.getElementById("modal-timer").classList.remove("active");
    });
});

function atualizarTelaDeBloqueio(radio) {
    if ('mediaSession' in navigator) {
        let nomeR = radio.name.toUpperCase().includes('FM') ? radio.name : `${radio.name} FM`;
        navigator.mediaSession.metadata = new MediaMetadata({
            title: 'Radar Rádios', artist: `${nomeR} • ${radio.city}`, album: radio.genre,
            artwork: [{ src: 'https://raw.githubusercontent.com/althierestm/Radar-Radios-App/main/R%C3%A1dios%20Online%20e%20Gr%C3%A1tis%20quadra%20azul.png', sizes: '512x512', type: 'image/png' }]
        });
        navigator.mediaSession.setActionHandler('play', () => { audio.play(); playIcon.className = "fa-solid fa-pause"; });
        navigator.mediaSession.setActionHandler('pause', () => { audio.pause(); stopChiado(); playIcon.className = "fa-solid fa-play"; });
        navigator.mediaSession.setActionHandler('previoustrack', () => { document.getElementById("btn-prev").click(); });
        navigator.mediaSession.setActionHandler('nexttrack', () => { document.getElementById("btn-next").click(); });
    }
}

if (localStorage.getItem("radar_theme") === "light") { document.body.classList.add("light-theme"); themeToggle.checked = true; }
themeToggle.addEventListener("change", (e) => {
    if (e.target.checked) { document.body.classList.add("light-theme"); localStorage.setItem("radar_theme", "light"); } 
    else { document.body.classList.remove("light-theme"); localStorage.setItem("radar_theme", "dark"); }
});

if (localStorage.getItem("radar_voice") === "on") { voiceToggle.checked = true; }
voiceToggle.addEventListener("change", (e) => {
    localStorage.setItem("radar_voice", e.target.checked ? "on" : "off");
});

if (localStorage.getItem("radar_haptic") === "off") { hapticToggle.checked = false; }
hapticToggle.addEventListener("change", (e) => {
    localStorage.setItem("radar_haptic", e.target.checked ? "on" : "off");
});

const requestWakeLock = async () => { try { wakeLock = await navigator.wakeLock.request('screen'); } catch (err) {} };
const releaseWakeLock = async () => { if (wakeLock !== null) { await wakeLock.release(); wakeLock = null; } };
wakelockToggle.addEventListener("change", (e) => { if (e.target.checked) { requestWakeLock(); } else { releaseWakeLock(); } });
document.addEventListener('visibilitychange', async () => { if (wakelockToggle.checked && document.visibilityState === 'visible') { await requestWakeLock(); } });
document.getElementById("btn-whatsapp").addEventListener("click", () => { window.open("https://wa.me/?text=Olá! Tenho uma sugestão de rádio para o aplicativo Radar Rádios:", '_blank'); });

airplayBtn.addEventListener("click", (e) => {
    e.stopPropagation();
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
    statusConexao.innerText = `${radio.city} • ${radio.genre} • AO VIVO`;
    playIcon.className = "fa-solid fa-pause";
    atualizarTelaDeBloqueio(radio); 

    currentStationTime = 0;
    currentStationTracked = false;
    clearInterval(profileTimer);
    
    profileTimer = setInterval(() => {
        currentStationTime += 5000;
        userStats.listeningTimeMS += 5000;
        
        if (currentStationTime >= 30000 && !currentStationTracked) {
            userStats.stationsListened[radio.name] = (userStats.stationsListened[radio.name] || 0) + 1;
            userStats.genresListened[radio.genre] = (userStats.genresListened[radio.genre] || 0) + 1;
            userStats.freqsListened[radio.freq] = (userStats.freqsListened[radio.freq] || 0) + 1;
            let state = radio.city.split("-")[1]?.trim() || "Web";
            if (state.toLowerCase() === "ba") state = "Bahia";
            if (state.toLowerCase() === "sp") state = "São Paulo";
            if (state.toLowerCase() === "mg") state = "Minas Gerais";
            if (state.toLowerCase() === "df") state = "Distrito Federal";
            userStats.statesListened[state] = (userStats.statesListened[state] || 0) + 1;
            currentStationTracked = true;
            localStorage.setItem("radar_stats", JSON.stringify(userStats));
            if(document.getElementById('modal-config').classList.contains('active')){
                renderProfile();
            }
        } else {
            localStorage.setItem("radar_stats", JSON.stringify(userStats));
        }
    }, 5000);
});

audio.addEventListener('pause', () => { clearInterval(profileTimer); });

const minFreq = 70.0; const maxFreq = 110.0; const tickWidth = 14; 
for (let f = minFreq; f <= maxFreq; f += 0.1) {
    let freqFixed = Number(f.toFixed(1)); const tick = document.createElement("div");
    let type = "minor"; let showText = "";
    if (Math.abs(freqFixed % 1) < 0.05) { type = "major"; showText = freqFixed.toFixed(0); } 
    else if (Math.abs((freqFixed * 10) % 5) < 0.5) { type = "medium"; }
    let conteudoExtra = "";
    if (radios.some(r => parseFloat(r.freq) === freqFixed)) { conteudoExtra = `<div class="station-dot"></div>`; }
    tick.className = `dial-tick ${type}`;
    tick.innerHTML = `${conteudoExtra}<span>${showText}</span><div class="line"></div>`;
    dialStrip.appendChild(tick);
}
function atualizarPosicaoDial(freqStr) {
    const totalTracos = (parseFloat(freqStr) - minFreq) / 0.1;
    dialStrip.style.transform = `translateX(${-(totalTracos * tickWidth)}px)`;
}

function getNextRadioIndex(direction) {
    const currentFreq = parseFloat(freqValor.innerText);
    if (direction === 1) {
        const nextIndex = radios.findIndex(r => parseFloat(r.freq) > currentFreq);
        return nextIndex !== -1 ? nextIndex : 0; 
    } else {
        let prevIndex = -1;
        for (let i = radios.length - 1; i >= 0; i--) {
            if (parseFloat(radios[i].freq) < currentFreq) { prevIndex = i; break; }
        }
        return prevIndex !== -1 ? prevIndex : (radios.length - 1);
    }
}

btnMultiRadio.addEventListener("click", () => {
    const currentFreq = parseFloat(radios[currentIndex].freq);
    const duplicates = radios.filter(r => parseFloat(r.freq) === currentFreq);
    document.getElementById("multi-modal-title").innerText = `Sintonia ${currentFreq.toFixed(1)} MHz`;
    const list = document.getElementById("multi-station-list");
    list.innerHTML = "";
    duplicates.forEach(r => {
        const li = document.createElement("li"); li.className = "station-item";
        li.innerHTML = `<div><strong>${r.name}</strong><br><small style="color:var(--text-muted)">${r.city} • ${r.genre}</small></div>`;
        li.addEventListener("click", () => { 
            currentIndex = radios.findIndex(rad => rad.id === r.id); 
            carregarRadio(currentIndex); document.getElementById("modal-multi").classList.remove("active"); tocarComVoz(radios[currentIndex]); 
        });
        list.appendChild(li);
    });
    document.getElementById("modal-multi").classList.add("active");
});
document.querySelectorAll(".fechar-modal-multi").forEach(btn => btn.addEventListener("click", () => document.getElementById("modal-multi").classList.remove("active")));

let isDragging = false; let startX = 0; let initialTranslateX = 0; let lastVibratedFreq = "";
dialContainer.addEventListener('pointerdown', (e) => {
    isDragging = true; startX = e.clientX;
    initialTranslateX = new WebKitCSSMatrix(window.getComputedStyle(dialStrip).transform).m41; 
    dialStrip.style.transition = 'none'; 
    audio.pause(); playChiado(); playIcon.className = "fa-solid fa-play";
    statusConexao.innerText = "Sintonizando...";
    btnMultiRadio.classList.remove("show");
    document.getElementById('btn-multi-radio').classList.add('hidden');
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
    
    if (freqValor.innerText !== lastVibratedFreq) {
        lastVibratedFreq = freqValor.innerText;
        if (hapticToggle.checked && navigator.vibrate) navigator.vibrate(10);
    }
    
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
        tocarComVoz(radios[currentIndex]);
    } else {
        estacaoNome.innerText = ""; statusConexao.innerText = "";
        favIcon.classList.replace("fa-solid", "fa-regular");
        btnMultiRadio.classList.remove("show");
        document.getElementById('btn-multi-radio').classList.add('hidden');
        if (noiseFilter) noiseFilter.frequency.value = 1000;
    }
});

function carregarRadio(index) {
    const radio = radios[index];
    freqValor.innerText = radio.freq; 
    let nomeBonito = radio.name.toUpperCase().includes('FM') ? radio.name : `${radio.name} FM`;
    estacaoNome.innerText = nomeBonito;
    statusConexao.innerText = "CONECTANDO...";
    
    audio.src = radio.url; atualizarPosicaoDial(radio.freq); verificarFavorito(radio.id); renderizarFavoritas();
    atualizarTelaDeBloqueio(radio);

    const arrayConflitos = radios.filter(r => parseFloat(r.freq) === parseFloat(radio.freq));
    if (arrayConflitos.length > 1) {
        document.getElementById('btn-multi-radio').classList.remove('hidden');
    } else {
        document.getElementById('btn-multi-radio').classList.add('hidden');
    }
}

function verificarFavorito(id) {
    if (favoritas.includes(id)) { favIcon.classList.replace("fa-regular", "fa-solid"); } 
    else { favIcon.classList.replace("fa-solid", "fa-regular"); }
}

playBtn.addEventListener("click", () => {
    if (audio.paused) {
        if (estacaoNome.innerText !== "Sem Sinal" && estacaoNome.innerText !== "") { statusConexao.innerText = "CONECTANDO..."; audio.play(); }
    } else { audio.pause(); stopChiado(); statusConexao.innerText = "PAUSADO"; playIcon.className = "fa-solid fa-play"; }
});

document.getElementById("btn-next").addEventListener("click", () => { 
    currentIndex = getNextRadioIndex(1); 
    carregarRadio(currentIndex); 
    if (!audio.paused || playIcon.classList.contains("fa-pause")) tocarComVoz(radios[currentIndex]); 
});
document.getElementById("btn-prev").addEventListener("click", () => { 
    currentIndex = getNextRadioIndex(-1); 
    carregarRadio(currentIndex); 
    if (!audio.paused || playIcon.classList.contains("fa-pause")) tocarComVoz(radios[currentIndex]); 
});

document.getElementById("btn-fav").addEventListener("click", () => {
    if (estacaoNome.innerText === "Sem Sinal" || estacaoNome.innerText === "") return; 
    const radioAtual = radios[currentIndex];
    if (favoritas.includes(radioAtual.id)) { favoritas = favoritas.filter(id => id !== radioAtual.id); } 
    else { favoritas.push(radioAtual.id); }
    localStorage.setItem("radar_favoritas", JSON.stringify(favoritas));
    verificarFavorito(radioAtual.id); renderizarFavoritas();
});

carregarRadio(currentIndex);

function renderizarFavoritas() {
    const listaFav = document.getElementById("favoritas-list"); listaFav.innerHTML = "";
    if (favoritas.length === 0) { listaFav.innerHTML = "<p style='text-align:center; padding: 20px; color: var(--text-muted); font-size: 14px;'>Nenhuma rádio salva.</p>"; return; }
    radios.filter(r => favoritas.includes(r.id)).forEach(r => {
        const li = document.createElement("li"); li.className = "station-item";
        li.innerHTML = `<div><strong>${r.name}</strong> (${r.freq} MHz)<br><small style="color:var(--text-muted)">${r.city} • ${r.genre}</small></div>`;
        li.addEventListener("click", () => { currentIndex = radios.findIndex(rad => rad.id === r.id); carregarRadio(currentIndex); document.getElementById("modal-config").classList.remove("active"); tocarComVoz(radios[currentIndex]); });
        listaFav.appendChild(li);
    });
}

document.querySelectorAll(".fechar-modal").forEach(btn => btn.addEventListener("click", () => document.getElementById("modal-estacoes").classList.remove("active")));
document.querySelectorAll(".fechar-config").forEach(btn => btn.addEventListener("click", () => document.getElementById("modal-config").classList.remove("active")));

document.getElementById("btn-config").addEventListener("click", () => { 
    renderizarFavoritas(); 
    renderProfile(); 
    document.getElementById("modal-config").classList.add("active"); 
});
