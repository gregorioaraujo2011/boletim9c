// CONFIGURAÇÃO FIXA DO ALUNO
const CONFIG_ALUNO = {
  turma: "9C",
  numeroChamada: 13,
  apiUrl: "https://boletim-api.profbt.com.br"
};

// PIN mantido apenas em memória durante a sessão
let pinSessao = "";

// Média mínima para "Bom desempenho"
const MEDIA_MINIMA = 6.0;

// Dados locais padrão / fictícios do projeto
let dadosBoletim = [
  { disciplina: "Língua Portuguesa", tri1: 78, tri2: "8,2", tri3: 8.6, faltas: [2, 2, 1] },
  { disciplina: "Matemática", tri1: 55, tri2: "5,4", tri3: null, faltas: [3, 2, 2] },
  { disciplina: "Ciências", tri1: 84, tri2: 7.9, tri3: "8,3", faltas: [1, 1, 1] },
  { disciplina: "História", tri1: "7,1", tri2: 82, tri3: null, faltas: [1, 2, 1] },
  { disciplina: "Geografia", tri1: 69, tri2: "7,5", tri3: 7.8, faltas: [0, 1, 1] },
  { disciplina: "Língua Inglesa", tri1: 88, tri2: 8.4, tri3: null, faltas: [1, 0, 1] },
  { disciplina: "Arte", tri1: "9,2", tri2: 87, tri3: 9.0, faltas: [1, 1, 0] },
  { disciplina: "Educação Física", tri1: 96, tri2: "9,3", tri3: null, faltas: [0, 1, 0] },
  { disciplina: "Educação Digital", tri1: 91, tri2: 8.9, tri3: "9,4", faltas: [1, 1, 0] },
  { disciplina: "Educação Financeira", tri1: 76, tri2: "7,2", tri3: null, faltas: [1, 1, 1] },
  { disciplina: "Rec. Aprend. Matemática", tri1: 58, tri2: "5,9", tri3: 6.2, faltas: [2, 2, 1] },
  { disciplina: "Leitura Rec. Aprend. Lingua Portuguesa", tri1: 72, tri2: "7,6", tri3: null, faltas: [2, 1, 1] },
  { disciplina: "Pensamento Lógico", tri1: 49, tri2: 5.5, tri3: "5,8", faltas: [2, 2, 2] },
  { disciplina: "Literatura Arte e Movimento", tri1: "8,0", tri2: 84, tri3: null, faltas: [1, 1, 0] },
  { disciplina: "Práticas Experimentais", tri1: 64, tri2: "6,6", tri3: 7.0, faltas: [1, 1, 1] }
];

let modoEdicao = false;

// NORMALIZAÇÃO PARA DADOS ANTIGOS
function normalizarNota(valor) {
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }
  const texto = String(valor).replace(",", ".");
  const numero = Number(texto);
  if (isNaN(numero)) {
    return null;
  }
  if (numero >= 0 && numero <= 10) {
    return numero;
  }
  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }
  return null;
}

function somarFaltas(listaDeFaltas) {
  if (!Array.isArray(listaDeFaltas)) return 0;
  let total = 0;
  listaDeFaltas.forEach(function (f) {
    const n = Number(f);
    if (!isNaN(n)) total += n;
  });
  return total;
}

function calcularMedia(notas) {
  const validas = [];
  notas.forEach(function (n) {
    if (n !== null && n !== undefined) {
      validas.push(n);
    }
  });
  if (validas.length === 0) return null;
  let soma = 0;
  validas.forEach(function (n) {
    soma += n;
  });
  return soma / validas.length;
}

function definirSituacao(media) {
  if (media === null) {
    return "Nota ainda não disponível";
  }
  if (media >= MEDIA_MINIMA) {
    return "Bom desempenho";
  }
  return "Atenção";
}

function formatarNota(valor) {
  if (valor === null || valor === undefined) return "Ainda não lançada";
  return valor.toFixed(1).replace(".", ",");
}

// ELEMENTOS DO DOM
const areaLogin = document.getElementById("area-login");
const campoPinInput = document.getElementById("campo-pin-input");
const btnEntrar = document.getElementById("btn-entrar");
const mensagemLogin = document.getElementById("mensagem-login");

const conteudoBoletim = document.getElementById("conteudo-boletim");
const corpoTabela = document.getElementById("corpo-tabela");

const cardMediaGeral = document.getElementById("card-media-geral");
const cardTotalFaltas = document.getElementById("card-total-faltas");
const cardBomDesempenho = document.getElementById("card-bom-desempenho");
const cardAtencao = document.getElementById("card-atencao");
const cardFrequencia = document.getElementById("card-frequencia");

const btnAlternarEdicao = document.getElementById("btn-alternar-edicao");
const btnSalvarEdicao = document.getElementById("btn-salvar-edicao");
const mensagemSalvar = document.getElementById("mensagem-salvar");

// EVENTOS DE LOGIN E EDIÇÃO
btnEntrar.addEventListener("click", realizarLogin);
btnAlternarEdicao.addEventListener("click", alternarModoEdicao);
btnSalvarEdicao.addEventListener("click", salvarAlteracoes);

async function realizarLogin() {
  const pinDigitado = campoPinInput.value.trim();
  if (!pinDigitado) {
    mensagemLogin.textContent = "Digite o PIN.";
    mensagemLogin.style.color = "#FFB347";