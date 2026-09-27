// --- CONFIGURAÇÃO FIREBASE E VARIÁVEIS GLOBAIS ---
if (!firebase.apps.length) {
    firebase.initializeApp({
        apiKey: "AIzaSyBfy8hroE6WnoYyemSfH7tcLjpUgxfT6MU",
        authDomain: "radar-radios.firebaseapp.com",
        projectId: "radar-radios",
        storageBucket: "radar-radios.firebasestorage.app",
        messagingSenderId: "961077981455",
        appId: "1:961077981455:web:b57cb8c81b959c36bf4e7a"
    });
}
const db = firebase.firestore();
const auth = firebase.auth();

let allRadios = [];
let currentFilterMode = "Rádio FM";
let radios = [];
let currentIndex = 0;
let currentUser = null;

let favoritas = JSON.parse(localStorage.getItem("radar_favoritas")) || [];
let sleepTimerInterval = null;
let targetTime = null;
let wakeLock = null; 
let wasPlayingBeforeBackground = false;
let rdsInterval = null;
let minFreq = 70.0; let maxFreq = 110.0; const tickWidth = 14; 

const audio = document.getElementById("audio-stream"); audio.volume = 1.0; 
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
const badgePais = document.getElementById("badge-pais");
const themeToggle = document.getElementById("theme-toggle");
const voiceToggle = document.getElementById("voice-toggle");
const noiseToggle = document.getElementById("noise-toggle");
const hapticToggle = document.getElementById("haptic-toggle");
const wakelockToggle = document.getElementById("wakelock-toggle");

// --- INICIALIZAÇÃO DE RÁDIOS DA NUVEM ---
async function loadRadiosFromCloud() {
    estacaoNome.innerText = "Sintonizando Nuvem...";
    try {
        const snapshot = await db.collection("radios").get();
        const fetchedRadios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        localStorage.setItem("radar_radios_cache", JSON.stringify(fetchedRadios));
        return fetchedRadios;
    } catch (e) {
        console.warn("Nuvem indisponível. A utilizar o cache local.");
        const cached = localStorage.getItem("radar_radios_cache");
        return cached ? JSON.parse(cached) : [];
    }
}

async function initApp() {
    const rawList = await loadRadiosFromCloud();
    const uniqueRadios = []; const seenNames = new Set();
    rawList.forEach(r => {
        const normName = r.name.trim().toLowerCase();
        if (!seenNames.has(normName)) { seenNames.add(normName); uniqueRadios.push(r); }
    });
    
    allRadios = uniqueRadios.sort((a, b) => parseFloat(a.freq) - parseFloat(b.freq));
    radios = allRadios.filter(r => (r.badge || "Rádio FM") === currentFilterMode);
    
    if (radios.length > 0) {
        buildDial();
        const indexIni = radios.findIndex(r => r.id === "radar-fm");
        currentIndex = indexIni !== -1 ? indexIni : 0;
        carregarRadio(currentIndex);
    } else {
        estacaoNome.innerText = "Nenhuma rádio encontrada";
        statusConexao.innerText = "Aguardando sincronização do painel";
    }
}
initApp();

// --- CONTROLO DE AUTENTICAÇÃO E PERFIL ---
let userStats = JSON.parse(localStorage.getItem("radar_stats")) || {
    listeningTimeMS: 0, currentMonth: new Date().getMonth(), stationsListened: {}, genresListened: {}, statesListened: {}, freqsListened: {}
};
if (userStats.currentMonth !== new Date().getMonth()) {
    userStats = { listeningTimeMS: 0, currentMonth: new Date().getMonth(), stationsListened: {}, genresListened: {}, statesListened: {}, freqsListened: {} };
}
let remoteHistory = {};

auth.onAuthStateChanged(user => {
    currentUser = user;
    if (user) {
        document.getElementById("auth-prompt-banner").style.display = "none";
        document.getElementById("logged-in-dashboard").style.display = "block";
        document.getElementById("user-display-name").innerText = `Olá, ${user.displayName || 'Ouvinte'}!`;
        
        // Sincronizar Favoritos
        db.collection("users").doc(user.uid).get().then(doc => {
            if (doc.exists && doc.data().favoritas) {
                favoritas = doc.data().favoritas;
                localStorage.setItem("radar_favoritas", JSON.stringify(favoritas));
                if (radios[currentIndex]) verificarFavorito(radios[currentIndex].id);
                renderizarFavoritas();
            }
        });
        loadUserHistory(user.uid);
    } else {
        document.getElementById("auth-prompt-banner").style.display = "block";
        document.getElementById("logged-in-dashboard").style.display = "none";
        renderProfileStats(userStats);
    }
});

function getCurrentMonthKey() {
    const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function formatMonthKey(key) {
    const [y, m] = key.split('-'); const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
    return `${meses[parseInt(m)-1]} ${y}`;
}

async function loadUserHistory(uid) {
    const snapshot = await db.collection("users").doc(uid).collection("history").get();
    const select = document.getElementById("history-month-select");
    select.innerHTML = `<option value="current">Mês Atual (Tempo Real)</option>`;
    
    snapshot.forEach(doc => {
        const key = doc.id; remoteHistory[key] = doc.data().stats;
        if(key !== getCurrentMonthKey()) {
            const opt = document.createElement("option"); opt.value = key; opt.innerText = formatMonthKey(key); select.appendChild(opt);
        } else { remoteHistory['current'] = doc.data().stats; }
    });

    select.onchange = (e) => {
        if(e.target.value === 'current') renderProfileStats(userStats);
        else renderProfileStats(remoteHistory[e.target.value]);
    };
    renderProfileStats(userStats);
}

// Funções de Modal e Login
window.abrirAuthModal = () => { document.getElementById("modal-auth").classList.add("active"); document.getElementById("login-error-msg").innerText = ""; }
window.fecharAuthModal = () => document.getElementById("modal-auth").classList.remove("active");
window.mudarAuthTab = (tab) => {
    document.getElementById("btn-tab-login").classList.remove("active"); document.getElementById("btn-tab-register").classList.remove("active");
    document.getElementById("auth-login-form").style.display = "none"; document.getElementById("auth-register-form").style.display = "none";
    if(tab === 'login') {
        document.getElementById("btn-tab-login").classList.add("active"); document.getElementById("auth-login-form").style.display = "block"; document.getElementById("auth-modal-title").innerText = "Entrar";
    } else {
        document.getElementById("btn-tab-register").classList.add("active"); document.getElementById("auth-register-form").style.display = "block"; document.getElementById("auth-modal-title").innerText = "Nova Conta";
    }
}

window.loginComGoogle = function() {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then(() => fecharAuthModal()).catch(err => document.getElementById("login-error-msg").innerText = err.message);
}
window.loginComApple = function() {
    const provider = new firebase.auth.OAuthProvider('apple.com');
    auth.signInWithPopup(provider).then(() => fecharAuthModal()).catch(err => document.getElementById("login-error-msg").innerText = "Login Apple indisponível. Confirme se ativou a Apple Dev Account no Firebase.");
}
window.processarLogin = function() {
    const email = document.getElementById("login-email").value; const pass = document.getElementById("login-pass").value;
    if(!email || !pass) return document.getElementById("login-error-msg").innerText = "Preencha todos os campos.";
    auth.signInWithEmailAndPassword(email, pass).then(() => fecharAuthModal()).catch(err => document.getElementById("login-error-msg").innerText = "E-mail ou senha incorretos.");
}
window.processarCadastro = function() {
    const name = document.getElementById("reg-name").value; const phone = document.getElementById("reg-phone").value; const city = document.getElementById("reg-city").value;
    const email = document.getElementById("reg-email").value; const conf = document.getElementById("reg-email-conf").value; const pass = document.getElementById("reg-pass").value;
    if(email !== conf) return document.getElementById("reg-error-msg").innerText = "Os e-mails não coincidem.";
    if(pass.length < 6) return document.getElementById("reg-error-msg").innerText = "A senha deve ter pelo menos 6 caracteres.";
    
    auth.createUserWithEmailAndPassword(email, pass).then(cred => {
        return cred.user.updateProfile({ displayName: name }).then(() => {
            db.collection("users").doc(cred.user.uid).set({ phone, city, createdAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
            fecharAuthModal();
        });
    }).catch(err => document.getElementById("reg-error-msg").innerText = err.message);
}
window.fazerLogout = function() { auth.signOut(); }

// --- LÓGICA DE DADOS DO PERFIL ---
function getTop(obj) { return Object.entries(obj || {}).sort((a,b) => b[1]-a[1])[0]?.[0] || "Nenhum"; }
function getDynamicPhrase(stats) {
    let phrases = []; let totalHours = (stats.listeningTimeMS || 0) / 3600000;
    let topGenre = getTop(stats.genresListened); let uniqueCount = Object.keys(stats.stationsListened || {}).length;
    if (topGenre !== "Nenhum") phrases.push(`Você é um ouvinte que curte muito ${topGenre} ein!`);
    if (totalHours > 5) phrases.push("Você é um verdadeiro entusiasta de Rádio mesmo!");
    if (uniqueCount > 10) phrases.push("Um explorador nato! Já sintonizou várias estações diferentes.");
    phrases.push("A companhia perfeita para o seu dia a dia musical.");
    return phrases[new Date().getDay() % phrases.length] || "A companhia perfeita para o seu dia a dia musical.";
}
function renderProfileStats(stats) {
    if(!stats) return;
    const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];
    const nomeMes = meses[stats.currentMonth] || "Mês Selecionado";
    let totalMinutos = Math.floor((stats.listeningTimeMS || 0) / 60000);
    let tempoStr = totalMinutos < 60 ? `${totalMinutos}m` : `${Math.floor(totalMinutos/60)}h ${totalMinutos%60}m`;
    const topRadio = getTop(stats.stationsListened); const topGenre = getTop(stats.genresListened);
    const topState = getTop(stats.statesListened); const topFreq = getTop(stats.freqsListened);
    const totalStations = Object.keys(stats.stationsListened || {}).length;

    document.getElementById("perfil-frase").innerText = getDynamicPhrase(stats);
    document.getElementById("perfil-dashboard").innerHTML = `
        <div class="perfil-card"><i class="fa-solid fa-clock"></i><span class="perfil-value">${tempoStr}</span><span class="perfil-label">Tempo (${nomeMes})</span></div>
        <div class="perfil-card"><i class="fa-solid fa-tower-broadcast"></i><span class="perfil-value">${totalStations}</span><span class="perfil-label">Rádios Descobertas</span></div>
        <div class="perfil-card full-width"><i class="fa-solid fa-heart"></i><div class="perfil-text-group"><span class="perfil-value">${topRadio}</span><span class="perfil-label">Estação Mais Ouvida</span></div></div>
        <div class="perfil-card"><i class="fa-solid fa-music"></i><span class="perfil-value">${topGenre}</span><span class="perfil-label">Gênero Favorito</span></div>
        <div class="perfil-card"><i class="fa-solid fa-map-location-dot"></i><span class="perfil-value">${topState}</span><span class="perfil-label">Região Mais Ouvida</span></div>
        <div class="perfil-card"><i class="fa-solid fa-wave-square"></i><span class="perfil-value">${topFreq !== "Nenhum" ? topFreq + ' MHz' : 'Nenhuma'}</span><span class="perfil-label">Sintonia Favorita</span></div>
    `;
}
function renderProfile() {
    const select = document.getElementById("history-month-select");
    if(currentUser && select && select.value !== 'current') renderProfileStats(remoteHistory[select.value]);
    else renderProfileStats(userStats);
}

// --- RÁDIO LÓGICA E UI BASE ---
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
    if(radios.length > 0) audio.play().catch(() => { statusConexao.innerText = "Erro ao conectar"; });
});

if (badgePais) {
    badgePais.style.cursor = "pointer"; badgePais.title = "Escolher Categoria";
    badgePais.addEventListener("click", () => { openCategorySelector(); });
}

function openCategorySelector() {
    let overlay = document.getElementById("category-overlay");
    if (!overlay) {
        overlay = document.createElement("div"); overlay.id = "category-overlay"; overlay.className = "ios-action-sheet-overlay";
        overlay.innerHTML = `<div class="ios-action-sheet"><div class="ios-action-group" id="category-group"></div><button class="ios-action-cancel" onclick="closeCategorySelector()">Cancelar</button></div>`;
        document.body.appendChild(overlay);
        overlay.addEventListener("click", (e) => { if(e.target === overlay) closeCategorySelector(); });
    }
    const group = overlay.querySelector("#category-group"); group.innerHTML = '<div class="ios-action-header">Selecione uma Categoria</div>';
    const uniqueBadges = [...new Set(allRadios.map(r => r.badge || "Rádio FM"))];
    uniqueBadges.forEach(badge => {
        const btn = document.createElement("button"); btn.className = "ios-action-btn";
        if (badge === currentFilterMode) btn.style.fontWeight = "700";
        btn.innerText = badge; btn.onclick = () => { applyCategory(badge); closeCategorySelector(); };
        group.appendChild(btn);
    });
    requestAnimationFrame(() => { overlay.classList.add("active"); });
}
window.closeCategorySelector = function() { const overlay = document.getElementById("category-overlay"); if (overlay) overlay.classList.remove("active"); };

function applyCategory(catName) {
    if (currentFilterMode === catName) return; 
    currentFilterMode = catName; radios = allRadios.filter(r => (r.badge || "Rádio FM") === catName);
    if (catName === "Rádio FM") { minFreq = 70.0; maxFreq = 110.0; } else if (catName === "Escuta Aérea") { minFreq = 118.0; maxFreq = 128.0; } else { let freqs = radios.map(r => parseFloat(r.freq)); minFreq = Math.floor(Math.min(...freqs)) - 2; maxFreq = Math.ceil(Math.max(...freqs)) + 2; }
    buildDial();
    if (catName === "Rádio FM") { let radarIndex = radios.findIndex(r => r.id === "radar-fm"); currentIndex = radarIndex !== -1 ? radarIndex : 0; } else { currentIndex = 0; }
    carregarRadio(currentIndex); tocarComVoz(radios[currentIndex]);
}

function loadRadioById(targetId) {
    let targetRadio = allRadios.find(r => r.id === targetId); if (!targetRadio) return;
    let catName = targetRadio.badge || "Rádio FM";
    if (currentFilterMode !== catName) {
        currentFilterMode = catName; radios = allRadios.filter(r => (r.badge || "Rádio FM") === catName);
        if (catName === "Rádio FM") { minFreq = 70.0; maxFreq = 110.0; } else if (catName === "Escuta Aérea") { minFreq = 118.0; maxFreq = 128.0; } else { let freqs = radios.map(r => parseFloat(r.freq)); minFreq = Math.floor(Math.min(...freqs)) - 2; maxFreq = Math.ceil(Math.max(...freqs)) + 2; }
        buildDial();
    }
    currentIndex = radios.findIndex(r => r.id === targetId); if (currentIndex === -1) currentIndex = 0;
    carregarRadio(currentIndex);
}

function normalizeStr(str) { return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }

let profileTimer; let currentStationTime = 0; let currentStationTracked = false;

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') { wasPlayingBeforeBackground = !audio.paused; } 
    else if (document.visibilityState === 'visible') { if (wasPlayingBeforeBackground && audio.paused) { const currentSrc = audio.src; audio.src = ""; setTimeout(() => { audio.src = currentSrc; audio.play().catch(()=>{}); }, 50); } }
});

function tocarComVoz(radio) {
    if (!voiceToggle.checked || !('speechSynthesis' in window)) { audio.play().catch(() => { statusConexao.innerText = "Erro ao conectar"; }); return; }
    window.speechSynthesis.cancel(); audio.pause(); stopChiado(); statusConexao.innerText = "ASSISTENTE DE VOZ...";
    let msg = new SpeechSynthesisUtterance(`${radio.freq.replace('.', ' ponto ')} Megahertz... ${radio.name}`);
    msg.lang = 'pt-BR'; msg.rate = 1.1;
    msg.onend = () => { statusConexao.innerText = `${radio.city} • ${radio.genre}`; audio.play().catch(() => {}); };
    msg.onerror = () => { audio.play().catch(() => {}); };
    window.speechSynthesis.speak(msg);
}

function abrirBusca() {
    document.getElementById("modal-estacoes").classList.add("active");
    const lista = document.getElementById("station-list"); lista.innerHTML = "";
    allRadios.forEach((r) => {
        const li = document.createElement("li"); li.className = "station-item"; li.style.display = "none"; 
        li.innerHTML = `<div><strong>${r.name}</strong> (${r.freq} MHz)<br><small style="color:var(--text-muted)">${r.city} • ${r.genre}</small></div>`;
        li.addEventListener("click", () => { document.getElementById("modal-estacoes").classList.remove("active"); loadRadioById(r.id); tocarComVoz(radios[currentIndex]); });
        lista.appendChild(li);
    });
    const inputBusca = document.getElementById("filtra-estacao"); inputBusca.value = ""; setTimeout(() => { inputBusca.focus(); }, 100);
}
areaBuscaFreq.addEventListener("click", abrirBusca); document.getElementById("btn-lista").addEventListener("click", abrirBusca);
let touchStartY = 0;
areaBuscaFreq.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, {passive: true});
areaBuscaFreq.addEventListener('touchend', e => { if (e.changedTouches[0].clientY - touchStartY > 40) abrirBusca(); }, {passive: true});
document.getElementById("filtra-estacao").addEventListener("input", (e) => {
    const termo = normalizeStr(e.target.value); const itens = document.querySelectorAll("#station-list .station-item");
    if (termo.length === 0) { itens.forEach(item => item.style.display = "none"); return; }
    itens.forEach(item => { item.style.display = normalizeStr(item.innerText).includes(termo) ? "flex" : "none"; });
});

document.getElementById("btn-whatsapp").addEventListener("click", () => { window.open(`https://wa.me/5532985109726?text=` + encodeURIComponent("Olá, Gostaria de adicionar uma rádio no Radar Rádios."), "_blank"); });
document.getElementById("btn-share").addEventListener("click", () => {
    if (navigator.share) { navigator.share({ title: 'Radar Rádios', text: `Estou ouvindo ${radios[currentIndex].name} no Radar Rádios!`, url: window.location.href }).catch(() => {});
    } else { alert("Compartilhamento não suportado."); }
});
document.getElementById("btn-shazam").addEventListener("click", () => { window.location.href = "shazam://"; setTimeout(() => { if(document.visibilityState === 'visible') alert("Instale o Shazam para identificar músicas automaticamente."); }, 1500); });

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
document.querySelectorAll(".fechar-modal-timer").forEach(btn => document.addEventListener("click", () => document.getElementById("modal-timer").classList.remove("active")));
document.querySelectorAll(".timer-option").forEach(item => {
    item.addEventListener("click", (e) => {
        const minutos = parseInt(e.currentTarget.getAttribute("data-time")); clearInterval(sleepTimerInterval);
        if (minutos > 0) { targetTime = new Date().getTime() + minutos * 60 * 1000; updateTimerDisplay(); timerDisplay.classList.remove("hidden"); sleepTimerInterval = setInterval(updateTimerDisplay, 1000); alert(`A rádio desligará em ${minutos} minutos.`);
        } else { timerDisplay.classList.add("hidden"); } document.getElementById("modal-timer").classList.remove("active");
    });
});

function atualizarTelaDeBloqueio(radio, rdsText = null, coverUrl = null) {
    if ('mediaSession' in navigator) {
        let nomeR = radio.name; if (!nomeR.toUpperCase().includes('FM') && (!radio.badge || radio.badge === 'Rádio FM')) nomeR = `${radio.name} FM`;
        let artworkSrc = 'https://raw.githubusercontent.com/althierestm/Radar-Radios-App/main/R%C3%A1dios%20Online%20e%20Gr%C3%A1tis%20quadra%20azul.png';
        if (coverUrl && coverUrl.startsWith('http')) artworkSrc = coverUrl;
        let albumText = (rdsText && rdsText !== "Programação ao vivo" && rdsText !== "Buscando informações...") ? `🎵 ${rdsText}` : ""; 
        navigator.mediaSession.metadata = new MediaMetadata({ title: nomeR, artist: `${radio.city} • ${radio.genre}`, album: albumText, artwork: [{ src: artworkSrc, sizes: '512x512' }] });
        navigator.mediaSession.setActionHandler('play', () => { audio.play(); playIcon.className = "fa-solid fa-pause"; });
        navigator.mediaSession.setActionHandler('pause', () => { audio.pause(); stopChiado(); playIcon.className = "fa-solid fa-play"; });
        navigator.mediaSession.setActionHandler('previoustrack', () => { document.getElementById("btn-prev").click(); });
        navigator.mediaSession.setActionHandler('nexttrack', () => { document.getElementById("btn-next").click(); });
    }
}

if (localStorage.getItem("radar_theme") === "light") { document.body.classList.add("light-theme"); themeToggle.checked = true; }
themeToggle.addEventListener("change", (e) => { if (e.target.checked) { document.body.classList.add("light-theme"); localStorage.setItem("radar_theme", "light"); } else { document.body.classList.remove("light-theme"); localStorage.setItem("radar_theme", "dark"); } });
if (localStorage.getItem("radar_voice") === "on") voiceToggle.checked = true;
voiceToggle.addEventListener("change", (e) => localStorage.setItem("radar_voice", e.target.checked ? "on" : "off"));
if (localStorage.getItem("radar_haptic") === "off") hapticToggle.checked = false;
hapticToggle.addEventListener("change", (e) => localStorage.setItem("radar_haptic", e.target.checked ? "on" : "off"));
const requestWakeLock = async () => { try { wakeLock = await navigator.wakeLock.request('screen'); } catch (err) {} };
const releaseWakeLock = async () => { if (wakeLock !== null) { await wakeLock.release(); wakeLock = null; } };
wakelockToggle.addEventListener("change", (e) => { if (e.target.checked) { requestWakeLock(); } else { releaseWakeLock(); } });
document.addEventListener('visibilitychange', async () => { if (wakelockToggle.checked && document.visibilityState === 'visible') { await requestWakeLock(); } });

airplayBtn.addEventListener("click", (e) => { e.stopPropagation(); if (window.WebKitPlaybackTargetAvailabilityEvent) audio.webkitShowPlaybackTargetPicker(); else if (audio.remote && audio.remote.prompt) audio.remote.prompt(); else alert("A transmissão AirPlay não é suportada neste navegador."); });
audio.addEventListener('webkitcurrentplaybacktargetiswirelesschanged', () => { airplayBtn.classList.toggle("active", audio.webkitCurrentPlaybackTargetIsWireless); });

let audioCtx, noiseNode, noiseGain, noiseFilter;
function initChiado() {
    if (audioCtx) return; audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const bufferSize = audioCtx.sampleRate * 2; const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0); for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    noiseNode = audioCtx.createBufferSource(); noiseNode.buffer = buffer; noiseNode.loop = true;
    noiseFilter = audioCtx.createBiquadFilter(); noiseFilter.type = 'bandpass'; noiseFilter.frequency.value = 1200;
    noiseGain = audioCtx.createGain(); noiseGain.gain.value = 0; 
    noiseNode.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(audioCtx.destination); noiseNode.start();
}
function playChiado() { if (!noiseToggle.checked) return; if (!audioCtx) initChiado(); if (audioCtx.state === 'suspended') audioCtx.resume(); noiseGain.gain.setTargetAtTime(0.3, audioCtx.currentTime, 0.1); }
function stopChiado() { if (noiseGain) noiseGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1); }

function updateRDSText(text, coverUrl = null) {
    const rdsText = document.getElementById("rds-text"); const rdsScroller = document.getElementById("rds-scroller");
    if (rdsText.innerText !== text) {
        rdsText.innerText = text; rdsScroller.classList.remove("marquee"); void rdsScroller.offsetWidth; 
        setTimeout(() => { if (rdsScroller.scrollWidth > rdsScroller.parentElement.clientWidth) rdsScroller.classList.add("marquee"); }, 50);
        if (typeof radios !== "undefined" && radios[currentIndex]) atualizarTelaDeBloqueio(radios[currentIndex], text, coverUrl);
    }
}

async function fetchRDS(radio) {
    try {
        if (!radio || !radio.rds) return;
        if (radio.rds === "local_chuva") {
            const hour = new Date().getHours(); let msg = hour >= 6 && hour < 12 ? "Bom dia, relaxe com esse barulhinho de chuva" : hour >= 12 && hour < 18 ? "Tardezinha ótima para dormir" : "Boa noite, bom descanso";
            updateRDSText(msg, null); return;
        }

        const url = radio.rds; let text = ""; let songName = ""; let coverUrl = null;

        if (url.includes("api.zeno.fm") || url.includes("/subscribe")) {
            const response = await fetch(url, { cache: "no-store" }); const reader = response.body.getReader(); const { value } = await reader.read(); text = new TextDecoder("utf-8").decode(value); reader.cancel(); 
        } else {
            let targetUrl = url; if (url.includes("clube.fm") || url.includes("radiomixfm.com.br") || url.includes("m985.com.br")) targetUrl = "https://api.allorigins.win/raw?url=" + encodeURIComponent(url);
            const response = await fetch(targetUrl, { cache: "no-store" }); if (!response.ok) throw new Error("Erro na requisição proxy"); text = await response.text();
        }

        if (text.includes("cue_title")) {
            const parser = new DOMParser(); const xmlDoc = parser.parseFromString(text, "text/xml"); const properties = xmlDoc.getElementsByTagName("property");
            for (let i = 0; i < properties.length; i++) { if (properties[i].getAttribute("name") === "cue_title") { songName = properties[i].textContent; break; } }
        } else if (text.includes('data:{"mount"')) {
            const lines = text.split('\n');
            for (let i = lines.length - 1; i >= 0; i--) { const line = lines[i].trim(); if (line.startsWith('data:{')) { try { const zenoData = JSON.parse(line.substring(5)); if (zenoData.streamTitle) { songName = zenoData.streamTitle; break; } } catch(e) {} } }
        } else {
            try {
                let json; try { json = JSON.parse(text); } catch (err) { const lines = text.split('\n'); for (let i = lines.length - 1; i >= 0; i--) { const line = lines[i].trim(); if (line.startsWith('data:')) { try { json = JSON.parse(line.substring(5).trim()); break; } catch (e) {} } } if (!json) throw new Error("Invalid JSON"); }
                if (!songName && json.t && typeof json.t === "string") { let artist = json.i || ""; songName = artist ? `${artist} - ${json.t}` : json.t; }
                if (json.programa) { let progNameStr = typeof json.programa === 'string' ? json.programa : (json.programa.nome || ""); let locutorStr = json.locutores ? (typeof json.locutores === 'string' ? json.locutores : "") : (json.locutor ? (typeof json.locutor === 'string' ? json.locutor : (json.locutor.nome || "")) : ""); if (progNameStr) songName = locutorStr ? `${locutorStr} - ${progNameStr}` : progNameStr; }
                if (!songName && json.singer && json.song && typeof json.song === "string") { songName = `${json.singer} - ${json.song}`; if (json.capa) coverUrl = json.capa; }
                if (!songName) songName = json.title || json.now_playing || (typeof json.song === "string" ? json.song : "") || json.songtitle || "";
                if (!songName && typeof json.program === "string") songName = json.program;
                if (!songName && json.infos) { if (json.infos.EventType !== "Commercials") { let title = json.infos.Title || (json.infos.MusicInfos && json.infos.MusicInfos.MusicTitle); let artist = json.infos.Subtitle || (json.infos.MusicInfos && json.infos.MusicInfos.PostSubTitle); if (title) songName = artist ? `${artist} - ${title}` : title; } } else if (!songName && json.MusicTitle) { songName = json.PostSubTitle ? `${json.PostSubTitle} - ${json.MusicTitle}` : json.MusicTitle; }
                let metroData = Array.isArray(json) ? json[0] : json;
                if (!songName && metroData && metroData.song && typeof metroData.song === 'object' && metroData.song.name) { let trackName = metroData.song.name; let mainArtist = (metroData.artist && metroData.artist.name) ? metroData.artist.name : ""; let featArtist = (metroData.feat && metroData.feat.name) ? metroData.feat.name : ""; let fullArtist = mainArtist; if (featArtist) fullArtist += `, ${featArtist}`; if (trackName) songName = fullArtist ? `${fullArtist} - ${trackName}` : trackName; }
                if (typeof json === 'object' && json !== null) { if (!coverUrl) coverUrl = json.cover || json.image || json.artworkUrl || json.thumb || null; if (!coverUrl && json.data && json.data.cover) coverUrl = json.data.cover; if (!coverUrl && metroData && metroData.song && metroData.song.cover) coverUrl = metroData.song.cover; }
            } catch(err) { if (text && text.length > 2 && text.length < 150 && !text.includes("<html")) songName = text.replace(/<[^>]*>?/gm, '').trim(); }
        }
        if (songName && typeof songName === "string") songName = songName.replace(/&#038;/g, "&").replace(/&amp;/g, "&").replace(/&#039;/g, "'").replace(/&quot;/g, '"');
        if (songName && typeof songName === "string" && songName.trim() !== "") updateRDSText(songName, coverUrl); else updateRDSText("Programação ao vivo", null);
    } catch (e) { updateRDSText("Programação ao vivo", null); }
}

function startRDS(radio) {
    clearInterval(rdsInterval); const rdsContainer = document.getElementById("rds-container"); const rdsScroller = document.getElementById("rds-scroller"); const rdsText = document.getElementById("rds-text");
    if (!radio.rds) { rdsContainer.classList.add("hidden"); if (typeof atualizarTelaDeBloqueio === "function") atualizarTelaDeBloqueio(radio, null, null); return; }
    rdsContainer.classList.remove("hidden"); rdsText.innerText = "Buscando informações..."; rdsScroller.classList.remove("marquee");
    fetchRDS(radio); rdsInterval = setInterval(() => fetchRDS(radio), 10000);
}

audio.addEventListener('playing', () => {
    stopChiado(); const radio = radios[currentIndex]; statusConexao.innerText = `${radio.city} • ${radio.genre}`; playIcon.className = "fa-solid fa-pause";
    if (badgePais) badgePais.innerText = radio.badge || "Rádio FM";
    atualizarTelaDeBloqueio(radio); startRDS(radio);

    currentStationTime = 0; currentStationTracked = false; clearInterval(profileTimer);
    profileTimer = setInterval(() => {
        currentStationTime += 5000; userStats.listeningTimeMS += 5000;
        if (currentStationTime >= 30000 && !currentStationTracked) {
            userStats.stationsListened[radio.name] = (userStats.stationsListened[radio.name] || 0) + 1; userStats.genresListened[radio.genre] = (userStats.genresListened[radio.genre] || 0) + 1; userStats.freqsListened[radio.freq] = (userStats.freqsListened[radio.freq] || 0) + 1;
            let state = radio.city.split("-")[1]?.trim() || "Web"; if (state.toLowerCase() === "ba") state = "Bahia"; if (state.toLowerCase() === "sp") state = "São Paulo"; if (state.toLowerCase() === "mg") state = "Minas Gerais"; if (state.toLowerCase() === "df") state = "Distrito Federal";
            userStats.statesListened[state] = (userStats.statesListened[state] || 0) + 1; currentStationTracked = true;
            localStorage.setItem("radar_stats", JSON.stringify(userStats));
            
            // Gravar histórico mensal na nuvem
            if (currentUser) {
                const monthKey = getCurrentMonthKey();
                db.collection("users").doc(currentUser.uid).collection("history").doc(monthKey).set({
                    stats: userStats, lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            }
            if(document.getElementById('modal-config').classList.contains('active')) renderProfile();
        } else { localStorage.setItem("radar_stats", JSON.stringify(userStats)); }
    }, 5000);
});

audio.addEventListener('pause', () => { clearInterval(profileTimer); clearInterval(rdsInterval); });

function buildDial() {
    dialStrip.innerHTML = '';
    for (let f = minFreq; f <= maxFreq; f += 0.1) {
        let freqFixed = Number(f.toFixed(1)); const tick = document.createElement("div"); let type = "minor"; let showText = "";
        if (Math.abs(freqFixed % 1) < 0.05) { type = "major"; showText = freqFixed.toFixed(0); } else if (Math.abs((freqFixed * 10) % 5) < 0.5) { type = "medium"; }
        let conteudoExtra = ""; if (radios.some(r => parseFloat(r.freq) === freqFixed)) { conteudoExtra = `<div class="station-dot"></div>`; }
        tick.className = `dial-tick ${type}`; tick.innerHTML = `${conteudoExtra}<span>${showText}</span><div class="line"></div>`; dialStrip.appendChild(tick);
    }
    if (radios[currentIndex]) atualizarPosicaoDial(radios[currentIndex].freq);
}

function atualizarPosicaoDial(freqStr) {
    const totalTracos = (parseFloat(freqStr) - minFreq) / 0.1; dialStrip.style.transform = `translateX(${-(totalTracos * tickWidth)}px)`;
}

function getNextRadioIndex(direction) {
    const currentFreq = parseFloat(freqValor.innerText);
    if (direction === 1) { const nextIndex = radios.findIndex(r => parseFloat(r.freq) > currentFreq); return nextIndex !== -1 ? nextIndex : 0; 
    } else { let prevIndex = -1; for (let i = radios.length - 1; i >= 0; i--) { if (parseFloat(radios[i].freq) < currentFreq) { prevIndex = i; break; } } return prevIndex !== -1 ? prevIndex : (radios.length - 1); }
}

btnMultiRadio.addEventListener("click", () => {
    const currentFreq = parseFloat(radios[currentIndex].freq); const duplicates = radios.filter(r => parseFloat(r.freq) === currentFreq);
    document.getElementById("multi-modal-title").innerText = `Sintonia ${currentFreq.toFixed(1)} MHz`;
    const list = document.getElementById("multi-station-list"); list.innerHTML = "";
    duplicates.forEach(r => {
        const li = document.createElement("li"); li.className = "station-item"; li.innerHTML = `<div><strong>${r.name}</strong><br><small style="color:var(--text-muted)">${r.city} • ${r.genre}</small></div>`;
        li.addEventListener("click", () => { currentIndex = radios.findIndex(rad => rad.id === r.id); carregarRadio(currentIndex); document.getElementById("modal-multi").classList.remove("active"); tocarComVoz(radios[currentIndex]); document.getElementById('btn-multi-radio').classList.remove('pulse-active'); });
        list.appendChild(li);
    });
    document.getElementById("modal-multi").classList.add("active");
});
document.querySelectorAll(".fechar-modal-multi").forEach(btn => btn.addEventListener("click", () => document.getElementById("modal-multi").classList.remove("active")));

let isDragging = false; let startX = 0; let initialTranslateX = 0; let lastVibratedFreq = "";
dialContainer.addEventListener('pointerdown', (e) => {
    isDragging = true; startX = e.clientX; initialTranslateX = new WebKitCSSMatrix(window.getComputedStyle(dialStrip).transform).m41; 
    dialStrip.style.transition = 'none'; audio.pause(); playChiado(); playIcon.className = "fa-solid fa-play";
    statusConexao.innerText = "Sintonizando..."; document.getElementById('btn-multi-radio').classList.add('hidden'); document.getElementById("rds-container").classList.add("hidden");
});
window.addEventListener('pointermove', (e) => {
    if (!isDragging) return; let novoTranslateX = initialTranslateX + (e.clientX - startX); const minTranslate = -((maxFreq - minFreq) / 0.1) * tickWidth;
    if (novoTranslateX > 0) novoTranslateX = 0; if (novoTranslateX < minTranslate) novoTranslateX = minTranslate;
    dialStrip.style.transform = `translateX(${novoTranslateX}px)`; const freqAtual = minFreq + (Math.abs(novoTranslateX) / tickWidth) * 0.1; freqValor.innerText = freqAtual.toFixed(1);
    if (freqValor.innerText !== lastVibratedFreq) { lastVibratedFreq = freqValor.innerText; if (hapticToggle.checked && navigator.vibrate) navigator.vibrate(10); }
    estacaoNome.innerText = "Buscando sinal..."; if (noiseFilter) noiseFilter.frequency.value = 800 + Math.abs(Math.sin(novoTranslateX * 0.1)) * 1500;
});
window.addEventListener('pointerup', () => {
    if (!isDragging) return; isDragging = false; dialStrip.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    const freqSintonizada = parseFloat(freqValor.innerText); atualizarPosicaoDial(freqSintonizada);
    const encontradas = radios.filter(r => parseFloat(r.freq) === freqSintonizada);
    if (encontradas.length > 0) { currentIndex = radios.findIndex(r => r.id === encontradas[0].id); carregarRadio(currentIndex); tocarComVoz(radios[currentIndex]);
    } else { estacaoNome.innerText = ""; statusConexao.innerText = ""; favIcon.classList.replace("fa-solid", "fa-regular"); document.getElementById('btn-multi-radio').classList.add('hidden'); if (noiseFilter) noiseFilter.frequency.value = 1000; }
});

function carregarRadio(index) {
    if (radios.length === 0) return;
    const radio = radios[index]; freqValor.innerText = radio.freq; 
    let nomeBonito = radio.name; if (!nomeBonito.toUpperCase().includes('FM') && (!radio.badge || radio.badge === 'Rádio FM')) nomeBonito = `${radio.name} FM`;
    estacaoNome.innerText = nomeBonito; statusConexao.innerText = "CONECTANDO..."; if (badgePais) badgePais.innerText = radio.badge || "Rádio FM";
    clearInterval(rdsInterval); document.getElementById("rds-container").classList.add("hidden");
    
    audio.src = radio.url; audio.loop = (radio.rds === "local_chuva"); 
    atualizarPosicaoDial(radio.freq); verificarFavorito(radio.id); renderizarFavoritas(); atualizarTelaDeBloqueio(radio);

    const arrayConflitos = radios.filter(r => parseFloat(r.freq) === parseFloat(radio.freq));
    const btnMulti = document.getElementById('btn-multi-radio');
    if (arrayConflitos.length > 1) { btnMulti.classList.remove('hidden'); btnMulti.classList.add('pulse-active');
    } else { btnMulti.classList.add('hidden'); btnMulti.classList.remove('pulse-active'); }
}

function verificarFavorito(id) {
    if (favoritas.includes(id)) { favIcon.classList.replace("fa-regular", "fa-solid"); } else { favIcon.classList.replace("fa-solid", "fa-regular"); }
}

playBtn.addEventListener("click", () => {
    if (audio.paused) { if (estacaoNome.innerText !== "Sem Sinal" && estacaoNome.innerText !== "") { statusConexao.innerText = "CONECTANDO..."; audio.play(); }
    } else { audio.pause(); stopChiado(); statusConexao.innerText = "PAUSADO"; playIcon.className = "fa-solid fa-play"; }
});

document.getElementById("btn-next").addEventListener("click", () => { currentIndex = getNextRadioIndex(1); carregarRadio(currentIndex); if (!audio.paused || playIcon.classList.contains("fa-pause")) tocarComVoz(radios[currentIndex]); });
document.getElementById("btn-prev").addEventListener("click", () => { currentIndex = getNextRadioIndex(-1); carregarRadio(currentIndex); if (!audio.paused || playIcon.classList.contains("fa-pause")) tocarComVoz(radios[currentIndex]); });

document.getElementById("btn-fav").addEventListener("click", () => {
    if (estacaoNome.innerText === "Sem Sinal" || estacaoNome.innerText === "") return; 
    const radioAtual = radios[currentIndex];
    if (favoritas.includes(radioAtual.id)) { favoritas = favoritas.filter(id => id !== radioAtual.id); } else { favoritas.push(radioAtual.id); }
    localStorage.setItem("radar_favoritas", JSON.stringify(favoritas)); verificarFavorito(radioAtual.id); renderizarFavoritas();
    
    if (currentUser) {
        db.collection("users").doc(currentUser.uid).set({ favoritas: favoritas }, { merge: true });
    }
});

function renderizarFavoritas() {
    const listaFav = document.getElementById("favoritas-list"); listaFav.innerHTML = "";
    if (favoritas.length === 0) { listaFav.innerHTML = "<p style='text-align:center; padding: 20px; color: var(--text-muted); font-size: 14px;'>Nenhuma rádio salva.</p>"; return; }
    allRadios.filter(r => favoritas.includes(r.id)).forEach(r => {
        const li = document.createElement("li"); li.className = "station-item";
        li.innerHTML = `<div><strong>${r.name}</strong> (${r.freq} MHz)<br><small style="color:var(--text-muted)">${r.city} • ${r.badge || "Rádio FM"}</small></div>`;
        li.addEventListener("click", () => { document.getElementById("modal-config").classList.remove("active"); loadRadioById(r.id); tocarComVoz(radios[currentIndex]); });
        listaFav.appendChild(li);
    });
}

document.querySelectorAll(".fechar-modal").forEach(btn => btn.addEventListener("click", () => document.getElementById("modal-estacoes").classList.remove("active")));
document.querySelectorAll(".fechar-config").forEach(btn => btn.addEventListener("click", () => document.getElementById("modal-config").classList.remove("active")));

document.getElementById("btn-config").addEventListener("click", () => { 
    renderizarFavoritas(); renderProfile(); document.getElementById("modal-config").classList.add("active"); 
});

const btnPrivacidade = document.getElementById("btn-privacidade");
if (btnPrivacidade) {
    btnPrivacidade.addEventListener("click", () => { window.open("https://althierestm.github.io/Radar-Radios-App/privacidade.html", "_blank"); });
    
    const alexaLi = document.createElement("li");
    alexaLi.className = "clickable-row"; alexaLi.style.justifyContent = "center"; alexaLi.style.borderBottom = "none"; alexaLi.style.padding = "25px 0"; alexaLi.style.marginTop = "10px";
    alexaLi.innerHTML = `<div style="cursor: pointer; transition: transform 0.2s;" onmousedown="this.style.transform='scale(0.9)'" onmouseup="this.style.transform='scale(1)'" onmouseleave="this.style.transform='scale(1)'" title="Ativar Skill na Alexa"><img src="https://upload.wikimedia.org/wikipedia/commons/c/cc/Amazon_Alexa_App_Logo.png" alt="Ativar na Alexa" style="width: 55px; height: 55px; border-radius: 14px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);"></div>`;
    alexaLi.addEventListener("click", () => { window.open("https://www.amazon.com.br/Althieres-Parillare-Dias-Radar-R%C3%A1dios/dp/B0HKZC442H", "_blank"); });
    btnPrivacidade.parentNode.appendChild(alexaLi);
}
