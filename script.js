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
    return;
  }

  mensagemLogin.textContent = "Conectando...";
  mensagemLogin.style.color = "#FFD966";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/abrir`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: String(CONFIG_ALUNO.turma),
        numero_chamada: Number(CONFIG_ALUNO.numeroChamada),
        pin: String(pinDigitado)
      })
    });

    if (resposta.status === 401) {
      mensagemLogin.textContent = "Turma, chamada ou PIN inválidos.";
      mensagemLogin.style.color = "#ff4d4d";
      return;
    }

    if (resposta.status === 429) {
      mensagemLogin.textContent = "Muitas tentativas. Aguarde um minuto e tente novamente.";
      mensagemLogin.style.color = "#ff4d4d";
      return;
    }

    if (!resposta.ok) {
      mensagemLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
      mensagemLogin.style.color = "#ff4d4d";
      return;
    }

    const resultado = await resposta.json();

    // PIN mantido somente em memória
    pinSessao = pinDigitado;
    campoPinInput.value = "";

    // Se existirem dados na API e dados não for null, substitui os dados locais
    if (resultado && resultado.dados && Array.isArray(resultado.dados.disciplinas)) {
      dadosBoletim = resultado.dados.disciplinas;
    }

    areaLogin.style.display = "none";
    conteudoBoletim.style.display = "block";
    renderizarBoletim();

  } catch (erro) {
    mensagemLogin.textContent = "Não foi possível conectar ao servidor. Tente novamente.";
    mensagemLogin.style.color = "#ff4d4d";
  }
}

function renderizarBoletim() {
  corpoTabela.innerHTML = "";

  let somaMedias = 0;
  let qtdMedias = 0;
  let totalFaltasGeral = 0;
  let qtdBom = 0;
  let qtdAtencao = 0;

  dadosBoletim.forEach(function (d, idx) {
    const n1 = normalizarNota(d.tri1);
    const n2 = normalizarNota(d.tri2);
    const n3 = normalizarNota(d.tri3);

    const media = calcularMedia([n1, n2, n3]);
    const faltasArray = Array.isArray(d.faltas) ? d.faltas : [0, 0, 0];
    const faltasTotal = somarFaltas(faltasArray);
    const situacao = definirSituacao(media);

    totalFaltasGeral += faltasTotal;
    if (media !== null) {
      somaMedias += media;
      qtdMedias++;
    }

    if (situacao === "Bom desempenho") qtdBom++;
    if (situacao === "Atenção") qtdAtencao++;

    const linha = document.createElement("tr");

    let classeSituacao = "situacao-sem-nota";
    if (situacao === "Bom desempenho") classeSituacao = "situacao-bom";
    if (situacao === "Atenção") classeSituacao = "situacao-atencao";

    if (!modoEdicao) {
      // MODO VISUALIZAÇÃO COM SEGURANÇA NO DOM
      const tdNome = document.createElement("td");
      tdNome.textContent = d.disciplina;

      const tdTri1 = document.createElement("td");
      tdTri1.textContent = formatarNota(n1);

      const tdTri2 = document.createElement("td");
      tdTri2.textContent = formatarNota(n2);

      const tdTri3 = document.createElement("td");
      tdTri3.textContent = formatarNota(n3);

      const tdMedia = document.createElement("td");
      tdMedia.textContent = formatarNota(media);

      const tdFaltas = document.createElement("td");
      tdFaltas.textContent = faltasTotal;

      const tdSituacao = document.createElement("td");
      tdSituacao.textContent = situacao;
      tdSituacao.className = classeSituacao;

      linha.appendChild(tdNome);
      linha.appendChild(tdTri1);
      linha.appendChild(tdTri2);
      linha.appendChild(tdTri3);
      linha.appendChild(tdMedia);
      linha.appendChild(tdFaltas);
      linha.appendChild(tdSituacao);
    } else {
      // MODO EDIÇÃO
      const tdNome = document.createElement("td");
      tdNome.textContent = d.disciplina;

      function criarInputNota(valor) {
        const inp = document.createElement("input");
        inp.type = "text";
        inp.className = "input-edicao-nota";
        inp.value = valor === null || valor === undefined ? "" : String(valor).replace(".", ",");
        return inp;
      }

      function criarInputFalta(valor) {
        const inp = document.createElement("input");
        inp.type = "text";
        inp.className = "input-edicao-falta";
        inp.value = valor === null || valor === undefined ? "0" : String(valor);
        return inp;
      }

      const tdTri1 = document.createElement("td");
      const in1 = criarInputNota(d.tri1);
      in1.id = `input-tri1-${idx}`;
      tdTri1.appendChild(in1);

      const tdTri2 = document.createElement("td");
      const in2 = criarInputNota(d.tri2);
      in2.id = `input-tri2-${idx}`;
      tdTri2.appendChild(in2);

      const tdTri3 = document.createElement("td");
      const in3 = criarInputNota(d.tri3);
      in3.id = `input-tri3-${idx}`;
      tdTri3.appendChild(in3);

      const tdMedia = document.createElement("td");
      tdMedia.textContent = formatarNota(media);

      const tdFaltas = document.createElement("td");
      const f1 = criarInputFalta(faltasArray[0]);
      f1.id = `input-f1-${idx}`;
      const f2 = criarInputFalta(faltasArray[1]);
      f2.id = `input-f2-${idx}`;
      const f3 = criarInputFalta(faltasArray[2]);
      f3.id = `input-f3-${idx}`;

      tdFaltas.appendChild(f1);
      tdFaltas.appendChild(document.createTextNode(" / "));
      tdFaltas.appendChild(f2);
      tdFaltas.appendChild(document.createTextNode(" / "));
      tdFaltas.appendChild(f3);

      const tdSituacao = document.createElement("td");
      tdSituacao.textContent = situacao;
      tdSituacao.className = classeSituacao;

      linha.appendChild(tdNome);
      linha.appendChild(tdTri1);
      linha.appendChild(tdTri2);
      linha.appendChild(tdTri3);
      linha.appendChild(tdMedia);
      linha.appendChild(tdFaltas);
      linha.appendChild(tdSituacao);
    }

    corpoTabela.appendChild(linha);
  });

  // ATUALIZAR CARDS DE RESUMO
  let mediaGeralTexto = "—";
  if (qtdMedias > 0) {
    mediaGeralTexto = formatarNota(somaMedias / qtdMedias);
  }
  cardMediaGeral.textContent = mediaGeralTexto;
  cardTotalFaltas.textContent = totalFaltasGeral;
  cardBomDesempenho.textContent = qtdBom;
  cardAtencao.textContent = qtdAtencao;

  const frequenciaDemonstrativa = 92;
  cardFrequencia.textContent = frequenciaDemonstrativa + "% — Frequência adequada";
}

function alternarModoEdicao() {
  modoEdicao = !modoEdicao;
  if (modoEdicao) {
    btnAlternarEdicao.textContent = "Cancelar edição";
    btnSalvarEdicao.style.display = "inline-block";
  } else {
    btnAlternarEdicao.textContent = "Alterar dados";
    btnSalvarEdicao.style.display = "none";
    mensagemSalvar.textContent = "";
  }
  renderizarBoletim();
}

// VALIDAÇÃO RIGOROSA DA EDIÇÃO DO ALUNO
function validarNotaDigitada(str) {
  const t = String(str).trim();
  if (t === "") return { ok: true, valor: null };
  const num = Number(t.replace(",", "."));
  if (isNaN(num)) return { ok: false };
  if (num >= 0 && num <= 10) return { ok: true, valor: num };
  return { ok: false };
}

function validarFaltaDigitada(str) {
  const t = String(str).trim();
  if (t === "") return { ok: false };
  const num = Number(t);
  if (isNaN(num)) return { ok: false };
  if (Number.isInteger(num) && num >= 0) return { ok: true, valor: num };
  return { ok: false };
}

async function salvarAlteracoes() {
  let temErro = false;
  const novasDisciplinas = [];

  // Remover marcações anteriores de erro
  document.querySelectorAll(".campo-invalid").forEach(el => el.classList.remove("campo-invalid"));

  for (let idx = 0; idx < dadosBoletim.length; idx++) {
    const in1 = document.getElementById(`input-tri1-${idx}`);
    const in2 = document.getElementById(`input-tri2-${idx}`);
    const in3 = document.getElementById(`input-tri3-${idx}`);

    const f1 = document.getElementById(`input-f1-${idx}`);
    const f2 = document.getElementById(`input-f2-${idx}`);
    const f3 = document.getElementById(`input-f3-${idx}`);

    const res1 = validarNotaDigitada(in1.value);
    const res2 = validarNotaDigitada(in2.value);
    const res3 = validarNotaDigitada(in3.value);

    const rf1 = validarFaltaDigitada(f1.value);
    const rf2 = validarFaltaDigitada(f2.value);
    const rf3 = validarFaltaDigitada(f3.value);

    if (!res1.ok) { in1.classList.add("campo-invalid"); temErro = true; }
    if (!res2.ok) { in2.classList.add("campo-invalid"); temErro = true; }
    if (!res3.ok) { in3.classList.add("campo-invalid"); temErro = true; }

    if (!rf1.ok) { f1.classList.add("campo-invalid"); temErro = true; }
    if (!rf2.ok) { f2.classList.add("campo-invalid"); temErro = true; }
    if (!rf3.ok) { f3.classList.add("campo-invalid"); temErro = true; }

    if (!temErro) {
      novasDisciplinas.push({
        disciplina: dadosBoletim[idx].disciplina,
        tri1: res1.valor,
        tri2: res2.valor,
        tri3: res3.valor,
        faltas: [rf1.valor, rf2.valor, rf3.valor]
      });
    }
  }

  if (temErro) {
    mensagemSalvar.textContent = "Verifique os campos destacados em vermelho.";
    mensagemSalvar.style.color = "#ff4d4d";
    return;
  }

  mensagemSalvar.textContent = "Salvando...";
  mensagemSalvar.style.color = "#FFD966";

  try {
    const resposta = await fetch(`${CONFIG_ALUNO.apiUrl}/api/v1/boletins/salvar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        turma: String(CONFIG_ALUNO.turma),
        numero_chamada: Number(CONFIG_ALUNO.numeroChamada),
        pin: String(pinSessao),
        dados: {
          disciplinas: novasDisciplinas
        }
      })
    });

    if (!resposta.ok) {
      mensagemSalvar.textContent = "Erro ao salvar. Tente novamente.";
      mensagemSalvar.style.color = "#ff4d4d";
      return;
    }

    dadosBoletim = novasDisciplinas;
    modoEdicao = false;
    btnAlternarEdicao.textContent = "Alterar dados";
    btnSalvarEdicao.style.display = "none";
    mensagemSalvar.textContent = "Dados salvos com sucesso.";
    mensagemSalvar.style.color = "#7CFC00";

    renderizarBoletim();

  } catch (erro) {
    mensagemSalvar.textContent = "Erro ao salvar. Tente novamente.";
    mensagemSalvar.style.color = "#ff4d4d";
  }
}