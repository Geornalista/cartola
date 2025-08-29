(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))a(o);new MutationObserver(o=>{for(const e of o)if(e.type==="childList")for(const s of e.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&a(s)}).observe(document,{childList:!0,subtree:!0});function i(o){const e={};return o.integrity&&(e.integrity=o.integrity),o.referrerPolicy&&(e.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?e.credentials="include":o.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function a(o){if(o.ep)return;o.ep=!0;const e=i(o);fetch(o.href,e)}})();class C{constructor(){this.ULTIMA_RODADA=21,this.proxyUrl="https://corsproxy.io/?",this.API_URLS={PONTUADOS:"https://api.cartola.globo.com/atletas/pontuados/",PARTIDAS:"https://api.cartola.globo.com/partidas/",CLUBES:"https://api.cartola.globo.com/clubes"},this.SCOUTS_DESCRICOES={A:"Assistência",CA:"Cartão Amarelo",CV:"Cartão Vermelho",DE:"Defesa",DP:"Defesa de Pênalti",DS:"Desarme",FC:"Falta Cometida",FD:"Finalização Defendida",FF:"Finalização pra Fora",FS:"Falta Sofrida",FT:"Finalização na Trave",G:"Gol",GC:"Gol Contra",GS:"Gol Sofrido",I:"Impedimento",PC:"Pênalti Cometido",PP:"Pênalti Perdido",PS:"Pênalti Sofrido",SG:"Jogo sem Sofrer Gol",V:"Vitórias"},this.dadosAgregados={},this.dadosClubesAgregados={},this.todosClubes={},this.todasPosicoes={},this.clubesParticipantes=new Set}getScoutsDescricoes(){return this.SCOUTS_DESCRICOES}createNewAthleteEntry(t){return{...t,pontuacao:{total:0,mandante:0,visitante:0},jogos:{total:0,mandante:0,visitante:0},scouts:{total:{},mandante:{},visitante:{}}}}createNewClubEntry(t){return{...t,pontuacao:{total:0,mandante:0,visitante:0},jogos:{total:0,mandante:0,visitante:0},scouts:{total:{},mandante:{},visitante:{}}}}async fetchAndAggregateData(){var i;const t=(i=document.querySelector(".container"))==null?void 0:i.__uiManager;t&&(t.updateCurrentRound(this.ULTIMA_RODADA),t.updateLoadingStatus("Carregando lista de clubes..."));try{const a=await fetch(`${this.proxyUrl}${this.API_URLS.CLUBES}`);this.todosClubes=await a.json()}catch(a){console.error("Erro ao carregar clubes:",a)}for(let a=1;a<=this.ULTIMA_RODADA;a++){t&&t.updateLoadingStatus(`Processando rodada ${a}/${this.ULTIMA_RODADA}...`);try{const[o,e]=await Promise.all([fetch(`${this.proxyUrl}${this.API_URLS.PARTIDAS}${a}`),fetch(`${this.proxyUrl}${this.API_URLS.PONTUADOS}${a}`)]);if(!o.ok||!e.ok)continue;const[s,l]=await Promise.all([o.json(),e.json()]);this.processaDadosDaRodada(l,s.partidas)}catch(o){console.error(`Erro na rodada ${a}:`,o)}}}processaDadosDaRodada(t,i){if(!t.atletas||Object.keys(t.atletas).length===0)return;t.posicoes&&(this.todasPosicoes=t.posicoes);const a={};i.forEach(e=>{a[e.clube_casa_id]="mandante",a[e.clube_visitante_id]="visitante"}),new Set(Object.values(t.atletas).map(e=>e.clube_id)).forEach(e=>{if(!this.todosClubes[e]||!a[e])return;const s=a[e];this.dadosClubesAgregados[e]||(this.dadosClubesAgregados[e]=this.createNewClubEntry(this.todosClubes[e])),this.dadosClubesAgregados[e].jogos.total+=1,this.dadosClubesAgregados[e].jogos[s]+=1});for(const e in t.atletas){const s=t.atletas[e],l=s.clube_id,n=a[l];if(!n)continue;this.clubesParticipantes.add(l),this.dadosAgregados[e]||(this.dadosAgregados[e]=this.createNewAthleteEntry(s));const d=this.dadosAgregados[e];if(d.pontuacao.total+=s.pontuacao,d.pontuacao[n]+=s.pontuacao,d.jogos.total+=1,d.jogos[n]+=1,s.scout)for(const r in s.scout){const u=s.scout[r];d.scouts.total[r]=(d.scouts.total[r]||0)+u,d.scouts[n][r]=(d.scouts[n][r]||0)+u}const c=this.dadosClubesAgregados[l];if(c&&(c.pontuacao.total+=s.pontuacao,c.pontuacao[n]+=s.pontuacao,s.scout))for(const r in s.scout){const u=s.scout[r];c.scouts.total[r]=(c.scouts.total[r]||0)+u,c.scouts[n][r]=(c.scouts[n][r]||0)+u}}}getFilteredAtletas({clubeId:t,posId:i,local:a,viewMode:o,metricaSelecionada:e}){let s=Object.values(this.dadosAgregados);return t!=="todos"&&(s=s.filter(l=>l.clube_id==t)),i!=="todos"&&(s=s.filter(l=>l.posicao_id==i)),a!=="todos"&&(s=s.filter(l=>l.jogos[a]>0)),o==="soma"&&e!=="pontuacao"&&(s=s.filter(l=>(l.scouts.total[e]||0)>0)),this.sortAtletas(s,a,o,e)}getFilteredClubes({local:t,viewMode:i,metricaSelecionada:a}){let o=Object.values(this.dadosClubesAgregados);return t!=="todos"&&(o=o.filter(e=>e.jogos[t]>0)),i==="soma"&&a!=="pontuacao"&&(o=o.filter(e=>(e.scouts.total[a]||0)>0)),this.sortClubes(o,t,i,a)}sortAtletas(t,i,a,o){return t.sort((e,s)=>{const l=i==="todos"?"total":i,n=e.jogos[l]||0,d=s.jogos[l]||0;let c=o==="pontuacao"?e.pontuacao[l]:e.scouts[l][o]||0,r=o==="pontuacao"?s.pontuacao[l]:s.scouts[l][o]||0;return a==="media"&&(c=n>0?c/n:0,r=d>0?r/d:0),r-c})}sortClubes(t,i,a,o){return t.sort((e,s)=>{const l=i==="todos"?"total":i,n=e.jogos[l]||0,d=s.jogos[l]||0;let c=o==="pontuacao"?e.pontuacao[l]:e.scouts[l][o]||0,r=o==="pontuacao"?s.pontuacao[l]:s.scouts[l][o]||0;return a==="media"&&(c=n>0?c/n:0,r=d>0?r/d:0),r-c})}}class j{constructor(){this.atletasContainer=null,this.clubesContainer=null}switchTab(t){const i=t==="jogadores",a=document.getElementById("tab-jogadores"),o=document.getElementById("tab-clubes");a.classList.toggle("active",i),o.classList.toggle("active",!i);const e=document.getElementById("content-jogadores"),s=document.getElementById("content-clubes");e.classList.toggle("active",i),s.classList.toggle("active",!i)}renderAtletas(t,i,a,o){if(this.atletasContainer=document.getElementById("atletas-container"),this.atletasContainer.innerHTML="",t.length===0){this.atletasContainer.innerHTML=`
        <div class="empty-state">
          <h3>Nenhum jogador encontrado</h3>
          <p>Tente ajustar os filtros para ver mais resultados</p>
        </div>
      `;return}const e=document.getElementById("filtro-local-jogadores").value,s=document.querySelector('input[name="view-mode-jogadores"]:checked').value,l=document.getElementById("filtro-scout-jogadores").value;t.forEach((n,d)=>{var b,y;const c=e==="todos"?"total":e,r=n.jogos[c];let u,m;l==="pontuacao"?(m="Pontuação",u=n.pontuacao[c]):(m=o[l]||l,u=n.scouts[c][l]||0);const v=s==="media"&&r>0?u/r:u,p=s==="media"||l==="pontuacao"?v.toFixed(2):v.toFixed(0);let f=s==="media"?`Média em ${r} jogos`:`Total em ${r} jogos`;e!=="todos"&&(f+=` (${e})`);const h=document.createElement("div");h.className="list-item",h.style.animationDelay=`${d*50}ms`,h.innerHTML=`
        <img src="${n.foto?n.foto.replace("FORMATO","140x140"):"https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=140&h=140&fit=crop"}" 
             alt="Foto de ${n.apelido}" 
             onerror="this.src='https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=140&h=140&fit=crop'">
        <div class="info">
          <h3>${n.apelido}</h3>
          <p>${((b=i[n.clube_id])==null?void 0:b.nome_fantasia)||""} • ${((y=a[n.posicao_id])==null?void 0:y.nome)||""}</p>
        </div>
        <div class="metric">
          <span class="metric-label">${m}</span>
          <span class="metric-value">${p}</span>
          <span class="metric-subtext">${f}</span>
        </div>
      `,this.atletasContainer.appendChild(h)})}renderClubes(t,i){if(this.clubesContainer=document.getElementById("clubes-container"),this.clubesContainer.innerHTML="",t.length===0){this.clubesContainer.innerHTML=`
        <div class="empty-state">
          <h3>Nenhum clube encontrado</h3>
          <p>Tente ajustar os filtros para ver mais resultados</p>
        </div>
      `;return}const a=document.getElementById("filtro-local-clubes").value,o=document.querySelector('input[name="view-mode-clubes"]:checked').value,e=document.getElementById("filtro-scout-clubes").value;t.forEach((s,l)=>{const n=a==="todos"?"total":a,d=s.jogos[n];let c,r;e==="pontuacao"?(r="Pontuação",c=s.pontuacao[n]):(r=i[e]||e,c=s.scouts[n][e]||0);const u=o==="media"&&d>0?c/d:c,m=o==="media"||e==="pontuacao"?u.toFixed(2):u.toFixed(0);let v=o==="media"?`Média em ${d} jogos`:`Total em ${d} jogos`;a!=="todos"&&(v+=` (${a})`);const p=document.createElement("div");p.className="list-item",p.style.animationDelay=`${l*50}ms`,p.innerHTML=`
        <img src="${s.escudos?s.escudos["60x60"]:"https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop"}" 
             alt="Escudo do ${s.nome_fantasia}"
             onerror="this.src='https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop'">
        <div class="info">
          <h3>${s.nome_fantasia}</h3>
          <p>${s.abreviacao}</p>
        </div>
        <div class="metric">
          <span class="metric-label">${r}</span>
          <span class="metric-value">${m}</span>
          <span class="metric-subtext">${v}</span>
        </div>
      `,this.clubesContainer.appendChild(p)})}updateLoadingStatus(t){const i=document.getElementById("loading-status");i&&(i.innerHTML=`
        <div class="loading-spinner"></div>
        ${t}
      `)}updateCurrentRound(t){const i=document.getElementById("rodada-atual");i&&(i.textContent=t)}}class A{constructor(){this.dataService=null,this.uiManager=null}setDataService(t){this.dataService=t}setUIManager(t){this.uiManager=t}populateFilters(t,i,a){this.populateClubFilter(t,i),this.populatePositionFilter(a),this.populateScoutFilters()}populateClubFilter(t,i){const a=document.getElementById("filtro-clube-jogadores");Array.from(t).map(e=>i[e]).filter(Boolean).sort((e,s)=>e.nome_fantasia.localeCompare(s.nome_fantasia)).forEach(e=>{const s=document.createElement("option");s.value=e.id,s.textContent=e.nome_fantasia,a.appendChild(s)})}populatePositionFilter(t){const i=document.getElementById("filtro-posicao-jogadores");Object.values(t).forEach(a=>{const o=document.createElement("option");o.value=a.id,o.textContent=a.nome,i.appendChild(o)})}populateScoutFilters(){const t=this.dataService.getScoutsDescricoes(),i=Object.entries(t).sort((a,o)=>a[1].localeCompare(o[1])).map(([a,o])=>`<option value="${a}">${o}</option>`).join("");document.getElementById("filtro-scout-jogadores").innerHTML+=i,document.getElementById("filtro-scout-clubes").innerHTML+=i}applyFilters(){document.querySelector(".tab-button.active").id==="tab-jogadores"?this.applyFiltersJogadores():this.applyFiltersClubes()}applyFiltersJogadores(){const t=document.getElementById("filtro-clube-jogadores").value,i=document.getElementById("filtro-posicao-jogadores").value,a=document.getElementById("filtro-local-jogadores").value,o=document.querySelector('input[name="view-mode-jogadores"]:checked').value,e=document.getElementById("filtro-scout-jogadores").value,s=this.dataService.getFilteredAtletas({clubeId:t,posId:i,local:a,viewMode:o,metricaSelecionada:e});this.uiManager.renderAtletas(s,this.dataService.todosClubes,this.dataService.todasPosicoes,this.dataService.getScoutsDescricoes())}applyFiltersClubes(){const t=document.getElementById("filtro-local-clubes").value,i=document.querySelector('input[name="view-mode-clubes"]:checked').value,a=document.getElementById("filtro-scout-clubes").value,o=this.dataService.getFilteredClubes({local:t,viewMode:i,metricaSelecionada:a});this.uiManager.renderClubes(o,this.dataService.getScoutsDescricoes())}}class S{constructor(){this.dataService=new C,this.uiManager=new j,this.filterManager=new A,this.setupEventListeners()}async init(){this.renderInitialUI(),await this.loadData(),this.setupFilters()}renderInitialUI(){const t=document.getElementById("app");t.innerHTML=`
      <div class="container">
        <header class="header">
          <h1>Análise Tática Cartola FC</h1>
          <p class="subtitle">Estatísticas acumuladas até a rodada <span id="rodada-atual">...</span></p>
        </header>

        <div class="main-card">
          <div class="tabs">
            <button id="tab-jogadores" class="tab-button active">
              <span>📊 Por Jogador</span>
            </button>
            <button id="tab-clubes" class="tab-button">
              <span>🏆 Por Clube</span>
            </button>
          </div>

          <div id="loading-status" class="loading-status">
            <div class="loading-spinner"></div>
            Carregando dados...
          </div>

          <div class="content">
            <!-- Painel de Jogadores -->
            <div id="content-jogadores" class="content-panel active">
              <div class="filters">
                <div class="filter-group">
                  <label for="filtro-clube-jogadores">Clube</label>
                  <select id="filtro-clube-jogadores">
                    <option value="todos">Todos os clubes</option>
                  </select>
                </div>
                <div class="filter-group">
                  <label for="filtro-posicao-jogadores">Posição</label>
                  <select id="filtro-posicao-jogadores">
                    <option value="todos">Todas as posições</option>
                  </select>
                </div>
                <div class="filter-group">
                  <label for="filtro-local-jogadores">Local</label>
                  <select id="filtro-local-jogadores">
                    <option value="todos">Todos os jogos</option>
                    <option value="mandante">Apenas mandante</option>
                    <option value="visitante">Apenas visitante</option>
                  </select>
                </div>
                <div class="filter-group">
                  <label for="filtro-scout-jogadores">Métrica</label>
                  <select id="filtro-scout-jogadores">
                    <option value="pontuacao">Pontuação</option>
                  </select>
                </div>
                <div class="filter-group">
                  <label>Visualização</label>
                  <div class="radio-group">
                    <div class="radio-option">
                      <input type="radio" id="view-soma-jogadores" name="view-mode-jogadores" value="soma" checked>
                      <label for="view-soma-jogadores">Soma</label>
                    </div>
                    <div class="radio-option">
                      <input type="radio" id="view-media-jogadores" name="view-mode-jogadores" value="media">
                      <label for="view-media-jogadores">Média</label>
                    </div>
                  </div>
                </div>
              </div>
              <div id="atletas-container" class="list-container"></div>
            </div>

            <!-- Painel de Clubes -->
            <div id="content-clubes" class="content-panel">
              <div class="filters">
                <div class="filter-group">
                  <label for="filtro-local-clubes">Local</label>
                  <select id="filtro-local-clubes">
                    <option value="todos">Todos os jogos</option>
                    <option value="mandante">Apenas mandante</option>
                    <option value="visitante">Apenas visitante</option>
                  </select>
                </div>
                <div class="filter-group">
                  <label for="filtro-scout-clubes">Métrica</label>
                  <select id="filtro-scout-clubes">
                    <option value="pontuacao">Pontuação</option>
                  </select>
                </div>
                <div class="filter-group">
                  <label>Visualização</label>
                  <div class="radio-group">
                    <div class="radio-option">
                      <input type="radio" id="view-soma-clubes" name="view-mode-clubes" value="soma" checked>
                      <label for="view-soma-clubes">Soma</label>
                    </div>
                    <div class="radio-option">
                      <input type="radio" id="view-media-clubes" name="view-mode-clubes" value="media">
                      <label for="view-media-clubes">Média</label>
                    </div>
                  </div>
                </div>
              </div>
              <div id="clubes-container" class="list-container"></div>
            </div>
          </div>
        </div>
      </div>
    `}setupEventListeners(){document.addEventListener("click",t=>{t.target.id==="tab-jogadores"?this.uiManager.switchTab("jogadores"):t.target.id==="tab-clubes"&&this.uiManager.switchTab("clubes")}),document.addEventListener("change",t=>{t.target.closest(".filters")&&this.filterManager.applyFilters()})}async loadData(){await this.dataService.fetchAndAggregateData(),this.hideLoading()}setupFilters(){this.filterManager.setDataService(this.dataService),this.filterManager.setUIManager(this.uiManager),this.filterManager.populateFilters(this.dataService.clubesParticipantes,this.dataService.todosClubes,this.dataService.todasPosicoes),this.filterManager.applyFilters()}hideLoading(){const t=document.getElementById("loading-status");t&&(t.style.display="none")}}document.addEventListener("DOMContentLoaded",()=>{new S().init()});
