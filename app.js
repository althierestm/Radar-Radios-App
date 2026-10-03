let db = null;
let auth = null;
let rtdb = null;

try {
    if (typeof firebase !== 'undefined' && !firebase.apps.length) {
        firebase.initializeApp({
            apiKey: "AIzaSyBfy8hroE6WnoYyemSfH7tcLjpUgxfT6MU",
            authDomain: "radar-radios.firebaseapp.com",
            databaseURL: "https://radar-radios-default-rtdb.firebaseio.com",
            projectId: "radar-radios",
            storageBucket: "radar-radios.firebasestorage.app",
            messagingSenderId: "961077981455",
            appId: "1:961077981455:web:b57cb8c81b959c36bf4e7a"
        });
        db = firebase.firestore();
        auth = firebase.auth();
        rtdb = firebase.database();
    }
} catch (e) {
    console.warn("Modo Offline ativado.");
}

let allRadios = [];
let currentFilterMode = "Rádio FM";
let radios = [];
let currentIndex = 0;
let currentUser = null;
let remoteHistory = {};
let sessionCounted = false; 
let isRadioLoaded = false;

let userStats;
try {
    userStats = JSON.parse(localStorage.getItem("radar_stats"));
    if (!userStats || typeof userStats !== 'object') throw new Error();
    if (userStats.currentMonth !== new Date().getMonth()) throw new Error();
} catch(e) {
    userStats = { listeningTimeMS: 0, currentMonth: new Date().getMonth(), stationsListened: {}, genresListened: {}, statesListened: {}, freqsListened: {} };
}

let favoritas = JSON.parse(localStorage.getItem("radar_favoritas")) || [];
let sleepTimerInterval = null; let targetTime = null; 
let wasPlayingBeforeBackground = false; let rdsInterval = null;
let minFreq = 70.0; let maxFreq = 110.0; const tickWidth = 14; 
let playCountTimer = null; 
let rdsEnabled = localStorage.getItem("radar_rds") !== "off";

const audio = document.getElementById("audio-stream"); 
if (audio) audio.volume = 1.0; 

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

const rdsToggle = document.getElementById("rds-toggle");
const voiceToggle = document.getElementById("voice-toggle");
const noiseToggle = document.getElementById("noise-toggle");
const hapticToggle = document.getElementById("haptic-toggle");

function generateAnonUid() { return 'anon_' + Math.random().toString(36).substr(2, 9); }
function getDeviceUid() {
    let uid = localStorage.getItem('radar_device_uid');
    if(!uid) { uid = generateAnonUid(); localStorage.setItem('radar_device_uid', uid); }
    return uid;
}

function updatePresence(status, radioId = null) {
    if(!rtdb) return;
    const uid = currentUser ? currentUser.uid : getDeviceUid();
    const connectedRef = rtdb.ref('.info/connected');
    const userRef = rtdb.ref(`presence/${uid}`);
    
    connectedRef.on('value', (snap) => {
        if (snap.val() === true) {
            userRef.onDisconnect().remove();
            userRef.set({ status, radio: radioId, timestamp: firebase.database.ServerValue.TIMESTAMP });
        }
    });
    userRef.update({ status, radio: radioId, timestamp: firebase.database.ServerValue.TIMESTAMP }).catch(()=>{});
}

function logVisit() {
    if(!db) return;
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    const month = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    const lastVisit = localStorage.getItem('radar_last_visit');
    
    if (lastVisit !== today) {
        localStorage.setItem('radar_last_visit', today);
        const statRef = db.collection('app_stats').doc('visits');
        statRef.set({
            [`daily.${today}`]: firebase.firestore.FieldValue.increment(1),
            [`monthly.${month}`]: firebase.firestore.FieldValue.increment(1),
            total: firebase.firestore.FieldValue.increment(1)
        }, { merge: true }).catch(()=>{});
    }
}

function initOfflineFirst() {
    const cachedRadios = localStorage.getItem("radar_radios_cache");
    if (cachedRadios) {
        allRadios = JSON.parse(cachedRadios).sort((a, b) => parseFloat(a.freq) - parseFloat(b.freq));
        radios = allRadios.filter(r => (r.badge || "Rádio FM") === currentFilterMode);
    }
    
    buildDial();
    const indexIni = radios.findIndex(r => r.id === "radar-fm");
    currentIndex = indexIni !== -1 ? indexIni : 0;
    if (radios.length > 0) carregarRadio(currentIndex);
    
    syncWithFirebaseBackground();
}

async function syncWithFirebaseBackground() {
    if(auth) { startAuthListener(); }
    if(db) {
        logVisit(); 
        updatePresence('online');
        try {
            const snapshot = await db.collection("radios").get();
            if (!snapshot.empty) {
                const fetchedRadios = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                
                const uniqueRadios = []; const seenNames = new Set();
                fetchedRadios.forEach(r => {
                    const normName = r.name.trim().toLowerCase();
                    if (!seenNames.has(normName)) { seenNames.add(normName); uniqueRadios.push(r); }
                });
                
                allRadios = uniqueRadios.sort((a, b) => parseFloat(a.freq) - parseFloat(b.freq));
                radios = allRadios.filter(r => (r.badge || "Rádio FM") === currentFilterMode);
                buildDial();
                
                if (radios.length > 0 && !isRadioLoaded) {
                    const idx = radios.findIndex(r => r.id === "radar-fm");
                    currentIndex = idx !== -1 ? idx : 0;
                    carregarRadio(currentIndex);
                }

                try {
                    localStorage.setItem("radar_radios_cache", JSON.stringify(fetchedRadios));
                } catch(e){}
            }
        } catch (e) {}
    }
}
initOfflineFirst();

function startAuthListener() {
    if(!auth) return;
    auth.onAuthStateChanged(user => {
        currentUser = user;
        updatePresence('online'); 
        const banner = document.getElementById("auth-prompt-banner");
        const dash = document.getElementById("logged-in-dashboard");
        
        if (user) {
            if(banner) banner.style.display = "none";
            if(dash) dash.style.display = "block";
            const usrDisp = document.getElementById("user-display-name");
            if(usrDisp) usrDisp.innerText = `Olá, ${user.displayName || 'Ouvinte'}!`;
            
            if(db) {
                db.collection("users").doc(user.uid).get().then(doc => {
                    if (doc.exists && doc.data().favoritas) {
                        favoritas = doc.data().favoritas;
                        localStorage.setItem("radar_favoritas", JSON.stringify(favoritas));
                        if (radios[currentIndex]) verificarFavorito(radios[currentIndex].id);
                        renderizarFavoritas();
                    }
                }).catch(()=>{});
            }
            loadUserHistory(user.uid);
        } else {
            if(banner) banner.style.display = "block";
            if(dash) dash.style.display = "none";
            renderProfileStats(userStats);
        }
    });
}

function getCurrentMonthKey() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; }
function formatMonthKey(key) { const [y, m] = key.split('-'); const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"]; return `${meses[parseInt(m)-1]} ${y}`; }

async function loadUserHistory(uid) {
    if(!db) return;
    try {
        const snapshot = await db.collection("users").doc(uid).collection("history").get();
        const select = document.getElementById("history-month-select");
        if(select) select.innerHTML = `<option value="current">Mês Atual (Tempo Real)</option>`;
        
        snapshot.forEach(doc => {
            const key = doc.id; remoteHistory[key] = doc.data().stats;
            if(key !== getCurrentMonthKey()) {
                const opt = document.createElement("option"); opt.value = key; opt.innerText = formatMonthKey(key); 
                if(select) select.appendChild(opt);
            } else { remoteHistory['current'] = doc.data().stats; }
        });

        if(select) {
            select.onchange = (e) => {
                if(e.target.value === 'current') renderProfileStats(userStats);
                else renderProfileStats(remoteHistory[e.target.value]);
            };
        }
        renderProfileStats(userStats);
    } catch(e) {}
}

window.abrirAuthModal = () => { const m = document.getElementById("modal-auth"); if(m) m.classList.add("active"); const e = document.getElementById("login-error-msg"); if(e) e.innerText = ""; }
window.fecharAuthModal = () => { const m = document.getElementById("modal-auth"); if(m) m.classList.remove("active"); }
window.mudarAuthTab = (tab) => {
    const btnL = document.getElementById("btn-tab-login"); const btnR = document.getElementById("btn-tab-register");
    const frmL = document.getElementById("auth-login-form"); const frmR = document.getElementById("auth-register-form");
    const ttl = document.getElementById("auth-modal-title");
    if(btnL) btnL.classList.remove("active"); if(btnR) btnR.classList.remove("active");
    if(frmL) frmL.style.display = "none"; if(frmR) frmR.style.display = "none";
    if(tab === 'login') {
        if(btnL) btnL.classList.add("active"); if(frmL) frmL.style.display = "block"; if(ttl) ttl.innerText = "Entrar";
    } else {
        if(btnR) btnR.classList.add("active"); if(frmR) frmR.style.display = "block"; if(ttl) ttl.innerText = "Nova Conta";
    }
}

window.loginComGoogle = function() {
    if(!auth) return;
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider).then(() => window.fecharAuthModal()).catch(err => { const el = document.getElementById("login-error-msg"); if(el) el.innerText = err.message; });
}
window.loginComApple = function() {
    if(!auth) return;
    const provider = new firebase.auth.OAuthProvider('apple.com');
    auth.signInWithPopup(provider).then(() => window.fecharAuthModal()).catch(err => { const el = document.getElementById("login-error-msg"); if(el) el.innerText = "Login Apple indisponível."; });
}
window.processarLogin = function() {
    if(!auth) return;
    const email = document.getElementById("login-email")?.value; const pass = document.getElementById("login-pass")?.value;
    const errEl = document.getElementById("login-error-msg");
    if(!email || !pass) { if(errEl) errEl.innerText = "Preencha todos os campos."; return; }
    auth.signInWithEmailAndPassword(email, pass).then(() => window.fecharAuthModal()).catch(err => { if(errEl) errEl.innerText = "E-mail ou senha incorretos."; });
}
window.processarCadastro = function() {
    if(!auth || !db) return;
    const name = document.getElementById("reg-name")?.value; const phone = document.getElementById("reg-phone")?.value; const city = document.getElementById("reg-city")?.value;
    const email = document.getElementById("reg-email")?.value; const pass = document.getElementById("reg-pass")?.value;
    const errEl = document.getElementById("reg-error-msg");
    
    if(!email || !pass) { if(errEl) errEl.innerText = "Preencha o e-mail e a senha."; return; }
    if(pass.length < 6) { if(errEl) errEl.innerText = "A senha deve ter pelo menos 6 caracteres."; return; }
    
    auth.createUserWithEmailAndPassword(email, pass).then(cred => {
        return cred.user.updateProfile({ displayName: name }).then(() => {
            db.collection("users").doc(cred.user.uid).set({ phone, city, createdAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
            window.fecharAuthModal();
        });
    }).catch(err => { if(errEl) errEl.innerText = err.message; });
}
window.fazerLogout = function() { if(auth) auth.signOut(); }

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

    const fraseEl = document.getElementById("perfil-frase"); if(fraseEl) fraseEl.innerText = getDynamicPhrase(stats);
    const dashEl = document.getElementById("perfil-dashboard");
    if(dashEl) {
        dashEl.innerHTML = `
            <div class="perfil-card"><i class="fa-solid fa-clock"></i><span class="perfil-value">${tempoStr}</span><span class="perfil-label">Tempo (${nomeMes})</span></div>
            <div class="perfil-card"><i class="fa-solid fa-tower-broadcast"></i><span class="perfil-value">${totalStations}</span><span class="perfil-label">Rádios Descobertas</span></div>
            <div class="perfil-card full-width"><i class="fa-solid fa-heart"></i><div class="perfil-text-group"><span class="perfil-value">${topRadio}</span><span class="perfil-label">Estação Mais Ouvida</span></div></div>
            <div class="perfil-card"><i class="fa-solid fa-music"></i><span class="perfil-value">${topGenre}</span><span class="perfil-label">Gênero Favorito</span></div>
            <div class="perfil-card"><i class="fa-solid fa-map-location-dot"></i><span class="perfil-value">${topState}</span><span class="perfil-label">Região Mais Ouvida</span></div>
            <div class="perfil-card"><i class="fa-solid fa-wave-square"></i><span class="perfil-value">${topFreq !== "Nenhum" ? topFreq + ' MHz' : 'Nenhuma'}</span><span class="perfil-label">Sintonia Favorita</span></div>
        `;
    }
}
function renderProfile() {
    const select = document.getElementById("history-month-select");
    if(currentUser && select && select.value !== 'current') renderProfileStats(remoteHistory[select.value]);
    else renderProfileStats(userStats);
}

window.showTab = function(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    const tab = document.getElementById(tabId); if(tab) tab.classList.add('active');
    if(event && event.currentTarget) event.currentTarget.classList.add('active');
    if(tabId === 'tab-config-perfil') renderProfile();
};

const splashScreen = document.getElementById("splash-screen");
const btnEntrar = document.getElementById("btn-entrar");
if(btnEntrar) {
    btnEntrar.addEventListener("click", () => {
        if(splashScreen) splashScreen.classList.add("hidden");
        initChiado(); playChiado();
        if(radios.length > 0 && audio) {
            audio.play().catch(() => {});
        }
    });
}

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
    const group = overlay.querySelector("#category-group"); if(group) group.innerHTML = '<div class="ios-action-header">Selecione uma Categoria</div>';
    const uniqueBadges = [...new Set(allRadios.map(r => r.badge || "Rádio FM"))];
    uniqueBadges.forEach(badge => {
        const btn = document.createElement("button"); btn.className = "ios-action-btn";
        if (badge === currentFilterMode) btn.style.fontWeight = "700";
        btn.innerText = badge; btn.onclick = () => { applyCategory(badge); closeCategorySelector(); };
        if(group) group.appendChild(btn);
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
    if (document.visibilityState === 'hidden') { if(audio) wasPlayingBeforeBackground = !audio.paused; } 
    else if (document.visibilityState === 'visible') { if (wasPlayingBeforeBackground && audio && audio.paused) { const currentSrc = audio.src; audio.src = ""; setTimeout(() => { audio.src = currentSrc; audio.play().catch(()=>{}); }, 50); } }
});

function tocarComVoz(radio) {
    if (!voiceToggle || !voiceToggle.checked || !('speechSynthesis' in window)) { if(audio) audio.play().catch(() => {}); return; }
    window.speechSynthesis.cancel(); if(audio) audio.pause(); stopChiado(); if(statusConexao) statusConexao.innerText = "ASSISTENTE DE VOZ...";
    let msg = new SpeechSynthesisUtterance(`${radio.freq.replace('.', ' ponto ')} Megahertz... ${radio.name}`);
    msg.lang = 'pt-BR'; msg.rate = 1.1;
    msg.onend = () => { if(statusConexao) statusConexao.innerText = `${radio.city} • ${radio.genre}`; if(audio) audio.play().catch(() => {}); };
    msg.onerror = () => { if(audio) audio.play().catch(() => {}); };
    window.speechSynthesis.speak(msg);
}

function abrirBusca() {
    const mdl = document.getElementById("modal-estacoes"); if(mdl) mdl.classList.add("active");
    const lista = document.getElementById("station-list"); if(!lista) return; 
    lista.innerHTML = "";
    allRadios.forEach((r) => {
        const li = document.createElement("li"); li.className = "station-item"; li.style.display = "none"; 
        li.innerHTML = `<div><strong>${r.name}</strong> (${r.freq} MHz)<br><small style="color:var(--text-muted)">${r.city} • ${r.genre}</small></div>`;
        li.addEventListener("click", () => { if(mdl) mdl.classList.remove("active"); loadRadioById(r.id); tocarComVoz(radios[currentIndex]); });
        lista.appendChild(li);
    });
    const inputBusca = document.getElementById("filtra-estacao"); if(inputBusca) { inputBusca.value = ""; setTimeout(() => { inputBusca.focus(); }, 100); }
}

if(areaBuscaFreq) {
    areaBuscaFreq.addEventListener("click", abrirBusca);
    let touchStartY = 0;
    areaBuscaFreq.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, {passive: true});
    areaBuscaFreq.addEventListener('touchend', e => { if (e.changedTouches[0].clientY - touchStartY > 40) abrirBusca(); }, {passive: true});
}

const btnLista = document.getElementById("btn-lista"); if(btnLista) btnLista.addEventListener("click", abrirBusca);

const filtraEstacao = document.getElementById("filtra-estacao");
if(filtraEstacao) {
    filtraEstacao.addEventListener("input", (e) => {
        const termo = normalizeStr(e.target.value); const itens = document.querySelectorAll("#station-list .station-item");
        if (termo.length === 0) { itens.forEach(item => item.style.display = "none"); return; }
        itens.forEach(item => { item.style.display = normalizeStr(item.innerText).includes(termo) ? "flex" : "none"; });
    });
}

const btnWp = document.getElementById("btn-whatsapp"); if(btnWp) btnWp.addEventListener("click", () => { window.open(`https://wa.me/5532985109726?text=` + encodeURIComponent("Olá, Gostaria de adicionar uma rádio no Radar Rádios."), "_blank"); });
const btnShare = document.getElementById("btn-share"); if(btnShare) btnShare.addEventListener("click", () => {
    if (navigator.share) { navigator.share({ title: 'Radar Rádios', text: `Estou ouvindo ${radios[currentIndex].name} no Radar Rádios!`, url: window.location.href }).catch(() => {});
    } else { alert("Compartilhamento não suportado."); }
});
const btnShazam = document.getElementById("btn-shazam"); if(btnShazam) btnShazam.addEventListener("click", () => { window.location.href = "shazam://"; setTimeout(() => { if(document.visibilityState === 'visible') alert("Instale o Shazam para identificar músicas automaticamente."); }, 1500); });

function updateTimerDisplay() {
    const now = new Date().getTime(); const diff = targetTime - now;
    if (diff <= 0) {
        clearInterval(sleepTimerInterval); if(audio) audio.pause(); stopChiado();
        if(statusConexao) statusConexao.innerText = "TEMPORIZADOR FINALIZADO"; if(playIcon) playIcon.className = "fa-solid fa-play";
        if(timerDisplay) timerDisplay.classList.add("hidden");
    } else {
        const totalSecs = Math.floor(diff / 1000); const hours = Math.floor(totalSecs / 3600);
        const mins = Math.floor((totalSecs % 3600) / 60); const secs = totalSecs % 60;
        if(timerDisplay) timerDisplay.innerText = `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}
const btnTimerOpen = document.getElementById("btn-timer-open"); if(btnTimerOpen) btnTimerOpen.addEventListener("click", () => { const m = document.getElementById("modal-timer"); if(m) m.classList.add("active"); });
const btnConfigTimer = document.getElementById("btn-config-timer"); if(btnConfigTimer) btnConfigTimer.addEventListener("click", () => { const c = document.getElementById("modal-config"); if(c) c.classList.remove("active"); const m = document.getElementById("modal-timer"); if(m) m.classList.add("active"); });
document.querySelectorAll(".fechar-modal-timer").forEach(btn => btn.addEventListener("click", () => { const m = document.getElementById("modal-timer"); if(m) m.classList.remove("active"); }));
document.querySelectorAll(".timer-option").forEach(item => {
    item.addEventListener("click", (e) => {
        const minutos = parseInt(e.currentTarget.getAttribute("data-time")); clearInterval(sleepTimerInterval);
        if (minutos > 0) { targetTime = new Date().getTime() + minutos * 60 * 1000; updateTimerDisplay(); if(timerDisplay) timerDisplay.classList.remove("hidden"); sleepTimerInterval = setInterval(updateTimerDisplay, 1000); alert(`A rádio desligará em ${minutos} minutos.`);
        } else { if(timerDisplay) timerDisplay.classList.add("hidden"); } 
        const m = document.getElementById("modal-timer"); if(m) m.classList.remove("active");
    });
});

function atualizarTelaDeBloqueio(radio, rdsText = null, coverUrl = null) {
    if ('mediaSession' in navigator && audio) {
        let nomeR = radio.name; if (!nomeR.toUpperCase().includes('FM') && (!radio.badge || radio.badge === 'Rádio FM')) nomeR = `${radio.name} FM`;
        
        let artworkSrc = 'https://raw.githubusercontent.com/althierestm/Radar-Radios-App/main/Icon%20RadarRadios.png?v=2';
        
        if (radio.logo && radio.logo.startsWith('http')) {
            artworkSrc = radio.logo;
        }

        if (coverUrl && coverUrl.startsWith('http')) {
            artworkSrc = coverUrl;
        }
        
        let temRDS = (rdsText && rdsText !== "Programação ao vivo" && rdsText !== "Buscando informações...");
        
        let mainTitle = temRDS ? rdsText : nomeR;
        let mainArtist = temRDS ? nomeR : `${radio.city} • ${radio.genre}`;
        let mainAlbum = temRDS ? `${radio.city} • ${radio.genre}` : "Radar Rádios";
        
        navigator.mediaSession.metadata = new MediaMetadata({ 
            title: mainTitle, 
            artist: mainArtist, 
            album: mainAlbum, 
            artwork: [
                { src: artworkSrc, sizes: '96x96', type: 'image/png' },
                { src: artworkSrc, sizes: '128x128', type: 'image/png' },
                { src: artworkSrc, sizes: '192x192', type: 'image/png' },
                { src: artworkSrc, sizes: '256x256', type: 'image/png' },
                { src: artworkSrc, sizes: '384x384', type: 'image/png' },
                { src: artworkSrc, sizes: '512x512', type: 'image/png' }
            ] 
        });
        
        navigator.mediaSession.setActionHandler('play', () => { audio.play().catch(()=>{}); if(playIcon) playIcon.className = "fa-solid fa-pause"; });
        navigator.mediaSession.setActionHandler('pause', () => { audio.pause(); stopChiado(); if(playIcon) playIcon.className = "fa-solid fa-play"; });
        navigator.mediaSession.setActionHandler('previoustrack', () => { const b = document.getElementById("btn-prev"); if(b) b.click(); });
        navigator.mediaSession.setActionHandler('nexttrack', () => { const b = document.getElementById("btn-next"); if(b) b.click(); });
    }
}

// Lógica de Temas Automática com Action Sheet
let currentThemeMode = localStorage.getItem("radar_theme_mode") || "Automático";
const themeValueDisplay = document.getElementById("theme-value-display");
const btnTheme = document.getElementById("btn-theme");

function updateThemeUI() {
    if(themeValueDisplay) themeValueDisplay.innerText = currentThemeMode;
    if (currentThemeMode === "Claro") {
        document.body.classList.add("light-theme");
    } else if (currentThemeMode === "Escuro") {
        document.body.classList.remove("light-theme");
    } else {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.remove("light-theme");
        } else {
            document.body.classList.add("light-theme");
        }
    }
}

updateThemeUI();

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    if (currentThemeMode === "Automático") updateThemeUI();
});

if (btnTheme) {
    btnTheme.addEventListener("click", () => {
        let overlay = document.getElementById("theme-overlay");
        if (!overlay) {
            overlay = document.createElement("div"); overlay.id = "theme-overlay"; overlay.className = "ios-action-sheet-overlay";
            overlay.innerHTML = `<div class="ios-action-sheet"><div class="ios-action-group" id="theme-group"></div><button class="ios-action-cancel" onclick="closeThemeSelector()">Cancelar</button></div>`;
            document.body.appendChild(overlay);
            overlay.addEventListener("click", (e) => { if(e.target === overlay) closeThemeSelector(); });
        }
        const group = overlay.querySelector("#theme-group"); if(group) group.innerHTML = '';
        const options = ["Automático", "Claro", "Escuro"];
        options.forEach(opt => {
            const btn = document.createElement("button"); btn.className = "ios-action-btn";
            if (opt === currentThemeMode) btn.style.fontWeight = "700";
            btn.innerText = opt; btn.onclick = () => { 
                currentThemeMode = opt; 
                localStorage.setItem("radar_theme_mode", opt);
                updateThemeUI();
                closeThemeSelector(); 
            };
            if(group) group.appendChild(btn);
        });
        requestAnimationFrame(() => { overlay.classList.add("active"); });
    });
}
window.closeThemeSelector = function() { const overlay = document.getElementById("theme-overlay"); if (overlay) overlay.classList.remove("active"); };

if(rdsToggle) {
    rdsToggle.checked = rdsEnabled;
    rdsToggle.addEventListener("change", (e) => {
        rdsEnabled = e.target.checked;
        localStorage.setItem("radar_rds", rdsEnabled ? "on" : "off");
        if (!rdsEnabled) {
            const rC = document.getElementById("rds-container");
            if(rC) rC.classList.add("hidden");
        } else {
            if (radios[currentIndex]) startRDS(radios[currentIndex]);
        }
    });
}

if(voiceToggle) {
    if (localStorage.getItem("radar_voice") === "on") voiceToggle.checked = true;
    voiceToggle.addEventListener("change", (e) => localStorage.setItem("radar_voice", e.target.checked ? "on" : "off"));
}

if(hapticToggle) {
    if (localStorage.getItem("radar_haptic") === "off") hapticToggle.checked = false;
    hapticToggle.addEventListener("change", (e) => localStorage.setItem("radar_haptic", e.target.checked ? "on" : "off"));
}

if(airplayBtn && audio) {
    airplayBtn.addEventListener("click", (e) => { e.stopPropagation(); if (window.WebKitPlaybackTargetAvailabilityEvent) audio.webkitShowPlaybackTargetPicker(); else if (audio.remote && audio.remote.prompt) audio.remote.prompt(); else alert("A transmissão AirPlay não é suportada neste navegador."); });
    audio.addEventListener('webkitcurrentplaybacktargetiswirelesschanged', () => { airplayBtn.classList.toggle("active", audio.webkitCurrentPlaybackTargetIsWireless); });
}

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
function playChiado() { if (!noiseToggle || !noiseToggle.checked) return; if (!audioCtx) initChiado(); if (audioCtx.state === 'suspended') audioCtx.resume(); noiseGain.gain.setTargetAtTime(0.3, audioCtx.currentTime, 0.1); }
function stopChiado() { if (noiseGain) noiseGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1); }

async function fetchRDS(radio) {
    try {
        if (!radio || !radio.rds) return;
        if (radio.rds === "local_chuva") {
            const hour = new Date().getHours(); let msg = hour >= 6 && hour < 12 ? "Bom dia, relaxe com esse barulhinho de chuva" : hour >= 12 && hour < 18 ? "Tardezinha ótima para dormir" : "Boa noite, bom descanso";
            updateRDSText(msg, null); return;
        }

        let url = radio.rds; let text = ""; let songName = ""; let coverUrl = null;

        if (url.includes("clube.fm") && url.includes("/eventos")) {
            url = url.replace("/eventos", "");
        }

        if (url.includes("clube.fm")) {
            updateRDSText("Programação ao vivo", null);
            return;
        }

        let isEventStream = url.includes("api.zeno.fm") || url.includes("/subscribe") || url.includes("/eventos");

        if (isEventStream) {
            let targetUrl = url;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000); 
            
            try {
                const response = await fetch(targetUrl, { cache: "no-store", signal: controller.signal }); 
                const reader = response.body.getReader(); 
                const decoder = new TextDecoder("utf-8");
                for (let i = 0; i < 20; i++) {
                    const { value, done } = await reader.read();
                    if (value) text += decoder.decode(value, { stream: true });
                    if (text.includes('"song"') || text.includes('"singer"') || text.includes('streamTitle')) break;
                    if (done) break;
                }
                reader.cancel().catch(()=>{});
            } catch(e) {}
            clearTimeout(timeoutId);
        } else {
            let targetUrl = url; 
            if (url.includes("hunter.fm") || url.includes("m985.com.br") || url.includes("trans99fm.com.br") || url.includes(".m3u8") || url.includes("publicradio.org") || url.includes("maringafm.com.br")) {
                const cbUrl = url + (url.includes("?") ? "&" : "?") + "cb=" + new Date().getTime();
                targetUrl = "https://api.allorigins.win/raw?url=" + encodeURIComponent(cbUrl);
            } else if (url.includes("radiomixfm.com.br")) {
                targetUrl = "https://corsproxy.io/?" + encodeURIComponent(url);
            }
            const response = await fetch(targetUrl, { cache: "no-store" }); if (!response.ok) throw new Error("Erro proxy"); text = await response.text();
        }

        if (text.includes("cue_title")) {
            const parser = new DOMParser(); const xmlDoc = parser.parseFromString(text, "text/xml"); const properties = xmlDoc.getElementsByTagName("property");
            for (let i = 0; i < properties.length; i++) { if (properties[i].getAttribute("name") === "cue_title") { songName = properties[i].textContent; break; } }
        } else if (text.includes('data:{"mount"')) {
            const lines = text.split('\n');
            for (let i = lines.length - 1; i >= 0; i--) { const line = lines[i].trim(); if (line.startsWith('data:{')) { try { const zenoData = JSON.parse(line.substring(5)); if (zenoData.streamTitle) { songName = zenoData.streamTitle; break; } } catch(e) {} } }
        } else if (text.includes("#EXTINF")) {
            const matches = [...text.matchAll(/title="([^"]+)"/g)];
            if (matches && matches.length > 0) {
                for (let i = matches.length - 1; i >= 0; i--) {
                    if (matches[i][1] && !matches[i][1].includes("YourClassical")) {
                        songName = matches[i][1]; break;
                    }
                }
                if (!songName) songName = matches[matches.length - 1][1];
            } else {
                const altMatches = [...text.matchAll(/#EXTINF:[^,]+,(.+)/g)];
                if (altMatches && altMatches.length > 0) {
                    for (let i = altMatches.length - 1; i >= 0; i--) {
                        let tmp = altMatches[i][1].trim();
                        if (tmp && !tmp.includes("http") && !tmp.includes(".aac") && !tmp.includes(".ts") && !tmp.includes("YourClassical")) {
                            songName = tmp; break;
                        }
                    }
                    if (!songName && altMatches.length > 0) songName = altMatches[altMatches.length - 1][1].trim();
                }
            }
        } else {
            try {
                let json; try { json = JSON.parse(text); } catch (err) { const lines = text.split('\n'); for (let i = lines.length - 1; i >= 0; i--) { const line = lines[i].trim(); if (line.startsWith('data:')) { try { let parsed = JSON.parse(line.substring(5).trim()); if(parsed) { json = parsed; break; } } catch (e) {} } } if (!json) throw new Error("JSON invalido"); }
                
                if (url.includes("maringafm.com.br")) {
                    if (json.title) songName = json.title;
                    if (json.artwork) coverUrl = json.artwork;
                }

                if (url.includes("glbimg.com") && json.emissoras && json.emissoras.length > 0) {
                    const hor = json.emissoras[0].horarios;
                    if (hor && hor.length > 0) {
                        if (hor[0].evento && hor[0].evento.nome) {
                            let progNome = hor[0].evento.nome;
                            let locutorNome = "";
                            if (hor[0].evento.profissionais && hor[0].evento.profissionais.length > 0) {
                                if (hor[0].evento.profissionais[0].profissional && hor[0].evento.profissionais[0].profissional.nome) {
                                    locutorNome = hor[0].evento.profissionais[0].profissional.nome;
                                }
                            }
                            songName = locutorNome ? `${locutorNome} - ${progNome}` : progNome;
                            if (hor[0].evento.foto) {
                                if (hor[0].evento.foto.foto4x3) { coverUrl = hor[0].evento.foto.foto4x3; } 
                                else if (hor[0].evento.foto.foto) { coverUrl = hor[0].evento.foto.foto; }
                            }
                        } else if (hor[0].programa && hor[0].programa.nome) {
                            songName = hor[0].programa.nome;
                            if (hor[0].programa.foto) {
                                if (hor[0].programa.foto.foto4x3) { coverUrl = hor[0].programa.foto.foto4x3; } 
                                else if (hor[0].programa.foto.foto) { coverUrl = hor[0].programa.foto.foto; }
                            }
                        }
                    }
                }
                
                if (url.includes("trans99fm.com.br") && Array.isArray(json)) {
                    const now = Math.floor(Date.now() / 1000);
                    let match = json.find(item => {
                        const s = Number(item.start);
                        const e = Number(item.end);
                        return now >= s && now < e;
                    });
                    if (!match && json.length > 0) {
                        let minDiff = Infinity;
                        json.forEach(item => {
                            const s = Number(item.start);
                            const e = Number(item.end);
                            if (now >= s && now <= e) {
                                match = item;
                            } else {
                                const diff = Math.min(Math.abs(now - s), Math.abs(now - e));
                                if (diff < minDiff && diff < 7200) {
                                    minDiff = diff;
                                    match = item;
                                }
                            }
                        });
                    }
                    if (match && match.title) {
                        songName = match.title;
                        if (match.image) coverUrl = match.image;
                    }
                }
                
                let itemData = Array.isArray(json) ? json[0] : json;
                if (!songName && itemData && itemData.TIT2) {
                    let title = itemData.TIT2;
                    let artist = itemData.TPE1 || "";
                    songName = artist ? `${artist} - ${title}` : title;
                    if (itemData.WXXX_album_art) {
                        coverUrl = itemData.WXXX_album_art;
                    }
                }
                
                if (!songName && json.t && typeof json.t === "string") { let artist = json.i || ""; songName = artist ? `${artist} - ${json.t}` : json.t; }
                if (!songName && json.programa) { let progNameStr = typeof json.programa === 'string' ? json.programa : (json.programa.nome || ""); let locutorStr = json.locutores ? (typeof json.locutores === 'string' ? json.locutores : "") : (json.locutor ? (typeof json.locutor === 'string' ? json.locutor : (json.locutor.nome || "")) : ""); if (progNameStr) songName = locutorStr ? `${locutorStr} - ${progNameStr}` : progNameStr; }
                if (!songName && json.singer && json.song && typeof json.song === "string") { songName = `${json.singer} - ${json.song}`; if (json.capa) coverUrl = json.capa; }
                if (!songName) songName = json.title || json.now_playing || (typeof json.song === "string" ? json.song : "") || json.songtitle || "";
                if (!songName && typeof json.program === "string") songName = json.program;
                if (!songName && json.infos) { if (json.infos.EventType !== "Commercials") { let title = json.infos.Title || (json.infos.MusicInfos && json.infos.MusicInfos.MusicTitle); let artist = json.infos.Subtitle || (json.infos.MusicInfos && json.infos.MusicInfos.PostSubTitle); if (title) songName = artist ? `${artist} - ${title}` : title; } } else if (!songName && json.MusicTitle) { songName = json.PostSubTitle ? `${json.PostSubTitle} - ${json.MusicTitle}` : json.MusicTitle; }
                
                let metroData = Array.isArray(json) ? json[0] : json;
                if (!songName && metroData && metroData.song && typeof metroData.song === 'object' && metroData.song.name) { let trackName = metroData.song.name; let mainArtist = (metroData.artist && metroData.artist.name) ? metroData.artist.name : ""; let featArtist = (metroData.feat && metroData.feat.name) ? metroData.feat.name : ""; let fullArtist = mainArtist; if (featArtist) fullArtist += `, ${featArtist}`; if (trackName) songName = fullArtist ? `${fullArtist} - ${trackName}` : trackName; }
                
                if (!songName && url.includes("api.hunter.fm")) {
                    const match = radio.url.match(/\.fm\/([^\/]+)/);
                    const slug = match ? match[1] : "";
                    if (slug && Array.isArray(json)) {
                        for (let i = 0; i < json.length; i++) {
                            if (json[i].url === slug && json[i].live && json[i].live.now) {
                                let musica = json[i].live.now.name || ""; let cantor = "";
                                if (Array.isArray(json[i].live.now.singers)) { cantor = json[i].live.now.singers.join(", "); }
                                if (musica) { songName = cantor ? `${cantor} - ${musica}` : musica; }
                                break;
                            }
                        }
                    }
                }

                if (typeof json === 'object' && json !== null) { if (!coverUrl) coverUrl = json.cover || json.image || json.artworkUrl || json.thumb || json.artwork || null; if (!coverUrl && json.data && json.data.cover) coverUrl = json.data.cover; if (!coverUrl && metroData && metroData.song && metroData.song.cover) coverUrl = metroData.song.cover; }
            } catch(err) { if (text && text.length > 2 && text.length < 150 && !text.includes("<html")) songName = text.replace(/<[^>]*>?/gm, '').trim(); }
        }
        if (songName && typeof songName === "string") songName = songName.replace(/&#038;/g, "&").replace(/&amp;/g, "&").replace(/&#039;/g, "'").replace(/&quot;/g, '"');
        if (songName && typeof songName === "string" && songName.trim() !== "") updateRDSText(songName, coverUrl); else updateRDSText("Programação ao vivo", null);
    } catch (e) { updateRDSText("Programação ao vivo", null); }
}

function updateRDSText(text, coverUrl = null) {
    const rdsText = document.getElementById("rds-text"); const rdsScroller = document.getElementById("rds-scroller");
    if (rdsText && rdsScroller && rdsText.innerText !== text) {
        rdsText.innerText = text; rdsScroller.classList.remove("marquee"); void rdsScroller.offsetWidth; 
        setTimeout(() => { 
            if (rdsScroller.scrollWidth > rdsScroller.parentElement.clientWidth) {
                rdsScroller.classList.add("marquee"); 
            }
        }, 150);
        if (typeof radios !== "undefined" && radios[currentIndex]) atualizarTelaDeBloqueio(radios[currentIndex], text, coverUrl);
    }
}

function startRDS(radio) {
    clearInterval(rdsInterval); const rdsContainer = document.getElementById("rds-container"); const rdsScroller = document.getElementById("rds-scroller"); const rdsText = document.getElementById("rds-text");
    if (!radio.rds || !rdsEnabled) { if(rdsContainer) rdsContainer.classList.add("hidden"); if (typeof atualizarTelaDeBloqueio === "function") atualizarTelaDeBloqueio(radio, null, null); return; }
    if(rdsContainer) rdsContainer.classList.remove("hidden"); if(rdsText) rdsText.innerText = "Buscando informações..."; if(rdsScroller) rdsScroller.classList.remove("marquee");
    fetchRDS(radio); rdsInterval = setInterval(() => fetchRDS(radio), 10000);
}

if(audio) {
    audio.addEventListener('playing', () => {
        stopChiado(); const radio = radios[currentIndex]; 
        if(statusConexao) statusConexao.innerText = `${radio.city} • ${radio.genre}`; 
        if(playIcon) playIcon.className = "fa-solid fa-pause";
        if (badgePais) badgePais.innerText = radio.badge || "Rádio FM";
        atualizarTelaDeBloqueio(radio); startRDS(radio);
        
        updatePresence('listening', radio.id);

        if (!sessionCounted) {
            clearTimeout(playCountTimer);
            playCountTimer = setTimeout(() => {
                if(!audio.paused && db) {
                    db.collection('radios').doc(radio.id).set({
                        playCount: firebase.firestore.FieldValue.increment(1)
                    }, { merge: true }).catch(()=>{});
                    sessionCounted = true;
                }
            }, 10000); 
        }

        currentStationTime = 0; currentStationTracked = false; clearInterval(profileTimer);
        profileTimer = setInterval(() => {
            currentStationTime += 5000; userStats.listeningTimeMS += 5000;
            if (currentStationTime >= 30000 && !currentStationTracked) {
                userStats.stationsListened[radio.name] = (userStats.stationsListened[radio.name] || 0) + 1; userStats.genresListened[radio.genre] = (userStats.genresListened[radio.genre] || 0) + 1; userStats.freqsListened[radio.freq] = (userStats.freqsListened[radio.freq] || 0) + 1;
                let state = radio.city.split("-")[1]?.trim() || "Web"; if (state.toLowerCase() === "ba") state = "Bahia"; if (state.toLowerCase() === "sp") state = "São Paulo"; if (state.toLowerCase() === "mg") state = "Minas Gerais"; if (state.toLowerCase() === "df") state = "Distrito Federal";
                userStats.statesListened[state] = (userStats.statesListened[state] || 0) + 1; currentStationTracked = true;
                localStorage.setItem("radar_stats", JSON.stringify(userStats));
                
                if (currentUser && db) {
                    const monthKey = getCurrentMonthKey();
                    db.collection("users").doc(currentUser.uid).collection("history").doc(monthKey).set({
                        stats: userStats, lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                }
                const mdlC = document.getElementById('modal-config');
                if(mdlC && mdlC.classList.contains('active')) renderProfile();
            } else { localStorage.setItem("radar_stats", JSON.stringify(userStats)); }
        }, 5000);
    });

    audio.addEventListener('pause', () => { 
        clearInterval(profileTimer); 
        clearInterval(rdsInterval); 
        clearTimeout(playCountTimer);
        updatePresence('online');
    });
}

function buildDial() {
    if(!dialStrip) return;
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
    if(!dialStrip) return;
    const totalTracos = (parseFloat(freqStr) - minFreq) / 0.1; dialStrip.style.transform = `translateX(${-(totalTracos * tickWidth)}px)`;
}

function getNextRadioIndex(direction) {
    if(!freqValor) return 0;
    const currentFreq = parseFloat(freqValor.innerText);
    if (direction === 1) { const nextIndex = radios.findIndex(r => parseFloat(r.freq) > currentFreq); return nextIndex !== -1 ? nextIndex : 0; 
    } else { let prevIndex = -1; for (let i = radios.length - 1; i >= 0; i--) { if (parseFloat(radios[i].freq) < currentFreq) { prevIndex = i; break; } } return prevIndex !== -1 ? prevIndex : (radios.length - 1); }
}

if(btnMultiRadio) {
    btnMultiRadio.addEventListener("click", () => {
        const currentFreq = parseFloat(radios[currentIndex].freq); const duplicates = radios.filter(r => parseFloat(r.freq) === currentFreq);
        const title = document.getElementById("multi-modal-title"); if(title) title.innerText = `Sintonia ${currentFreq.toFixed(1)} MHz`;
        const list = document.getElementById("multi-station-list"); if(!list) return;
        list.innerHTML = "";
        duplicates.forEach(r => {
            const li = document.createElement("li"); li.className = "station-item"; li.innerHTML = `<div><strong>${r.name}</strong><br><small style="color:var(--text-muted)">${r.city} • ${r.genre}</small></div>`;
            li.addEventListener("click", () => { currentIndex = radios.findIndex(rad => rad.id === r.id); carregarRadio(currentIndex); const m = document.getElementById("modal-multi"); if(m) m.classList.remove("active"); tocarComVoz(radios[currentIndex]); btnMultiRadio.classList.remove('pulse-active'); });
            list.appendChild(li);
        });
        const m = document.getElementById("modal-multi"); if(m) m.classList.add("active");
    });
}
document.querySelectorAll(".fechar-modal-multi").forEach(btn => btn.addEventListener("click", () => { const m = document.getElementById("modal-multi"); if(m) m.classList.remove("active"); }));

let isDragging = false; let startX = 0; let initialTranslateX = 0; let lastVibratedFreq = "";
if(dialContainer && dialStrip) {
    dialContainer.addEventListener('pointerdown', (e) => {
        if(radios.length === 0) return;
        isDragging = true; startX = e.clientX; 
        const style = window.getComputedStyle(dialStrip).transform;
        if(style !== "none") { initialTranslateX = new WebKitCSSMatrix(style).m41; } else { initialTranslateX = 0; }
        dialStrip.style.transition = 'none'; if(audio) audio.pause(); playChiado(); if(playIcon) playIcon.className = "fa-solid fa-play";
        if(statusConexao) statusConexao.innerText = "Sintonizando..."; if(btnMultiRadio) btnMultiRadio.classList.add('hidden'); 
        const rC = document.getElementById("rds-container"); if(rC) rC.classList.add("hidden");
    });
    window.addEventListener('pointermove', (e) => {
        if (!isDragging) return; let novoTranslateX = initialTranslateX + (e.clientX - startX); const minTranslate = -((maxFreq - minFreq) / 0.1) * tickWidth;
        if (novoTranslateX > 0) novoTranslateX = 0; if (novoTranslateX < minTranslate) novoTranslateX = minTranslate;
        dialStrip.style.transform = `translateX(${novoTranslateX}px)`; const freqAtual = minFreq + (Math.abs(novoTranslateX) / tickWidth) * 0.1; 
        if(freqValor) freqValor.innerText = freqAtual.toFixed(1);
        if (freqValor && freqValor.innerText !== lastVibratedFreq) { lastVibratedFreq = freqValor.innerText; if (hapticToggle && hapticToggle.checked && navigator.vibrate) navigator.vibrate(10); }
        if(estacaoNome) estacaoNome.innerText = "Buscando sinal..."; if (noiseFilter) noiseFilter.frequency.value = 800 + Math.abs(Math.sin(novoTranslateX * 0.1)) * 1500;
    });
    window.addEventListener('pointerup', () => {
        if (!isDragging) return; isDragging = false; dialStrip.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        if(!freqValor) return;
        const freqSintonizada = parseFloat(freqValor.innerText); atualizarPosicaoDial(freqSintonizada);
        const encontradas = radios.filter(r => parseFloat(r.freq) === freqSintonizada);
        if (encontradas.length > 0) { currentIndex = radios.findIndex(r => r.id === encontradas[0].id); carregarRadio(currentIndex); tocarComVoz(radios[currentIndex]);
        } else { if(estacaoNome) estacaoNome.innerText = ""; if(statusConexao) statusConexao.innerText = ""; if(favIcon) favIcon.classList.replace("fa-solid", "fa-regular"); if(btnMultiRadio) btnMultiRadio.classList.add('hidden'); if (noiseFilter) noiseFilter.frequency.value = 1000; }
    });
}

function carregarRadio(index) {
    if (radios.length === 0) return;
    isRadioLoaded = true;
    sessionCounted = false; 
    clearTimeout(playCountTimer);
    
    const radio = radios[index]; if(freqValor) freqValor.innerText = radio.freq; 
    let nomeBonito = radio.name; if (!nomeBonito.toUpperCase().includes('FM') && (!radio.badge || radio.badge === 'Rádio FM')) nomeBonito = `${radio.name} FM`;
    if(estacaoNome) estacaoNome.innerText = nomeBonito; if(statusConexao) statusConexao.innerText = "Sintonizando..."; if (badgePais) badgePais.innerText = radio.badge || "Rádio FM";
    clearInterval(rdsInterval); const rC = document.getElementById("rds-container"); if(rC) rC.classList.add("hidden");
    
    if(audio) { audio.src = radio.url; audio.loop = (radio.rds === "local_chuva"); audio.play().catch(()=>{}); }
    atualizarPosicaoDial(radio.freq); verificarFavorito(radio.id); renderizarFavoritas(); atualizarTelaDeBloqueio(radio);

    const arrayConflitos = radios.filter(r => parseFloat(r.freq) === parseFloat(radio.freq));
    if (arrayConflitos.length > 1) { if(btnMultiRadio) { btnMultiRadio.classList.remove('hidden'); btnMultiRadio.classList.add('pulse-active'); }
    } else { if(btnMultiRadio) { btnMultiRadio.classList.add('hidden'); btnMultiRadio.classList.remove('pulse-active'); } }
}

function verificarFavorito(id) {
    if(!favIcon) return;
    if (favoritas.includes(id)) { favIcon.classList.replace("fa-regular", "fa-solid"); } else { favIcon.classList.replace("fa-solid", "fa-regular"); }
}

if(playBtn) {
    playBtn.addEventListener("click", () => {
        if(!audio) return;
        if (audio.paused) { if (estacaoNome && estacaoNome.innerText !== "Sem Sinal" && estacaoNome.innerText !== "") { if(statusConexao) statusConexao.innerText = "Sintonizando..."; audio.play().catch(()=>{}); }
        } else { audio.pause(); stopChiado(); if(statusConexao) statusConexao.innerText = "PAUSADO"; if(playIcon) playIcon.className = "fa-solid fa-play"; }
    });
}

const btnNext = document.getElementById("btn-next"); if(btnNext) btnNext.addEventListener("click", () => { if(radios.length === 0) return; currentIndex = getNextRadioIndex(1); carregarRadio(currentIndex); if (audio && (!audio.paused || (playIcon && playIcon.classList.contains("fa-pause")))) tocarComVoz(radios[currentIndex]); });
const btnPrev = document.getElementById("btn-prev"); if(btnPrev) btnPrev.addEventListener("click", () => { if(radios.length === 0) return; currentIndex = getNextRadioIndex(-1); carregarRadio(currentIndex); if (audio && (!audio.paused || (playIcon && playIcon.classList.contains("fa-pause")))) tocarComVoz(radios[currentIndex]); });

const btnFav = document.getElementById("btn-fav");
if(btnFav) {
    btnFav.addEventListener("click", () => {
        if (!estacaoNome || estacaoNome.innerText === "Sem Sinal" || estacaoNome.innerText === "" || radios.length === 0) return; 
        const radioAtual = radios[currentIndex];
        if (favoritas.includes(radioAtual.id)) { favoritas = favoritas.filter(id => id !== radioAtual.id); } else { favoritas.push(radioAtual.id); }
        localStorage.setItem("radar_favoritas", JSON.stringify(favoritas)); verificarFavorito(radioAtual.id); renderizarFavoritas();
        if (currentUser && db) { db.collection("users").doc(currentUser.uid).set({ favoritas: favoritas }, { merge: true }); }
    });
}

function renderizarFavoritas() {
    const listaFav = document.getElementById("favoritas-list"); if(!listaFav) return;
    listaFav.innerHTML = "";
    if (favoritas.length === 0) { listaFav.innerHTML = "<p style='text-align:center; padding: 20px; color: var(--text-muted); font-size: 14px;'>Nenhuma rádio salva.</p>"; return; }
    allRadios.filter(r => favoritas.includes(r.id)).forEach(r => {
        const li = document.createElement("li"); li.className = "station-item";
        li.innerHTML = `<div><strong>${r.name}</strong> (${r.freq} MHz)<br><small style="color:var(--text-muted)">${r.city} • ${r.badge || "Rádio FM"}</small></div>`;
        li.addEventListener("click", () => { const m = document.getElementById("modal-config"); if(m) m.classList.remove("active"); loadRadioById(r.id); tocarComVoz(radios[currentIndex]); });
        listaFav.appendChild(li);
    });
}

document.querySelectorAll(".fechar-modal").forEach(btn => btn.addEventListener("click", () => { const m = document.getElementById("modal-estacoes"); if(m) m.classList.remove("active"); }));
document.querySelectorAll(".fechar-config").forEach(btn => btn.addEventListener("click", () => { const m = document.getElementById("modal-config"); if(m) m.classList.remove("active"); }));

const btnConfig = document.getElementById("btn-config");
if(btnConfig) {
    btnConfig.addEventListener("click", () => { 
        renderizarFavoritas(); renderProfile(); const m = document.getElementById("modal-config"); if(m) m.classList.add("active"); 
    });
}

const btnPrivacidade = document.getElementById("btn-privacidade");
if (btnPrivacidade) {
    btnPrivacidade.addEventListener("click", () => { window.open("https://radar-radios-app.vercel.app/Pol%C3%ADtica%20de%20Privacidade.html", "_blank"); });
}

const btnAlexa = document.getElementById("btn-alexa");
if (btnAlexa) {
    btnAlexa.addEventListener("click", () => { window.open("https://www.amazon.com.br/Althieres-Parillare-Dias-Radar-R%C3%A1dios/dp/B0HKZC442H/ref=sr_1_2?__mk_pt_BR=%C3%85M%C3%85%C5%BD%C3%95%C3%91&crid=U1LGG1NA3U4S&dib=eyJ2IjoiMSJ9.o37KO67omAjsqZ1UtDKSgA.6sotiDdgPRv5Wai2SfEbUBJDjocC0D3voW5mkhE3l48&dib_tag=se&keywords=radar+radio&qid=1791034863&s=alexa-skills&sprefix=radar+radios%2Calexa-skills%2C235&sr=1-2", "_blank"); });
}
