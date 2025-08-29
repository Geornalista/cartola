export class DataService {
  constructor() {
    this.ULTIMA_RODADA = 21;
    this.proxyUrl = 'https://corsproxy.io/?';
    this.API_URLS = {
      PONTUADOS: 'https://api.cartola.globo.com/atletas/pontuados/',
      PARTIDAS: 'https://api.cartola.globo.com/partidas/',
      CLUBES: 'https://api.cartola.globo.com/clubes'
    };
    this.SCOUTS_DESCRICOES = {
      'A': 'Assistência',
      'CA': 'Cartão Amarelo',
      'CV': 'Cartão Vermelho',
      'DE': 'Defesa',
      'DP': 'Defesa de Pênalti',
      'DS': 'Desarme',
      'FC': 'Falta Cometida',
      'FD': 'Finalização Defendida',
      'FF': 'Finalização pra Fora',
      'FS': 'Falta Sofrida',
      'FT': 'Finalização na Trave',
      'G': 'Gol',
      'GC': 'Gol Contra',
      'GS': 'Gol Sofrido',
      'I': 'Impedimento',
      'PC': 'Pênalti Cometido',
      'PP': 'Pênalti Perdido',
      'PS': 'Pênalti Sofrido',
      'SG': 'Jogo sem Sofrer Gol',
      'V': 'Vitórias'
    };

    this.dadosAgregados = {};
    this.dadosClubesAgregados = {};
    this.todosClubes = {};
    this.todasPosicoes = {};
    this.clubesParticipantes = new Set();
  }

  getScoutsDescricoes() {
    return this.SCOUTS_DESCRICOES;
  }

  createNewAthleteEntry(info) {
    return {
      ...info,
      pontuacao: { total: 0, mandante: 0, visitante: 0 },
      jogos: { total: 0, mandante: 0, visitante: 0 },
      scouts: { total: {}, mandante: {}, visitante: {} }
    };
  }

  createNewClubEntry(info) {
    return {
      ...info,
      pontuacao: { total: 0, mandante: 0, visitante: 0 },
      jogos: { total: 0, mandante: 0, visitante: 0 },
      scouts: { total: {}, mandante: {}, visitante: {} }
    };
  }

  async fetchAndAggregateData() {
    const uiManager = document.querySelector('.container')?.__uiManager;
    
    if (uiManager) {
      uiManager.updateCurrentRound(this.ULTIMA_RODADA);
      uiManager.updateLoadingStatus('Carregando lista de clubes...');
    }

    try {
      const clubesResponse = await fetch(`${this.proxyUrl}${this.API_URLS.CLUBES}`);
      this.todosClubes = await clubesResponse.json();
    } catch (error) {
      console.error('Erro ao carregar clubes:', error);
    }

    for (let rodada = 1; rodada <= this.ULTIMA_RODADA; rodada++) {
      if (uiManager) {
        uiManager.updateLoadingStatus(`Processando rodada ${rodada}/${this.ULTIMA_RODADA}...`);
      }

      try {
        const [partidasResponse, scoutResponse] = await Promise.all([
          fetch(`${this.proxyUrl}${this.API_URLS.PARTIDAS}${rodada}`),
          fetch(`${this.proxyUrl}${this.API_URLS.PONTUADOS}${rodada}`)
        ]);

        if (!partidasResponse.ok || !scoutResponse.ok) continue;

        const [partidasData, scoutData] = await Promise.all([
          partidasResponse.json(),
          scoutResponse.json()
        ]);

        this.processaDadosDaRodada(scoutData, partidasData.partidas);
      } catch (error) {
        console.error(`Erro na rodada ${rodada}:`, error);
      }
    }
  }

  processaDadosDaRodada(scoutData, partidas) {
    if (!scoutData.atletas || Object.keys(scoutData.atletas).length === 0) {
      return;
    }

    if (scoutData.posicoes) {
      this.todasPosicoes = scoutData.posicoes;
    }

    const localMapa = {};
    partidas.forEach(partida => {
      localMapa[partida.clube_casa_id] = 'mandante';
      localMapa[partida.clube_visitante_id] = 'visitante';
    });

    const clubesQueJogaramNaRodada = new Set(
      Object.values(scoutData.atletas).map(a => a.clube_id)
    );

    // Processa dados dos clubes
    clubesQueJogaramNaRodada.forEach(clubeId => {
      if (!this.todosClubes[clubeId] || !localMapa[clubeId]) return;
      
      const local = localMapa[clubeId];
      if (!this.dadosClubesAgregados[clubeId]) {
        this.dadosClubesAgregados[clubeId] = this.createNewClubEntry(this.todosClubes[clubeId]);
      }
      
      this.dadosClubesAgregados[clubeId].jogos.total += 1;
      this.dadosClubesAgregados[clubeId].jogos[local] += 1;
    });

    // Processa dados dos atletas
    for (const atletaId in scoutData.atletas) {
      const atleta = scoutData.atletas[atletaId];
      const clubeId = atleta.clube_id;
      const local = localMapa[clubeId];
      
      if (!local) continue;
      
      this.clubesParticipantes.add(clubeId);

      if (!this.dadosAgregados[atletaId]) {
        this.dadosAgregados[atletaId] = this.createNewAthleteEntry(atleta);
      }

      const agregado = this.dadosAgregados[atletaId];
      agregado.pontuacao.total += atleta.pontuacao;
      agregado.pontuacao[local] += atleta.pontuacao;
      agregado.jogos.total += 1;
      agregado.jogos[local] += 1;

      if (atleta.scout) {
        for (const sigla in atleta.scout) {
          const valor = atleta.scout[sigla];
          agregado.scouts.total[sigla] = (agregado.scouts.total[sigla] || 0) + valor;
          agregado.scouts[local][sigla] = (agregado.scouts[local][sigla] || 0) + valor;
        }
      }

      // Atualiza dados do clube
      const clubeAgregado = this.dadosClubesAgregados[clubeId];
      if (clubeAgregado) {
        clubeAgregado.pontuacao.total += atleta.pontuacao;
        clubeAgregado.pontuacao[local] += atleta.pontuacao;
        
        if (atleta.scout) {
          for (const sigla in atleta.scout) {
            const valor = atleta.scout[sigla];
            clubeAgregado.scouts.total[sigla] = (clubeAgregado.scouts.total[sigla] || 0) + valor;
            clubeAgregado.scouts[local][sigla] = (clubeAgregado.scouts[local][sigla] || 0) + valor;
          }
        }
      }
    }
  }

  getFilteredAtletas({ clubeId, posId, local, viewMode, metricaSelecionada }) {
    let atletasFiltrados = Object.values(this.dadosAgregados);

    if (clubeId !== 'todos') {
      atletasFiltrados = atletasFiltrados.filter(a => a.clube_id == clubeId);
    }
    
    if (posId !== 'todos') {
      atletasFiltrados = atletasFiltrados.filter(a => a.posicao_id == posId);
    }
    
    if (local !== 'todos') {
      atletasFiltrados = atletasFiltrados.filter(a => a.jogos[local] > 0);
    }

    if (viewMode === 'soma' && metricaSelecionada !== 'pontuacao') {
      atletasFiltrados = atletasFiltrados.filter(atleta => 
        (atleta.scouts.total[metricaSelecionada] || 0) > 0
      );
    }

    return this.sortAtletas(atletasFiltrados, local, viewMode, metricaSelecionada);
  }

  getFilteredClubes({ local, viewMode, metricaSelecionada }) {
    let clubesFiltrados = Object.values(this.dadosClubesAgregados);

    if (local !== 'todos') {
      clubesFiltrados = clubesFiltrados.filter(c => c.jogos[local] > 0);
    }

    if (viewMode === 'soma' && metricaSelecionada !== 'pontuacao') {
      clubesFiltrados = clubesFiltrados.filter(clube => 
        (clube.scouts.total[metricaSelecionada] || 0) > 0
      );
    }

    return this.sortClubes(clubesFiltrados, local, viewMode, metricaSelecionada);
  }

  sortAtletas(atletas, local, viewMode, metricaSelecionada) {
    return atletas.sort((a, b) => {
      const key = (local === 'todos') ? 'total' : local;
      const jogosA = a.jogos[key] || 0;
      const jogosB = b.jogos[key] || 0;
      
      let valA = (metricaSelecionada === 'pontuacao') 
        ? a.pontuacao[key] 
        : (a.scouts[key][metricaSelecionada] || 0);
      let valB = (metricaSelecionada === 'pontuacao') 
        ? b.pontuacao[key] 
        : (b.scouts[key][metricaSelecionada] || 0);

      if (viewMode === 'media') {
        valA = jogosA > 0 ? valA / jogosA : 0;
        valB = jogosB > 0 ? valB / jogosB : 0;
      }

      return valB - valA;
    });
  }

  sortClubes(clubes, local, viewMode, metricaSelecionada) {
    return clubes.sort((a, b) => {
      const key = (local === 'todos') ? 'total' : local;
      const jogosA = a.jogos[key] || 0;
      const jogosB = b.jogos[key] || 0;
      
      let valA = (metricaSelecionada === 'pontuacao') 
        ? a.pontuacao[key] 
        : (a.scouts[key][metricaSelecionada] || 0);
      let valB = (metricaSelecionada === 'pontuacao') 
        ? b.pontuacao[key] 
        : (b.scouts[key][metricaSelecionada] || 0);

      if (viewMode === 'media') {
        valA = jogosA > 0 ? valA / jogosA : 0;
        valB = jogosB > 0 ? valB / jogosB : 0;
      }

      return valB - valA;
    });
  }
}