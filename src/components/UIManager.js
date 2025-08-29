export class UIManager {
  constructor() {
    this.atletasContainer = null;
    this.clubesContainer = null;
  }

  switchTab(activeTab) {
    const isJogadores = activeTab === 'jogadores';
    
    // Update tab buttons
    const tabJogadores = document.getElementById('tab-jogadores');
    const tabClubes = document.getElementById('tab-clubes');
    
    tabJogadores.classList.toggle('active', isJogadores);
    tabClubes.classList.toggle('active', !isJogadores);
    
    // Update content panels
    const contentJogadores = document.getElementById('content-jogadores');
    const contentClubes = document.getElementById('content-clubes');
    
    contentJogadores.classList.toggle('active', isJogadores);
    contentClubes.classList.toggle('active', !isJogadores);
  }

  renderAtletas(atletas, todosClubes, todasPosicoes, scoutsDescricoes) {
    this.atletasContainer = document.getElementById('atletas-container');
    this.atletasContainer.innerHTML = '';

    if (atletas.length === 0) {
      this.atletasContainer.innerHTML = `
        <div class="empty-state">
          <h3>Nenhum jogador encontrado</h3>
          <p>Tente ajustar os filtros para ver mais resultados</p>
        </div>
      `;
      return;
    }

    const local = document.getElementById('filtro-local-jogadores').value;
    const viewMode = document.querySelector('input[name="view-mode-jogadores"]:checked').value;
    const metricaScout = document.getElementById('filtro-scout-jogadores').value;

    atletas.forEach((atleta, index) => {
      const key = (local === 'todos') ? 'total' : local;
      const jogos = atleta.jogos[key];
      
      let valor, rotulo;
      if (metricaScout === 'pontuacao') {
        rotulo = 'Pontuação';
        valor = atleta.pontuacao[key];
      } else {
        rotulo = scoutsDescricoes[metricaScout] || metricaScout;
        valor = atleta.scouts[key][metricaScout] || 0;
      }

      const valorCalculado = (viewMode === 'media' && jogos > 0) ? (valor / jogos) : valor;
      const valorDisplay = (viewMode === 'media' || metricaScout === 'pontuacao') 
        ? valorCalculado.toFixed(2) 
        : valorCalculado.toFixed(0);

      let subtexto = viewMode === 'media' ? `Média em ${jogos} jogos` : `Total em ${jogos} jogos`;
      if (local !== 'todos') subtexto += ` (${local})`;

      const itemDiv = document.createElement('div');
      itemDiv.className = 'list-item';
      itemDiv.style.animationDelay = `${index * 50}ms`;
      
      itemDiv.innerHTML = `
        <img src="${atleta.foto ? atleta.foto.replace('FORMATO', '140x140') : 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=140&h=140&fit=crop'}" 
             alt="Foto de ${atleta.apelido}" 
             onerror="this.src='https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=140&h=140&fit=crop'">
        <div class="info">
          <h3>${atleta.apelido}</h3>
          <p>${todosClubes[atleta.clube_id]?.nome_fantasia || ''} • ${todasPosicoes[atleta.posicao_id]?.nome || ''}</p>
        </div>
        <div class="metric">
          <span class="metric-label">${rotulo}</span>
          <span class="metric-value">${valorDisplay}</span>
          <span class="metric-subtext">${subtexto}</span>
        </div>
      `;
      
      this.atletasContainer.appendChild(itemDiv);
    });
  }

  renderClubes(clubes, scoutsDescricoes) {
    this.clubesContainer = document.getElementById('clubes-container');
    this.clubesContainer.innerHTML = '';

    if (clubes.length === 0) {
      this.clubesContainer.innerHTML = `
        <div class="empty-state">
          <h3>Nenhum clube encontrado</h3>
          <p>Tente ajustar os filtros para ver mais resultados</p>
        </div>
      `;
      return;
    }

    const local = document.getElementById('filtro-local-clubes').value;
    const viewMode = document.querySelector('input[name="view-mode-clubes"]:checked').value;
    const metricaScout = document.getElementById('filtro-scout-clubes').value;

    clubes.forEach((clube, index) => {
      const key = (local === 'todos') ? 'total' : local;
      const jogos = clube.jogos[key];
      
      let valor, rotulo;
      if (metricaScout === 'pontuacao') {
        rotulo = 'Pontuação';
        valor = clube.pontuacao[key];
      } else {
        rotulo = scoutsDescricoes[metricaScout] || metricaScout;
        valor = clube.scouts[key][metricaScout] || 0;
      }

      const valorCalculado = (viewMode === 'media' && jogos > 0) ? (valor / jogos) : valor;
      const valorDisplay = (viewMode === 'media' || metricaScout === 'pontuacao') 
        ? valorCalculado.toFixed(2) 
        : valorCalculado.toFixed(0);

      let subtexto = viewMode === 'media' ? `Média em ${jogos} jogos` : `Total em ${jogos} jogos`;
      if (local !== 'todos') subtexto += ` (${local})`;

      const itemDiv = document.createElement('div');
      itemDiv.className = 'list-item';
      itemDiv.style.animationDelay = `${index * 50}ms`;
      
      itemDiv.innerHTML = `
        <img src="${clube.escudos ? clube.escudos['60x60'] : 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop'}" 
             alt="Escudo do ${clube.nome_fantasia}"
             onerror="this.src='https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=60&h=60&fit=crop'">
        <div class="info">
          <h3>${clube.nome_fantasia}</h3>
          <p>${clube.abreviacao}</p>
        </div>
        <div class="metric">
          <span class="metric-label">${rotulo}</span>
          <span class="metric-value">${valorDisplay}</span>
          <span class="metric-subtext">${subtexto}</span>
        </div>
      `;
      
      this.clubesContainer.appendChild(itemDiv);
    });
  }

  updateLoadingStatus(message) {
    const loadingStatus = document.getElementById('loading-status');
    if (loadingStatus) {
      loadingStatus.innerHTML = `
        <div class="loading-spinner"></div>
        ${message}
      `;
    }
  }

  updateCurrentRound(round) {
    const rodadaAtual = document.getElementById('rodada-atual');
    if (rodadaAtual) {
      rodadaAtual.textContent = round;
    }
  }
}