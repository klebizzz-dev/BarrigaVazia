import "./style.css";
import { api } from "./api.js";

const estado = {
  abaAtiva: "doacoes",
  saude: { status: "verificando", banco: "..." },
  doadores: [],
  itens: [],
  doacoes: [],
  carregando: true,
  erroGlobal: null,
  doadorEmEdicao: null,
  buscaDoador: "",
  buscaDoacao: "",
  itensFormularioDoacao: [{ id_item: "", quantidade: 1 }],
};

function escaparHtml(valor) {
  if (valor === null || valor === undefined) return "";
  return String(valor)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function dataHojeISO() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function formatarData(dataStr) {
  if (!dataStr) return "—";
  const partes = String(dataStr).slice(0, 10).split("-");
  if (partes.length !== 3) return escaparHtml(dataStr);
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function mostrarNotificacao(mensagem, tipo = "sucesso") {
  const container = document.querySelector("#toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast toast-${tipo}`;
  toast.textContent = mensagem;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("toast-saindo");
    setTimeout(() => toast.remove(), 220);
  }, 3800);
}

function montarEstruturaInicial() {
  const app = document.querySelector("#app");
  app.innerHTML = `
    <div id="toast-container" class="toast-container" aria-live="polite"></div>

    <header class="navbar">
      <div class="navbar-inner">
        <div class="navbar-esquerda">
          <a href="#doacoes" class="brand" id="link-brand">
            <span class="brand-mark">BV</span>
            <div class="brand-text">
              <span class="brand-name">Barriga Vazia</span>
              <span class="brand-sep">/</span>
              <span class="brand-sub">ConectaDoa</span>
            </div>
          </a>

          <nav class="nav-links" aria-label="Navegação principal">
            <button type="button" class="nav-item ativo" data-aba="doacoes">
              Doações
              <span class="nav-count" id="nav-count-doacoes">0</span>
            </button>
            <button type="button" class="nav-item" data-aba="doadores">
              Doadores
              <span class="nav-count" id="nav-count-doadores">0</span>
            </button>
            <button type="button" class="nav-item" data-aba="itens">
              Catálogo
              <span class="nav-count" id="nav-count-itens">0</span>
            </button>
          </nav>
        </div>

        <div class="navbar-direita">
          <div id="status-api" class="status-indicador" title="Status da conexão com a API e banco de dados">
            <span class="status-dot"></span>
            <span id="status-texto">Conectando...</span>
          </div>
          <button type="button" id="btn-recarregar" class="btn-icone" title="Sincronizar dados">
            Sincronizar
          </button>
        </div>
      </div>
    </header>

    <div class="barra-resumo">
      <div class="barra-resumo-inner" id="resumo-strip"></div>
    </div>

    <main class="container">
      <div id="alerta-global"></div>

      <section id="secao-doacoes" class="aba-painel">
        <div class="cabecalho-secao">
          <div>
            <h1>Controle de Doações</h1>
            <p>Lance novas entregas recebidas e consulte o histórico de entradas.</p>
          </div>
        </div>

        <div class="layout-colunas">
          <aside class="coluna-form">
            <div class="painel">
              <div class="painel-topo">
                <h2>Nova entrada</h2>
              </div>

              <form id="form-doacao" class="formulario">
                <div class="campo">
                  <div class="campo-topo">
                    <label for="doacao-doador">Doador</label>
                    <button type="button" id="atalho-novo-doador" class="link-acao">
                      + Novo doador
                    </button>
                  </div>
                  <select id="doacao-doador" required>
                    <option value="">Selecione...</option>
                  </select>
                </div>

                <div class="campo">
                  <label for="doacao-data">Data do recebimento</label>
                  <input type="date" id="doacao-data" required />
                </div>

                <div class="campo">
                  <label for="doacao-observacao">Observações</label>
                  <input
                    type="text"
                    id="doacao-observacao"
                    maxlength="255"
                    placeholder="Opcional (ex.: campanha, lote, responsável)"
                  />
                </div>

                <div class="campo">
                  <div class="campo-topo">
                    <label>Itens recebidos</label>
                    <button type="button" id="btn-adicionar-item" class="link-acao">
                      + Adicionar linha
                    </button>
                  </div>
                  <div id="lista-itens-form" class="itens-editor"></div>
                </div>

                <div class="form-rodape">
                  <button type="submit" id="btn-salvar-doacao" class="btn btn-primario">
                    Confirmar recebimento
                  </button>
                </div>
              </form>
            </div>
          </aside>

          <div class="coluna-conteudo">
            <div class="painel">
              <div class="painel-topo painel-topo-filtro">
                <h2>Registros de entrada</h2>
                <div class="input-filtro-wrap">
                  <input
                    type="search"
                    id="busca-doacao"
                    placeholder="Buscar por doador, item ou observação..."
                    aria-label="Filtrar doações"
                  />
                </div>
              </div>

              <div id="lista-doacoes"></div>
            </div>
          </div>
        </div>
      </section>

      <section id="secao-doadores" class="aba-painel oculto">
        <div class="cabecalho-secao">
          <div>
            <h1>Cadastro de Doadores</h1>
            <p>Pessoas físicas, empresas e instituições parceiras da ONG.</p>
          </div>
        </div>

        <div class="layout-colunas">
          <aside class="coluna-form">
            <div class="painel">
              <div class="painel-topo">
                <h2 id="titulo-form-doador">Novo doador</h2>
              </div>

              <form id="form-doador" class="formulario">
                <div class="campo">
                  <label for="doador-nome">Nome ou razão social</label>
                  <input
                    type="text"
                    id="doador-nome"
                    maxlength="150"
                    required
                    placeholder="Nome completo ou empresa"
                  />
                </div>

                <div class="campo">
                  <label for="doador-email">E-mail</label>
                  <input
                    type="email"
                    id="doador-email"
                    maxlength="100"
                    placeholder="email@dominio.com"
                  />
                </div>

                <div class="campo">
                  <label for="doador-telefone">Telefone</label>
                  <input
                    type="text"
                    id="doador-telefone"
                    maxlength="20"
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div class="form-rodape">
                  <button type="submit" id="btn-salvar-doador" class="btn btn-primario">
                    Salvar cadastro
                  </button>
                  <button
                    type="button"
                    id="btn-cancelar-edicao"
                    class="btn btn-neutro oculto"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </aside>

          <div class="coluna-conteudo">
            <div class="painel">
              <div class="painel-topo painel-topo-filtro">
                <h2>Base de doadores</h2>
                <div class="input-filtro-wrap">
                  <input
                    type="search"
                    id="busca-doador"
                    placeholder="Filtrar por nome, e-mail ou telefone..."
                    aria-label="Buscar doadores"
                  />
                </div>
              </div>

              <div id="lista-doadores" class="tabela-wrap"></div>
            </div>
          </div>
        </div>
      </section>

      <section id="secao-itens" class="aba-painel oculto">
        <div class="cabecalho-secao">
          <div>
            <h1>Catálogo de Itens</h1>
            <p>Relação de insumos padronizados no banco e volume acumulado por item.</p>
          </div>
        </div>

        <div id="catalogo-itens" class="catalogo-colunas"></div>
      </section>
    </main>

    <footer class="rodape">
      <div class="rodape-inner">
        <span>ONG Barriga Vazia</span>
        <span class="rodape-sep">·</span>
        <span>Sistema ConectaDoa — Projeto Integrador Extensionista</span>
      </div>
    </footer>
  `;

  document.querySelector("#doacao-data").value = dataHojeISO();
  configurarEventos();
}

function atualizarStatusApiUI() {
  const badge = document.querySelector("#status-api");
  const texto = document.querySelector("#status-texto");
  if (!badge || !texto) return;

  badge.className = "status-indicador";
  if (estado.saude.status === "ok" && estado.saude.banco === "ok") {
    badge.classList.add("online");
    texto.textContent = "MySQL conectado";
  } else if (estado.saude.status === "ok") {
    badge.classList.add("parcial");
    texto.textContent = `Banco: ${estado.saude.banco}`;
  } else {
    badge.classList.add("offline");
    texto.textContent = "API offline";
  }
}

function renderizarAlertaGlobal() {
  const container = document.querySelector("#alerta-global");
  if (!container) return;

  if (!estado.erroGlobal) {
    container.innerHTML = "";
    return;
  }

  container.innerHTML = `
    <div class="aviso-erro">
      <div>
        <strong>Falha de conexão com a API:</strong>
        <span>${escaparHtml(estado.erroGlobal)}. Confirme se o servidor está ativo (<code>vp run api</code>) e se o MySQL do XAMPP está iniciado.</span>
      </div>
      <button type="button" id="btn-tentar-novamente" class="btn btn-neutro btn-sm">
        Tentar novamente
      </button>
    </div>
  `;

  document.querySelector("#btn-tentar-novamente")?.addEventListener("click", () => carregarDados());
}

function renderizarResumo() {
  const totalDoacoes = estado.doacoes.length;
  const totalDoadores = estado.doadores.length;
  const totalUnidades = estado.doacoes.reduce(
    (acc, doacao) =>
      acc + doacao.itens.reduce((soma, item) => soma + Number(item.quantidade || 0), 0),
    0,
  );
  const ultimaData = estado.doacoes[0]?.data_doacao
    ? formatarData(estado.doacoes[0].data_doacao)
    : "—";

  const countDoacoes = document.querySelector("#nav-count-doacoes");
  const countDoadores = document.querySelector("#nav-count-doadores");
  const countItens = document.querySelector("#nav-count-itens");
  if (countDoacoes) countDoacoes.textContent = totalDoacoes;
  if (countDoadores) countDoadores.textContent = totalDoadores;
  if (countItens) countItens.textContent = estado.itens.length;

  const strip = document.querySelector("#resumo-strip");
  if (!strip) return;

  strip.innerHTML = `
    <div class="metrica-inline">
      <span class="metrica-label">Entradas registradas</span>
      <strong class="metrica-num">${totalDoacoes}</strong>
    </div>
    <span class="metrica-divisor"></span>
    <div class="metrica-inline">
      <span class="metrica-label">Volume arrecadado</span>
      <strong class="metrica-num">${totalUnidades} <small>itens</small></strong>
    </div>
    <span class="metrica-divisor"></span>
    <div class="metrica-inline">
      <span class="metrica-label">Doadores ativos</span>
      <strong class="metrica-num">${totalDoadores}</strong>
    </div>
    <span class="metrica-divisor"></span>
    <div class="metrica-inline">
      <span class="metrica-label">Última doação</span>
      <strong class="metrica-num">${ultimaData}</strong>
    </div>
  `;
}

function renderizarSelectDoadores() {
  const select = document.querySelector("#doacao-doador");
  if (!select) return;

  const valorAtual = select.value;
  const opcoes = estado.doadores
    .map((d) => `<option value="${d.id_doador}">${escaparHtml(d.nome)}</option>`)
    .join("");

  select.innerHTML = `<option value="">Selecione...</option>${opcoes}`;

  if (valorAtual && estado.doadores.some((d) => String(d.id_doador) === String(valorAtual))) {
    select.value = valorAtual;
  }
}

function gerarOpcoesItensHTML(idSelecionado) {
  const porCategoria = new Map();
  for (const item of estado.itens) {
    if (!porCategoria.has(item.categoria)) {
      porCategoria.set(item.categoria, []);
    }
    porCategoria.get(item.categoria).push(item);
  }

  let html = `<option value="">Escolha um item...</option>`;
  for (const [categoria, lista] of porCategoria.entries()) {
    html += `<optgroup label="${escaparHtml(categoria)}">`;
    for (const item of lista) {
      const selecionado = String(item.id_item) === String(idSelecionado) ? "selected" : "";
      html += `<option value="${item.id_item}" ${selecionado}>${escaparHtml(item.nome)} (${escaparHtml(item.unidade)})</option>`;
    }
    html += `</optgroup>`;
  }
  return html;
}

function renderizarItensFormularioDoacao() {
  const container = document.querySelector("#lista-itens-form");
  if (!container) return;

  if (estado.itensFormularioDoacao.length === 0) {
    estado.itensFormularioDoacao.push({ id_item: "", quantidade: 1 });
  }

  container.innerHTML = estado.itensFormularioDoacao
    .map((linha, indice) => {
      const itemInfo = estado.itens.find((i) => String(i.id_item) === String(linha.id_item));
      const unidadeLabel = itemInfo ? itemInfo.unidade : "un.";
      const podeRemover = estado.itensFormularioDoacao.length > 1;

      return `
        <div class="linha-item" data-indice="${indice}">
          <select class="select-item-doacao" data-indice="${indice}" required aria-label="Item">
            ${gerarOpcoesItensHTML(linha.id_item)}
          </select>
          <div class="qtd-box">
            <input
              type="number"
              class="input-qtd-doacao"
              data-indice="${indice}"
              min="1"
              step="1"
              value="${Number(linha.quantidade) || 1}"
              required
              aria-label="Quantidade"
            />
            <span class="qtd-unidade">${escaparHtml(unidadeLabel)}</span>
          </div>
          <button
            type="button"
            class="btn-remover-linha"
            data-indice="${indice}"
            title="Remover linha"
            ${podeRemover ? "" : "disabled"}
          >
            ×
          </button>
        </div>
      `;
    })
    .join("");
}

function renderizarListaDoacoes() {
  const container = document.querySelector("#lista-doacoes");
  if (!container) return;

  if (estado.carregando) {
    container.innerHTML = `<div class="vazio">Carregando registros...</div>`;
    return;
  }

  const termo = estado.buscaDoacao.trim().toLowerCase();
  const filtradas = estado.doacoes.filter((d) => {
    if (!termo) return true;
    const nomeDoador = d.doador?.nome?.toLowerCase() || "";
    const obs = d.observacao?.toLowerCase() || "";
    const temItem = d.itens.some((i) => i.nome.toLowerCase().includes(termo));
    return nomeDoador.includes(termo) || obs.includes(termo) || temItem;
  });

  if (filtradas.length === 0) {
    container.innerHTML = `
      <div class="vazio">
        ${termo ? "Nenhum registro corresponde ao filtro." : "Nenhuma doação registrada."}
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="tabela-wrap">
      <table class="tabela">
        <thead>
          <tr>
            <th class="col-id">Reg.</th>
            <th class="col-data">Data</th>
            <th>Doador / Observação</th>
            <th>Itens entregues</th>
          </tr>
        </thead>
        <tbody>
          ${filtradas
            .map((doacao) => {
              const itensTags = doacao.itens
                .map(
                  (item) => `
                    <span class="tag-item">
                      <b>${Number(item.quantidade)}×</b> ${escaparHtml(item.nome)}
                      <small>(${escaparHtml(item.unidade)})</small>
                    </span>
                  `,
                )
                .join("");

              return `
                <tr>
                  <td class="col-id mono">#${doacao.id_doacao}</td>
                  <td class="col-data mono">${formatarData(doacao.data_doacao)}</td>
                  <td>
                    <div class="celula-principal">${escaparHtml(doacao.doador?.nome || "—")}</div>
                    ${
                      doacao.observacao
                        ? `<div class="celula-sub">${escaparHtml(doacao.observacao)}</div>`
                        : ""
                    }
                  </td>
                  <td>
                    <div class="tags-grupo">${itensTags}</div>
                  </td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderizarListaDoadores() {
  const container = document.querySelector("#lista-doadores");
  if (!container) return;

  if (estado.carregando) {
    container.innerHTML = `<div class="vazio">Carregando doadores...</div>`;
    return;
  }

  const termo = estado.buscaDoador.trim().toLowerCase();
  const filtrados = estado.doadores.filter((d) => {
    if (!termo) return true;
    return (
      d.nome?.toLowerCase().includes(termo) ||
      d.email?.toLowerCase().includes(termo) ||
      d.telefone?.toLowerCase().includes(termo)
    );
  });

  if (filtrados.length === 0) {
    container.innerHTML = `
      <div class="vazio">
        ${termo ? "Nenhum doador encontrado para a busca." : "Nenhum doador cadastrado."}
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <table class="tabela">
      <thead>
        <tr>
          <th class="col-id">ID</th>
          <th>Nome / Razão social</th>
          <th>E-mail</th>
          <th>Telefone</th>
          <th class="col-data">Cadastro</th>
          <th class="col-acoes"></th>
        </tr>
      </thead>
      <tbody>
        ${filtrados
          .map(
            (d) => `
          <tr class="${estado.doadorEmEdicao?.id_doador === d.id_doador ? "linha-ativa" : ""}">
            <td class="col-id mono">#${d.id_doador}</td>
            <td class="celula-principal">${escaparHtml(d.nome)}</td>
            <td>${d.email ? escaparHtml(d.email) : '<span class="texto-vazio">—</span>'}</td>
            <td class="mono">${d.telefone ? escaparHtml(d.telefone) : '<span class="texto-vazio">—</span>'}</td>
            <td class="col-data mono">${formatarData(d.data_cadastro)}</td>
            <td class="col-acoes">
              <div class="acoes-linha">
                <button
                  type="button"
                  class="btn-tabela btn-editar-doador"
                  data-id="${d.id_doador}"
                >
                  Editar
                </button>
                <button
                  type="button"
                  class="btn-tabela btn-tabela-perigo btn-excluir-doador"
                  data-id="${d.id_doador}"
                >
                  Excluir
                </button>
              </div>
            </td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  `;
}

function renderizarCatalogoItens() {
  const container = document.querySelector("#catalogo-itens");
  if (!container) return;

  if (estado.carregando) {
    container.innerHTML = `<div class="vazio">Carregando catálogo...</div>`;
    return;
  }

  if (estado.itens.length === 0) {
    container.innerHTML = `<div class="vazio">Nenhum item cadastrado.</div>`;
    return;
  }

  const totalPorItem = new Map();
  for (const doacao of estado.doacoes) {
    for (const item of doacao.itens) {
      const atual = totalPorItem.get(item.id_item) || 0;
      totalPorItem.set(item.id_item, atual + Number(item.quantidade || 0));
    }
  }

  const porCategoria = new Map();
  for (const item of estado.itens) {
    if (!porCategoria.has(item.categoria)) {
      porCategoria.set(item.categoria, []);
    }
    porCategoria.get(item.categoria).push(item);
  }

  container.innerHTML = [...porCategoria.entries()]
    .map(
      ([categoria, itens]) => `
        <div class="painel">
          <div class="painel-topo">
            <h2>${escaparHtml(categoria)}</h2>
            <span class="painel-meta">${itens.length} itens</span>
          </div>
          <table class="tabela">
            <thead>
              <tr>
                <th>Item</th>
                <th>Unidade</th>
                <th class="col-acoes">Total recebido</th>
              </tr>
            </thead>
            <tbody>
              ${itens
                .map((item) => {
                  const arrecadado = totalPorItem.get(item.id_item) || 0;
                  return `
                    <tr>
                      <td class="celula-principal">${escaparHtml(item.nome)}</td>
                      <td class="celula-sub">${escaparHtml(item.unidade)}</td>
                      <td class="col-acoes mono">
                        <strong class="${arrecadado > 0 ? "qtd-positiva" : "texto-vazio"}">
                          ${arrecadado}
                        </strong>
                      </td>
                    </tr>
                  `;
                })
                .join("")}
            </tbody>
          </table>
        </div>
      `,
    )
    .join("");
}

function renderizarTudo() {
  atualizarStatusApiUI();
  renderizarAlertaGlobal();
  renderizarResumo();
  renderizarSelectDoadores();
  renderizarItensFormularioDoacao();
  renderizarListaDoacoes();
  renderizarListaDoadores();
  renderizarCatalogoItens();
}

function trocarAba(nomeAba) {
  estado.abaAtiva = nomeAba;

  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.classList.toggle("ativo", btn.dataset.aba === nomeAba);
  });

  document.querySelector("#secao-doacoes")?.classList.toggle("oculto", nomeAba !== "doacoes");
  document.querySelector("#secao-doadores")?.classList.toggle("oculto", nomeAba !== "doadores");
  document.querySelector("#secao-itens")?.classList.toggle("oculto", nomeAba !== "itens");
}

function iniciarEdicaoDoador(doador) {
  estado.doadorEmEdicao = doador;
  document.querySelector("#titulo-form-doador").textContent = `Editando #${doador.id_doador}`;
  document.querySelector("#doador-nome").value = doador.nome || "";
  document.querySelector("#doador-email").value = doador.email || "";
  document.querySelector("#doador-telefone").value = doador.telefone || "";
  document.querySelector("#btn-salvar-doador").textContent = "Atualizar dados";
  document.querySelector("#btn-cancelar-edicao").classList.remove("oculto");
  renderizarListaDoadores();
  document.querySelector("#doador-nome").focus();
}

function limparFormularioDoador() {
  estado.doadorEmEdicao = null;
  document.querySelector("#titulo-form-doador").textContent = "Novo doador";
  document.querySelector("#form-doador").reset();
  document.querySelector("#btn-salvar-doador").textContent = "Salvar cadastro";
  document.querySelector("#btn-cancelar-edicao").classList.add("oculto");
  renderizarListaDoadores();
}

async function carregarDados() {
  estado.carregando = true;
  estado.erroGlobal = null;
  renderizarTudo();

  try {
    const saude = await api.verificarSaude();
    estado.saude = saude;
  } catch {
    estado.saude = { status: "erro", banco: "sem conexão" };
  }
  atualizarStatusApiUI();

  try {
    const [doadores, itens, doacoes] = await Promise.all([
      api.listarDoadores(),
      api.listarItens(),
      api.listarDoacoes(),
    ]);
    estado.doadores = doadores;
    estado.itens = itens;
    estado.doacoes = doacoes;
  } catch (erro) {
    estado.erroGlobal = erro.message || "Falha de comunicação com o servidor";
  } finally {
    estado.carregando = false;
    renderizarTudo();
  }
}

function configurarEventos() {
  document.querySelector("#link-brand").addEventListener("click", (e) => {
    e.preventDefault();
    trocarAba("doacoes");
  });

  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => trocarAba(btn.dataset.aba));
  });

  document.querySelector("#btn-recarregar").addEventListener("click", () => {
    carregarDados();
  });

  document.querySelector("#atalho-novo-doador").addEventListener("click", () => {
    trocarAba("doadores");
    limparFormularioDoador();
    document.querySelector("#doador-nome").focus();
  });

  document.querySelector("#btn-adicionar-item").addEventListener("click", () => {
    estado.itensFormularioDoacao.push({ id_item: "", quantidade: 1 });
    renderizarItensFormularioDoacao();
  });

  const listaItensForm = document.querySelector("#lista-itens-form");
  listaItensForm.addEventListener("change", (evento) => {
    const alvo = evento.target;
    const indice = Number(alvo.dataset.indice);
    if (Number.isNaN(indice)) return;

    if (alvo.classList.contains("select-item-doacao")) {
      estado.itensFormularioDoacao[indice].id_item = alvo.value ? Number(alvo.value) : "";
      renderizarItensFormularioDoacao();
    } else if (alvo.classList.contains("input-qtd-doacao")) {
      estado.itensFormularioDoacao[indice].quantidade = Number(alvo.value);
    }
  });

  listaItensForm.addEventListener("input", (evento) => {
    const alvo = evento.target;
    if (alvo.classList.contains("input-qtd-doacao")) {
      const indice = Number(alvo.dataset.indice);
      estado.itensFormularioDoacao[indice].quantidade = Number(alvo.value);
    }
  });

  listaItensForm.addEventListener("click", (evento) => {
    const botaoRemover = evento.target.closest(".btn-remover-linha");
    if (!botaoRemover) return;
    const indice = Number(botaoRemover.dataset.indice);
    if (estado.itensFormularioDoacao.length > 1) {
      estado.itensFormularioDoacao.splice(indice, 1);
      renderizarItensFormularioDoacao();
    }
  });

  document.querySelector("#form-doacao").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const idDoador = Number(document.querySelector("#doacao-doador").value);
    const dataDoacao = document.querySelector("#doacao-data").value;
    const observacao = document.querySelector("#doacao-observacao").value.trim();

    const itensLimpos = estado.itensFormularioDoacao.map((i) => ({
      id_item: Number(i.id_item),
      quantidade: Number(i.quantidade),
    }));

    const botao = document.querySelector("#btn-salvar-doacao");
    botao.disabled = true;

    try {
      await api.criarDoacao({
        id_doador: idDoador,
        data_doacao: dataDoacao,
        observacao: observacao || null,
        itens: itensLimpos,
      });

      mostrarNotificacao("Doação registrada.", "sucesso");
      document.querySelector("#doacao-observacao").value = "";
      document.querySelector("#doacao-data").value = dataHojeISO();
      estado.itensFormularioDoacao = [{ id_item: "", quantidade: 1 }];
      await carregarDados();
    } catch (erro) {
      mostrarNotificacao(erro.message, "erro");
    } finally {
      botao.disabled = false;
    }
  });

  document.querySelector("#busca-doacao").addEventListener("input", (evento) => {
    estado.buscaDoacao = evento.target.value;
    renderizarListaDoacoes();
  });

  document.querySelector("#form-doador").addEventListener("submit", async (evento) => {
    evento.preventDefault();

    const dados = {
      nome: document.querySelector("#doador-nome").value.trim(),
      email: document.querySelector("#doador-email").value.trim() || null,
      telefone: document.querySelector("#doador-telefone").value.trim() || null,
    };

    const botao = document.querySelector("#btn-salvar-doador");
    botao.disabled = true;

    try {
      if (estado.doadorEmEdicao) {
        await api.atualizarDoador(estado.doadorEmEdicao.id_doador, dados);
        mostrarNotificacao("Cadastro atualizado.", "sucesso");
      } else {
        await api.criarDoador(dados);
        mostrarNotificacao("Doador cadastrado.", "sucesso");
      }

      limparFormularioDoador();
      await carregarDados();
    } catch (erro) {
      mostrarNotificacao(erro.message, "erro");
    } finally {
      botao.disabled = false;
    }
  });

  document.querySelector("#btn-cancelar-edicao").addEventListener("click", () => {
    limparFormularioDoador();
  });

  document.querySelector("#busca-doador").addEventListener("input", (evento) => {
    estado.buscaDoador = evento.target.value;
    renderizarListaDoadores();
  });

  document.querySelector("#lista-doadores").addEventListener("click", async (evento) => {
    const btnEditar = evento.target.closest(".btn-editar-doador");
    if (btnEditar) {
      const id = Number(btnEditar.dataset.id);
      const doador = estado.doadores.find((d) => d.id_doador === id);
      if (doador) iniciarEdicaoDoador(doador);
      return;
    }

    const btnExcluir = evento.target.closest(".btn-excluir-doador");
    if (btnExcluir) {
      const id = Number(btnExcluir.dataset.id);
      const doador = estado.doadores.find((d) => d.id_doador === id);
      if (!doador) return;

      const confirmar = window.confirm(`Confirmar a exclusão de "${doador.nome}"?`);
      if (!confirmar) return;

      btnExcluir.disabled = true;
      try {
        await api.excluirDoador(id);
        mostrarNotificacao("Doador removido.", "sucesso");
        if (estado.doadorEmEdicao?.id_doador === id) {
          limparFormularioDoador();
        }
        await carregarDados();
      } catch (erro) {
        mostrarNotificacao(erro.message, "erro");
        btnExcluir.disabled = false;
      }
    }
  });
}

montarEstruturaInicial();
carregarDados();
