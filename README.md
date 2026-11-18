# ONG Barriga Vazia · Sistema ConectaDoa

Sistema web para gestão de doadores, catálogo de insumos e controle de doações recebidas pela **ONG Barriga Vazia**.  
Desenvolvido como **Projeto Integrador Extensionista II (PIE II) · Análise e Desenvolvimento de Sistemas (ADS)**.

---

## Resumo rápido (para quem já tem o ambiente configurado)

```bash
git clone https://github.com/klebizzz-dev/BarrigaVazia.git && cd BarrigaVazia
vp install
# No MySQL: executar database/schema.sql e database/seed.sql
# Copiar .env.example para .env e ajustar DB_USER / DB_PASSWORD se necessário
# Terminal 1:
vp run api
# Terminal 2:
vp dev
# Abrir http://localhost:5173
```

---

## Guia Passo a Passo Completo (para iniciantes)

Este guia foi escrito para que qualquer pessoa — mesmo sem experiência prévia em programação — consiga instalar e abrir o sistema no próprio computador.

---

### Passo 1 — Instalar os programas necessários

Antes de começar, você precisa ter **3 programas gratuitos** instalados no computador:

1. **Git** (para baixar o projeto):
   - Acesse [https://git-scm.com/downloads](https://git-scm.com/downloads), baixe a versão para o seu sistema (Windows, Mac ou Linux) e instale clicando em _"Next"_ (Avançar) até concluir.
2. **XAMPP** (para rodar o banco de dados MySQL facilmente):
   - Acesse [https://www.apachefriends.org/pt_br/index.html](https://www.apachefriends.org/pt_br/index.html), baixe e instale o XAMPP.
3. **Vite+ (`vp`)** (ferramenta que executa o sistema):
   - Abra o **Prompt de Comando** ou **PowerShell** do Windows (pressione a tecla `Windows`, digite `powershell` e aperte `Enter`).
   - Para instalar o Vite+ no Windows, cole o comando abaixo e aperte `Enter` (ou siga o guia oficial em [https://viteplus.dev](https://viteplus.dev)):
     ```powershell
     irm https://viteplus.dev/install.ps1 | iex
     ```
   - Após instalar, **feche e abra novamente** a janela do PowerShell para que o comando `vp` seja reconhecido.

---

### Passo 2 — Ligar o Banco de Dados no XAMPP

1. Abra o programa **XAMPP Control Panel** no seu computador.
2. Na lista de módulos, procure as linhas **Apache** e **MySQL**.
3. Clique no botão **Start** ao lado de **Apache** e também no botão **Start** ao lado de **MySQL**.
4. Aguarde até que os nomes **Apache** e **MySQL** fiquem com o fundo **verde** (isso significa que o banco de dados está ligado).

---

### Passo 3 — Baixar o projeto para o seu computador

1. Abra o **PowerShell** (ou Terminal).
2. Digite o comando abaixo e aperte `Enter` para baixar a pasta do projeto:
   ```bash
   git clone https://github.com/klebizzz-dev/BarrigaVazia.git
   ```
3. Entre dentro da pasta que acabou de ser baixada digitando:
   ```bash
   cd BarrigaVazia
   ```
4. Instale as bibliotecas do projeto digitando:
   ```bash
   vp install
   ```
   _(Aguarde alguns segundos até que o download das dependências termine)._

---

### Passo 4 — Criar as tabelas e os dados de exemplo no Banco de Dados

Você pode criar o banco de dados de **duas formas** (escolha a que achar mais fácil):

#### Opção A: Pelo navegador usando o phpMyAdmin do XAMPP (mais fácil e visual)

1. Com o XAMPP ligado (Passo 2), abra o seu navegador de internet e acesse:  
   [http://localhost/phpmyadmin](http://localhost/phpmyadmin)
2. No menu superior da página, clique na aba **Importar** (ou _Import_).
3. Clique no botão **Escolher arquivo** (_Choose File_), vá até a pasta onde você baixou o projeto (`BarrigaVazia/database`) e selecione o arquivo **`schema.sql`**.
4. Role a página até o final e clique no botão **Importar** (ou **Executar** / _Go_). Isso criará o banco de dados `conectadoa` e todas as tabelas.
5. Agora repita o processo para colocar os dados de exemplo: clique novamente na aba **Importar** no topo, escolha o arquivo **`seed.sql`** (que também está na pasta `BarrigaVazia/database`) e clique em **Importar** no final da página.

#### Opção B: Pelo terminal do MySQL (para quem prefere linha de comando)

Se você estiver usando o terminal do MySQL dentro da pasta do projeto, basta rodar:

```sql
SOURCE database/schema.sql;
SOURCE database/seed.sql;
```

---

### Passo 5 — Configurar o arquivo `.env` (conexão com o banco)

O sistema precisa de um arquivo chamado `.env` para saber como se conectar ao MySQL.

1. Na pasta do projeto (`BarrigaVazia`), faça uma cópia do arquivo `.env.example` e renomeie a cópia para **`.env`**.
   - Pelo terminal (Windows PowerShell), você pode fazer isso rodando:
     ```powershell
     Copy-Item .env.example .env
     ```
   - Ou no Linux/Mac:
     ```bash
     cp .env.example .env
     ```
2. Se você estiver usando o **XAMPP padrão**, **não precisa alterar nada** dentro do `.env`, pois ele já vem configurado com o usuário padrão do XAMPP (`DB_USER=root` e `DB_PASSWORD=` em branco):
   ```env
   PORT=3000
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=conectadoa
   ```
   _(Caso você utilize outro MySQL que possua senha, basta abrir o arquivo `.env` no Bloco de Notas e digitar sua senha na frente de `DB_PASSWORD=`)._

---

### Passo 6 — Iniciar o sistema (API e Interface Visual)

Para o sistema funcionar completo, precisamos deixar **duas janelas de terminal** abertas ao mesmo tempo: uma para o servidor (API) e outra para a tela do sistema (Frontend).

#### 1º Terminal — Ligar o Servidor (API)

1. Na janela do terminal que já está aberta dentro da pasta `BarrigaVazia`, digite:
   ```bash
   vp run api
   ```
2. Aperte `Enter`. Aparecerá a mensagem: `API rodando em http://localhost:3000`.
3. **Importante:** Não feche essa janela! Deixe-a aberta em segundo plano.

#### 2º Terminal — Ligar a Tela do Sistema (Frontend)

1. Abra uma **nova janela** do PowerShell / Terminal.
2. Entre novamente na pasta do projeto (ou abra o terminal direto na pasta `BarrigaVazia`):
   ```bash
   cd BarrigaVazia
   ```
3. Digite o comando abaixo e aperte `Enter`:
   ```bash
   vp dev
   ```
4. Aparecerá um endereço na tela indicando que o servidor web iniciou: `http://localhost:5173`.

---

### Passo 7 — Acessar o sistema no navegador

1. Abra o seu navegador (Chrome, Edge, Firefox) e digite na barra de endereços:
   **[http://localhost:5173](http://localhost:5173)**
2. Pronto! O sistema da **ONG Barriga Vazia (ConectaDoa)** será exibido com o indicador **"MySQL conectado"** no canto superior direito.

---

## O que funciona e próximos passos (Relatório PIE II)

| Funciona                                                                                | Pendente / Próximas melhorias                                     |
| :-------------------------------------------------------------------------------------- | :---------------------------------------------------------------- |
| Verificação automática de saúde da API e conexão com o MySQL (`/api/health`)            | Editar ou excluir uma doação já registrada no histórico           |
| Cadastro, listagem, busca, edição e exclusão de doadores (`/api/doadores`)              | Cadastrar novos itens e categorias diretamente pela interface web |
| Proteção contra exclusão de doador que já possui doações registradas (status `409`)     | Autenticação com tela de login para voluntários e administradores |
| Registro de nova doação com múltiplos itens em transação única (`/api/doacoes`)         | Exportação de relatório mensal de doações em PDF/CSV              |
| Histórico de doações e catálogo de itens com cálculo do total arrecadado (`/api/itens`) |                                                                   |
