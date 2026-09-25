const radiosRaw = [
    { id: "radar-chuva", name: "Rádio Radar - Chuva", freq: "85.0", city: "Muriaé - MG", genre: "Relaxar", url: "https://raw.githubusercontent.com/althierestm/Radar-Radios-App/main/R%C3%A1dios/Radio%20Radar%20-%20Radio%20Chuva.mp3", rds: "local_chuva", badge: "Web Rádio" },
    { id: "radar-fm", name: "Radar FM", freq: "87.9", city: "Muriaé - MG", genre: "Eclética", url: "https://stream.zeno.fm/qrothx4gudetv", rds: "https://api.zeno.fm/mounts/metadata/subscribe/d42wceognggtv", badge: "Rádio FM" },
    { id: "fm-o-dia", name: "FM o Dia", freq: "100.5", city: "Rio de Janeiro - RJ", genre: "Hits", url: "https://streaming.livespanel.com:8016/fmodia", rds: "https://www.fmodia.com.br/wp-admin/admin-ajax.php?action=get_live_infos", badge: "Rádio FM" },
    { id: "bh-fm", name: "BH FM", freq: "102.1", city: "Belo Horizonte - MG", genre: "Eclética", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/BHFMAAC.aac?dist=radioscombr&1790281491381", rds: "https://s3.glbimg.com/v1/AUTH_3ec28e89a5754c7b937cbc7ade6b1ace/api/grade_bhfm.json", badge: "Rádio FM" },
    { id: "jere-fm", name: "JERE FM", freq: "106.9", city: "Jeremoabo - BA", genre: "Eclética", url: "https://1.stmip.net:2044/stream", badge: "Rádio FM" },
    { id: "hunter-80s", name: "Hunter Anos 80", freq: "106.9", city: "Brasília - DF", genre: "Flashback", url: "https://hls.hunter.fm/80s/64.m3u8?shtl=OR99PlKze7mgR_U1AF_NVQZ0.dLFtA%2FSwg6Gi%2Fh77nRQTbBFiELSZm%2BOueXvqQcHVqGs", rds: "https://api.hunter.fm/stations/live", badge: "Web Rádio" },
    { id: "energia-97", name: "Energia 97", freq: "97.7", city: "São Paulo - SP", genre: "Eletrônica/Pop", url: "https://streaming.inweb.com.br/energia", badge: "Rádio FM" },
    { id: "salvador-fm", name: "Salvador FM", freq: "92.3", city: "Salvador - BA", genre: "Eclética", url: "https://streaming.livespanel.com:9230/ssafm9230", badge: "Rádio FM" },
    { id: "hunter-pop", name: "Hunter Pop", freq: "92.3", city: "Brasília - DF", genre: "Pop", url: "https://hls.hunter.fm/pop/64.m3u8?shtl=OR99PlKze7mgR_U1AF_NVQZ0.dLFtA%2FSwg6Gi%2Fh77nRQTbBFiELSZm%2BOueXvqQcHVqGs", rds: "https://api.hunter.fm/stations/live", badge: "Web Rádio" },
    { id: "hunter-pagode", name: "Hunter Pagode", freq: "94.1", city: "Brasília - DF", genre: "Samba/Pagode", url: "https://hls.hunter.fm/pagode/64.m3u8?shtl=rLegrEjjYDLNiSScageIw8HO.tFEvhucVcOviAxNp1EnuCrAm7v1GpVOQdCA6q2VZ0CA", rds: "https://api.hunter.fm/stations/live", badge: "Web Rádio" },
    { id: "hunter-sertanejo", name: "Hunter Sertanejo", freq: "90.5", city: "Brasília - DF", genre: "Sertanejo", url: "https://hls.hunter.fm/sertanejo/64.m3u8?shtl=rLegrEjjYDLNiSScageIw8HO.tFEvhucVcOviAxNp1EnuCrAm7v1GpVOQdCA6q2VZ0CA", rds: "https://api.hunter.fm/stations/live", badge: "Web Rádio" },
    { id: "hunter-hits", name: "Hunter Hits", freq: "101.3", city: "Brasília - DF", genre: "Hits Brasil", url: "https://hls.hunter.fm/hitsbrasil/64.m3u8?shtl=7KWu3SjMvgY-GhV1-8B6b9rB.lpykqpyxgqfSK4vGJSb3tqheOVp2UggEshcePVZJDVw", rds: "https://api.hunter.fm/stations/live", badge: "Web Rádio" },
    { id: "hunter-pisadinha", name: "Hunter Pisadinha", freq: "98.1", city: "Brasília - DF", genre: "Forró", url: "https://hls.hunter.fm/pisadinha/64.m3u8?shtl=rLegrEjjYDLNiSScageIw8HO.tFEvhucVcOviAxNp1EnuCrAm7v1GpVOQdCA6q2VZ0CA", rds: "https://api.hunter.fm/stations/live", badge: "Web Rádio" },
    { id: "hunter-kpop", name: "Hunter K-Pop", freq: "102.5", city: "Brasília - DF", genre: "K-Pop", url: "https://stream.hunter.fm/kpop/64.m3u8", rds: "https://api.hunter.fm/stations/live", badge: "Web Rádio" },
    { id: "hunter-pop2k", name: "Hunter Pop 2K", freq: "104.5", city: "Brasília - DF", genre: "Pop 2000", url: "https://hls.hunter.fm/pop2k/64.m3u8?shtl=OR99PlKze7mgR_U1AF_NVQZ0.dLFtA%2FSwg6Gi%2Fh77nRQTbBFiELSZm%2BOueXvqQcHVqGs", rds: "https://api.hunter.fm/stations/live", badge: "Web Rádio" },
    { id: "hunter-gospel", name: "Hunter Gospel", freq: "103.1", city: "Brasília - DF", genre: "Gospel", url: "https://hls.hunter.fm/gospel/64.m3u8?shtl=OR99PlKze7mgR_U1AF_NVQZ0.dLFtA%2FSwg6Gi%2Fh77nRQTbBFiELSZm%2BOueXvqQcHVqGs", rds: "https://api.hunter.fm/stations/live", badge: "Web Rádio" },
    { id: "hunter-moda", name: "Hunter Moda", freq: "105.7", city: "Brasília - DF", genre: "Sertanejo Raiz", url: "https://hls.hunter.fm/modasertaneja/64.m3u8?shtl=OR99PlKze7mgR_U1AF_NVQZ0.dLFtA%2FSwg6Gi%2Fh77nRQTbBFiELSZm%2BOueXvqQcHVqGs", rds: "https://api.hunter.fm/stations/live", badge: "Web Rádio" },
    { id: "hunter-tropical", name: "Hunter Tropical", freq: "107.9", city: "Brasília - DF", genre: "Brasilidades", url: "https://hls.hunter.fm/tropical/64.m3u8?shtl=OR99PlKze7mgR_U1AF_NVQZ0.dLFtA%2FSwg6Gi%2Fh77nRQTbBFiELSZm%2BOueXvqQcHVqGs", rds: "https://api.hunter.fm/stations/live", badge: "Web Rádio" },
    { id: "hunter-rock", name: "Hunter Rock", freq: "96.7", city: "Brasília - DF", genre: "Rock", url: "https://hls.hunter.fm/rock/64.m3u8?shtl=OR99PlKze7mgR_U1AF_NVQZ0.dLFtA%2FSwg6Gi%2Fh77nRQTbBFiELSZm%2BOueXvqQcHVqGs", rds: "https://api.hunter.fm/stations/live", badge: "Web Rádio" },
    { id: "hunter-lofi", name: "Hunter LoFi", freq: "107.5", city: "Brasília - DF", genre: "Lo-Fi", url: "https://stream.hunter.fm/lofi/64.m3u8", rds: "https://api.hunter.fm/stations/live", badge: "Web Rádio" },
    { id: "radio-pop", name: "Rádio POP", freq: "88.5", city: "Web", genre: "Pop", url: "https://virtues.live:8254/stream", badge: "Web Rádio" },
    { id: "euclides-cunha", name: "Euclides da Cunha", freq: "91.1", city: "Euclides da Cunha - BA", genre: "Eclética", url: "https://servidor25-2.brlogic.com:8024/live", badge: "Rádio FM" },
    { id: "gospel-inter", name: "Gospel Inter", freq: "95.5", city: "Web", genre: "Gospel", url: "https://stream.vagalume.fm/hls/1470245767122628/aac.m3u8", badge: "Web Rádio" },
    { id: "antena-1", name: "Antena 1", freq: "94.7", city: "São Paulo - SP", genre: "Adulto Contemporâneo", url: "https://antenaone.crossradio.com.br/stream/1", badge: "Rádio FM" },
    { id: "jp-fm", name: "Jovem Pan FM", freq: "100.9", city: "São Paulo - SP", genre: "Pop/Hits", url: "https://stream.zeno.fm/c45wbq2us3buv", badge: "Rádio FM" },
    { id: "jp-news", name: "Jovem Pan News", freq: "76.7", city: "São Paulo - SP", genre: "Notícias", url: "https://stream.zeno.fm/vlcraijc6yiuv", badge: "Rádio FM" },
    { id: "brado-radio", name: "Brado Rádio", freq: "93.1", city: "Prado - BA", genre: "Notícias", url: "https://servidor17-5.brlogic.com:8300/live", badge: "Rádio FM" },
    { id: "web-jp", name: "Web Rádio JP", freq: "100.1", city: "Web", genre: "Eclética", url: "https://stream.zeno.fm/a7klgcfvvw9uv", badge: "Web Rádio" },
    { id: "cidade-ba", name: "Rádio Cidade BA", freq: "95.9", city: "Bahia", genre: "Pop/Hits", url: "https://streaming.livespanel.com:20959/cidadefmlem", badge: "Rádio FM" },
    { id: "mix-bahia", name: "Mix Bahia", freq: "89.3", city: "Bahia", genre: "Pop", url: "https://8175.brasilstream.com.br/stream", badge: "Rádio FM" },
    { id: "lairton-teclas", name: "Lairton Teclas", freq: "91.7", city: "Web", genre: "Variedades", url: "https://stream.zeno.fm/rv1w865yaphvv", badge: "Web Rádio" },
    { id: "onda-beat", name: "Radio Onda Beat", freq: "101.1", city: "Litoral", genre: "Hits", url: "https://www.quinsanbroadcast.com.br:8040/101FM_LITORAL", badge: "Rádio FM" },
    { id: "96fm-natal", name: "96 FM Natal", freq: "96.7", city: "Natal - RN", genre: "Pop", url: "http://r10.ciclano.io:6258/stream?1790357297749;", badge: "Rádio FM" },
    { id: "arapuan-fm", name: "Arapuan FM", freq: "95.3", city: "João Pessoa - PB", genre: "Eclética", url: "https://streaming.engelhosting.com.br:10026/stream", badge: "Rádio FM" },
    { id: "wlni", name: "WLNI", freq: "105.9", city: "Web", genre: "Notícias", url: "https://ice66.securenetsystems.net/WLNI?playSessionID=BB4B565D-8260-47E9-BF1E5A6D474DAC8C&source=TuneIn", badge: "Web Rádio" },
    { id: "on-charts", name: "ON Charts", freq: "102.1", city: "Web", genre: "Hits", url: "https://0n-charts.radionetz.de/0n-charts.aac", badge: "Web Rádio" },
    { id: "radio-96", name: "Rádio 96 FM", freq: "96.1", city: "Web", genre: "Eclética", url: "https://cast2.youngtech.radio.br:8130/radio", badge: "Web Rádio" },
    { id: "radio-videira", name: "Rádio Videira", freq: "88.1", city: "Videira - SC", genre: "Eclética", url: "https://5a2b083e9f360.streamlock.net/radiovideira/radiovideira.stream/playlist.m3u8", badge: "Rádio FM" },
    { id: "vicosa-95", name: "Rádio Viçosa", freq: "95.1", city: "Viçosa - MG", genre: "Eclética", url: "https://stm1.streamproarte.com.br:7494/stream", badge: "Rádio FM" },
    { id: "country-88", name: "Country 88", freq: "88.1", city: "Web", genre: "Country", url: "https://goldenwest.leanstream.co/CKMWFM?args=tunein_03", badge: "Web Rádio" },
    { id: "plaisir-1055", name: "Plaisir", freq: "105.5", city: "Web", genre: "Eclética", url: "https://playerservices.streamtheworld.com/api/livestream-redirect/CKLD_FM.mp3", badge: "Web Rádio" },
    { id: "chiru-fm", name: "Rádio Chiru FM", freq: "104.3", city: "Web", genre: "Eclética", url: "https://stm01.virtualcast.com.br:8366/live", badge: "Web Rádio" },
    { id: "highway-1", name: "Highway 1 Radio", freq: "99.1", city: "Web", genre: "Eclética", url: "https://bonneville.cdnstream1.com/2625_48.aac?aw_0_1st.playerid=TuneIn&aw_0_1st.skey=1729796666&lat=41.8874&lon=-87.6318&aw_0_1st.abtest=&aw_0_1st.stationId=s309452&aw_0_1st.premium=false&source=TuneIn&aw_0_1st.platform=tunein&aw_0_1st.genre_id=g115&aw_0_1st.class=music&aw_0_1st.ads_partner_alias=ce.Other&aw_0_azn.planguage=en&aw_0_1st.is_ondemand=false&aw_0_1st.topicId=na&aw_0_1st.affiliateIds=a38448%2ca40075&aw_0_1st.bandId=16", badge: "Web Rádio" },
    { id: "nash-1025", name: "NASH FM", freq: "102.5", city: "Web", genre: "Country", url: "https://cast2.youngtech.radio.br:8130/radio", badge: "Web Rádio" },
    { id: "peaceful-piano", name: "Peaceful Piano", freq: "103.3", city: "Web", genre: "Clássica", url: "https://peacefulpiano.stream.publicradio.org/peacefulpiano.aac?srcid=tunein", badge: "Web Rádio" },
    { id: "brian-fm-wanaka", name: "Brian FM Wanaka", freq: "100.5", city: "Web", genre: "Rock", url: "https://ais-sa1.streamon.fm/7657_128k.aac", badge: "Web Rádio" },
    { id: "brian-fm-chch", name: "Brian FM Christchurch", freq: "105.3", city: "Web", genre: "Rock", url: "https://ais-sa1.streamon.fm/7409_128k.aac", badge: "Web Rádio" },
    { id: "rtl-2000er", name: "89.0 RTL", freq: "89.1", city: "Web", genre: "Pop", url: "https://stream.89.0rtl.de/2000er/mp3-256/tunein/", badge: "Web Rádio" },
    { id: "maxximum", name: "Maxximum", freq: "97.3", city: "Web", genre: "Eletrônica", url: "https://stream.rcs.revma.com/nwhyn2c6p98uv.mp3", badge: "Web Rádio" },
    { id: "children", name: "YourClassical Children", freq: "91.5", city: "Web", genre: "Clássica", url: "https://classicalkids.stream.publicradio.org/classicalkids.aac?srcid=tunein", badge: "Web Rádio" },
    { id: "rnb-radio", name: "RnB Radio", freq: "90.1", city: "Web", genre: "R&B", url: "https://listen.radioking.com/radio/181987/stream/223822", badge: "Web Rádio" },
    { id: "capital-sp", name: "Rádio Capital", freq: "77.5", city: "São Paulo - SP", genre: "Jornalismo", url: "https://ice.fabricahost.com.br/capitalfmsp", badge: "Rádio AM" },
    { id: "cruz-alta", name: "Rádio Cruz Alta", freq: "103.5", city: "Cruz Alta - RS", genre: "Eclética", url: "https://cast2.youngtech.radio.br:8150/radio", badge: "Rádio FM" },
    { id: "norte-fm", name: "Norte FM", freq: "101.5", city: "Brasília - DF", genre: "Notícias", url: "https://live8.livemus.com.br:27246/stream", badge: "Rádio FM" },
    { id: "purcell", name: "PURCELL", freq: "102.7", city: "Web", genre: "Eclética", url: "https://tunein-live-b.cdnstream1.com/3788_128.mp3?aw_0_1st.skey=1729809658&lat=36.6676&lon=-78.3875&aw_0_1st.abtest=&aw_0_1st.stationId=s221680&aw_0_1st.premium=false&source=TuneIn&aw_0_1st.platform=tunein&aw_0_1st.genre_id=g5&aw_0_1st.class=music&aw_0_1st.ads_partner_alias=ce.Other&aw_0_azn.planguage=en&aw_0_1st.is_ondemand=false&aw_0_1st.topicId=na&aw_0_1st.affiliateIds=a40075%2ca38725&aw_0_1st.bandId=16", badge: "Web Rádio" },
    { id: "diario-sertao", name: "Diário do Sertão", freq: "97.5", city: "Cajazeiras - PB", genre: "Notícias", url: "https://5a2b083e9f360.streamlock.net/pdsertao/pdsertao.stream/playlist.m3u8", badge: "Rádio FM" },
    { id: "transamerica-aju", name: "Transamérica", freq: "90.5", city: "Aracaju - SE", genre: "Pop/Hits", url: "https://ice.fabricahost.com.br/transamericaaracaju", badge: "Rádio FM" },
    { id: "radio-brasil", name: "Rádio Brasil", freq: "104.1", city: "Web", genre: "Eclética", url: "https://r13.ciclano.io:8417/stream", badge: "Web Rádio" },
    { id: "viola-viva", name: "Viola Viva", freq: "99.3", city: "Web", genre: "Sertanejo", url: "https://centova.euroti.com.br:20055/stream", badge: "Web Rádio" },
    { id: "wljf", name: "WLJF", freq: "100.7", city: "Web", genre: "Gospel", url: "https://stream.abacast.net/playlist/loveandfaith-wljffmaac-ibc2.m3u?source=TuneIn", badge: "Web Rádio" },
    { id: "96-fm", name: "Radio 96", freq: "96.3", city: "Muriaé - MG", genre: "Eclética", url: "https://5a57bda70564a.streamlock.net/fm96muriae/fm96muriae.stream/playlist.m3u8", badge: "Rádio FM" },
    { id: "premium-fm", name: "Premium FM", freq: "94.7", city: "Muriaé - MG", genre: "Adulto Contemporâneo", url: "https://live.paineldj.com.br/proxy/premiumfm?mp=/stream", badge: "Rádio FM" },
    { id: "radio-muriae", name: "Rádio Muriaé", freq: "99.5", city: "Muriaé - MG", genre: "Jornalismo", url: "https://5a57bda70564a.streamlock.net/muriaeamhd/muriaeamhd.stream/playlist.m3u8", badge: "Rádio AM" },
    { id: "massa-fm", name: "Massa FM", freq: "92.9", city: "São Paulo - SP", genre: "Sertajeno", url: "https://live.virtualcast.com.br/massasaopaulo", badge: "Rádio FM" },
    { id: "metropolitana-fm", name: "Metropolitana FM", freq: "98.5", city: "São Paulo - SP", genre: "Hits", url: "https://play.wisestream.io/metropolitana985sp", rds: "https://m985.com.br/api/last/aovivo", badge: "Rádio FM" },
    { id: "nativa-fm", name: "Rádio Nativa", freq: "101.1", city: "Itapetininga - SP", genre: "Sertanejo", url: "https://stm7.xcast.com.br:7460/stream?1790280137885", badge: "Rádio FM" },
    { id: "tupi-fm", name: "Super Rádio Tupi", freq: "96.5", city: "Rio de Janeiro - RJ", genre: "Jornalismo", url: "https://8923.brasilstream.com.br/stream?1790280249717", badge: "Rádio FM" },
    { id: "mix-fm", name: "Rádio Mix FM", freq: "102.1", city: "Rio de Janeiro - RJ", genre: "Pop-Rock", url: "https://24233.live.streamtheworld.com/MIXRIOAAC_SC?dist=radioscombr&1790280345202", badge: "Rádio FM" },
    { id: "catedral-fm", name: "Catedral FM", freq: "105.9", city: "Muriaé - MG", genre: "Católica", url: "https://8224.brasilstream.com.br/stream?1790281539791", badge: "Rádio FM" },
    { id: "pan-muriae", name: "Jovem Pan Muriaé", freq: "98.7", city: "Muriaé - MG", genre: "Pop-Rock", url: "https://s32.maxcast.com.br:8086/live", badge: "Rádio FM" },
    { id: "clube-fm", name: "Clube FM", freq: "105.5", city: "Brasília - DF", genre: "Hits", url: "https://8157.brasilstream.com.br/stream", rds: "https://www.clube.fm/api/programa-atual?afiliada=brasilia", badge: "Rádio FM" },
    { id: "band-fm", name: "Band FM", freq: "96.1", city: "São Paulo - SP", genre: "Hits", url: "https://26653.live.streamtheworld.com/BANDFM_SPAAC.aac?dist=radios.com.br&1790357439969", badge: "Rádio FM" },
    { id: "mix-sp", name: "Mix FM", freq: "106.3", city: "São Paulo - SP", genre: "Pop-Rock", url: "https://27593.live.streamtheworld.com/MIXFM_SAOPAULOAAC.aac?dist=mix-web-player-radio-ao-vivo&773912.0577217169", rds: "https://aovivo.radiomixfm.com.br/?m", badge: "Rádio FM" },
    
    // ESCUTAS ADICIONADAS
    { id: "atis-cgh", name: "ATIS Congonhas", freq: "127.6", city: "São Paulo - SP", genre: "Aviação", url: "https://ssl1.transmissaodigital.com:20103/127.65ATISCGHRCB", badge: "Escuta Aérea" },
    { id: "solo-cgh", name: "Solo Congonhas", freq: "121.9", city: "São Paulo - SP", genre: "Aviação", url: "https://ssl1.transmissaodigital.com:20104/SOLOCGH121.9RCBOSOUTROSPAGAMEVOCEGANHABONITOISSO", badge: "Escuta Aérea" },
    { id: "torre-cgh", name: "Torre Congonhas", freq: "127.1", city: "São Paulo - SP", genre: "Aviação", url: "https://ssl1.transmissaodigital.com:20101/CGH127.15RCBLADRAODEFONIASFIQUEATENTO", badge: "Escuta Aérea" },
    { id: "trafego-cgh", name: "Tráfego Congonhas", freq: "120.6", city: "São Paulo - SP", genre: "Aviação", url: "https://ssl1.transmissaodigital.com:20393/120.6TRAFEGOCONGONHASRCB", badge: "Escuta Aérea" },
    { id: "galeao-rj", name: "Aeroporto do Galeão", freq: "118.0", city: "Rio de Janeiro - RJ", genre: "Aviação", url: "https://stm18.xcast.com.br:8092/stream?1790360449561", badge: "Escuta Aérea" },
    { id: "coord-heli-sp", name: "Coord. Helicópteros", freq: "127.3", city: "São Paulo - SP", genre: "Aviação", url: "https://ssl1.transmissaodigital.com:20101/HELI127.35RCB", badge: "Escuta Aérea" },
    { id: "ctrl-heli-sp", name: "Controle Helicópteros", freq: "118.3", city: "São Paulo - SP", genre: "Aviação", url: "https://ssl1.transmissaodigital.com:20015/118.350aeroescuta", badge: "Escuta Aérea" },
    { id: "torre-vcp", name: "Torre Viracopos", freq: "118.2", city: "Campinas - SP", genre: "Aviação", url: "https://ssl1.transmissaodigital.com:20064/viracopostorre118.25", badge: "Escuta Aérea" },
    { id: "solo-vcp", name: "Solo Viracopos", freq: "121.9", city: "Campinas - SP", genre: "Aviação", url: "https://ssl1.transmissaodigital.com:20070/vcpsolo121.9", badge: "Escuta Aérea" }
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

let allRadios = uniqueRadios.sort((a, b) => parseFloat(a.freq) - parseFloat(b.freq));
let currentFilterMode = "Rádio FM";
let radios = allRadios.filter(r => (r.badge || "Rádio FM") === currentFilterMode);

let currentIndex = 0;
let favoritas = JSON.parse(localStorage.getItem("radar_favoritas")) || [];
let sleepTimerInterval = null;
let targetTime = null;
let wakeLock = null; 
let wasPlayingBeforeBackground = false;
let rdsInterval = null;

let minFreq = 70.0; 
let maxFreq = 110.0; 
const tickWidth = 14; 

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
const badgePais = document.getElementById("badge-pais");

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

if (badgePais) {
    badgePais.style.cursor = "pointer";
    badgePais.title = "Escolher Categoria";
    badgePais.addEventListener("click", () => {
        openCategorySelector();
    });
}

function openCategorySelector() {
    let overlay = document.getElementById("category-overlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "category-overlay";
        overlay.className = "ios-action-sheet-overlay";
        overlay.innerHTML = `
            <div class="ios-action-sheet">
                <div class="ios-action-group" id="category-group"></div>
                <button class="ios-action-cancel" onclick="closeCategorySelector()">Cancelar</button>
            </div>
        `;
        document.body.appendChild(overlay);
        overlay.addEventListener("click", (e) => {
            if(e.target === overlay) closeCategorySelector();
        });
    }

    const group = overlay.querySelector("#category-group");
    group.innerHTML = '<div class="ios-action-header">Selecione uma Categoria</div>';

    const uniqueBadges = [...new Set(allRadios.map(r => r.badge || "Rádio FM"))];
    uniqueBadges.forEach(badge => {
        const btn = document.createElement("button");
        btn.className = "ios-action-btn";
        if (badge === currentFilterMode) {
            btn.style.fontWeight = "700";
        }
        btn.innerText = badge;
        btn.onclick = () => {
            applyCategory(badge);
            closeCategorySelector();
        };
        group.appendChild(btn);
    });

    requestAnimationFrame(() => {
        overlay.classList.add("active");
    });
}

window.closeCategorySelector = function() {
    const overlay = document.getElementById("category-overlay");
    if (overlay) overlay.classList.remove("active");
};

function applyCategory(catName) {
    if (currentFilterMode === catName) return; 
    currentFilterMode = catName;
    radios = allRadios.filter(r => (r.badge || "Rádio FM") === catName);

    if (["Rádio FM", "Web Rádio", "Rádio AM"].includes(catName)) {
        minFreq = 70.0;
        maxFreq = 110.0;
    } else if (catName === "Escuta Aérea") {
        minFreq = 118.0;
        maxFreq = 128.0;
    } else {
        let freqs = radios.map(r => parseFloat(r.freq));
        minFreq = Math.floor(Math.min(...freqs)) - 2;
        maxFreq = Math.ceil(Math.max(...freqs)) + 2;
    }

    buildDial();

    if (catName === "Rádio FM") {
        let radarIndex = radios.findIndex(r => r.id === "radar-fm");
        currentIndex = radarIndex !== -1 ? radarIndex : 0;
    } else if (catName === "Web Rádio") {
        let radarIndex = radios.findIndex(r => r.id === "radar-chuva");
        currentIndex = radarIndex !== -1 ? radarIndex : 0;
    } else {
        currentIndex = 0;
    }

    carregarRadio(currentIndex);
    tocarComVoz(radios[currentIndex]);
}

function loadRadioById(targetId) {
    let targetRadio = allRadios.find(r => r.id === targetId);
    if (!targetRadio) return;

    let catName = targetRadio.badge || "Rádio FM";
    if (currentFilterMode !== catName) {
        currentFilterMode = catName;
        radios = allRadios.filter(r => (r.badge || "Rádio FM") === catName);
        if (["Rádio FM", "Web Rádio", "Rádio AM"].includes(catName)) {
            minFreq = 70.0; maxFreq = 110.0;
        } else if (catName === "Escuta Aérea") {
            minFreq = 118.0; maxFreq = 128.0;
        } else {
            let freqs = radios.map(r => parseFloat(r.freq));
            minFreq = Math.floor(Math.min(...freqs)) - 2;
            maxFreq = Math.ceil(Math.max(...freqs)) + 2;
        }
        buildDial();
    }

    currentIndex = radios.findIndex(r => r.id === targetId);
    if (currentIndex === -1) currentIndex = 0;
    carregarRadio(currentIndex);
}

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

function abrirBusca() {
    document.getElementById("modal-estacoes").classList.add("active");
    const lista = document.getElementById("station-list"); 
    lista.innerHTML = "";
    allRadios.forEach((r) => {
        const li = document.createElement("li"); li.className = "station-item";
        li.style.display = "none"; 
        li.innerHTML = `<div><strong>${r.name}</strong> (${r.freq} MHz)<br><small style="color:var(--text-muted)">${r.city} • ${r.genre}</small></div>`;
        li.addEventListener("click", () => { 
            document.getElementById("modal-estacoes").classList.remove("active"); 
            loadRadioById(r.id);
            tocarComVoz(radios[currentIndex]); 
        });
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

document.getElementById("btn-whatsapp").addEventListener("click", () => {
    const numero = "5532985109726";
    const mensagem = encodeURIComponent("Olá, Gostaria de adicionar uma rádio no Radar Rádios.");
    window.open(`https://wa.me/${numero}?text=${mensagem}`, "_blank");
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
document.querySelectorAll(".fechar-modal-timer").forEach(btn => document.addEventListener("click", () => document.getElementById("modal-timer").classList.remove("active")));

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

function atualizarTelaDeBloqueio(radio, rdsText = null, coverUrl = null) {
    if ('mediaSession' in navigator) {
        let nomeR = radio.name;
        if (!nomeR.toUpperCase().includes('FM') && (!radio.badge || radio.badge === 'Rádio FM')) {
            nomeR = `${radio.name} FM`;
        }
        
        let titleText = nomeR; 
        let artistText = `${radio.city} • ${radio.genre}`;
        let albumText = "";
        
        let artworkSrc = 'https://raw.githubusercontent.com/althierestm/Radar-Radios-App/main/R%C3%A1dios%20Online%20e%20Gr%C3%A1tis%20quadra%20azul.png';

        if (coverUrl && coverUrl.startsWith('http')) {
            artworkSrc = coverUrl;
        }

        if (rdsText && rdsText !== "Programação ao vivo" && rdsText !== "Buscando informações...") {
            albumText = `🎵 ${rdsText}`; 
        }

        navigator.mediaSession.metadata = new MediaMetadata({
            title: titleText,
            artist: artistText,
            album: albumText,
            artwork: [{ src: artworkSrc, sizes: '512x512' }]
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

function updateRDSText(text, coverUrl = null) {
    const rdsText = document.getElementById("rds-text");
    const rdsScroller = document.getElementById("rds-scroller");
    
    if (rdsText.innerText !== text) {
        rdsText.innerText = text;
        rdsScroller.classList.remove("marquee");
        
        void rdsScroller.offsetWidth; 
        
        setTimeout(() => {
            if (rdsScroller.scrollWidth > rdsScroller.parentElement.clientWidth) {
                rdsScroller.classList.add("marquee");
            }
        }, 50);
        
        if (typeof radios !== "undefined" && radios[currentIndex]) {
            atualizarTelaDeBloqueio(radios[currentIndex], text, coverUrl);
        }
    }
}

async function fetchRDS(radio) {
    try {
        if (!radio || !radio.rds) return;

        if (radio.rds === "local_chuva") {
            const hour = new Date().getHours();
            let msg = "";
            if (hour >= 6 && hour < 12) {
                msg = "Bom dia, relaxe com esse barulhinho de chuva";
            } else if (hour >= 12 && hour < 18) {
                msg = "Tardezinha ótima para dormir";
            } else {
                msg = "Boa noite, bom descanso";
            }
            updateRDSText(msg, null);
            return;
        }

        const url = radio.rds;
        let text = "";
        let songName = "";
        let coverUrl = null;

        if (url.includes("api.zeno.fm") || url.includes("/subscribe")) {
            const response = await fetch(url, { cache: "no-store" });
            const reader = response.body.getReader();
            const { value } = await reader.read();
            text = new TextDecoder("utf-8").decode(value);
            reader.cancel(); 
        } else {
            let targetUrl = url;
            if (url.includes("clube.fm") || url.includes("radiomixfm.com.br")) {
                targetUrl = "https://api.allorigins.win/raw?url=" + encodeURIComponent(url);
            }
            const response = await fetch(targetUrl, { cache: "no-store" });
            if (!response.ok) throw new Error("Erro na requisição proxy");
            text = await response.text();
        }

        if (text.includes("cue_title")) {
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(text, "text/xml");
            const properties = xmlDoc.getElementsByTagName("property");
            for (let i = 0; i < properties.length; i++) {
                if (properties[i].getAttribute("name") === "cue_title") {
                    songName = properties[i].textContent;
                    break;
                }
            }
        } else if (text.includes('data:{"mount"')) {
            const lines = text.split('\n');
            for (let i = lines.length - 1; i >= 0; i--) {
                const line = lines[i].trim();
                if (line.startsWith('data:{')) {
                    try {
                        const zenoData = JSON.parse(line.substring(5));
                        if (zenoData.streamTitle) {
                            songName = zenoData.streamTitle;
                            break;
                        }
                    } catch(e) {}
                }
            }
        } else {
            try {
                let json;
                try {
                    json = JSON.parse(text);
                } catch (err) {
                    const lines = text.split('\n');
                    for (let i = lines.length - 1; i >= 0; i--) {
                        const line = lines[i].trim();
                        if (line.startsWith('data:')) {
                            try {
                                json = JSON.parse(line.substring(5).trim());
                                break;
                            } catch (e) {}
                        }
                    }
                    if (!json) throw new Error("Invalid JSON");
                }
                
                if (!songName && json.t && typeof json.t === "string") {
                    let artist = json.i || "";
                    songName = artist ? `${artist} - ${json.t}` : json.t;
                }
                
                if (json.programa) {
                    let progNameStr = typeof json.programa === 'string' ? json.programa : (json.programa.nome || "");
                    let locutorStr = "";
                    if (json.locutores) {
                        locutorStr = typeof json.locutores === 'string' ? json.locutores : "";
                    } else if (json.locutor) {
                        locutorStr = typeof json.locutor === 'string' ? json.locutor : (json.locutor.nome || "");
                    }
                    if (progNameStr) {
                        songName = locutorStr ? `${locutorStr} - ${progNameStr}` : progNameStr;
                    }
                }

                if (!songName && json.singer && json.song && typeof json.song === "string") {
                    songName = `${json.singer} - ${json.song}`;
                    if (json.capa) coverUrl = json.capa;
                }

                if (!songName) {
                    let tempSong = (typeof json.song === "string") ? json.song : "";
                    songName = json.title || json.now_playing || tempSong || json.songtitle || "";
                }
                
                if (!songName && typeof json.program === "string") {
                    songName = json.program;
                }
                
                if (!songName && json.infos) {
                    if (json.infos.EventType !== "Commercials") {
                        let title = json.infos.Title || (json.infos.MusicInfos && json.infos.MusicInfos.MusicTitle);
                        let artist = json.infos.Subtitle || (json.infos.MusicInfos && json.infos.MusicInfos.PostSubTitle);
                        if (title) {
                            songName = artist ? `${artist} - ${title}` : title;
                        }
                    }
                } else if (!songName && json.MusicTitle) {
                    songName = json.PostSubTitle ? `${json.PostSubTitle} - ${json.MusicTitle}` : json.MusicTitle;
                }
                
                if (!songName && json.emissoras && Array.isArray(json.emissoras) && json.emissoras.length > 0) {
                    let horarios = json.emissoras[0].horarios;
                    if (horarios && Array.isArray(horarios) && horarios.length > 0) {
                        let evento = horarios[0].evento;
                        if (evento) {
                            let progName = evento.nome || (evento.programa && evento.programa.nome) || "";
                            let locutor = "";
                            if (evento.profissional && Array.isArray(evento.profissional) && evento.profissional.length > 0) {
                                locutor = evento.profissional[0].nome || "";
                            }
                            if (progName) {
                                songName = locutor ? `${locutor} - ${progName}` : progName;
                            }
                        }
                    }
                }

                if (!songName && json.programas) {
                    const keys = Object.keys(json.programas);
                    if (keys.length > 0) {
                        const programList = json.programas[keys[0]];
                        if (Array.isArray(programList)) {
                            const now = new Date();
                            const timeStr = new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).format(now);

                            for (let prog of programList) {
                                let start = prog.hora_inicio; 
                                let end = prog.hora_fim;      
                                
                                let isPlaying = false;
                                if (start && end) {
                                    if (start <= end) {
                                        isPlaying = timeStr >= start && timeStr <= end;
                                    } else {
                                        isPlaying = timeStr >= start || timeStr <= end;
                                    }
                                }

                                if (isPlaying) {
                                    let progTitle = prog.titulo || prog.nome || "";
                                    let locutor = "";
                                    if (prog.profissionais && Array.isArray(prog.profissionais) && prog.profissionais.length > 0) {
                                        let prof = prog.profissionais[0];
                                        if (typeof prof === 'string') {
                                            locutor = prof;
                                        } else if (prof.nome) {
                                            locutor = prof.nome;
                                        } else if (prof.profissional && prof.profissional.nome) {
                                            locutor = prof.profissional.nome;
                                        }
                                    }
                                    if (progTitle) {
                                        songName = locutor ? `${locutor} - ${progTitle}` : progTitle;
                                    }
                                    break;
                                }
                            }
                        }
                    }
                }

                if (!songName && json.icestats && json.icestats.source) {
                    let source = json.icestats.source;
                    let mountInfo = Array.isArray(source) ? (source.find(m => url.includes(m.listenurl.split(':80')[1] || m.listenurl)) || source[0]) : source;
                    if (mountInfo) {
                        songName = mountInfo.title || mountInfo.yp_currently_playing || mountInfo.server_name || "";
                    }
                }

                let metroData = Array.isArray(json) ? json[0] : json;
                if (!songName && metroData && metroData.song && typeof metroData.song === 'object' && metroData.song.name) {
                    let trackName = metroData.song.name;
                    
                    let mainArtist = (metroData.artist && metroData.artist.name) ? metroData.artist.name : "";
                    let featArtist = (metroData.feat && metroData.feat.name) ? metroData.feat.name : "";
                    
                    let fullArtist = mainArtist;
                    if (featArtist) {
                        fullArtist += `, ${featArtist}`;
                    }
                    
                    if (trackName) {
                        songName = fullArtist ? `${fullArtist} - ${trackName}` : trackName;
                    }
                }
                
                if (!songName && url.includes("api.hunter.fm")) {
                    const match = radio.url.match(/\.fm\/([^\/]+)/);
                    const slug = match ? match[1] : "";
                    if (slug && Array.isArray(json)) {
                        for (let i = 0; i < json.length; i++) {
                            if (json[i].url === slug && json[i].live && json[i].live.now) {
                                let musica = json[i].live.now.name || "";
                                let cantor = "";
                                if (Array.isArray(json[i].live.now.singers)) {
                                    cantor = json[i].live.now.singers.join(", ");
                                }
                                if (musica) {
                                    songName = cantor ? `${cantor} - ${musica}` : musica;
                                }
                                break;
                            }
                        }
                    }
                }

            } catch(err) {
                if (text && text.length > 2 && text.length < 150 && !text.includes("<html")) {
                    songName = text.replace(/<[^>]*>?/gm, '').trim();
                }
            }
        }

        if (songName && typeof songName === "string") {
            songName = songName.replace(/&#038;/g, "&").replace(/&amp;/g, "&").replace(/&#039;/g, "'").replace(/&quot;/g, '"');
        }

        if (songName && typeof songName === "string" && songName.trim() !== "") {
            updateRDSText(songName, coverUrl);
        } else {
            updateRDSText("Programação ao vivo", null);
        }
    } catch (e) {
        updateRDSText("Programação ao vivo", null);
    }
}

function startRDS(radio) {
    clearInterval(rdsInterval);
    const rdsContainer = document.getElementById("rds-container");
    const rdsScroller = document.getElementById("rds-scroller");
    const rdsText = document.getElementById("rds-text");

    if (!radio.rds) {
        rdsContainer.classList.add("hidden");
        if (typeof atualizarTelaDeBloqueio === "function") {
            atualizarTelaDeBloqueio(radio, null, null);
        }
        return;
    }

    rdsContainer.classList.remove("hidden");
    rdsText.innerText = "Buscando informações...";
    rdsScroller.classList.remove("marquee");

    fetchRDS(radio);
    rdsInterval = setInterval(() => fetchRDS(radio), 10000);
}

audio.addEventListener('playing', () => {
    stopChiado(); const radio = radios[currentIndex];
    statusConexao.innerText = `${radio.city} • ${radio.genre}`;
    playIcon.className = "fa-solid fa-pause";
    
    if (badgePais) {
        badgePais.innerText = radio.badge || "Rádio FM";
    }

    atualizarTelaDeBloqueio(radio); 
    startRDS(radio);

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

audio.addEventListener('pause', () => { 
    clearInterval(profileTimer); 
    clearInterval(rdsInterval);
});

function buildDial() {
    dialStrip.innerHTML = '';
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
    if (radios[currentIndex]) {
        atualizarPosicaoDial(radios[currentIndex].freq);
    }
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
            
            document.getElementById('btn-multi-radio').classList.remove('pulse-active');
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
    document.getElementById('btn-multi-radio').classList.add('hidden');
    document.getElementById("rds-container").classList.add("hidden");
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
        document.getElementById('btn-multi-radio').classList.add('hidden');
        if (noiseFilter) noiseFilter.frequency.value = 1000;
    }
});

function carregarRadio(index) {
    const radio = radios[index];
    freqValor.innerText = radio.freq; 
    
    let nomeBonito = radio.name;
    if (!nomeBonito.toUpperCase().includes('FM') && (!radio.badge || radio.badge === 'Rádio FM')) {
        nomeBonito = `${radio.name} FM`;
    }
    
    estacaoNome.innerText = nomeBonito;
    statusConexao.innerText = "CONECTANDO...";
    
    if (badgePais) {
        badgePais.innerText = radio.badge || "Rádio FM";
    }
    
    clearInterval(rdsInterval);
    document.getElementById("rds-container").classList.add("hidden");
    
    audio.src = radio.url; 
    audio.loop = (radio.rds === "local_chuva"); 
    atualizarPosicaoDial(radio.freq); 
    verificarFavorito(radio.id); 
    renderizarFavoritas();
    atualizarTelaDeBloqueio(radio);

    const arrayConflitos = radios.filter(r => parseFloat(r.freq) === parseFloat(radio.freq));
    const btnMulti = document.getElementById('btn-multi-radio');
    
    if (arrayConflitos.length > 1) {
        btnMulti.classList.remove('hidden');
        btnMulti.classList.add('pulse-active');
    } else {
        btnMulti.classList.add('hidden');
        btnMulti.classList.remove('pulse-active');
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

buildDial();
const indexIni = radios.findIndex(r => r.id === "radar-fm");
currentIndex = indexIni !== -1 ? indexIni : 0;
carregarRadio(currentIndex);

function renderizarFavoritas() {
    const listaFav = document.getElementById("favoritas-list"); listaFav.innerHTML = "";
    if (favoritas.length === 0) { listaFav.innerHTML = "<p style='text-align:center; padding: 20px; color: var(--text-muted); font-size: 14px;'>Nenhuma rádio salva.</p>"; return; }
    allRadios.filter(r => favoritas.includes(r.id)).forEach(r => {
        const li = document.createElement("li"); li.className = "station-item";
        li.innerHTML = `<div><strong>${r.name}</strong> (${r.freq} MHz)<br><small style="color:var(--text-muted)">${r.city} • ${r.genre}</small></div>`;
        li.addEventListener("click", () => { 
            document.getElementById("modal-config").classList.remove("active"); 
            loadRadioById(r.id);
            tocarComVoz(radios[currentIndex]); 
        });
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

const btnPrivacidade = document.getElementById("btn-privacidade");
if (btnPrivacidade) {
    btnPrivacidade.addEventListener("click", () => {
        window.open("https://althierestm.github.io/Radar-Radios-App/privacidade.html", "_blank");
    });
}
