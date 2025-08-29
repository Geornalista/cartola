import { DataService } from '../services/DataService.js';
import { UIManager } from './UIManager.js';
import { FilterManager } from './FilterManager.js';

export class App {
  constructor() {
    this.dataService = new DataService();
    this.uiManager = new UIManager();
    this.filterManager = new FilterManager();
    
    this.setupEventListeners();
  }

  async init() {
    this.renderInitialUI();
    await this.loadData();
    this.setupFilters();
  }

  renderInitialUI() {
    const app = document.getElementById('app');
    app.innerHTML = `
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
    `;
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.id === 'tab-jogadores') {
        this.uiManager.switchTab('jogadores');
      } else if (e.target.id === 'tab-clubes') {
        this.uiManager.switchTab('clubes');
      }
    });

    document.addEventListener('change', (e) => {
      if (e.target.closest('.filters')) {
        this.filterManager.applyFilters();
      }
    });
  }

  async loadData() {
    await this.dataService.fetchAndAggregateData();
    this.hideLoading();
  }

  setupFilters() {
    this.filterManager.setDataService(this.dataService);
    this.filterManager.setUIManager(this.uiManager);
    this.filterManager.populateFilters(
      this.dataService.clubesParticipantes,
      this.dataService.todosClubes,
      this.dataService.todasPosicoes
    );
    this.filterManager.applyFilters();
  }

  hideLoading() {
    const loadingStatus = document.getElementById('loading-status');
    if (loadingStatus) {
      loadingStatus.style.display = 'none';
    }
  }
}