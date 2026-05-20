# 🚀 Organizador Automático do Google Drive (Drive Master)

Um script automatizado desenvolvido em **Google Apps Script** para varrer a raiz do seu Google Drive, organizar seus arquivos por categorias e limpar pastas vazias de forma inteligente, respeitando os limites de tempo da própria Google.

---

## ✨ Funcionalidades

*   📂 **Organização por Categoria:** Move arquivos soltos na raiz para pastas automáticas baseadas no tipo de arquivo (Documentos, Planilhas, PDFs, Fotos, Vídeos e Outros).
*   📦 **Filtro de Arquivos Grandes:** Arquivos com mais de 10MB são movidos para uma subpasta especial chamada "Maiores de 10MB".
*   ⚠️ **Quarentena de Sem Nome:** Arquivos criados sem título ou sem nome vão direto para a pasta `00_ARQUIVOS_SEM_NOME`.
*   🛡️ **Isolamento de Duplicados:** O script analisa o nome e o tamanho do arquivo. Se houver um arquivo idêntico, o segundo é isolado na pasta `00_ARQUIVOS_DUPLICADOS` para evitar acúmulo de lixo digital.
*   🔴 **Tratamento de Pastas Vazias:** 
    *   Se a pasta vazia estiver na **raiz**, ela é pintada de vermelho e movida para a quarentena `00_PASTAS_VAZIAS`.
    *   Se estiver **escondida dentro de outra pasta**, ela é apenas pintada de vermelho para você saber onde ela está, sem sair do lugar original.
*   ⏱️ **Trava de Segurança (Anti-Timeout):** O Google limita execuções automáticas a 5 ou 6 minutos. Nosso script monitora o tempo e se auto-interrompe de forma limpa antes de estourar o limite, gerando um relatório do que ficou pendente para a próxima rodada.

---

## 🛠️ Como Configurar no seu Google Drive

Siga este passo a passo simples para colocar o robô para rodar:

### 1. Criar o Script
1. Acesse o seu [Google Drive](https://drive.google.com).
2. Clique no botão **+ Novo** (canto superior esquerdo) > **Mais** > **Google Apps Script**. *(Se não encontrar, acesse direto por [script.google.com](https://script.google.com))*.
3. Apague todo o código padrão do editor.
4. Cole o código do arquivo `codigo.js` deste repositório.
5. Clique no ícone de **Salvar** (o disquete no topo).

### 2. Ativar o Serviço de Cores (Obrigatório)
Se você tentar rodar o script sem este passo, ele vai dar erro ao tentar pintar as pastas.
1. No menu lateral esquerdo do editor do Apps Script, clique no botão **`+`** ao lado da palavra **Serviços**.
2. Na lista que se abrir, procure por **Drive API**.
3. Selecione-o e clique no botão **Adicionar** (canto inferior direito).

### 3. Primeira Execução e Permissões
1. No topo do editor, certifique-se de que a função selecionada é a `organizarDriveMaster`.
2. Clique no botão **Executar** (ícone de *Play* `▷`).
3. O Google abrirá uma janela pedindo autorização de acesso. Clique em **Revisar permissões**, selecione sua conta, vá em **Avançado** (canto inferior esquerdo da janelinha) e depois clique em **Acessar Projeto (não seguro)** para liberar os acessos.

---

## 📅 Como Agendar para Rodar Sozinho Todo Mês

Para nunca mais se preocupar com a bagunça da raiz do Drive:
1. No menu lateral esquerdo do editor do Apps Script, clique no ícone de **Relógio** (Acionadores).
2. Clique no botão **+ Adicionar acionador** (canto inferior direito).
3. Deixe as configurações assim:
   * **Escolha a função que deve ser executada:** `organizarDriveMaster`
   * **Selecione a fonte do evento:** `Baseado no tempo`
   * **Selecione o tipo de acionador com base no tempo:** `Temporizador mensal`
   * **Selecione o dia do mês / hora:** Escolha o dia e horário de sua preferência (ex: Dia 1, entre midnight e 1 AM).
4. Clique em **Salvar**.

---

## 📊 Relatório de Execução
Ao final de cada rodada, o script gera um relatório visual no console (Aba "Registro de Execução"). Ele vai te mostrar exatamente:
* Quantos arquivos foram movidos.
* Quantas pastas foram limpas ou pintadas.
* Se a tarefa foi 100% concluída ou se ficou algo pendente devido ao limite de tempo de 5 minutos da Google.

---
💡 *Dica: Se o seu Drive tiver milhares de arquivos acumulados na raiz, execute o script manualmente umas 3 ou 4 vezes seguidas no primeiro dia até que o relatório acuse "🎉 Nada pendente!". Depois disso, o gatilho mensal dará conta do recado em poucos segundos!*
