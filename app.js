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
let splashDismissed = false;

let profileTimer = null;
let currentStationTime = 0;
let currentStationTracked = false;
let audioCtx, noiseNode, noiseGain, noiseFilter;
let isDragging = false;
let startX = 0;
let initialTranslateX = 0;
let lastVibratedFreq = "";

let userStats;
try {
    userStats = JSON.parse(localStorage.getItem("radar_stats"));
    if (!userStats || typeof userStats !== 'object') throw new Error();
    if (userStats.currentMonth !== new Date().getMonth()) throw new Error();
} catch(e) {
    userStats = { listeningTimeMS: 0, currentMonth: new Date().getMonth(), stationsListened: {}, genresListened: {}, statesListened: {}, freqsListened: {} };
}

let favoritas;
try {
    favoritas = JSON.parse(localStorage.getItem("radar_favoritas")) || [];
    if (!Array.isArray(favoritas)) favoritas = [];
} catch(e) {
    favoritas = [];
}

let userFeedbackHistory = {};
try {
    userFeedbackHistory = JSON.parse(localStorage.getItem("radar_feedback_history")) || {};
    if (!userFeedbackHistory || typeof userFeedbackHistory !== 'object') userFeedbackHistory = {};
} catch(e) {
    userFeedbackHistory = {};
}

let sleepTimerInterval = null; 
let targetTime = null; 
let wasPlayingBeforeBackground = false; 
let rdsInterval = null;
let minFreq = 70.0; 
let maxFreq = 110.0; 
let freqStep = 0.1; 
const tickWidth = 14; 
let playCountTimer = null; 
let rdsEnabled = localStorage.getItem("radar_rds") !== "off";

let currentShazamRef = null;
let currentShazamListener = null;
let shazamWatchdog = null;
let shazamData = null;
let fallbackRdsText = null;
let fallbackRdsCover = null;
let commercialToggleInterval = null;
let isShowingComercial = true;
let rdsSessionId = 0;
let lastMediaSessionTitle = "";
let lastMediaSessionArtist = "";
let lastMediaSessionAlbum = "";
let lastMediaSessionArtwork = "";

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

const splashScreen = document.getElementById("splash-screen");
const btnEntrar = document.getElementById("btn-entrar");

const tourOverlay = document.getElementById("tour-overlay");
const tourSpotlight = document.getElementById("tour-spotlight");
const tourTooltip = document.getElementById("tour-tooltip");
const tourStepCounter = document.getElementById("tour-step-counter");
const tourTitle = document.getElementById("tour-title");
const tourDesc = document.getElementById("tour-desc");
const tourNextBtn = document.getElementById("tour-next-btn");
const tourSkipBtn = document.getElementById("tour-skip-btn");

let currentTourStep = 0;
const tourSteps = [
    {
        target: "#dial-container",
        title: "Sintonizador Analógico",
        desc: "Deslize a faixa de frequência para os lados para sintonizar as emissoras em tempo real."
    },
    {
        target: "#area-busca-freq",
        title: "Busca Rápida",
        desc: "Toque diretamente sobre os números da frequência ou deslize para baixo para pesquisar qualquer rádio, cidade ou estilo."
    },
    {
        target: "#badge-pais",
        title: "FM, AM, SW e Escuta Aérea",
        desc: "Toque neste botão superior para alternar entre Rádio FM, Rádio AM, Onda Curta (SW) e Escuta Aérea."
    },
    {
        target: "#btn-fav",
        title: "Suas Favoritas",
        desc: "Guarde suas estações preferidas no coração para acessá-las rapidamente quando quiser."
    },
    {
        target: "#btn-timer-open",
        title: "Temporizador de Sono",
        desc: "Programe o desligamento automático da rádio para dormir ouvindo sua programação favorita."
    }
];

function startOnboardingTour(force = false) {
    if (!force && localStorage.getItem("radar_onboarding_v1") === "done") return;
    if (!tourOverlay || !tourSpotlight || !tourTooltip) return;
    currentTourStep = 0;
    tourOverlay.classList.remove("hidden");
    renderTourStep();
}

function renderTourStep() {
    const step = tourSteps[currentTourStep];
    if (!step) {
        finishOnboardingTour();
        return;
    }
    const el = document.querySelector(step.target);
    if (!el) {
        finishOnboardingTour();
        return;
    }
    const rect = el.getBoundingClientRect();
    const pad = 8;
    tourSpotlight.style.top = `${rect.top - pad}px`;
    tourSpotlight.style.left = `${rect.left - pad}px`;
    tourSpotlight.style.width = `${rect.width + pad * 2}px`;
    tourSpotlight.style.height = `${rect.height + pad * 2}px`;

    if (tourStepCounter) tourStepCounter.innerText = `${currentTourStep + 1} de ${tourSteps.length}`;
    if (tourTitle) tourTitle.innerText = step.title;
    if (tourDesc) tourDesc.innerText = step.desc;
    if (tourNextBtn) tourNextBtn.innerText = (currentTourStep === tourSteps.length - 1) ? "Começar" : "Próximo";

    const spaceBelow = window.innerHeight - (rect.bottom + pad);
    if (spaceBelow > 190) {
        tourTooltip.style.top = `${rect.bottom + pad + 16}px`;
        tourTooltip.style.bottom = "auto";
    } else {
        tourTooltip.style.top = "auto";
        tourTooltip.style.bottom = `${window.innerHeight - rect.top + pad + 16}px`;
    }
}

function finishOnboardingTour() {
    localStorage.setItem("radar_onboarding_v1", "done");
    if (tourOverlay) tourOverlay.classList.add("hidden");
}

if (tourNextBtn) {
    tourNextBtn.addEventListener("click", () => {
        currentTourStep++;
        if (currentTourStep >= tourSteps.length) {
            finishOnboardingTour();
        } else {
            renderTourStep();
        }
    });
}

if (tourSkipBtn) {
    tourSkipBtn.addEventListener("click", finishOnboardingTour);
}

window.addEventListener("resize", () => {
    if (tourOverlay && !tourOverlay.classList.contains("hidden")) {
        renderTourStep();
    }
});

const btnTourRestart = document.getElementById("btn-tour-restart");
if (btnTourRestart) {
    btnTourRestart.addEventListener("click", () => {
        const c = document.getElementById("modal-config");
        if (c) c.classList.remove("active");
        setTimeout(() => startOnboardingTour(true), 300);
    });
}

function entrarNoAplicativo() {
    splashDismissed = true;
    if (splashScreen) splashScreen.classList.add("hidden");
    try {
        initChiado();
        playChiado();
    } catch (e) {}
    if (radios.length > 0 && audio) {
        audio.play().catch(() => {});
    }
    setTimeout(() => startOnboardingTour(false), 600);
}

if (btnEntrar) {
    btnEntrar.addEventListener("click", entrarNoAplicativo);
}

function generateAnonUid() { return 'anon_' + Math.random().toString(36).substr(2, 9); }
function getDeviceUid() {
    let uid = localStorage.getItem('radar_device_uid');
    if(!uid) { uid = generateAnonUid(); localStorage.setItem('radar_device_uid', uid); }
    return uid;
}

function updatePresence(status, radioId = null) {
    if(!rtdb) return;
    try {
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
    } catch (e) {}
}

function logVisit() {
    if(!db) return;
    try {
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
    } catch (e) {}
}

function initOfflineFirst() {
    try {
        const cachedRadios = localStorage.getItem("radar_radios_cache");
        if (cachedRadios) {
            const parsed = JSON.parse(cachedRadios);
            if (Array.isArray(parsed)) {
                allRadios = parsed
                    .filter(r => r && r.name && r.freq !== undefined)
                    .sort((a, b) => parseRadioFreq(a.freq, a.badge) - parseRadioFreq(b.freq, b.badge));
                radios = allRadios.filter(r => (r.badge || "Rádio FM") === currentFilterMode);
            }
        }
    } catch(e) {}
    
    try {
        buildDial();
        const indexIni = radios.findIndex(r => r.id === "radar-fm");
        currentIndex = indexIni !== -1 ? indexIni : 0;
        if (radios.length > 0) carregarRadio(currentIndex);
    } catch(e) {}
    
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
                
                const uniqueRadios = []; 
                const seenNames = new Set();
                fetchedRadios.forEach(r => {
                    if (!r || !r.name || r.freq === undefined) return;
                    const normName = String(r.name).trim().toLowerCase();
                    if (!seenNames.has(normName)) { 
                        seenNames.add(normName); 
                        uniqueRadios.push(r); 
                    }
                });
                
                allRadios = uniqueRadios.sort((a, b) => parseRadioFreq(a.freq, a.badge) - parseRadioFreq(b.freq, b.badge));
                radios = allRadios.filter(r => (r.badge || "Rádio FM") === currentFilterMode);
                buildDial();
                
                if (radios.length > 0 && !isRadioLoaded) {
                    const idx = radios.findIndex(r => r.id === "radar-fm");
                    currentIndex = idx !== -1 ? idx : 0;
                    carregarRadio(currentIndex);
                }

                try {
                    localStorage.setItem("radar_radios_cache", JSON.stringify(uniqueRadios));
                } catch(e){}
            }
        } catch (e) {
            console.warn("Erro ao sincronizar rádios:", e);
        }
    }
}

function mergeStatsObjects(localS, remoteS) {
    if (!remoteS || typeof remoteS !== 'object') return localS;
    if (!localS || typeof localS !== 'object') return remoteS;

    const merged = {
        currentMonth: new Date().getMonth(),
        listeningTimeMS: Math.max(Number(localS.listeningTimeMS || 0), Number(remoteS.listeningTimeMS || 0)),
        stationsListened: { ...(remoteS.stationsListened || {}) },
        genresListened: { ...(remoteS.genresListened || {}) },
        statesListened: { ...(remoteS.statesListened || {}) },
        freqsListened: { ...(remoteS.freqsListened || {}) }
    };

    const mergeMap = (targetMap, localMap) => {
        Object.entries(localMap || {}).forEach(([k, v]) => {
            targetMap[k] = Math.max(Number(targetMap[k] || 0), Number(v || 0));
        });
    };

    mergeMap(merged.stationsListened, localS.stationsListened);
    mergeMap(merged.genresListened, localS.genresListened);
    mergeMap(merged.statesListened, localS.statesListened);
    mergeMap(merged.freqsListened, localS.freqsListened);

    return merged;
}

function syncUserStatsToCloud() {
    if (!currentUser || !db) return;
    const monthKey = getCurrentMonthKey();
    db.collection("users").doc(currentUser.uid).collection("history").doc(monthKey).set({
        stats: userStats,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).catch(()=>{});
    db.collection("users").doc(currentUser.uid).set({
        currentMonthKey: monthKey,
        currentStats: userStats,
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    }, { merge: true }).catch(()=>{});
}

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
                    if (doc.exists) {
                        const data = doc.data() || {};
                        if (Array.isArray(data.favoritas)) {
                            favoritas = [...new Set([...favoritas, ...data.favoritas])];
                            localStorage.setItem("radar_favoritas", JSON.stringify(favoritas));
                            if (radios[currentIndex]) verificarFavorito(radios[currentIndex].id);
                            renderizarFavoritas();
                        }
                        if (data.currentMonthKey === getCurrentMonthKey() && data.currentStats) {
                            userStats = mergeStatsObjects(userStats, data.currentStats);
                            localStorage.setItem("radar_stats", JSON.stringify(userStats));
                            renderProfile();
                        }
                        if (data.feedbackHistory && typeof data.feedbackHistory === 'object') {
                            Object.entries(data.feedbackHistory).forEach(([rId, remoteRec]) => {
                                if (!remoteRec || typeof remoteRec !== 'object') return;
                                const localRec = userFeedbackHistory[rId] || {};
                                userFeedbackHistory[rId] = {
                                    rated: Boolean(localRec.rated || remoteRec.rated),
                                    lastCheckAt: Math.max(Number(localRec.lastCheckAt || 0), Number(remoteRec.lastCheckAt || 0)),
                                    lastInteractedAt: Math.max(Number(localRec.lastInteractedAt || 0), Number(remoteRec.lastInteractedAt || 0))
                                };
                            });
                            localStorage.setItem("radar_feedback_history", JSON.stringify(userFeedbackHistory));
                        }
                    }
                    const mergePayload = {};
                    if (favoritas.length > 0) mergePayload.favoritas = favoritas;
                    if (Object.keys(userFeedbackHistory).length > 0) mergePayload.feedbackHistory = userFeedbackHistory;
                    if (Object.keys(mergePayload).length > 0) {
                        db.collection("users").doc(user.uid).set(mergePayload, { merge: true }).catch(()=>{});
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
        
        const currentKey = getCurrentMonthKey();
        const pastKeys = [];

        snapshot.forEach(doc => {
            const key = doc.id;
            const docStats = doc.data().stats;
            remoteHistory[key] = docStats;
            if(key !== currentKey) {
                pastKeys.push(key);
            } else if (docStats) {
                remoteHistory['current'] = docStats;
                userStats = mergeStatsObjects(userStats, docStats);
                localStorage.setItem("radar_stats", JSON.stringify(userStats));
            }
        });

        pastKeys.sort().reverse().forEach(key => {
            const opt = document.createElement("option");
            opt.value = key;
            opt.innerText = formatMonthKey(key);
            if(select) select.appendChild(opt);
        });

        if (userStats.listeningTimeMS > 0 || Object.keys(userStats.stationsListened || {}).length > 0) {
            syncUserStatsToCloud();
        }

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
    if(typeof event !== 'undefined' && event && event.currentTarget) event.currentTarget.classList.add('active');
    if(tabId === 'tab-config-perfil') renderProfile();
};

if (badgePais) {
    badgePais.style.cursor = "pointer"; badgePais.title = "Escolher Categoria";
    badgePais.addEventListener("click", () => { openCategorySelector(); });
}

function isSWCategory(catName) {
    return catName === "Onda Curta (SW)" || catName === "Onda Curta (OC/SW)" || catName === "Rádio SW" || catName === "Rádio OC";
}

function isAMCategory(catName) {
    return catName === "Rádio AM";
}

function matchesCategory(radioBadge, filterMode) {
    const b = radioBadge || "Rádio FM";
    if (isSWCategory(filterMode)) return isSWCategory(b);
    return b === filterMode;
}

function getCategoryBadgeLabel(catName) {
    if (isSWCategory(catName)) return "Rádio SW";
    return catName || "Rádio FM";
}

function getCategorySelectorLabel(catName) {
    if (isSWCategory(catName)) return "Onda Curta (OC/SW)";
    return catName || "Rádio FM";
}

function getFreqUnit(catName) {
    return (isAMCategory(catName) || isSWCategory(catName)) ? "kHz" : "MHz";
}

function parseRadioFreq(freqStr, catName = currentFilterMode) {
    let s = String(freqStr || "").trim().replace(',', '.');
    if (isSWCategory(catName)) {
        if (/^\d{1,2}\.\d{3}$/.test(s)) {
            return parseFloat(s.replace('.', ''));
        }
        let val = parseFloat(s);
        if (!isNaN(val) && val > 0 && val < 100) {
            return Math.round(val * 1000);
        }
        return val;
    }
    if (isAMCategory(catName)) {
        if (/^\d\.\d{3}$/.test(s)) {
            return parseFloat(s.replace('.', ''));
        }
    }
    return parseFloat(s);
}

function formatFreqDisplay(freqVal, catName = currentFilterMode) {
    let num = typeof freqVal === 'number' ? freqVal : parseRadioFreq(freqVal, catName);
    if (isNaN(num)) return String(freqVal || "");
    if (isSWCategory(catName)) {
        let khz = Math.round(num);
        return khz.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    }
    if (isAMCategory(catName)) {
        return (freqStep >= 1) ? Math.round(num).toString() : num.toFixed(1);
    }
    return (freqStep >= 1) ? Math.round(num).toString() : num.toFixed(1);
}

function adjustFreqFontSize(textStr) {
    if (!freqValor) return;
    const len = String(textStr || "").length;
    if (len >= 6) {
        freqValor.style.fontSize = "78px";
    } else if (len === 5) {
        freqValor.style.fontSize = "90px";
    } else {
        freqValor.style.fontSize = "";
    }
}

function setFreqValorText(textStr) {
    if (!freqValor) return;
    freqValor.innerText = textStr;
    adjustFreqFontSize(textStr);
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
    const defaultBadges = ["Rádio FM", "Rádio AM", "Onda Curta (SW)", "Escuta Aérea"];
    const customBadges = allRadios.map(r => r.badge || "Rádio FM").filter(b => !isSWCategory(b));
    const uniqueBadges = [...new Set([...defaultBadges, ...customBadges])];
    uniqueBadges.forEach(badge => {
        const btn = document.createElement("button"); btn.className = "ios-action-btn";
        const isCurrent = matchesCategory(badge, currentFilterMode);
        if (isCurrent) btn.style.fontWeight = "700";
        btn.innerText = getCategorySelectorLabel(badge);
        btn.onclick = () => { applyCategory(badge); closeCategorySelector(); };
        if(group) group.appendChild(btn);
    });
    requestAnimationFrame(() => { overlay.classList.add("active"); });
}
window.closeCategorySelector = function() { const overlay = document.getElementById("category-overlay"); if (overlay) overlay.classList.remove("active"); };

function updateFreqUnitDisplay(catName) {
    const unitEl = document.querySelector(".frequencia-principal small");
    if (unitEl) unitEl.innerText = getFreqUnit(catName);
}

function configureCategoryBounds(catName) {
    if (catName === "Rádio FM") {
        minFreq = 70.0; maxFreq = 110.0; freqStep = 0.1;
    } else if (isAMCategory(catName)) {
        let freqs = radios.map(r => parseRadioFreq(r.freq, catName)).filter(f => !isNaN(f));
        let usesDecimal = freqs.length > 0 && freqs.every(f => f < 100);
        if (usesDecimal) {
            minFreq = 5.2; maxFreq = 17.1; freqStep = 0.1;
        } else {
            minFreq = 520; maxFreq = 1710; freqStep = 10;
        }
    } else if (isSWCategory(catName)) {
        let freqs = radios.map(r => parseRadioFreq(r.freq, catName)).filter(f => !isNaN(f));
        if (freqs.length > 0) {
            let minR = Math.floor(Math.min(...freqs, 4900) / 100) * 100 - 100;
            let maxR = Math.ceil(Math.max(...freqs, 16000) / 100) * 100 + 100;
            minFreq = Math.max(2300, minR);
            maxFreq = Math.min(26100, maxR);
        } else {
            minFreq = 4900; maxFreq = 16000;
        }
        freqStep = 5;
    } else if (catName === "Escuta Aérea") {
        minFreq = 118.0; maxFreq = 128.0; freqStep = 0.1;
    } else {
        let freqs = radios.map(r => parseRadioFreq(r.freq, catName)).filter(f => !isNaN(f));
        if (freqs.length > 0) {
            minFreq = Math.floor(Math.min(...freqs)) - 2;
            maxFreq = Math.ceil(Math.max(...freqs)) + 2;
        } else {
            minFreq = 70.0; maxFreq = 110.0;
        }
        freqStep = 0.1;
    }
    updateFreqUnitDisplay(catName);
}

function applyCategory(catName) {
    if (matchesCategory(catName, currentFilterMode)) return; 
    currentFilterMode = catName; radios = allRadios.filter(r => matchesCategory(r.badge, catName));
    if (badgePais) badgePais.innerText = getCategoryBadgeLabel(catName);
    configureCategoryBounds(catName);
    buildDial();
    if (catName === "Rádio FM") { let radarIndex = radios.findIndex(r => r.id === "radar-fm"); currentIndex = radarIndex !== -1 ? radarIndex : 0; } else { currentIndex = 0; }
    if (radios.length > 0) {
        carregarRadio(currentIndex); 
        tocarComVoz(radios[currentIndex]);
    } else {
        setFreqValorText(formatFreqDisplay(minFreq, catName));
        if (estacaoNome) estacaoNome.innerText = "Nenhuma estação";
        if (statusConexao) statusConexao.innerText = getCategorySelectorLabel(catName);
        const rC = document.getElementById("rds-container"); if(rC) rC.classList.add("hidden");
    }
}

function loadRadioById(targetId) {
    let targetRadio = allRadios.find(r => r.id === targetId); if (!targetRadio) return;
    let catName = targetRadio.badge || "Rádio FM";
    if (!matchesCategory(catName, currentFilterMode)) {
        currentFilterMode = catName; radios = allRadios.filter(r => matchesCategory(r.badge, catName));
        if (badgePais) badgePais.innerText = getCategoryBadgeLabel(catName);
        configureCategoryBounds(catName);
        buildDial();
    }
    currentIndex = radios.findIndex(r => r.id === targetId); if (currentIndex === -1) currentIndex = 0;
    carregarRadio(currentIndex);
}

function normalizeStr(str) { return String(str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); }

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') { if(audio) wasPlayingBeforeBackground = !audio.paused; } 
    else if (document.visibilityState === 'visible') { if (wasPlayingBeforeBackground && audio && audio.paused) { const currentSrc = audio.src; audio.src = ""; setTimeout(() => { audio.src = currentSrc; audio.play().catch(()=>{}); }, 50); } }
});

function tocarComVoz(radio) {
    if (!radio) return;
    if (!voiceToggle || !voiceToggle.checked || !('speechSynthesis' in window)) { if(audio && splashDismissed) audio.play().catch(() => {}); return; }
    window.speechSynthesis.cancel(); if(audio) audio.pause(); stopChiado(); if(statusConexao) statusConexao.innerText = "ASSISTENTE DE VOZ...";
    const isKhz = isAMCategory(radio.badge) || isSWCategory(radio.badge);
    let unidadeVoz = isKhz ? "Quilohertz" : "Megahertz";
    let freqFalada = isKhz ? String(Math.round(parseRadioFreq(radio.freq, radio.badge))) : String(radio.freq).replace('.', ' ponto ');
    let msg = new SpeechSynthesisUtterance(`${freqFalada} ${unidadeVoz}... ${radio.name}`);
    msg.lang = 'pt-BR'; msg.rate = 1.1;
    msg.onend = () => { if(statusConexao) statusConexao.innerText = `${radio.city || ''} • ${radio.genre || ''}`; if(audio && splashDismissed) audio.play().catch(() => {}); };
    msg.onerror = () => { if(audio && splashDismissed) audio.play().catch(() => {}); };
    window.speechSynthesis.speak(msg);
}

let activeQuickFilter = "em-alta";
let detectedUserStateSigla = localStorage.getItem("radar_user_state") || "";
let detectedUserCity = localStorage.getItem("radar_user_city") || "";

async function detectUserLocationForFilter() {
    if (detectedUserStateSigla) {
        updatePertoPillLabel();
        return;
    }
    try {
        const res = await fetch("https://ipapi.co/json/");
        if (res.ok) {
            const data = await res.json();
            if (data && data.region_code) {
                detectedUserStateSigla = String(data.region_code).toUpperCase();
                localStorage.setItem("radar_user_state", detectedUserStateSigla);
            }
            if (data && data.city) {
                detectedUserCity = String(data.city);
                localStorage.setItem("radar_user_city", detectedUserCity);
            }
            updatePertoPillLabel();
        }
    } catch (e) {}
}

function updatePertoPillLabel() {
    const pillPerto = document.getElementById("pill-perto");
    if (!pillPerto) return;
    if (detectedUserStateSigla) {
        pillPerto.innerText = `Perto de Mim (${detectedUserStateSigla})`;
    } else {
        const topState = getTop(userStats ? userStats.statesListened : {});
        if (topState && topState !== "Nenhum" && topState !== "Web") {
            pillPerto.innerText = `Perto de Mim`;
        }
    }
}

function renderSearchListByFilter(filterKey, searchTerm = "") {
    const mdl = document.getElementById("modal-estacoes");
    const lista = document.getElementById("station-list");
    if (!lista) return;
    lista.innerHTML = "";

    const normTerm = normalizeStr(searchTerm).trim();
    let listToRender = [...allRadios];

    if (normTerm.length > 0) {
        listToRender = listToRender.filter(r => {
            const fullStr = `${r.name || ""} ${r.freq || ""} ${r.city || ""} ${r.genre || ""} ${r.badge || ""}`;
            return normalizeStr(fullStr).includes(normTerm);
        });
    } else {
        if (filterKey === "em-alta") {
            listToRender.sort((a, b) => (Number(b.playCount || 0) + Number(b.likesCount || 0) * 2) - (Number(a.playCount || 0) + Number(a.likesCount || 0) * 2));
            listToRender = listToRender.slice(0, 15);
        } else if (filterKey === "perto") {
            const sigla = detectedUserStateSigla ? normalizeStr(detectedUserStateSigla) : "mg";
            const cityNorm = detectedUserCity ? normalizeStr(detectedUserCity) : "";
            const localMatches = listToRender.filter(r => {
                const c = normalizeStr(r.city || "");
                const parts = c.split("-").map(s => s.trim());
                const st = parts[1] || "";
                return st === sigla || (cityNorm && c.includes(cityNorm)) || c.includes(`- ${sigla}`);
            });
            if (localMatches.length > 0) {
                localMatches.sort((a, b) => {
                    const aCity = cityNorm && normalizeStr(a.city || "").includes(cityNorm) ? 1 : 0;
                    const bCity = cityNorm && normalizeStr(b.city || "").includes(cityNorm) ? 1 : 0;
                    return bCity - aCity;
                });
                listToRender = localMatches;
            }
        } else if (filterKey === "sertanejo") {
            listToRender = listToRender.filter(r => normalizeStr(`${r.genre || ""} ${r.name || ""}`).includes("sertanej") || normalizeStr(r.genre || "").includes("popular"));
        } else if (filterKey === "pop") {
            listToRender = listToRender.filter(r => {
                const g = normalizeStr(`${r.genre || ""} ${r.name || ""}`);
                return g.includes("pop") || g.includes("jovem") || g.includes("rock") || g.includes("hit") || g.includes("dance");
            });
        } else if (filterKey === "noticias") {
            listToRender = listToRender.filter(r => {
                const g = normalizeStr(`${r.genre || ""} ${r.name || ""}`);
                return g.includes("notic") || g.includes("jornal") || g.includes("news") || g.includes("info");
            });
        } else if (filterKey === "esportes") {
            listToRender = listToRender.filter(r => {
                const g = normalizeStr(`${r.genre || ""} ${r.name || ""}`);
                return g.includes("esport") || g.includes("futebol");
            });
        } else if (filterKey === "gospel") {
            listToRender = listToRender.filter(r => {
                const g = normalizeStr(`${r.genre || ""} ${r.name || ""}`);
                return g.includes("gospel") || g.includes("relig") || g.includes("catolic") || g.includes("evangel") || g.includes("crist");
            });
        }
    }

    if (listToRender.length === 0) {
        lista.innerHTML = `<p style="text-align:center; padding: 25px 10px; color: var(--text-muted); font-size: 14px;">Nenhuma estação encontrada para este filtro.</p>`;
        return;
    }

    listToRender.forEach((r) => {
        const li = document.createElement("li");
        li.className = "station-item";
        const unit = getFreqUnit(r.badge);
        const freqFmt = formatFreqDisplay(r.freq, r.badge);
        li.innerHTML = `<div><strong>${r.name}</strong> (${freqFmt} ${unit})<br><small style="color:var(--text-muted)">${r.city || ''} • ${r.genre || ''}</small></div>`;
        li.addEventListener("click", (e) => {
            e.stopPropagation();
            if(mdl) mdl.classList.remove("active");
            loadRadioById(r.id);
            tocarComVoz(radios[currentIndex]);
        });
        lista.appendChild(li);
    });
}

function abrirBusca() {
    const mdl = document.getElementById("modal-estacoes");
    if(mdl) mdl.classList.add("active");
    detectUserLocationForFilter();
    const inputBusca = document.getElementById("filtra-estacao");
    if(inputBusca) inputBusca.value = "";
    document.querySelectorAll("#quick-filters-bar .filter-pill").forEach(btn => {
        btn.classList.toggle("active", btn.getAttribute("data-filter") === activeQuickFilter);
    });
    renderSearchListByFilter(activeQuickFilter, "");
}

document.querySelectorAll("#quick-filters-bar .filter-pill").forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.stopPropagation();
        activeQuickFilter = btn.getAttribute("data-filter") || "em-alta";
        document.querySelectorAll("#quick-filters-bar .filter-pill").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const inputBusca = document.getElementById("filtra-estacao");
        if (inputBusca) inputBusca.value = "";
        renderSearchListByFilter(activeQuickFilter, "");
    });
});

const modalEstacoesEl = document.getElementById("modal-estacoes");
const stationListEl = document.getElementById("station-list");
const modalEstacoesContentEl = document.getElementById("modal-estacoes-content");

if (stationListEl) {
    stationListEl.addEventListener("click", (e) => {
        const inputBusca = document.getElementById("filtra-estacao");
        const semTexto = !inputBusca || inputBusca.value.trim().length === 0;
        if (e.target === stationListEl && semTexto) {
            if (modalEstacoesEl) modalEstacoesEl.classList.remove("active");
        }
    });
}

if (modalEstacoesEl) {
    modalEstacoesEl.addEventListener("click", (e) => {
        const inputBusca = document.getElementById("filtra-estacao");
        const semTexto = !inputBusca || inputBusca.value.trim().length === 0;
        if ((e.target === modalEstacoesEl || e.target === modalEstacoesContentEl) && semTexto) {
            modalEstacoesEl.classList.remove("active");
        }
    });
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
        renderSearchListByFilter(activeQuickFilter, e.target.value);
    });
}

const btnFeedbackStation = document.getElementById("btn-feedback-station");
if (btnFeedbackStation) {
    btnFeedbackStation.addEventListener("click", () => {
        const c = document.getElementById("modal-config");
        if (c) c.classList.remove("active");
        openFeedbackSelector();
    });
}

function openFeedbackSelector() {
    const radioAtual = radios[currentIndex];
    if (!radioAtual) return;

    let overlay = document.getElementById("feedback-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "feedback-overlay";
        overlay.className = "ios-action-sheet-overlay";
        overlay.innerHTML = `
            <div class="ios-action-sheet">
                <div class="ios-action-group">
                    <div class="ios-action-header" id="feedback-sheet-title">Feedback de Estação</div>
                    <div class="feedback-obs-box">
                        <input type="text" id="feedback-obs-input" class="feedback-obs-input" placeholder="Qual a frequência certa ou detalhe? (Opcional)">
                    </div>
                    <div id="feedback-options-group"></div>
                </div>
                <button class="ios-action-cancel" onclick="closeFeedbackSelector()">Cancelar</button>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.addEventListener("click", (e) => { if (e.target === overlay) closeFeedbackSelector(); });
    }

    const titleEl = overlay.querySelector("#feedback-sheet-title");
    if (titleEl) {
        const unit = getFreqUnit(radioAtual.badge);
        const freqFmt = formatFreqDisplay(radioAtual.freq, radioAtual.badge);
        titleEl.innerHTML = `<strong style="color:var(--text-primary);font-size:15px;">${radioAtual.name} (${freqFmt} ${unit})</strong><br>A emissora está na frequência certa?`;
    }

    const obsInput = overlay.querySelector("#feedback-obs-input");
    if (obsInput) obsInput.value = "";

    const group = overlay.querySelector("#feedback-options-group");
    if (group) {
        group.innerHTML = "";
        const opcoes = [
            { label: "Frequência e áudio corretos", tipo: "Correta" },
            { label: "Frequência diferente no dial", tipo: "Frequência Errada" },
            { label: "Estação sem som / Fora do ar", tipo: "Fora do Ar" },
            { label: "Outra emissora tocando no lugar", tipo: "Emissora Trocada" }
        ];
        opcoes.forEach(op => {
            const btn = document.createElement("button");
            btn.className = "ios-action-btn";
            btn.innerText = op.label;
            btn.onclick = () => enviarFeedbackEstacao(radioAtual, op.tipo);
            group.appendChild(btn);
        });
    }

    requestAnimationFrame(() => { overlay.classList.add("active"); });
}

window.closeFeedbackSelector = function() {
    const overlay = document.getElementById("feedback-overlay");
    if (overlay) overlay.classList.remove("active");
};

function enviarFeedbackEstacao(radio, statusTipo) {
    const obsInput = document.getElementById("feedback-obs-input");
    const observacao = obsInput ? obsInput.value.trim() : "";
    closeFeedbackSelector();
    if (radio && radio.id) {
        salvarHistoricoFeedbackEstacao(radio.id, false);
    }

    if (!db) {
        alert("Feedback registrado. Obrigado por colaborar!");
        return;
    }

    db.collection("station_feedback").add({
        radioId: radio.id || "",
        radioName: radio.name || "",
        radioFreq: radio.freq || "",
        radioCity: radio.city || "",
        status: statusTipo,
        note: observacao,
        userUid: currentUser ? currentUser.uid : getDeviceUid(),
        createdAt: new Date().toISOString(),
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).then(() => {
        alert("Obrigado! Seu feedback sobre a estação foi enviado para a administração.");
    }).catch(() => {
        alert("Não foi possível enviar agora, tente novamente mais tarde.");
    });
}

const btnWp = document.getElementById("btn-whatsapp"); if(btnWp) btnWp.addEventListener("click", () => { window.open(`https://wa.me/5532985109726?text=` + encodeURIComponent("Olá, Gostaria de adicionar uma rádio no Radar Rádios."), "_blank"); });
let recentSongsHistory = [];
try {
    recentSongsHistory = JSON.parse(localStorage.getItem("radar_recent_songs")) || [];
    if (!Array.isArray(recentSongsHistory)) recentSongsHistory = [];
} catch(e) {
    recentSongsHistory = [];
}

function isValidSongTitle(text, radio) {
    if (!text) return false;
    const clean = String(text).trim();
    if (clean.length < 3) return false;
    const norm = normalizeStr(clean);
    const sloganStr = (radio && radio.slogan) ? normalizeStr(radio.slogan).trim() : "";
    const radioNameNorm = (radio && radio.name) ? normalizeStr(radio.name).trim() : "";

    if (
        norm === "programacao ao vivo" ||
        norm === "comercial ou locucao" ||
        norm === "comercial" ||
        norm === "locucao" ||
        norm.includes("buscando") ||
        norm.includes("sintonizando") ||
        norm.includes("barulhinho de chuva") ||
        norm.includes("tardezinha otima") ||
        norm.includes("bom descanso") ||
        norm.includes("ta na otima") ||
        norm.includes("a radio que toca") ||
        (sloganStr && (norm === sloganStr || norm.includes(sloganStr) || sloganStr.includes(norm))) ||
        (radioNameNorm && norm === radioNameNorm)
    ) {
        return false;
    }

    if (Array.isArray(allRadios)) {
        for (let i = 0; i < allRadios.length; i++) {
            const s = allRadios[i].slogan ? normalizeStr(allRadios[i].slogan).trim() : "";
            if (s && s.length > 3 && (norm === s || norm.includes(s))) {
                return false;
            }
        }
    }

    if (!clean.includes(" - ") && !clean.includes(" / ") && clean.endsWith("!")) {
        return false;
    }

    return true;
}

recentSongsHistory = recentSongsHistory.filter(item => isValidSongTitle(item && item.title, null));
try { localStorage.setItem("radar_recent_songs", JSON.stringify(recentSongsHistory)); } catch(e) {}

function recordSongInHistory(songTitle, coverUrl, radio) {
    if (!songTitle || !radio) return;
    const clean = String(songTitle).trim();
    if (!isValidSongTitle(clean, radio)) return;

    if (recentSongsHistory.length > 0 && recentSongsHistory[0].title === clean && recentSongsHistory[0].radioId === radio.id) {
        if (coverUrl && !recentSongsHistory[0].cover) {
            recentSongsHistory[0].cover = coverUrl;
            localStorage.setItem("radar_recent_songs", JSON.stringify(recentSongsHistory));
        }
        return;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const unit = getFreqUnit(radio.badge);
    const freqFmt = formatFreqDisplay(radio.freq, radio.badge);

    const entry = {
        title: clean,
        cover: coverUrl || radio.logo || "https://raw.githubusercontent.com/althierestm/Radar-Radios-App/main/Icon%20RadarRadios.png?v=2",
        radioId: radio.id,
        radioName: radio.name,
        radioFreq: `${freqFmt} ${unit}`,
        time: timeStr,
        timestamp: now.getTime()
    };

    recentSongsHistory = [entry, ...recentSongsHistory.filter(item => !(item.title === clean && item.radioId === radio.id))].slice(0, 10);
    try {
        localStorage.setItem("radar_recent_songs", JSON.stringify(recentSongsHistory));
    } catch(e) {}
}

function getActiveSongOnRDS() {
    const rdsTextEl = document.getElementById("rds-text");
    const txt = rdsTextEl ? rdsTextEl.innerText.trim() : "";
    const radioAtual = radios[currentIndex];
    if (isValidSongTitle(txt, radioAtual)) {
        return txt;
    }
    return "";
}

function copySongToClipboard(textToCopy) {
    if (!textToCopy) return;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(textToCopy).then(() => {
            alert("Música copiada: " + textToCopy);
        }).catch(() => alert(textToCopy));
    } else {
        alert(textToCopy);
    }
}

function abrirModalMusicas() {
    const mdl = document.getElementById("modal-musicas");
    const listEl = document.getElementById("recent-songs-list");
    const currentBar = document.getElementById("current-song-copy-bar");
    const currentTitleEl = document.getElementById("current-song-title-bar");
    const btnCopyBar = document.getElementById("btn-copy-current-song");
    if (!mdl || !listEl) return;

    if (btnCopyBar) btnCopyBar.style.display = "none";

    const activeSong = getActiveSongOnRDS();
    if (currentBar && currentTitleEl) {
        if (activeSong) {
            currentTitleEl.innerText = activeSong;
            currentBar.style.cursor = "pointer";
            currentBar.title = "Toque para copiar a música";
            currentBar.onclick = () => copySongToClipboard(activeSong);
            currentBar.classList.remove("hidden");
        } else {
            currentBar.classList.add("hidden");
        }
    }

    listEl.innerHTML = "";
    const validList = recentSongsHistory.filter(item => isValidSongTitle(item && item.title, null)).slice(0, 10);
    if (validList.length === 0) {
        listEl.innerHTML = `<p style="text-align:center; padding: 30px 15px; color: var(--text-muted); font-size: 14px;">Nenhuma música identificada recentemente nesta sessão.</p>`;
    } else {
        validList.forEach(item => {
            const li = document.createElement("li");
            li.className = "recent-song-item";
            const fallbackImg = "https://raw.githubusercontent.com/althierestm/Radar-Radios-App/main/Icon%20RadarRadios.png?v=2";
            li.innerHTML = `
                <img src="${item.cover || fallbackImg}" alt="Capa" class="recent-song-cover" onerror="this.src='${fallbackImg}'">
                <div class="recent-song-meta">
                    <strong>${item.radioName} (${item.radioFreq})</strong>
                    <small style="font-size: 13px; color: var(--text-secondary); margin-top: 2px;">${item.title}</small>
                </div>
                <span class="recent-song-time">${item.time || ""}</span>
            `;
            li.title = "Toque para copiar o nome da música";
            li.addEventListener("click", () => {
                copySongToClipboard(item.title);
            });
            listEl.appendChild(li);
        });
    }

    mdl.classList.add("active");
}

document.querySelectorAll(".fechar-modal-musicas").forEach(btn => {
    btn.addEventListener("click", () => {
        const m = document.getElementById("modal-musicas");
        if (m) m.classList.remove("active");
    });
});

const btnShazam = document.getElementById("btn-shazam"); 
let shazamLongPressTimer = null;
let shazamLongPressTriggered = false;

if (btnShazam) {
    const startShazamPress = () => {
        shazamLongPressTriggered = false;
        clearTimeout(shazamLongPressTimer);
        shazamLongPressTimer = setTimeout(() => {
            shazamLongPressTriggered = true;
            if (hapticToggle && hapticToggle.checked && navigator.vibrate) navigator.vibrate(20);
            abrirModalMusicas();
        }, 500);
    };
    const cancelShazamPress = () => {
        clearTimeout(shazamLongPressTimer);
    };

    btnShazam.addEventListener("pointerdown", startShazamPress);
    btnShazam.addEventListener("pointerup", cancelShazamPress);
    btnShazam.addEventListener("pointerleave", cancelShazamPress);
    btnShazam.addEventListener("pointercancel", cancelShazamPress);
    btnShazam.addEventListener("contextmenu", (e) => e.preventDefault());

    btnShazam.addEventListener("click", (e) => {
        if (shazamLongPressTriggered) {
            e.preventDefault();
            e.stopPropagation();
            shazamLongPressTriggered = false;
            return;
        }
        const activeSong = getActiveSongOnRDS();
        if (activeSong) {
            copySongToClipboard(activeSong);
        } else {
            alert("Nenhuma música sendo exibida no momento para copiar.");
        }
    });
}

async function generateShareCardBlob(radio, songText) {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");

    const grad = ctx.createLinearGradient(0, 0, 0, 1920);
    grad.addColorStop(0, "#080c1d");
    grad.addColorStop(0.5, "#030305");
    grad.addColorStop(1, "#000000");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 1080, 1920);

    const radial = ctx.createRadialGradient(540, 680, 40, 540, 680, 650);
    radial.addColorStop(0, "rgba(31, 55, 186, 0.38)");
    radial.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = radial;
    ctx.fillRect(0, 0, 1080, 1920);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 3;
    ctx.strokeRect(70, 140, 940, 1640);

    ctx.fillStyle = "#4a65f0";
    ctx.font = "700 32px Montserrat, sans-serif";
    ctx.textAlign = "center";
    const catLabel = getCategoryBadgeLabel(radio.badge).toUpperCase();
    ctx.fillText(`SINTONIZADO NO RADAR RÁDIOS • ${catLabel}`, 540, 290);

    const freqFmt = formatFreqDisplay(radio.freq, radio.badge);
    const unit = getFreqUnit(radio.badge);
    ctx.fillStyle = "#ffffff";
    ctx.font = "300 230px Montserrat, sans-serif";
    ctx.fillText(freqFmt, 540, 690);

    ctx.fillStyle = "#8e8e93";
    ctx.font = "500 52px Montserrat, sans-serif";
    ctx.fillText(unit, 540, 775);

    let nomeEstacao = String(radio.name || "Rádio");
    if (!nomeEstacao.toUpperCase().includes('FM') && (!radio.badge || radio.badge === 'Rádio FM')) nomeEstacao = `${nomeEstacao} FM`;
    else if (!nomeEstacao.toUpperCase().includes('AM') && isAMCategory(radio.badge)) nomeEstacao = `${nomeEstacao} AM`;
    else if (!nomeEstacao.toUpperCase().includes('SW') && !nomeEstacao.toUpperCase().includes('OC') && isSWCategory(radio.badge)) nomeEstacao = `${nomeEstacao} SW`;

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 68px Montserrat, sans-serif";
    ctx.fillText(nomeEstacao.slice(0, 26), 540, 960);

    ctx.fillStyle = "#888888";
    ctx.font = "500 36px Montserrat, sans-serif";
    const subInfo = `${radio.city || ""} • ${radio.genre || ""}`;
    ctx.fillText(subInfo.slice(0, 40), 540, 1035);

    ctx.strokeStyle = "rgba(31, 55, 186, 0.5)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(240, 1140);
    ctx.lineTo(840, 1140);
    ctx.stroke();

    const activeLine = songText || (radio.slogan && String(radio.slogan).trim() !== "" ? radio.slogan : "Transmissão Ao Vivo");
    const labelTop = songText ? "TOCANDO AGORA" : "NO AR";

    ctx.fillStyle = "#4a65f0";
    ctx.font = "700 28px Montserrat, sans-serif";
    ctx.fillText(labelTop, 540, 1245);

    ctx.fillStyle = "#d1d1d6";
    ctx.font = "600 42px Montserrat, sans-serif";
    const truncatedSong = activeLine.length > 38 ? activeLine.slice(0, 35) + "..." : activeLine;
    ctx.fillText(truncatedSong, 540, 1320);

    ctx.fillStyle = "#ffffff";
    ctx.font = "700 44px Montserrat, sans-serif";
    ctx.fillText("Radar Rádios", 540, 1610);

    ctx.fillStyle = "#888888";
    ctx.font = "400 28px Montserrat, sans-serif";
    ctx.fillText("Rádios Online Grátis", 540, 1660);

    return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/png");
    });
}

const btnShare = document.getElementById("btn-share");
if (btnShare) {
    btnShare.addEventListener("click", async () => {
        const radio = radios[currentIndex];
        if (!radio) return;
        const activeSong = getActiveSongOnRDS();
        const shareText = activeSong
            ? `Estou ouvindo ${activeSong} na ${radio.name} (${radio.freq}) pelo Radar Rádios!`
            : `Estou ouvindo ${radio.name} (${radio.freq}) no Radar Rádios!`;

        try {
            const blob = await generateShareCardBlob(radio, activeSong);
            if (blob && navigator.canShare) {
                const file = new File([blob], "radar-radios-story.png", { type: "image/png" });
                if (navigator.canShare({ files: [file] })) {
                    await navigator.share({
                        title: "Radar Rádios",
                        text: shareText,
                        files: [file]
                    });
                    return;
                }
            }
        } catch (err) {
            if (err && err.name === "AbortError") return;
        }

        if (navigator.share) {
            navigator.share({
                title: "Radar Rádios",
                text: shareText,
                url: window.location.href
            }).catch(() => {});
        } else {
            alert("Compartilhamento não suportado neste navegador.");
        }
    });
}

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

const btnTimerOpen = document.getElementById("btn-timer-open"); 
if(btnTimerOpen) btnTimerOpen.addEventListener("click", () => { openTimerSelector(); });

const btnConfigTimer = document.getElementById("btn-config-timer"); 
if(btnConfigTimer) btnConfigTimer.addEventListener("click", () => { 
    const c = document.getElementById("modal-config"); 
    if(c) c.classList.remove("active"); 
    openTimerSelector(); 
});

function openTimerSelector() {
    let overlay = document.getElementById("timer-overlay");
    if (!overlay) {
        overlay = document.createElement("div"); overlay.id = "timer-overlay"; overlay.className = "ios-action-sheet-overlay";
        overlay.innerHTML = `<div class="ios-action-sheet"><div class="ios-action-header">Temporizador</div><div class="ios-action-group" id="timer-group"></div><button class="ios-action-cancel" onclick="closeTimerSelector()">Cancelar</button></div>`;
        document.body.appendChild(overlay);
        overlay.addEventListener("click", (e) => { if(e.target === overlay) closeTimerSelector(); });
    }
    const group = overlay.querySelector("#timer-group"); if(group) group.innerHTML = '';
    const options = [
        { label: "Desativar", val: 0 },
        { label: "15 Minutos", val: 15 },
        { label: "30 Minutos", val: 30 },
        { label: "60 Minutos", val: 60 },
        { label: "90 Minutos", val: 90 }
    ];
    options.forEach(opt => {
        const btn = document.createElement("button"); btn.className = "ios-action-btn";
        btn.innerText = opt.label; 
        btn.onclick = () => { 
            setTimer(opt.val);
            closeTimerSelector(); 
        };
        if(group) group.appendChild(btn);
    });
    requestAnimationFrame(() => { overlay.classList.add("active"); });
}
window.closeTimerSelector = function() { const overlay = document.getElementById("timer-overlay"); if (overlay) overlay.classList.remove("active"); };

function setTimer(minutos) {
    clearInterval(sleepTimerInterval);
    if (minutos > 0) { 
        targetTime = new Date().getTime() + minutos * 60 * 1000; 
        updateTimerDisplay(); 
        if(timerDisplay) timerDisplay.classList.remove("hidden"); 
        sleepTimerInterval = setInterval(updateTimerDisplay, 1000); 
        alert(`A rádio desligará em ${minutos} minutos.`);
    } else { 
        if(timerDisplay) timerDisplay.classList.add("hidden"); 
    } 
}

function atualizarTelaDeBloqueio(radio, rdsText = null, coverUrl = null) {
    try {
        if ('mediaSession' in navigator && audio && radio) {
            if (!radios[currentIndex] || radios[currentIndex].id !== radio.id) return;

            let nomeR = String(radio.name || "Rádio"); 
            if (!nomeR.toUpperCase().includes('FM') && (!radio.badge || radio.badge === 'Rádio FM')) nomeR = `${nomeR} FM`;
            else if (!nomeR.toUpperCase().includes('AM') && isAMCategory(radio.badge)) nomeR = `${nomeR} AM`;
            else if (!nomeR.toUpperCase().includes('SW') && !nomeR.toUpperCase().includes('OC') && isSWCategory(radio.badge)) nomeR = `${nomeR} SW`;
            
            let artworkSrc = 'https://raw.githubusercontent.com/althierestm/Radar-Radios-App/main/Icon%20RadarRadios.png?v=2';
            
            if (radio.logo && String(radio.logo).startsWith('http')) {
                artworkSrc = String(radio.logo).trim();
            }

            if (coverUrl && String(coverUrl).startsWith('http')) {
                artworkSrc = String(coverUrl).trim();
            }
            
            let sloganStr = (radio.slogan && String(radio.slogan).trim() !== "") ? String(radio.slogan).trim() : "";
            let temRDS = isValidSongTitle(rdsText, radio);
            
            let freqFmt = formatFreqDisplay(radio.freq, radio.badge);
            let sufixoFreq = (!radio.badge || radio.badge === 'Rádio FM') ? 'FM' : (isAMCategory(radio.badge) ? 'AM' : (isSWCategory(radio.badge) ? 'kHz SW' : 'MHz'));
            let mainTitle = radio.freq ? `${freqFmt}${sufixoFreq.startsWith('kHz') ? ' ' + sufixoFreq : sufixoFreq} - ${nomeR}` : nomeR;
            let mainArtist = temRDS ? String(rdsText).trim() : `${radio.city || ''} • ${radio.genre || ''}`;
            let mainAlbum = sloganStr ? sloganStr : "Radar Rádios";

            navigator.mediaSession.playbackState = !audio.paused ? "playing" : "paused";

            if (
                mainTitle === lastMediaSessionTitle &&
                mainArtist === lastMediaSessionArtist &&
                mainAlbum === lastMediaSessionAlbum &&
                artworkSrc === lastMediaSessionArtwork
            ) {
                return;
            }

            lastMediaSessionTitle = mainTitle;
            lastMediaSessionArtist = mainArtist;
            lastMediaSessionAlbum = mainAlbum;
            lastMediaSessionArtwork = artworkSrc;
            
            navigator.mediaSession.metadata = new MediaMetadata({ 
                title: mainTitle, 
                artist: mainArtist, 
                album: mainAlbum, 
                artwork: [
                    { src: artworkSrc, sizes: '512x512', type: 'image/png' }
                ] 
            });

            try { navigator.mediaSession.setActionHandler('seekbackward', null); } catch (e) {}
            try { navigator.mediaSession.setActionHandler('seekforward', null); } catch (e) {}
            try { navigator.mediaSession.setActionHandler('seekto', null); } catch (e) {}

            navigator.mediaSession.setActionHandler('play', () => { audio.play().catch(()=>{}); if(playIcon) playIcon.className = "fa-solid fa-pause"; navigator.mediaSession.playbackState = "playing"; });
            navigator.mediaSession.setActionHandler('pause', () => { audio.pause(); stopChiado(); if(playIcon) playIcon.className = "fa-solid fa-play"; navigator.mediaSession.playbackState = "paused"; });
            navigator.mediaSession.setActionHandler('previoustrack', () => { const b = document.getElementById("btn-prev"); if(b) b.click(); });
            navigator.mediaSession.setActionHandler('nexttrack', () => { const b = document.getElementById("btn-next"); if(b) b.click(); });
        }
    } catch (e) {}
}

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

if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (currentThemeMode === "Automático") updateThemeUI();
    });
}

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

function initChiado() {
    try {
        if (audioCtx) return; 
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        audioCtx = new AudioContextClass();
        const bufferSize = audioCtx.sampleRate * 2; const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const data = buffer.getChannelData(0); for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        noiseNode = audioCtx.createBufferSource(); noiseNode.buffer = buffer; noiseNode.loop = true;
        noiseFilter = audioCtx.createBiquadFilter(); noiseFilter.type = 'bandpass'; noiseFilter.frequency.value = 1200;
        noiseGain = audioCtx.createGain(); noiseGain.gain.value = 0; 
        noiseNode.connect(noiseFilter); noiseFilter.connect(noiseGain); noiseGain.connect(audioCtx.destination); noiseNode.start();
    } catch (e) {}
}
function playChiado() { 
    try {
        if (!noiseToggle || !noiseToggle.checked) return; 
        if (!audioCtx) initChiado(); 
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') audioCtx.resume(); 
        noiseGain.gain.setTargetAtTime(0.3, audioCtx.currentTime, 0.1); 
    } catch (e) {}
}
function stopChiado() { 
    try {
        if (noiseGain && audioCtx) noiseGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1); 
    } catch (e) {}
}

async function fetchFallbackCover(query) {
    try {
        if (!query || query.length < 3 || query.includes("Programação ao vivo") || query.includes("Comercial")) return null;
        let cleanQuery = query.replace(/Ao Vivo/ig, '').replace(/\(.*\)/g, '').replace(/\[.*\]/g, '').trim();
        const response = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(cleanQuery)}&media=music&entity=song&limit=1`);
        const data = await response.json();
        if (data.results && data.results.length > 0 && data.results[0].artworkUrl100) {
            return data.results[0].artworkUrl100.replace('100x100bb', '512x512bb');
        }
    } catch (e) {}
    return null;
}

function stopCommercialToggle() {
    if (commercialToggleInterval) {
        clearInterval(commercialToggleInterval);
        commercialToggleInterval = null;
    }
}

function resetRDSState() {
    rdsSessionId++;
    clearInterval(rdsInterval);
    clearInterval(shazamWatchdog);
    stopCommercialToggle();
    if (currentShazamRef && currentShazamListener) {
        currentShazamRef.off('value', currentShazamListener);
        currentShazamRef = null;
        currentShazamListener = null;
    }
    shazamData = null;
    fallbackRdsText = null;
    fallbackRdsCover = null;
    const rdsContainer = document.getElementById("rds-container");
    const rdsScroller = document.getElementById("rds-scroller");
    const rdsTextEl = document.getElementById("rds-text");
    if (rdsContainer) rdsContainer.classList.add("hidden");
    if (rdsScroller) rdsScroller.classList.remove("marquee");
    if (rdsTextEl) rdsTextEl.innerText = "";
}

function renderRDS(radio, sessionToken = rdsSessionId) {
    if (!radio || sessionToken !== rdsSessionId) return;
    if (!radios[currentIndex] || radios[currentIndex].id !== radio.id) return;

    const now = Date.now();
    const rdsContainer = document.getElementById("rds-container");
    const rdsTextEl = document.getElementById("rds-text");
    const sloganStr = (radio.slogan && String(radio.slogan).trim() !== "") ? String(radio.slogan).trim() : "";
    
    const isShazamFresh = radio.shazam_active && shazamData && shazamData.timestamp && (now - shazamData.timestamp < 240000);

    if (isShazamFresh) {
        stopCommercialToggle();
        if (shazamData.texto && shazamData.texto !== 'COMERCIAL_FLAG' && isValidSongTitle(shazamData.texto, radio)) {
            if (rdsContainer && rdsEnabled) rdsContainer.classList.remove("hidden");
            updateRDSText(shazamData.texto, shazamData.capa, radio, true);
        } else if (sloganStr !== "") {
            if (rdsContainer && rdsEnabled) rdsContainer.classList.remove("hidden");
            updateRDSText(sloganStr, null, radio, false);
        } else {
            if (rdsContainer) rdsContainer.classList.add("hidden");
            if (rdsTextEl) rdsTextEl.innerText = "";
            atualizarTelaDeBloqueio(radio, null, null);
        }
    } else {
        stopCommercialToggle();
        
        const hasValidFallback = isValidSongTitle(fallbackRdsText, radio);

        if (hasValidFallback) {
            if (rdsContainer && rdsEnabled) rdsContainer.classList.remove("hidden");
            updateRDSText(fallbackRdsText, fallbackRdsCover, radio, true);
        } else if (sloganStr !== "") {
            if (rdsContainer && rdsEnabled) rdsContainer.classList.remove("hidden");
            updateRDSText(sloganStr, null, radio, false);
        } else {
            if (rdsContainer) rdsContainer.classList.add("hidden");
            if (rdsTextEl) rdsTextEl.innerText = "";
            atualizarTelaDeBloqueio(radio, null, null);
        }
    }
}

async function fetchRDS(radio, sessionToken = rdsSessionId) {
    if (!radio || sessionToken !== rdsSessionId) return;
    if (!radios[currentIndex] || radios[currentIndex].id !== radio.id) return;
    let fallbackText = (radio.slogan && String(radio.slogan).trim() !== "") ? String(radio.slogan).trim() : ""; 

    try {
        if (!radio.rds) {
            if (sessionToken !== rdsSessionId) return;
            fallbackRdsText = fallbackText;
            fallbackRdsCover = null;
            renderRDS(radio, sessionToken);
            return;
        }
        if (radio.rds === "local_chuva") {
            if (sessionToken !== rdsSessionId) return;
            const hour = new Date().getHours(); let msg = hour >= 6 && hour < 12 ? "Bom dia, relaxe com esse barulhinho de chuva" : hour >= 12 && hour < 18 ? "Tardezinha ótima para dormir" : "Boa noite, bom descanso";
            fallbackRdsText = msg;
            fallbackRdsCover = null;
            renderRDS(radio, sessionToken);
            return;
        }

        let url = radio.rds; let text = ""; let songName = ""; let coverUrl = null;

        if (url.includes("clube.fm") && url.includes("/eventos")) {
            url = url.replace("/eventos", "");
        }

        if (url.includes("clube.fm")) {
            if (sessionToken !== rdsSessionId) return;
            fallbackRdsText = fallbackText; fallbackRdsCover = null; renderRDS(radio, sessionToken); return;
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
            if (url.includes("hunter.fm") || url.includes("m985.com.br") || url.includes("trans99fm.com.br") || url.includes(".m3u8") || url.includes("publicradio.org") || url.includes("otimafm.com.br")) {
                const cbUrl = url + (url.includes("?") ? "&" : "?") + "cb=" + new Date().getTime();
                targetUrl = "https://api.allorigins.win/raw?url=" + encodeURIComponent(cbUrl);
            } else if (url.includes("radiomixfm.com.br") || url.includes("maringafm.com.br") || url.includes("soundstream.com.br")) {
                const cbUrl = url + (url.includes("?") ? "&" : "?") + "cb=" + new Date().getTime();
                targetUrl = "https://corsproxy.io/?" + encodeURIComponent(cbUrl);
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
                
                if (json.now_playing && json.now_playing.song) {
                    let s = json.now_playing.song;
                    songName = s.text || (s.artist ? `${s.artist} - ${s.title}` : s.title) || "";
                    if (s.art && !s.art.includes("generic_song")) {
                        coverUrl = s.art;
                    }
                }

                if (url.includes("otimafm.com.br") && Array.isArray(json)) {
                    const diasStr = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
                    const diaHoje = diasStr[new Date().getDay()];
                    const horaAtual = new Date().getHours();

                    let matchProg = json.find(item => {
                        let diaItem = (item.dia || "").toLowerCase();
                        if (!diaItem.includes(diaHoje)) return false;

                        if (item.horario) {
                            let horas = item.horario.match(/(\d+)h/g);
                            if (horas && horas.length >= 2) {
                                let s = parseInt(horas[0]);
                                let e = parseInt(horas[1]);
                                let curr = horaAtual;
                                if (e <= s && e === 0) e = 24;
                                else if (e <= s) e += 24;
                                if (curr < s && horaAtual < e - 24) curr += 24;
                                return curr >= s && curr < e;
                            }
                        }
                        return false;
                    });

                    if (matchProg) {
                        let prog = matchProg.titulo || "";
                        let apr = matchProg.apresentador || "";
                        songName = apr ? `${apr} - ${prog}` : prog;
                    }
                }

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
        
        if (songName && typeof songName === "string") {
            songName = songName.replace(/&#038;/g, "&").replace(/&amp;/g, "&").replace(/&#039;/g, "'").replace(/&quot;/g, '"').trim();
        }

        if (sessionToken !== rdsSessionId || !radios[currentIndex] || radios[currentIndex].id !== radio.id) return;

        if (isValidSongTitle(songName, radio)) {
            if (!coverUrl) {
                coverUrl = await fetchFallbackCover(songName);
            }
            if (sessionToken !== rdsSessionId || !radios[currentIndex] || radios[currentIndex].id !== radio.id) return;
            fallbackRdsText = songName;
            fallbackRdsCover = coverUrl;
        } else {
            fallbackRdsText = fallbackText;
            fallbackRdsCover = null;
        }
        renderRDS(radio, sessionToken);
    } catch (e) { 
        if (sessionToken !== rdsSessionId || !radios[currentIndex] || radios[currentIndex].id !== radio.id) return;
        fallbackRdsText = fallbackText;
        fallbackRdsCover = null;
        renderRDS(radio, sessionToken);
    }
}

function updateRDSText(text, coverUrl = null, targetRadio = null, isActualSong = false) {
    const activeRadio = targetRadio || (typeof radios !== "undefined" ? radios[currentIndex] : null);
    if (!activeRadio || (radios[currentIndex] && radios[currentIndex].id !== activeRadio.id)) return;

    const rdsText = document.getElementById("rds-text");
    const rdsScroller = document.getElementById("rds-scroller");

    if (isActualSong && isValidSongTitle(text, activeRadio)) {
        recordSongInHistory(text, coverUrl, activeRadio);
    }

    if (rdsText && rdsScroller && rdsText.innerText !== text) {
        rdsText.innerText = text;
        rdsScroller.classList.remove("marquee");
        void rdsScroller.offsetWidth;
        setTimeout(() => { 
            if (rdsScroller.parentElement && rdsScroller.scrollWidth > rdsScroller.parentElement.clientWidth) {
                rdsScroller.classList.add("marquee"); 
            }
        }, 150);
    }
    atualizarTelaDeBloqueio(activeRadio, isActualSong ? text : null, isActualSong ? coverUrl : null);
    updateCarModeUI();
}

function startRDS(radio) {
    resetRDSState();
    if (!radio) return;
    const mySession = rdsSessionId;
    const rdsContainer = document.getElementById("rds-container"); 
    const rdsScroller = document.getElementById("rds-scroller"); 
    const rdsText = document.getElementById("rds-text");

    const sloganStr = (radio.slogan && String(radio.slogan).trim() !== "") ? String(radio.slogan).trim() : "";

    if (!rdsEnabled || (!radio.rds && !radio.shazam_active && !sloganStr)) { 
        if(rdsContainer) rdsContainer.classList.add("hidden"); 
        if(rdsText) rdsText.innerText = "";
        atualizarTelaDeBloqueio(radio, null, null); 
        return; 
    }
    
    if (sloganStr !== "") {
        if(rdsContainer) rdsContainer.classList.remove("hidden");
        if(rdsScroller) rdsScroller.classList.remove("marquee");
        if(rdsText) rdsText.innerText = "";
        updateRDSText(sloganStr, null, radio, false);
    } else {
        if(rdsContainer) rdsContainer.classList.add("hidden");
        if(rdsText) rdsText.innerText = "";
        atualizarTelaDeBloqueio(radio, null, null);
    }

    if (radio.shazam_active && rtdb) {
        currentShazamRef = rtdb.ref(`shazam_rds/${radio.id}`);
        currentShazamListener = currentShazamRef.on('value', async (snapshot) => {
            if (mySession !== rdsSessionId || !radios[currentIndex] || radios[currentIndex].id !== radio.id) return;
            const val = snapshot.val();
            if (val && val.texto && val.texto !== 'COMERCIAL_FLAG' && !val.capa && isValidSongTitle(val.texto, radio)) {
                val.capa = await fetchFallbackCover(val.texto);
            }
            if (mySession !== rdsSessionId || !radios[currentIndex] || radios[currentIndex].id !== radio.id) return;
            shazamData = val;
            renderRDS(radio, mySession);
        });

        shazamWatchdog = setInterval(() => {
            if (mySession !== rdsSessionId) return;
            renderRDS(radio, mySession);
        }, 10000); 
    }

    if (radio.rds) {
        fetchRDS(radio, mySession); 
        rdsInterval = setInterval(() => {
            if (mySession !== rdsSessionId) return;
            fetchRDS(radio, mySession);
        }, 10000);
    } else {
        renderRDS(radio, mySession);
    }
}

if(audio) {
    audio.addEventListener('playing', () => {
        stopChiado(); const radio = radios[currentIndex]; 
        if (!radio) return;
        if(statusConexao) statusConexao.innerText = `${radio.city || ''} • ${radio.genre || ''}`; 
        if(playIcon) playIcon.className = "fa-solid fa-pause";
        updateCarModeUI();
        if (badgePais) badgePais.innerText = getCategoryBadgeLabel(radio.badge);
        atualizarTelaDeBloqueio(radio); startRDS(radio);
        
        updatePresence('listening', radio.id);

        startQuickFeedbackCountdown(radio);

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
                userStats.stationsListened[radio.name] = (userStats.stationsListened[radio.name] || 0) + 1; 
                userStats.genresListened[radio.genre] = (userStats.genresListened[radio.genre] || 0) + 1; 
                userStats.freqsListened[radio.freq] = (userStats.freqsListened[radio.freq] || 0) + 1;
                let state = (radio.city || "").split("-")[1]?.trim() || "Web"; 
                if (state.toLowerCase() === "ba") state = "Bahia"; 
                if (state.toLowerCase() === "sp") state = "São Paulo"; 
                if (state.toLowerCase() === "mg") state = "Minas Gerais"; 
                if (state.toLowerCase() === "df") state = "Distrito Federal";
                userStats.statesListened[state] = (userStats.statesListened[state] || 0) + 1; 
                currentStationTracked = true;
                localStorage.setItem("radar_stats", JSON.stringify(userStats));
                syncUserStatsToCloud();
                const mdlC = document.getElementById('modal-config');
                if(mdlC && mdlC.classList.contains('active')) renderProfile();
            } else {
                localStorage.setItem("radar_stats", JSON.stringify(userStats));
                if (currentStationTime % 30000 === 0) {
                    syncUserStatsToCloud();
                }
            }
        }, 5000);
    });

    audio.addEventListener('pause', () => { 
        try { if ('mediaSession' in navigator) navigator.mediaSession.playbackState = "paused"; } catch (e) {}
        updateCarModeUI();
        clearInterval(profileTimer); 
        clearQuickFeedbackTimers();
        syncUserStatsToCloud();
        clearInterval(rdsInterval); 
        clearInterval(shazamWatchdog);
        stopCommercialToggle();
        
        if (currentShazamRef && currentShazamListener) {
            currentShazamRef.off('value', currentShazamListener);
            currentShazamRef = null;
            currentShazamListener = null;
        }

        clearTimeout(playCountTimer);
        updatePresence('online');
    });
}

function buildDial() {
    if(!dialStrip) return;
    dialStrip.innerHTML = '';
    const totalSteps = Math.round((maxFreq - minFreq) / freqStep);
    for (let i = 0; i <= totalSteps; i++) {
        let rawF = minFreq + (i * freqStep);
        let freqFixed = (freqStep >= 1) ? Math.round(rawF) : Number(rawF.toFixed(1));
        const tick = document.createElement("div"); let type = "minor"; let showText = "";
        if (isSWCategory(currentFilterMode)) {
            if (freqFixed % 50 === 0) { type = "major"; showText = formatFreqDisplay(freqFixed, currentFilterMode); }
            else if (freqFixed % 25 === 0) { type = "medium"; }
        } else if (freqStep >= 1) {
            if (freqFixed % 100 === 0) { type = "major"; showText = String(freqFixed); }
            else if (freqFixed % 50 === 0) { type = "medium"; }
        } else {
            if (Math.abs(freqFixed % 1) < 0.05) { type = "major"; showText = freqFixed.toFixed(0); }
            else if (Math.abs((freqFixed * 10) % 5) < 0.5) { type = "medium"; }
        }
        let conteudoExtra = "";
        if (radios.some(r => Math.abs(parseRadioFreq(r.freq, r.badge) - freqFixed) < (freqStep * 0.45))) {
            conteudoExtra = `<div class="station-dot"></div>`;
        }
        tick.className = `dial-tick ${type}`; tick.innerHTML = `${conteudoExtra}<span>${showText}</span><div class="line"></div>`; dialStrip.appendChild(tick);
    }
    if (radios[currentIndex]) atualizarPosicaoDial(radios[currentIndex].freq);
}

function atualizarPosicaoDial(freqStr) {
    if(!dialStrip) return;
    const val = parseRadioFreq(freqStr, currentFilterMode);
    const totalTracos = (val - minFreq) / freqStep;
    dialStrip.style.transform = `translateX(${-(totalTracos * tickWidth)}px)`;
}

function getNextRadioIndex(direction) {
    if(!freqValor || radios.length === 0) return 0;
    const currentFreq = parseRadioFreq(freqValor.innerText, currentFilterMode);
    if (direction === 1) { const nextIndex = radios.findIndex(r => parseRadioFreq(r.freq, r.badge) > currentFreq); return nextIndex !== -1 ? nextIndex : 0; 
    } else { let prevIndex = -1; for (let i = radios.length - 1; i >= 0; i--) { if (parseRadioFreq(radios[i].freq, radios[i].badge) < currentFreq) { prevIndex = i; break; } } return prevIndex !== -1 ? prevIndex : (radios.length - 1); }
}

if(btnMultiRadio) {
    btnMultiRadio.addEventListener("click", () => {
        if (!radios[currentIndex]) return;
        const currentFreq = parseRadioFreq(radios[currentIndex].freq, currentFilterMode);
        const duplicates = radios.filter(r => Math.abs(parseRadioFreq(r.freq, r.badge) - currentFreq) < (freqStep * 0.45));
        const unit = getFreqUnit(currentFilterMode);
        const freqLabel = formatFreqDisplay(currentFreq, currentFilterMode);
        const title = document.getElementById("multi-modal-title"); if(title) title.innerText = `Sintonia ${freqLabel} ${unit}`;
        const list = document.getElementById("multi-station-list"); if(!list) return;
        list.innerHTML = "";
        duplicates.forEach(r => {
            const li = document.createElement("li"); li.className = "station-item"; li.innerHTML = `<div><strong>${r.name}</strong><br><small style="color:var(--text-muted)">${r.city || ''} • ${r.genre || ''}</small></div>`;
            li.addEventListener("click", () => { currentIndex = radios.findIndex(rad => rad.id === r.id); carregarRadio(currentIndex); const m = document.getElementById("modal-multi"); if(m) m.classList.remove("active"); tocarComVoz(radios[currentIndex]); btnMultiRadio.classList.remove('pulse-active'); });
            list.appendChild(li);
        });
        const m = document.getElementById("modal-multi"); if(m) m.classList.add("active");
    });
}
document.querySelectorAll(".fechar-modal-multi").forEach(btn => btn.addEventListener("click", () => { const m = document.getElementById("modal-multi"); if(m) m.classList.remove("active"); }));

if(dialContainer && dialStrip) {
    dialContainer.addEventListener('pointerdown', (e) => {
        if(radios.length === 0) return;
        isDragging = true; startX = e.clientX; 
        const style = window.getComputedStyle(dialStrip).transform;
        if(style !== "none") { 
            const matrix = new (window.DOMMatrix || window.WebKitCSSMatrix)(style);
            initialTranslateX = matrix.m41; 
        } else { initialTranslateX = 0; }
        hideQuickFeedbackPill();
        resetRDSState();
        dialStrip.style.transition = 'none'; if(audio) audio.pause(); playChiado(); if(playIcon) playIcon.className = "fa-solid fa-play";
        if(statusConexao) statusConexao.innerText = "Sintonizando..."; if(btnMultiRadio) btnMultiRadio.classList.add('hidden');
    });
    window.addEventListener('pointermove', (e) => {
        if (!isDragging) return; let novoTranslateX = initialTranslateX + (e.clientX - startX); const minTranslate = -((maxFreq - minFreq) / freqStep) * tickWidth;
        if (novoTranslateX > 0) novoTranslateX = 0; if (novoTranslateX < minTranslate) novoTranslateX = minTranslate;
        dialStrip.style.transform = `translateX(${novoTranslateX}px)`; const freqAtual = minFreq + Math.round(Math.abs(novoTranslateX) / tickWidth) * freqStep; 
        setFreqValorText(formatFreqDisplay(freqAtual, currentFilterMode));
        if (freqValor && freqValor.innerText !== lastVibratedFreq) { lastVibratedFreq = freqValor.innerText; if (hapticToggle && hapticToggle.checked && navigator.vibrate) navigator.vibrate(10); }
        if(estacaoNome) estacaoNome.innerText = "Buscando sinal..."; if (noiseFilter) noiseFilter.frequency.value = 800 + Math.abs(Math.sin(novoTranslateX * 0.1)) * 1500;
    });
    window.addEventListener('pointerup', () => {
        if (!isDragging) return; isDragging = false; dialStrip.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        if(!freqValor) return;
        const freqSintonizada = parseRadioFreq(freqValor.innerText, currentFilterMode); atualizarPosicaoDial(freqSintonizada);
        const encontradas = radios.filter(r => Math.abs(parseRadioFreq(r.freq, r.badge) - freqSintonizada) < (freqStep * 0.45));
        if (encontradas.length > 0) { currentIndex = radios.findIndex(r => r.id === encontradas[0].id); carregarRadio(currentIndex); tocarComVoz(radios[currentIndex]);
        } else { if(estacaoNome) estacaoNome.innerText = ""; if(statusConexao) statusConexao.innerText = ""; if(favIcon) favIcon.classList.replace("fa-solid", "fa-regular"); if(btnMultiRadio) btnMultiRadio.classList.add('hidden'); if (noiseFilter) noiseFilter.frequency.value = 1000; }
    });
}

function carregarRadio(index) {
    if (radios.length === 0 || !radios[index]) return;
    isRadioLoaded = true;
    sessionCounted = false; 
    clearTimeout(playCountTimer);
    hideQuickFeedbackPill();
    
    const radio = radios[index]; 
    setFreqValorText(formatFreqDisplay(radio.freq, radio.badge));
    updateFreqUnitDisplay(radio.badge || "Rádio FM");
    let nomeBonito = String(radio.name || "Rádio"); 
    if (!nomeBonito.toUpperCase().includes('FM') && (!radio.badge || radio.badge === 'Rádio FM')) nomeBonito = `${nomeBonito} FM`;
    else if (!nomeBonito.toUpperCase().includes('AM') && isAMCategory(radio.badge)) nomeBonito = `${nomeBonito} AM`;
    else if (!nomeBonito.toUpperCase().includes('SW') && !nomeBonito.toUpperCase().includes('OC') && isSWCategory(radio.badge)) nomeBonito = `${nomeBonito} SW`;
    if(estacaoNome) estacaoNome.innerText = nomeBonito; 
    if(statusConexao) statusConexao.innerText = "Sintonizando..."; 
    if (badgePais) badgePais.innerText = getCategoryBadgeLabel(radio.badge);
    resetRDSState();
    
    if(audio) { 
        audio.src = radio.url; 
        audio.loop = (radio.rds === "local_chuva"); 
        if (splashDismissed) {
            audio.play().catch(()=>{}); 
        }
    }
    atualizarPosicaoDial(radio.freq); 
    verificarFavorito(radio.id); 
    renderizarFavoritas(); 
    atualizarTelaDeBloqueio(radio);
    updateCarModeUI();

    const targetF = parseRadioFreq(radio.freq, radio.badge);
    const arrayConflitos = radios.filter(r => Math.abs(parseRadioFreq(r.freq, r.badge) - targetF) < (freqStep * 0.45));
    if (arrayConflitos.length > 1) { if(btnMultiRadio) { btnMultiRadio.classList.remove('hidden'); btnMultiRadio.classList.add('pulse-active'); }
    } else { if(btnMultiRadio) { btnMultiRadio.classList.add('hidden'); btnMultiRadio.classList.remove('pulse-active'); } }
}

function verificarFavorito(id) {
    if(!favIcon) return;
    if (favoritas.includes(id)) { favIcon.classList.replace("fa-regular", "fa-solid"); } else { favIcon.classList.replace("fa-solid", "fa-regular"); }
    const carFavIcon = document.getElementById("car-fav-icon");
    if (carFavIcon) {
        if (favoritas.includes(id)) { carFavIcon.classList.replace("fa-regular", "fa-solid"); } else { carFavIcon.classList.replace("fa-solid", "fa-regular"); }
    }
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
let favLongPressTimer = null;
let favLongPressTriggered = false;

function abrirAtalhoFavoritas() {
    renderizarFavoritas();
    renderProfile();
    const m = document.getElementById("modal-config");
    if (m) m.classList.add("active");
    document.querySelectorAll('#modal-config .tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('#modal-config .tab-btn').forEach(el => el.classList.remove('active'));
    const tabFav = document.getElementById("tab-config-favs");
    if (tabFav) tabFav.classList.add("active");
    const favTabBtn = document.querySelector('#modal-config .tab-btn[onclick*="tab-config-favs"]');
    if (favTabBtn) favTabBtn.classList.add("active");
}

if(btnFav) {
    const startFavPress = () => {
        favLongPressTriggered = false;
        clearTimeout(favLongPressTimer);
        favLongPressTimer = setTimeout(() => {
            favLongPressTriggered = true;
            if (hapticToggle && hapticToggle.checked && navigator.vibrate) navigator.vibrate(25);
            abrirAtalhoFavoritas();
        }, 1000);
    };
    const cancelFavPress = () => {
        clearTimeout(favLongPressTimer);
    };

    btnFav.addEventListener("pointerdown", startFavPress);
    btnFav.addEventListener("pointerup", cancelFavPress);
    btnFav.addEventListener("pointerleave", cancelFavPress);
    btnFav.addEventListener("pointercancel", cancelFavPress);
    btnFav.addEventListener("contextmenu", (e) => e.preventDefault());

    btnFav.addEventListener("click", (e) => {
        if (favLongPressTriggered) {
            e.preventDefault();
            e.stopPropagation();
            favLongPressTriggered = false;
            return;
        }
        if (!estacaoNome || estacaoNome.innerText === "Sem Sinal" || estacaoNome.innerText === "" || radios.length === 0 || !radios[currentIndex]) return; 
        const radioAtual = radios[currentIndex];
        if (favoritas.includes(radioAtual.id)) { favoritas = favoritas.filter(id => id !== radioAtual.id); } else { favoritas.push(radioAtual.id); }
        localStorage.setItem("radar_favoritas", JSON.stringify(favoritas)); verificarFavorito(radioAtual.id); renderizarFavoritas();
        if (currentUser && db) { db.collection("users").doc(currentUser.uid).set({ favoritas: favoritas }, { merge: true }).catch(()=>{}); }
    });
}

function renderizarFavoritas() {
    const listaFav = document.getElementById("favoritas-list"); if(!listaFav) return;
    listaFav.innerHTML = "";
    if (favoritas.length === 0) { listaFav.innerHTML = "<p style='text-align:center; padding: 20px; color: var(--text-muted); font-size: 14px;'>Nenhuma rádio salva.</p>"; return; }
    allRadios.filter(r => favoritas.includes(r.id)).forEach(r => {
        const li = document.createElement("li"); li.className = "station-item";
        const unit = getFreqUnit(r.badge);
        const freqFmt = formatFreqDisplay(r.freq, r.badge);
        li.innerHTML = `<div><strong>${r.name}</strong> (${freqFmt} ${unit})<br><small style="color:var(--text-muted)">${r.city || ''} • ${getCategoryBadgeLabel(r.badge)}</small></div>`;
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


let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
});

window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    closeInstallModal();
});

function isAppStandalone() {
    return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
}

const btnInstallApp = document.getElementById("btn-install-app");
if (btnInstallApp) {
    btnInstallApp.addEventListener("click", async () => {
        const c = document.getElementById("modal-config");
        if (c) c.classList.remove("active");

        if (deferredInstallPrompt) {
            try {
                deferredInstallPrompt.prompt();
                const { outcome } = await deferredInstallPrompt.userChoice;
                if (outcome === 'accepted') {
                    deferredInstallPrompt = null;
                }
                return;
            } catch (err) {}
        }

        openInstallGuideSheet();
    });
}

function openInstallGuideSheet() {
    let overlay = document.getElementById("install-guide-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "install-guide-overlay";
        overlay.className = "ios-action-sheet-overlay";
        overlay.innerHTML = `
            <div class="ios-action-sheet">
                <div class="ios-action-group">
                    <div class="ios-action-header" id="install-sheet-header">Instalar Radar Rádios</div>
                    <div class="pwa-install-box" id="install-sheet-body"></div>
                    <button class="ios-action-btn" id="install-direct-btn" style="display:none; font-weight:700;">Instalar Aplicativo Agora</button>
                </div>
                <button class="ios-action-cancel" onclick="closeInstallModal()">Entendi</button>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.addEventListener("click", (e) => { if (e.target === overlay) closeInstallModal(); });
    }

    const headerEl = overlay.querySelector("#install-sheet-header");
    const bodyEl = overlay.querySelector("#install-sheet-body");
    const directBtn = overlay.querySelector("#install-direct-btn");

    const ua = navigator.userAgent || "";
    const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroid = /Android/i.test(ua);

    if (isAppStandalone()) {
        if (headerEl) headerEl.innerHTML = `<strong style="color:var(--text-primary);font-size:15px;">Aplicativo já instalado</strong>`;
        if (bodyEl) {
            bodyEl.innerHTML = `
                <div style="text-align:center; padding: 10px 0;">
                    <i class="fa-solid fa-circle-check" style="font-size: 36px; color: #34C759; margin-bottom: 10px;"></i>
                    <p>O <strong>Radar Rádios</strong> já está adicionado na sua Tela de Início e rodando em modo aplicativo!</p>
                </div>
            `;
        }
        if (directBtn) directBtn.style.display = "none";
    } else if (isIOS) {
        if (headerEl) headerEl.innerHTML = `<strong style="color:var(--text-primary);font-size:15px;">Adicionar no iPhone / iPad</strong><br>Instale na sua tela inicial em 2 passos:`;
        if (bodyEl) {
            bodyEl.innerHTML = `
                <div class="pwa-install-step">
                    <div class="pwa-step-num">1</div>
                    <div class="pwa-step-text">
                        Toque no ícone de <strong>Compartilhar</strong> <i class="fa-solid fa-arrow-up-from-bracket" style="color:#1f37ba; margin:0 3px;"></i> na barra do navegador Safari.
                        <small>Geralmente fica na parte inferior ou superior da tela.</small>
                    </div>
                </div>
                <div class="pwa-install-step">
                    <div class="pwa-step-num">2</div>
                    <div class="pwa-step-text">
                        Role as opções para baixo e toque em <strong>"Adicionar à Tela de Início"</strong> <i class="fa-regular fa-square-plus" style="color:#1f37ba; margin:0 3px;"></i> e depois em <strong>Adicionar</strong>.
                    </div>
                </div>
            `;
        }
        if (directBtn) directBtn.style.display = "none";
    } else if (isAndroid) {
        if (headerEl) headerEl.innerHTML = `<strong style="color:var(--text-primary);font-size:15px;">Adicionar no Android</strong><br>Tenha acesso rápido direto na sua tela inicial:`;
        if (bodyEl) {
            bodyEl.innerHTML = `
                <div class="pwa-install-step">
                    <div class="pwa-step-num">1</div>
                    <div class="pwa-step-text">
                        Toque no menu de <strong>3 pontinhos</strong> <i class="fa-solid fa-ellipsis-vertical" style="color:#1f37ba; margin:0 4px;"></i> no canto superior direito do navegador.
                    </div>
                </div>
                <div class="pwa-install-step">
                    <div class="pwa-step-num">2</div>
                    <div class="pwa-step-text">
                        Selecione <strong>"Instalar aplicativo"</strong> ou <strong>"Adicionar à tela inicial"</strong> <i class="fa-solid fa-mobile-screen-button" style="color:#1f37ba; margin:0 3px;"></i> e confirme.
                    </div>
                </div>
            `;
        }
        if (directBtn) {
            if (deferredInstallPrompt) {
                directBtn.style.display = "block";
                directBtn.onclick = async () => {
                    closeInstallModal();
                    deferredInstallPrompt.prompt();
                    const { outcome } = await deferredInstallPrompt.userChoice;
                    if (outcome === 'accepted') deferredInstallPrompt = null;
                };
            } else {
                directBtn.style.display = "none";
            }
        }
    } else {
        if (headerEl) headerEl.innerHTML = `<strong style="color:var(--text-primary);font-size:15px;">Instalar no Computador (Windows / Mac)</strong><br>Use o Radar Rádios como um programa nativo:`;
        if (bodyEl) {
            bodyEl.innerHTML = `
                <div class="pwa-install-step">
                    <div class="pwa-step-num">1</div>
                    <div class="pwa-step-text">
                        Olhe no canto direito da <strong>barra de endereço</strong> do seu navegador (Chrome ou Edge) e clique no ícone de <strong>Instalar</strong> <i class="fa-solid fa-download" style="color:#1f37ba; margin:0 3px;"></i>.
                    </div>
                </div>
                <div class="pwa-install-step">
                    <div class="pwa-step-num">2</div>
                    <div class="pwa-step-text">
                        Ou clique nos <strong>3 pontinhos</strong> no topo do navegador e escolha <strong>"Salvar e compartilhar" &gt; "Instalar Radar Rádios"</strong>.
                    </div>
                </div>
            `;
        }
        if (directBtn) {
            if (deferredInstallPrompt) {
                directBtn.style.display = "block";
                directBtn.onclick = async () => {
                    closeInstallModal();
                    deferredInstallPrompt.prompt();
                    const { outcome } = await deferredInstallPrompt.userChoice;
                    if (outcome === 'accepted') deferredInstallPrompt = null;
                };
            } else {
                directBtn.style.display = "none";
            }
        }
    }

    requestAnimationFrame(() => { overlay.classList.add("active"); });
}

window.closeInstallModal = function() {
    const overlay = document.getElementById("install-guide-overlay");
    if (overlay) overlay.classList.remove("active");
};


let quickFeedbackTimer = null;
let quickFeedbackHideTimer = null;
let quickFeedbackStep = 1;
let quickFeedbackRadio = null;
let quickFeedbackShownSession = {};
let quickFeedbackMutedDueToNoInteraction = false;
let quickFeedbackInteractedCurrent = false;
const FEEDBACK_COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

function salvarHistoricoFeedbackEstacao(radioId, markRated = false) {
    if (!radioId) return;
    const now = Date.now();
    const prev = userFeedbackHistory[radioId] || {};
    userFeedbackHistory[radioId] = {
        rated: Boolean(prev.rated || markRated),
        lastCheckAt: now,
        lastInteractedAt: now
    };
    localStorage.setItem("radar_feedback_history", JSON.stringify(userFeedbackHistory));
    if (currentUser && db) {
        db.collection("users").doc(currentUser.uid).set({
            feedbackHistory: userFeedbackHistory
        }, { merge: true }).catch(()=>{});
    }
}

function devePedirFeedbackEstacao(radioId) {
    if (!radioId) return false;
    const rec = userFeedbackHistory[radioId];
    if (!rec || !rec.lastCheckAt) return true;
    const diff = Date.now() - Number(rec.lastCheckAt);
    return diff >= FEEDBACK_COOLDOWN_MS;
}

function jaAvaliouGostoEstacao(radioId) {
    if (!radioId) return false;
    const rec = userFeedbackHistory[radioId];
    return Boolean(rec && rec.rated);
}

function clearQuickFeedbackTimers() {
    if (quickFeedbackTimer) {
        clearTimeout(quickFeedbackTimer);
        quickFeedbackTimer = null;
    }
    if (quickFeedbackHideTimer) {
        clearTimeout(quickFeedbackHideTimer);
        quickFeedbackHideTimer = null;
    }
}

function hideQuickFeedbackPill() {
    clearQuickFeedbackTimers();
    const pill = document.getElementById("quick-feedback-pill");
    if (pill) pill.classList.add("hidden");
}

function startQuickFeedbackCountdown(radio) {
    clearQuickFeedbackTimers();
    if (!radio || !radio.id) return;
    if (quickFeedbackMutedDueToNoInteraction) return;
    if (quickFeedbackShownSession[radio.id]) return;
    if (!devePedirFeedbackEstacao(radio.id)) return;

    quickFeedbackTimer = setTimeout(() => {
        if (!audio || audio.paused) return;
        const currentR = radios[currentIndex];
        if (!currentR || currentR.id !== radio.id) return;
        showQuickFeedbackStep1(currentR);
    }, 5000);
}

function showQuickFeedbackStep1(radio) {
    const pill = document.getElementById("quick-feedback-pill");
    const textEl = document.getElementById("quick-feedback-text");
    const actionsEl = document.getElementById("quick-feedback-actions");
    if (!pill || !textEl || !actionsEl) return;

    quickFeedbackRadio = radio;
    quickFeedbackStep = 1;
    quickFeedbackInteractedCurrent = false;
    quickFeedbackShownSession[radio.id] = true;

    textEl.innerHTML = `<i class="fa-solid fa-tower-broadcast" style="color:#4a65f0; font-size:12px;"></i> A rádio está tocando?`;
    actionsEl.style.display = "flex";
    pill.classList.remove("hidden");

    clearTimeout(quickFeedbackHideTimer);
    quickFeedbackHideTimer = setTimeout(() => {
        if (!quickFeedbackInteractedCurrent) {
            quickFeedbackMutedDueToNoInteraction = true;
        }
        hideQuickFeedbackPill();
    }, 5000);
}

function showQuickFeedbackStep2() {
    const textEl = document.getElementById("quick-feedback-text");
    const actionsEl = document.getElementById("quick-feedback-actions");
    if (!textEl || !actionsEl) return;

    quickFeedbackStep = 2;
    textEl.innerHTML = `<i class="fa-solid fa-heart" style="color:#ff2d55; font-size:12px;"></i> Está gostando desta rádio?`;
    actionsEl.style.display = "flex";

    clearTimeout(quickFeedbackHideTimer);
    quickFeedbackHideTimer = setTimeout(() => {
        hideQuickFeedbackPill();
    }, 5000);
}

function showQuickFeedbackThanks() {
    const textEl = document.getElementById("quick-feedback-text");
    const actionsEl = document.getElementById("quick-feedback-actions");
    if (!textEl || !actionsEl) return;

    quickFeedbackStep = 3;
    actionsEl.style.display = "none";
    textEl.innerHTML = `<i class="fa-solid fa-circle-check" style="color:#34C759; font-size:14px;"></i> Obrigado pelo seu feedback!`;

    clearTimeout(quickFeedbackHideTimer);
    quickFeedbackHideTimer = setTimeout(() => {
        hideQuickFeedbackPill();
    }, 2800);
}

function registrarConfirmacaoTocando(radio) {
    if (!radio || !radio.id) return;
    salvarHistoricoFeedbackEstacao(radio.id, false);
}

function registrarAvaliacaoRadio(radio, gostou) {
    if (!radio) return;
    if (radio.id) {
        salvarHistoricoFeedbackEstacao(radio.id, true);
    }
    if (!db) return;
    const fieldName = gostou ? "likesCount" : "dislikesCount";
    const statusLabel = gostou ? "Gostou da Rádio 👍" : "Não Gostou da Rádio 👎";

    db.collection("radios").doc(radio.id).set({
        [fieldName]: firebase.firestore.FieldValue.increment(1)
    }, { merge: true }).catch(()=>{});

    db.collection("station_feedback").add({
        radioId: radio.id || "",
        radioName: radio.name || "",
        radioFreq: radio.freq || "",
        radioCity: radio.city || "",
        status: statusLabel,
        ratingType: gostou ? "like" : "dislike",
        note: "Avaliação rápida após 5s de sintonia",
        userUid: currentUser ? currentUser.uid : getDeviceUid(),
        createdAt: new Date().toISOString(),
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(()=>{});
}

const qfBtnUp = document.getElementById("qf-btn-up");
const qfBtnDown = document.getElementById("qf-btn-down");

if (qfBtnUp) {
    qfBtnUp.addEventListener("click", (e) => {
        e.stopPropagation();
        quickFeedbackInteractedCurrent = true;
        quickFeedbackMutedDueToNoInteraction = false;
        if (hapticToggle && hapticToggle.checked && navigator.vibrate) navigator.vibrate(12);
        const targetRadio = quickFeedbackRadio || radios[currentIndex];
        if (quickFeedbackStep === 1) {
            if (targetRadio && jaAvaliouGostoEstacao(targetRadio.id)) {
                registrarConfirmacaoTocando(targetRadio);
                showQuickFeedbackThanks();
            } else {
                registrarConfirmacaoTocando(targetRadio);
                showQuickFeedbackStep2();
            }
        } else if (quickFeedbackStep === 2) {
            registrarAvaliacaoRadio(targetRadio, true);
            showQuickFeedbackThanks();
        }
    });
}

if (qfBtnDown) {
    qfBtnDown.addEventListener("click", (e) => {
        e.stopPropagation();
        quickFeedbackInteractedCurrent = true;
        quickFeedbackMutedDueToNoInteraction = false;
        if (hapticToggle && hapticToggle.checked && navigator.vibrate) navigator.vibrate(12);
        const targetRadio = quickFeedbackRadio || radios[currentIndex];
        if (quickFeedbackStep === 1) {
            if (targetRadio && targetRadio.id) {
                salvarHistoricoFeedbackEstacao(targetRadio.id, false);
            }
            hideQuickFeedbackPill();
            openFeedbackSelector();
        } else if (quickFeedbackStep === 2) {
            registrarAvaliacaoRadio(targetRadio, false);
            showQuickFeedbackThanks();
        }
    });
}


let alarmConfig = { active: false, time: "07:00", stationId: "", lastTriggeredDate: "" };
try {
    const savedAlarm = JSON.parse(localStorage.getItem("radar_alarm_config"));
    if (savedAlarm && typeof savedAlarm === "object") {
        alarmConfig = { ...alarmConfig, ...savedAlarm };
    }
} catch(e) {}

let alarmCheckInterval = null;
let alarmFadeInterval = null;

function updateAlarmIndicators() {
    const badgeEl = document.getElementById("alarm-display");
    const statusLabel = document.getElementById("alarm-status-label");
    if (alarmConfig.active && alarmConfig.time) {
        if (badgeEl) {
            badgeEl.innerText = `ALR ${alarmConfig.time}`;
            badgeEl.classList.remove("hidden");
        }
        if (statusLabel) statusLabel.innerText = alarmConfig.time;
    } else {
        if (badgeEl) badgeEl.classList.add("hidden");
        if (statusLabel) statusLabel.innerText = "Desativado";
    }
}

function populateAlarmStationsSelect() {
    const select = document.getElementById("alarm-station-select");
    if (!select) return;
    select.innerHTML = "";
    const currentR = radios[currentIndex];
    const defaultId = alarmConfig.stationId || (currentR ? currentR.id : "");

    allRadios.forEach(r => {
        const opt = document.createElement("option");
        opt.value = r.id;
        const unit = getFreqUnit(r.badge);
        const freqFmt = formatFreqDisplay(r.freq, r.badge);
        opt.innerText = `${r.name} (${freqFmt} ${unit})`;
        if (r.id === defaultId) opt.selected = true;
        select.appendChild(opt);
    });
}

function abrirModalDespertador() {
    const mdl = document.getElementById("modal-despertador");
    if (!mdl) return;
    populateAlarmStationsSelect();
    const timeInp = document.getElementById("alarm-time-input");
    const activeToggle = document.getElementById("alarm-active-toggle");
    if (timeInp) timeInp.value = alarmConfig.time || "07:00";
    if (activeToggle) activeToggle.checked = Boolean(alarmConfig.active);
    mdl.classList.add("active");
}

const btnConfigAlarm = document.getElementById("btn-config-alarm");
if (btnConfigAlarm) {
    btnConfigAlarm.addEventListener("click", () => {
        const c = document.getElementById("modal-config");
        if (c) c.classList.remove("active");
        abrirModalDespertador();
    });
}

document.querySelectorAll(".fechar-modal-despertador").forEach(btn => {
    btn.addEventListener("click", () => {
        const m = document.getElementById("modal-despertador");
        if (m) m.classList.remove("active");
    });
});

const btnSaveAlarm = document.getElementById("btn-save-alarm");
if (btnSaveAlarm) {
    btnSaveAlarm.addEventListener("click", () => {
        const timeInp = document.getElementById("alarm-time-input");
        const stationSel = document.getElementById("alarm-station-select");
        const activeToggle = document.getElementById("alarm-active-toggle");

        alarmConfig.time = (timeInp && timeInp.value) ? timeInp.value : "07:00";
        alarmConfig.stationId = stationSel ? stationSel.value : "";
        alarmConfig.active = activeToggle ? activeToggle.checked : false;
        alarmConfig.lastTriggeredDate = "";

        localStorage.setItem("radar_alarm_config", JSON.stringify(alarmConfig));
        updateAlarmIndicators();

        const m = document.getElementById("modal-despertador");
        if (m) m.classList.remove("active");

        if (alarmConfig.active) {
            requestWakeLock();
            alert(`Despertador programado para ${alarmConfig.time}.`);
        } else {
            alert("Despertador desativado.");
        }
    });
}

function triggerAlarmRadio() {
    if (!audio) return;
    splashDismissed = true;
    if (splashScreen) splashScreen.classList.add("hidden");

    if (alarmConfig.stationId && allRadios.some(r => r.id === alarmConfig.stationId)) {
        loadRadioById(alarmConfig.stationId);
    }

    clearInterval(alarmFadeInterval);
    audio.volume = 0.05;
    audio.play().catch(() => {});
    if (playIcon) playIcon.className = "fa-solid fa-pause";

    let currentVol = 0.05;
    alarmFadeInterval = setInterval(() => {
        currentVol += 0.05;
        if (currentVol >= 1.0) {
            audio.volume = 1.0;
            clearInterval(alarmFadeInterval);
        } else {
            audio.volume = Number(currentVol.toFixed(2));
        }
    }, 1500);
}

function startAlarmMonitor() {
    updateAlarmIndicators();
    clearInterval(alarmCheckInterval);
    alarmCheckInterval = setInterval(() => {
        if (!alarmConfig.active || !alarmConfig.time) return;
        const now = new Date();
        const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        const todayStr = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

        if (hhmm === alarmConfig.time && alarmConfig.lastTriggeredDate !== todayStr) {
            alarmConfig.lastTriggeredDate = todayStr;
            localStorage.setItem("radar_alarm_config", JSON.stringify(alarmConfig));
            triggerAlarmRadio();
        }
    }, 5000);
}
startAlarmMonitor();


let wakeLockSentinel = null;
let isCarModeActive = false;

async function requestWakeLock() {
    if ('wakeLock' in navigator) {
        try {
            if (!wakeLockSentinel) {
                wakeLockSentinel = await navigator.wakeLock.request('screen');
                wakeLockSentinel.addEventListener('release', () => {
                    wakeLockSentinel = null;
                });
            }
        } catch (e) {}
    }
}

function releaseWakeLock() {
    if (wakeLockSentinel && !alarmConfig.active) {
        try {
            wakeLockSentinel.release();
            wakeLockSentinel = null;
        } catch (e) {}
    }
}

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible' && (isCarModeActive || alarmConfig.active)) {
        requestWakeLock();
    }
});

function updateCarModeUI() {
    const overlay = document.getElementById("car-mode-overlay");
    if (!overlay || overlay.classList.contains("hidden")) return;

    const radio = radios[currentIndex];
    if (!radio) return;

    const freqEl = document.getElementById("car-freq-val");
    const unitEl = document.getElementById("car-freq-unit");
    const nameEl = document.getElementById("car-station-name");
    const rdsEl = document.getElementById("car-rds-line");
    const playIc = document.getElementById("car-play-icon");
    const favIc = document.getElementById("car-fav-icon");

    if (freqEl) freqEl.innerText = formatFreqDisplay(radio.freq, radio.badge);
    if (unitEl) unitEl.innerText = getFreqUnit(radio.badge);

    let nomeBonito = String(radio.name || "Rádio");
    if (!nomeBonito.toUpperCase().includes('FM') && (!radio.badge || radio.badge === 'Rádio FM')) nomeBonito = `${nomeBonito} FM`;
    else if (!nomeBonito.toUpperCase().includes('AM') && isAMCategory(radio.badge)) nomeBonito = `${nomeBonito} AM`;
    else if (!nomeBonito.toUpperCase().includes('SW') && !nomeBonito.toUpperCase().includes('OC') && isSWCategory(radio.badge)) nomeBonito = `${nomeBonito} SW`;
    if (nameEl) nameEl.innerText = nomeBonito;

    const rdsTextEl = document.getElementById("rds-text");
    const rdsCurrent = (rdsTextEl && rdsTextEl.innerText.trim() !== "" && !rdsTextEl.innerText.includes("Buscando"))
        ? rdsTextEl.innerText.trim()
        : (radio.slogan && String(radio.slogan).trim() !== "" ? radio.slogan : `${radio.city || ""} • ${radio.genre || ""}`);
    if (rdsEl) rdsEl.innerText = rdsCurrent;

    if (playIc && audio) {
        playIc.className = audio.paused ? "fa-solid fa-play" : "fa-solid fa-pause";
    }
    if (favIc) {
        if (favoritas.includes(radio.id)) {
            favIc.classList.replace("fa-regular", "fa-solid");
        } else {
            favIc.classList.replace("fa-solid", "fa-regular");
        }
    }
}

let isCarHudMirrored = false;

function applyCarHudState() {
    const overlay = document.getElementById("car-mode-overlay");
    const hudBtn = document.getElementById("btn-car-hud");
    const hudLabel = document.getElementById("car-hud-label");
    if (overlay) overlay.classList.toggle("hud-mirrored", isCarHudMirrored);
    if (hudBtn) hudBtn.classList.toggle("active", isCarHudMirrored);
    if (hudLabel) hudLabel.innerText = isCarHudMirrored ? "Tela Normal" : "Espelhar no Vidro (HUD)";
}

function openCarMode() {
    const overlay = document.getElementById("car-mode-overlay");
    if (!overlay) return;
    isCarModeActive = true;
    applyCarHudState();
    overlay.classList.remove("hidden");
    updateCarModeUI();
    requestWakeLock();
}

function closeCarMode() {
    const overlay = document.getElementById("car-mode-overlay");
    if (!overlay) return;
    isCarModeActive = false;
    isCarHudMirrored = false;
    applyCarHudState();
    overlay.classList.add("hidden");
    releaseWakeLock();
}

const btnCarHud = document.getElementById("btn-car-hud");
if (btnCarHud) {
    btnCarHud.addEventListener("click", () => {
        isCarHudMirrored = !isCarHudMirrored;
        if (hapticToggle && hapticToggle.checked && navigator.vibrate) navigator.vibrate(15);
        applyCarHudState();
    });
}

const btnConfigCar = document.getElementById("btn-config-car");
if (btnConfigCar) {
    btnConfigCar.addEventListener("click", () => {
        const c = document.getElementById("modal-config");
        if (c) c.classList.remove("active");
        openCarMode();
    });
}

const btnCloseCarMode = document.getElementById("btn-close-car-mode");
if (btnCloseCarMode) {
    btnCloseCarMode.addEventListener("click", closeCarMode);
}

const carBtnPlay = document.getElementById("car-btn-play");
if (carBtnPlay) {
    carBtnPlay.addEventListener("click", () => {
        if (playBtn) playBtn.click();
        setTimeout(updateCarModeUI, 80);
    });
}

const carBtnPrev = document.getElementById("car-btn-prev");
if (carBtnPrev) {
    carBtnPrev.addEventListener("click", () => {
        const b = document.getElementById("btn-prev");
        if (b) b.click();
        setTimeout(updateCarModeUI, 80);
    });
}

const carBtnNext = document.getElementById("car-btn-next");
if (carBtnNext) {
    carBtnNext.addEventListener("click", () => {
        const b = document.getElementById("btn-next");
        if (b) b.click();
        setTimeout(updateCarModeUI, 80);
    });
}

const carBtnFav = document.getElementById("car-btn-fav");
if (carBtnFav) {
    carBtnFav.addEventListener("click", () => {
        if (btnFav) btnFav.click();
        setTimeout(updateCarModeUI, 80);
    });
}

initOfflineFirst();
