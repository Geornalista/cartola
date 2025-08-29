export class FilterManager {
  constructor() {
    this.dataService = null;
    this.uiManager = null;
  }

  setDataService(dataService) {
    this.dataService = dataService;
  }

  setUIManager(uiManager) {
    this.uiManager = uiManager;
  }

  populateFilters(clubesParticipantes, todosClubes, todasPosicoes) {
    this.populateClubFilter(clubesParticipantes, todosClubes);
    this.populatePositionFilter(todasPosicoes);
    this.populateScoutFilters();
  }

  populateClubFilter(clubesParticipantes, todosClubes) {
    const filtroClube = document.getElementById('filtro-clube-jogadores');
    
    const clubesOrdenados = Array.from(clubesParticipantes)
      .map(id => todosClubes[id])
      .filter(Boolean)
      .sort((a, b) => a.nome_fantasia.localeCompare(b.nome_fantasia));

    clubesOrdenados.forEach(clube => {
      const option = document.createElement('option');
      option.value = clube.id;
      option.textContent = clube.nome_fantasia;
      filtroClube.appendChild(option);
    });
  }

  populatePositionFilter(todasPosicoes) {
    const filtroPosicao = document.getElementById('filtro-posicao-jogadores');
    
    Object.values(todasPosicoes).forEach(posicao => {
      const option = document.createElement('option');
      option.value = posicao.id;
      option.textContent = posicao.nome;
      filtroPosicao.appendChild(option);
    });
  }

  populateScoutFilters() {
    const scoutsDescricoes = this.dataService.getScoutsDescricoes();
    const scoutOptions = Object.entries(scoutsDescricoes)
      .sort((a, b) => a[1].localeCompare(b[1]))
      .map(([sigla, desc]) => `<option value="${sigla}">${desc}</option>`)
      .join('');

    document.getElementById('filtro-scout-jogadores').innerHTML += scoutOptions;
    document.getElementById('filtro-scout-clubes').innerHTML += scoutOptions;
  }

  applyFilters() {
    const activeTab = document.querySelector('.tab-button.active').id;
    
    if (activeTab === 'tab-jogadores') {
      this.applyFiltersJogadores();
    } else {
      this.applyFiltersClubes();
    }
  }

  applyFiltersJogadores() {
    const clubeId = document.getElementById('filtro-clube-jogadores').value;
    const posId = document.getElementById('filtro-posicao-jogadores').value;
    const local = document.getElementById('filtro-local-jogadores').value;
    const viewMode = document.querySelector('input[name="view-mode-jogadores"]:checked').value;
    const metricaSelecionada = document.getElementById('filtro-scout-jogadores').value;

    const atletasFiltrados = this.dataService.getFilteredAtletas({
      clubeId,
      posId,
      local,
      viewMode,
      metricaSelecionada
    });

    this.uiManager.renderAtletas(
      atletasFiltrados,
      this.dataService.todosClubes,
      this.dataService.todasPosicoes,
      this.dataService.getScoutsDescricoes()
    );
  }

  applyFiltersClubes() {
    const local = document.getElementById('filtro-local-clubes').value;
    const viewMode = document.querySelector('input[name="view-mode-clubes"]:checked').value;
    const metricaSelecionada = document.getElementById('filtro-scout-clubes').value;

    const clubesFiltrados = this.dataService.getFilteredClubes({
      local,
      viewMode,
      metricaSelecionada
    });

    this.uiManager.renderClubes(
      clubesFiltrados,
      this.dataService.getScoutsDescricoes()
    );
  }
}