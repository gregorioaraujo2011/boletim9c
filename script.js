// ============================================================
// 📘 CONCEITO: ARRAY e OBJETO
// - ARRAY é uma lista: [item1, item2, item3]
// - OBJETO é um conjunto de características: { nome: "Ana", idade: 14 }
// Aqui temos um ARRAY de OBJETOS: cada disciplina é um objeto.
// ============================================================

const disciplinas = [
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

// Média mínima para "Bom desempenho"
const MEDIA_MINIMA = 6.0;

// ============================================================
// 📘 CONCEITO: FUNÇÃO
// Uma FUNÇÃO é um bloco de código que faz uma tarefa.
// A gente "chama" a função pelo nome quando precisa dela.
// ============================================================

// Normaliza uma nota para a escala 0–10.
// Regras:
// - vazio, null ou undefined → null (nota ainda não lançada)
// - entre 0 e 10 → fica igual
// - entre 10 (exclusivo) e 100 → divide por 10
// - aceita ponto ou vírgula decimal
// - valores inválidos → null
function normalizarNota(valor) {
  // Se for nulo, indefinido ou string vazia, não há nota
  if (valor === null || valor === undefined || valor === "") {
    return null;
  }

  // Troca vírgula por ponto para poder converter em número
  const texto = String(valor).replace(",", ".");
  const numero = Number(texto);

  // Se não for um número válido, retorna null
  if (isNaN(numero)) {
    return null;
  }

  // Entre 0 e 10 permanece igual
  if (numero >= 0 && numero <= 10) {
    return numero;
  }

  // Maior que 10 e até 100 → divide por 10
  if (numero > 10 && numero <= 100) {
    return numero / 10;
  }

  // Fora das regras → inválido
  return null;
}

// Soma as faltas de uma disciplina (array de números)
function somarFaltas(listaDeFaltas) {
  let total = 0;
  listaDeFaltas.forEach(function (f) {
    total += f;
  });
  return total;
}

// Calcula a média usando SOMENTE as notas disponíveis
function calcularMedia(notas) {
  const validas = [];
  notas.forEach(function (n) {
    if (n !== null) {
      validas.push(n);
    }
  });

  if (validas.length === 0) {
    return null; // nenhuma nota válida
  }

  let soma = 0;
  validas.forEach(function (n) {
    soma += n;
  });

  return soma / validas.length;
}

// Define a situação com base na média
// 📘 CONCEITO: IF — toma decisões com base em uma condição
function definirSituacao(media) {
  if (media === null) {
    return "Nota ainda não disponível";
  }
  if (media >= MEDIA_MINIMA) {
    return "Bom desempenho";
  }
  return "Atenção";
}

// Formata um número para o padrão brasileiro (vírgula) com 1 casa
// Ex.: 8.5 → "8,5"   |   10 → "10,0"
function formatarNota(valor) {
  if (valor === null) return "Ainda não lançada";
  return valor.toFixed(1).replace(".", ",");
}

// ============================================================
// 📘 CONCEITO: DOM
// DOM é a "árvore" de elementos da página (títulos, tabela, cards).
// Com JavaScript a gente consegue criar e alterar esses elementos.
// ============================================================

// Pega a referência ao <tbody> da tabela
const corpoTabela = document.getElementById("corpo-tabela");

// Variáveis para os cards de resumo
const cardMediaGeral = document.getElementById("card-media-geral");
const cardTotalFaltas = document.getElementById("card-total-faltas");
const cardBomDesempenho = document.getElementById("card-bom-desempenho");
const cardAtencao = document.getElementById("card-atencao");
const cardFrequencia = document.getElementById("card-frequencia");

// Variáveis acumuladoras para os cards
let somaMedias = 0;
let qtdMedias = 0;
let totalFaltasGeral = 0;
let qtdBom = 0;
let qtdAtencao = 0;

// ============================================================
// 📘 CONCEITO: forEach
// forEach percorre cada item de um array executando uma função.
// Aqui ele percorre as 15 disciplinas.
// ============================================================

disciplinas.forEach(function (d) {
  // 1) Normaliza as notas dos três trimestres
  const n1 = normalizarNota(d.tri1);
  const n2 = normalizarNota(d.tri2);
  const n3 = normalizarNota(d.tri3);

  // 2) Calcula a média usando apenas as notas válidas
  const media = calcularMedia([n1, n2, n3]);

  // 3) Soma as faltas
  const faltas = somarFaltas(d.faltas);

  // 4) Define a situação
  const situacao = definirSituacao(media);

  // 5) Acumula valores para os cards
  totalFaltasGeral += faltas;

  if (media !== null) {
    somaMedias += media;
    qtdMedias++;
  }

  if (situacao === "Bom desempenho") qtdBom++;
  if (situacao === "Atenção") qtdAtencao++;

  // 6) Cria uma linha <tr> na tabela
  const linha = document.createElement("tr");

  // Define a classe de cor da situação
  let classeSituacao = "situacao-sem-nota";
  if (situacao === "Bom desempenho") classeSituacao = "situacao-bom";
  if (situacao === "Atenção") classeSituacao = "situacao-atencao";

  // Monta o conteúdo da linha (com notas já normalizadas e formatadas)
  linha.innerHTML = `
    <td>${d.disciplina}</td>
    <td>${formatarNota(n1)}</td>
    <td>${formatarNota(n2)}</td>
    <td>${formatarNota(n3)}</td>
    <td>${formatarNota(media)}</td>
    <td>${faltas}</td>
    <td class="${classeSituacao}">${situacao}</td>
  `;

  // Adiciona a linha no corpo da tabela
  corpoTabela.appendChild(linha);
});

// ============================================================
// PREENCHIMENTO DOS CARDS DE RESUMO
// ============================================================

// Média geral = média de todas as médias disponíveis
let mediaGeralTexto = "—";
if (qtdMedias > 0) {
  mediaGeralTexto = formatarNota(somaMedias / qtdMedias);
}
cardMediaGeral.textContent = mediaGeralTexto;

// Total de faltas somadas
cardTotalFaltas.textContent = totalFaltasGeral;

// Quantas disciplinas com bom desempenho
cardBomDesempenho.textContent = qtdBom;

// Quantas precisam de atenção
cardAtencao.textContent = qtdAtencao;

// FREQUÊNCIA: valor APENAS DEMONSTRATIVO (não é calculado a partir das faltas).
// No futuro, será tratado de outra forma.
const frequenciaDemonstrativa = 92;
cardFrequencia.textContent = frequenciaDemonstrativa + "% — Frequência adequada";