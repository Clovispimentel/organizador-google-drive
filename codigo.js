function organizarDriveMaster() {
  const tempoInicio = new Date().getTime();
  const LIMITE_TEMPO_MS = 5 * 60 * 1000; // Trava de segurança em 5 minutos

  const raiz = DriveApp.getRootFolder();
  const arquivosRaiz = raiz.getFiles();
  const pastasRaiz = raiz.getFolders();
  
  // CONFIGURAÇÕES DE CORES
  const COR_AMARELO = "#f4b400";  // Categorias
  const COR_VERMELHO = "#db4437"; // Alerta/Quarentena

  const NOME_PASTA_VAZIAS = "00_PASTAS_VAZIAS";
  const NOME_PASTA_SEM_NOME = "00_ARQUIVOS_SEM_NOME";
  const NOME_PASTA_DUPLICADOS = "00_ARQUIVOS_DUPLICADOS";

  const pastaCache = {};
  const arquivosProcessados = {}; 

  // CONTADORES PARA O RELATÓRIO
  const relatorio = {
    arquivosMovidos: 0,
    arquivosDuplicados: 0,
    pastasVaziasRaizMovidas: 0,
    pastasVaziasInternasPintadas: 0,
    tempoEsgotado: false
  };

  Logger.log("🚀 Iniciando a varredura e organização do Google Drive...");

  // 1. ORGANIZAR ARQUIVOS DA RAIZ
  while (arquivosRaiz.hasNext()) {
    if (new Date().getTime() - tempoInicio > LIMITE_TEMPO_MS) {
      relatorio.tempoEsgotado = true;
      break;
    }

    let arquivo = arquivosRaiz.next();
    let nome = arquivo.getName();
    let mime = arquivo.getMimeType();
    let tamanho = arquivo.getSize();

    if (mime === "application/vnd.google-apps.script") continue;

    let pastaDestino;
    
    // Critério 1: Detecção de Duplicados
    let chaveDuplicado = `${nome}_${tamanho}`;
    if (arquivosProcessados[chaveDuplicado]) {
      pastaDestino = obterOuCriarPasta(raiz, NOME_PASTA_DUPLICADOS, COR_VERMELHO, pastaCache);
      arquivo.moveTo(pastaDestino);
      relatorio.arquivosDuplicados++;
      continue;
    }
    
    arquivosProcessados[chaveDuplicado] = true;

    // Critério 2: Sem Nome
    if (nome.toLowerCase().includes("sem título") || nome.toLowerCase().includes("sem nome") || nome.trim() === "") {
      pastaDestino = obterOuCriarPasta(raiz, NOME_PASTA_SEM_NOME, COR_VERMELHO, pastaCache);
    } else {
      // Critério 3: Categorias por MimeType
      let category = 'Outros';
      const mapeamento = {
        'Documentos': ['application/vnd.google-apps.document', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'],
        'Planilhas': ['application/vnd.google-apps.spreadsheet', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
        'PDFs': ['application/pdf'],
        'Fotos': ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        'Vídeos': ['video/mp4', 'video/mpeg', 'video/quicktime']
      };

      for (let key in mapeamento) {
        if (mapeamento[key].includes(mime)) {
          category = key;
          break;
        }
      }
      
      pastaDestino = obterOuCriarPasta(raiz, category, COR_AMARELO, pastaCache);

      if (tamanho > 10 * 1024 * 1024) {
        pastaDestino = obterOuCriarPasta(pastaDestino, "Maiores de 10MB", COR_AMARELO, pastaCache);
      }
    }

    arquivo.moveTo(pastaDestino);
    relatorio.arquivosMovidos++;
  }

  // 2. PROCESSAR PASTAS DA RAIZ E SUBPASTAS
  if (!relatorio.tempoEsgotado) {
    const pastaQuarentenaVazias = obterOuCriarPasta(raiz, NOME_PASTA_VAZIAS, COR_VERMELHO, pastaCache);
    
    while (pastasRaiz.hasNext()) {
      if (new Date().getTime() - tempoInicio > LIMITE_TEMPO_MS) {
        relatorio.tempoEsgotado = true;
        break;
      }

      let pasta = pastasRaiz.next();
      let nomePasta = pasta.getName();

      // Ignora as pastas de controle criadas pelo script
      if (nomePasta === NOME_PASTA_VAZIAS || nomePasta === NOME_PASTA_SEM_NOME || nomePasta === NOME_PASTA_DUPLICADOS || pastaCache[pasta.getId()]) {
        continue;
      }

      // Se a pasta da RAIZ estiver vazia: Pinta de Vermelho E Move
      if (!pasta.getFiles().hasNext() && !pasta.getFolders().hasNext()) {
        alterarCorPasta(pasta.getId(), COR_VERMELHO);
        pasta.moveTo(pastaQuarentenaVazias);
        relatorio.pastasVaziasRaizMovidas++;
      } else {
        // Se NÃO estiver vazia, entra nela para buscar subpastas vazias (Apenas pintar)
        varrerSubpastasEColorir(pasta, tempoInicio, LIMITE_TEMPO_MS, relatorio, NOME_PASTA_VAZIAS, NOME_PASTA_SEM_NOME, NOME_PASTA_DUPLICADOS);
      }
    }
  }

  // 3. EXIBIÇÃO DO RELATÓRIO FINAL
  exibirRelatorio(relatorio);
}

// FUNÇÃO RECURSIVA: Procura pastas vazias dentro de outras pastas (Apenas pinta de vermelho, não move)
function varrerSubpastasEColorir(pastaPai, tempoInicio, limiteTempo, relatorio, nomeVazias, nomeSemNome, nomeDuplicados) {
  if (new Date().getTime() - tempoInicio > limiteTempo) {
    relatorio.tempoEsgotado = true;
    return;
  }

  let subpastas = pastaPai.getFolders();

  while (subpastas.hasNext()) {
    let subpasta = subpastas.next();
    let nomeSub = subpasta.getName();

    if (nomeSub === nomeVazias || nomeSub === nomeSemNome || nomeSub === nomeDuplicados) continue;

    // Se a subpasta interna estiver vazia: APENAS PINTA DE VERMELHO
    if (!subpasta.getFiles().hasNext() && !subpasta.getFolders().hasNext()) {
      alterarCorPasta(subpasta.getId(), "#db4437"); // Vermelho
      relatorio.pastasVaziasInternasPintadas++;
    } else {
      // Se não estiver vazia, continua descendo na árvore de diretórios
      varrerSubpastasEColorir(subpasta, tempoInicio, limiteTempo, relatorio, nomeVazias, nomeSemNome, nomeDuplicados);
    }
  }
}

// GERA O TEXTO E EXIBE NO LOG PARA O USUÁRIO
function exibirRelatorio(rel) {
  Logger.log("\n==================================================" +
             "\n📊 RELATÓRIO DE EXECUÇÃO DO DRIVE MASTER" +
             "\n==================================================" +
             `\n✅ O QUE FOI FEITO:` +
             `\n   - Arquivos organizados por categoria: ${rel.arquivosMovidos}` +
             `\n   - Arquivos duplicados isolados: ${rel.arquivosDuplicados}` +
             `\n   - Pastas vazias da RAIZ (Pintadas e Movidas): ${rel.pastasVaziasRaizMovidas}` +
             `\n   - Pastas vazias INTERNAS (Apenas Pintadas de Vermelho): ${rel.pastasVaziasInternasPintadas}` +
             "\n--------------------------------------------------" +
             `\n❌ O QUE NÃO FOI FEITO / PENDENTE:` +
             (rel.tempoEsgotado 
               ? "\n   - ⚠️ O limite de 5 minutos foi atingido! Alguns arquivos ou subpastas mais profundas não foram analisados nesta rodada e ficaram pendentes para o próximo mês." 
               : "\n   - 🎉 Nada pendente! O Drive foi varrido por completo dentro do tempo limite.") +
             "\n==================================================");
}

function obterOuCriarPasta(pai, nome, corHex, cache) {
  let chave = pai.getId() + "_" + nome;
  if (cache[chave]) return cache[chave];
  let pastas = pai.getFoldersByName(nome);
  let pasta = pastas.hasNext() ? pastas.next() : pai.createFolder(nome);
  alterarCorPasta(pasta.getId(), corHex);
  cache[chave] = pasta;
  return pasta;
}

function alterarCorPasta(pastaId, corHex) {
  try {
    Drive.Files.update({ folderColorRgb: corHex }, pastaId);
  } catch (e) {
    // Silencioso se der erro para não travar a execução
  }
}
