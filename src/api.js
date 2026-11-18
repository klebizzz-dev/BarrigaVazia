// Cliente HTTP para comunicação com a API Express (/api)

async function requisicao(url, opcoes = {}) {
  const config = {
    headers: { "Content-Type": "application/json" },
    ...opcoes,
  };

  const resposta = await fetch(url, config);

  if (resposta.status === 204) {
    return null;
  }

  let dados = null;
  try {
    dados = await resposta.json();
  } catch {
    dados = null;
  }

  if (!resposta.ok) {
    const mensagem = dados?.erro || `Erro HTTP ${resposta.status}`;
    throw new Error(mensagem);
  }

  return dados;
}

export const api = {
  verificarSaude() {
    return requisicao("/api/health");
  },

  listarDoadores() {
    return requisicao("/api/doadores");
  },

  buscarDoador(id) {
    return requisicao(`/api/doadores/${id}`);
  },

  criarDoador(dados) {
    return requisicao("/api/doadores", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },

  atualizarDoador(id, dados) {
    return requisicao(`/api/doadores/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
  },

  excluirDoador(id) {
    return requisicao(`/api/doadores/${id}`, {
      method: "DELETE",
    });
  },

  listarItens() {
    return requisicao("/api/itens");
  },

  listarDoacoes() {
    return requisicao("/api/doacoes");
  },

  criarDoacao(dados) {
    return requisicao("/api/doacoes", {
      method: "POST",
      body: JSON.stringify(dados),
    });
  },
};
