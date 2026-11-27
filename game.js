// =========================================================
// JOGO: ritadivaprota - Laboratório de Frações (6º Ano)
// =========================================================

// Lista das 10 rodadas com dificuldade crescente
// totalPartes = denominador (em quantos pedaços o tubo é dividido)
// partesAlvo = numerador (quantos pedaços o jogador precisa preencher)
const desafios = [
  { numerador: 1, denominador: 2, partesAlvo: 1, totalPartes: 2, dica: "Metade do tubo." },
  { numerador: 1, denominador: 3, partesAlvo: 1, totalPartes: 3, dica: "Um pedaço de três partes iguais." },
  { numerador: 3, denominador: 4, partesAlvo: 3, totalPartes: 4, dica: "Três pedaços de quatro partes iguais." },
  { numerador: 2, denominador: 5, partesAlvo: 2, totalPartes: 5, dica: "Dois pedaços de cinco partes iguais." },
  { numerador: 5, denominador: 6, partesAlvo: 5, totalPartes: 6, dica: "Cinco pedaços de seis partes iguais." },
  { numerador: 4, denominador: 8, partesAlvo: 4, totalPartes: 8, dica: "Quatro oitavos equivale à metade do tubo!" },
  { numerador: 3, denominador: 7, partesAlvo: 3, totalPartes: 7, dica: "Três pedaços de sete partes iguais." },
  { numerador: 7, denominador: 10, partesAlvo: 7, totalPartes: 10, dica: "Sete décimos do tubo." },
  // Rodadas finais com frações equivalentes para desafiar o raciocínio
  { numerador: 1, denominador: 2, partesAlvo: 3, totalPartes: 6, dica: "Atenção! O tubo tem 6 partes. Quanto vale 1/2 dele?" },
  { numerador: 2, denominador: 3, partesAlvo: 4, totalPartes: 6, dica: "Desafio final: o tubo tem 6 partes. Quanto vale 2/3 dele?" }
];

// Variáveis de controle da partida
let indiceRodadaAtual = 0;
let pontos = 0;
let totalAcertos = 0;
let partesSelecionadas = 0;
let rodadaRespondida = false;
let tempoInicio = 0;

const pontosPorAcerto = 10;
const pontuacaoMaxima = desafios.length * pontosPorAcerto;

// Elementos da tela
const telaInicio = document.getElementById("tela-inicio");
const telaJogo = document.getElementById("tela-jogo");
const telaFim = document.getElementById("tela-fim");

const infoRodada = document.getElementById("info-rodada");
const infoPontos = document.getElementById("info-pontos");
const valorNumerador = document.getElementById("valor-numerador");
const valorDenominador = document.getElementById("valor-denominador");
const dicaVisual = document.getElementById("dica-visual");
const tuboFracao = document.getElementById("tubo-fracao");
const contadorSelecao = document.getElementById("contador-selecao");

const caixaFeedback = document.getElementById("caixa-feedback");
const textoFeedback = document.getElementById("texto-feedback");

const btnTema = document.getElementById("btn-tema");
const btnComecar = document.getElementById("btn-comecar");
const btnLimpar = document.getElementById("btn-limpar");
const btnConfirmar = document.getElementById("btn-confirmar");
const btnProximo = document.getElementById("btn-proximo");
const btnReiniciar = document.getElementById("btn-reiniciar");

// =========================================================
// INTEGRAÇÃO COM O PORTAL (Contrato vrgame)
// =========================================================

function notificarAlturaPortal() {
  const alturaDocumento = document.documentElement.scrollHeight;
  window.parent.postMessage({
    type: "vrgame:resize",
    height: alturaDocumento
  }, "*");
}

function aplicarTema(tema) {
  const temaEscolhido = tema === "escuro" ? "escuro" : "claro";
  document.documentElement.setAttribute("data-tema", temaEscolhido);
  notificarAlturaPortal();
}

// Escuta mensagens enviadas pelo portal
window.addEventListener("message", function (evento) {
  const dados = evento.data;
  if (!dados || typeof dados !== "object") return;

  if (dados.type === "vrgame:theme") {
    aplicarTema(dados.theme || dados.tema);
  }

  if (dados.type === "vrgame:fullscreen") {
    if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(function () {});
    } else if (document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(function () {});
    }
    notificarAlturaPortal();
  }
});

// Avisa o portal quando o tamanho da tela mudar
window.addEventListener("resize", notificarAlturaPortal);

// =========================================================
// LÓGICA DO JOGO
// =========================================================

function mostrarTela(telaParaExibir) {
  telaInicio.hidden = true;
  telaJogo.hidden = true;
  telaFim.hidden = true;

  telaParaExibir.hidden = false;
  notificarAlturaPortal();
}

function iniciarJogo() {
  indiceRodadaAtual = 0;
  pontos = 0;
  totalAcertos = 0;
  tempoInicio = Date.now();

  mostrarTela(telaJogo);
  carregarRodada();
}

function carregarRodada() {
  const desafio = desafios[indiceRodadaAtual];
  partesSelecionadas = 0;
  rodadaRespondida = false;

  // Atualiza textos do topo e da fração
  infoRodada.textContent = "Rodada " + (indiceRodadaAtual + 1) + " de " + desafios.length;
  infoPontos.textContent = "Pontos: " + pontos;
  valorNumerador.textContent = desafio.numerador;
  valorDenominador.textContent = desafio.denominador;
  dicaVisual.textContent = desafio.dica;

  // Esconde feedback e ajusta botões
  caixaFeedback.hidden = true;
  caixaFeedback.className = "feedback";
  btnLimpar.hidden = false;
  btnConfirmar.hidden = false;
  btnProximo.hidden = true;

  // Monta os pedaços clicáveis do tubo
  tuboFracao.innerHTML = "";
  for (let i = 0; i < desafio.totalPartes; i++) {
    const pedaco = document.createElement("button");
    pedaco.type = "button";
    pedaco.className = "pedaco-tubo";
    pedaco.setAttribute("aria-pressed", "false");
    pedaco.setAttribute("aria-label", "Pedaço " + (i + 1) + " de " + desafio.totalPartes);
    pedaco.textContent = "1/" + desafio.totalPartes;

    pedaco.addEventListener("click", function () {
      alternarPedaco(pedaco);
    });

    tuboFracao.appendChild(pedaco);
  }

  atualizarContador();
  notificarAlturaPortal();
}

function alternarPedaco(pedaco) {
  if (rodadaRespondida) return;

  const jaPreenchido = pedaco.classList.contains("preenchido");

  if (jaPreenchido) {
    pedaco.classList.remove("preenchido");
    pedaco.setAttribute("aria-pressed", "false");
    partesSelecionadas--;
  } else {
    pedaco.classList.add("preenchido");
    pedaco.setAttribute("aria-pressed", "true");
    partesSelecionadas++;
  }

  atualizarContador();
}

function limparTubo() {
  if (rodadaRespondida) return;

  const todosPedacos = tuboFracao.querySelectorAll(".pedaco-tubo");
  todosPedacos.forEach(function (pedaco) {
    pedaco.classList.remove("preenchido");
    pedaco.setAttribute("aria-pressed", "false");
  });

  partesSelecionadas = 0;
  atualizarContador();
}

function atualizarContador() {
  const desafio = desafios[indiceRodadaAtual];
  contadorSelecao.textContent = "Selecionados: " + partesSelecionadas + " de " + desafio.totalPartes + " pedaços";
}

function verificarResposta() {
  if (rodadaRespondida) return;
  rodadaRespondida = true;

  const desafio = desafios[indiceRodadaAtual];

  // Trava os pedaços do tubo após confirmar
  const todosPedacos = tuboFracao.querySelectorAll(".pedaco-tubo");
  todosPedacos.forEach(function (pedaco) {
    pedaco.disabled = true;
  });

  caixaFeedback.hidden = false;

  if (partesSelecionadas === desafio.partesAlvo) {
    pontos += pontosPorAcerto;
    totalAcertos++;
    infoPontos.textContent = "Pontos: " + pontos;

    caixaFeedback.className = "feedback acerto";
    textoFeedback.textContent =
      "Acertou! Você preencheu " + partesSelecionadas + " de " + desafio.totalPartes +
      " partes, formando exatamente " + desafio.numerador + "/" + desafio.denominador + ".";
  } else {
    caixaFeedback.className = "feedback erro";
    textoFeedback.textContent =
      "Você errou! Você preencheu " + partesSelecionadas + " de " + desafio.totalPartes +
      " partes, mas para formar " + desafio.numerador + "/" + desafio.denominador +
      " era preciso preencher " + desafio.partesAlvo + " parte(s).";
  }

  // Troca os botões de ação
  btnLimpar.hidden = true;
  btnConfirmar.hidden = true;
  btnProximo.hidden = false;

  if (indiceRodadaAtual === desafios.length - 1) {
    btnProximo.textContent = "Ver Resultado Final ➔";
  } else {
    btnProximo.textContent = "Próxima Fórmula ➔";
  }

  notificarAlturaPortal();
}

function avancarRodada() {
  indiceRodadaAtual++;

  if (indiceRodadaAtual < desafios.length) {
    carregarRodada();
  } else {
    finalizarJogo();
  }
}

function finalizarJogo() {
  const tempoTotalMs = Date.now() - tempoInicio;

  document.getElementById("pontos-finais").textContent = pontos;
  document.getElementById("pontos-maximos").textContent = pontuacaoMaxima;
  document.getElementById("total-acertos").textContent = totalAcertos;

  const mensagemFinal = document.getElementById("mensagem-final");
  if (totalAcertos >= 8) {
    mensagemFinal.textContent = "Excelente trabalho! Você dominou as frações do laboratório!";
  } else if (totalAcertos >= 5) {
    mensagemFinal.textContent = "Bom resultado! Continue praticando para acertar todas as fórmulas.";
  } else {
    mensagemFinal.textContent = "Valeu a tentativa! Jogue de novo para treinar mais um pouco.";
  }

  mostrarTela(telaFim);

  // Envia resultado final para o portal
  window.parent.postMessage({
    type: "vrgame:finish",
    score: pontos,
    maxScore: pontuacaoMaxima,
    timeMs: tempoTotalMs,
    detail: {
      jogo: "ritadivaprota"
    }
  }, "*");
}

// =========================================================
// EVENTOS DOS BOTÕES E INICIALIZAÇÃO
// =========================================================

btnTema.addEventListener("click", function () {
  const temaAtual = document.documentElement.getAttribute("data-tema");
  const novoTema = temaAtual === "escuro" ? "claro" : "escuro";
  aplicarTema(novoTema);
});

btnComecar.addEventListener("click", iniciarJogo);
btnLimpar.addEventListener("click", limparTubo);
btnConfirmar.addEventListener("click", verificarResposta);
btnProximo.addEventListener("click", avancarRodada);
btnReiniciar.addEventListener("click", iniciarJogo);

// Avisa o portal assim que o jogo terminar de carregar
window.addEventListener("load", function () {
  window.parent.postMessage({ type: "vrgame:ready" }, "*");
  notificarAlturaPortal();
});