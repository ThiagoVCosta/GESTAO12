# GIT - Gestão Interna de Trabalho (Gestão 12º BPM)

## Visão Geral

O GIT (Gestão Interna de Trabalho) é uma aplicação web robusta e em tempo real, desenvolvida para o controle e gerenciamento de cautelas de viaturas policiais do 12º BPM. Ele permite o acompanhamento dinâmico da frota, o processo de solicitação e devolução de viaturas, e o gerenciamento de perfis de usuários com diferentes níveis de acesso. A aplicação visa otimizar a gestão de recursos móveis, aumentar a transparência operacional, fornecer um histórico detalhado das cautelas e garantir a segurança através de funcionalidades como logout automático por tempo de sessão.

## Funcionalidades Principais

A aplicação oferece funcionalidades distintas baseadas no perfil do usuário logado:

### 1. Policial (Perfil `USER`)

*   **Login:** Acesso ao sistema via matrícula e senha.
*   **Configuração Inicial de Senha:** No primeiro acesso, o policial é obrigado a definir uma nova senha pessoal. O email de autenticação (`authEmail`) é configurado pelo administrador.
*   **Dashboard do Policial:**
    *   Visualização da **viatura atualmente em sua posse**, com detalhes da missão, KM e horário de retirada.
    *   Opção para **solicitar a devolução** da viatura em posse, preenchendo um checklist de devolução e informando a KM final.
    *   Listagem da **frota disponível** para cautela, apresentada em cards interativos.
    *   Visualização de **viaturas em manutenção**.
*   **Solicitar Viatura (Cautela):**
    *   Ao clicar em uma viatura disponível, pode visualizar detalhes como modelo, placa, KM atual.
    *   Pode iniciar uma **solicitação de cautela**, informando a missão, confirmando/atualizando a KM de saída, e preenchendo um **checklist de saída** (verificação de luzes, pneus, combustível, etc.).
    *   Adicionar observações sobre o estado da viatura antes da retirada.
    *   A solicitação é enviada para aprovação da Reserva e aparece em tempo real no painel da Reserva.
*   **Recuperação de Senha:** Funcionalidade para solicitar redefinição de senha através da matrícula. Um link é enviado para o `authEmail` (email pessoal) cadastrado pelo administrador.
*   **Configurações da Conta:** Alterar a própria senha. O email de login não pode ser alterado pelo policial; é necessário contatar um administrador.

### 2. Reserva (Perfil `RESERVA`)

*   **Todas as funcionalidades do Policial.**
*   **Navegação por Abas:** Interface organizada com abas para "Painel Reserva" e "Histórico". O estado da aba ativa é preservado durante a sessão.
*   **Painel Reserva (Aba):**
    *   **Solicitações de Cautela Pendentes:** Lista (atualizada em tempo real) de viaturas solicitadas por policiais, aguardando análise.
        *   **Analisar Cautela:** Visualizar detalhes da solicitação (policial, viatura, missão, checklist de saída).
        *   **Aprovar Saída:** Libera a viatura para o policial, registrando o horário de saída e atualizando o status da viatura para "Em Uso". Pode adicionar observações.
        *   **Recusar Solicitação:** Nega a cautela, podendo adicionar observações.
    *   **Solicitações de Devolução Pendentes:** Lista (atualizada em tempo real) de viaturas cuja devolução foi solicitada por policiais.
        *   **Confirmar Recebimento:** Visualizar detalhes da devolução (KM final informada pelo policial, checklist de devolução, observações do policial).
        *   Confirmar/corrigir a KM final e preencher/validar o **checklist de devolução da Reserva**.
        *   Adicionar observações da Reserva sobre o estado da viatura no recebimento.
        *   Ao confirmar, a viatura retorna ao status "Disponível".
    *   **Viaturas em Uso:** Visualização (atualizada em tempo real) das viaturas atualmente em operação, com informações do condutor, missão e horário de retirada.
        *   **Registrar Devolução Direta:** O Reserva pode registrar a devolução de uma viatura diretamente, preenchendo KM e checklist, mesmo que o policial não tenha iniciado o processo.
        *   Acesso rápido ao histórico de cautelas da viatura.
    *   **Viaturas Disponíveis:** Listagem da frota disponível.
    *   **Viaturas em Manutenção:** Listagem da frota em manutenção.
*   **Histórico (Aba):**
    *   Acesso a uma tabela detalhada com todas as cautelas (concluídas e em andamento).
    *   Filtros por termo de busca (viatura, policial, missão), data inicial e data final.
    *   Funcionalidade de **impressão do relatório** de histórico.
*   **Header com Navegação Rápida:** Botões "RESERVA" (para seu painel padrão) e "CAUTELAS" (para visualizar como Policial).

### 3. Administrador (Perfil `ADMIN`)

*   **Todas as funcionalidades do Policial e da Reserva.**
*   **Navegação Flexível:**
    *   Header com botões "ADMIN", "RESERVA", e "CAUTELAS" para alternar entre os diferentes painéis e visualizações.
    *   Um Administrador pode visualizar e operar o painel da Reserva como se fosse um usuário Reserva.
*   **Painel do Administrador (com abas):** O estado da aba ativa é preservado.
    *   **Gerenciar Frota (Aba):**
        *   Listagem completa de todas as viaturas (atualizada em tempo real).
        *   **Adicionar Nova Viatura:** Formulário para cadastrar prefixo, modelo, placa, KM inicial, e tipo de frota (própria/alugada).
        *   **Editar Viatura.**
        *   **Excluir Viatura** (com restrições).
        *   **Alternar Status de Manutenção.**
        *   Acesso rápido a ações da viatura (editar, histórico, manutenção, excluir) através de um modal de ações.
    *   **Gerenciar Usuários (Aba):**
        *   Listagem de todos os usuários cadastrados.
        *   **Adicionar Novo Usuário:** Formulário para cadastrar nome, matrícula, perfil (Policial, Reserva, Admin) e **`authEmail` (email pessoal para login)**.
            *   A senha inicial é padronizada (`DEFAULT_INITIAL_PASSWORD`).
            *   O novo usuário precisará definir sua senha no primeiro login.
        *   **Editar Usuário:** Modificar nome, matrícula e perfil. O `authEmail` não é editável após a criação.
        *   **Excluir Usuário:** Remove o perfil do usuário do Firestore.
        *   **Resetar Senha do Usuário:** Marca um usuário para que ele seja forçado a definir uma nova senha no próximo login bem-sucedido (requer que o usuário saiba a senha atual para logar).
        *   Acesso rápido a ações do usuário (editar, resetar senha, excluir) através de um modal de ações.
    *   **Histórico (Aba):** Acesso completo ao histórico de cautelas, similar à Reserva.
    *   **Configurações Gerais (Aba):**
        *   **Gestão de Itens do Checklist:** Adicionar ou excluir itens customizáveis dos checklists. Itens fixos (como Quilometragem) não podem ser excluídos. Os itens podem ser reordenados por arrastar e soltar.

## Autenticação e Autorização

*   **Autenticação:** Realizada pelo Firebase Authentication. Login com matrícula (convertida internamente para o `authEmail`) e senha.
*   **Autorização:** Baseada em papéis (`ADMIN`, `RESERVA`, `USER`) no Firestore.
*   **Segurança de Senha:**
    *   Senha inicial padrão para novos usuários, com obrigatoriedade de alteração no primeiro login.
    *   Funcionalidade "Esqueceu sua senha?" via matrícula, com link enviado para o `authEmail`.
*   **Sessão:** Logout automático após 60 minutos de inatividade para aumentar a segurança.
*   **Visão de Administrador:** Admins podem navegar e operar como Reserva ou visualizar como Policial.

## Módulos e Componentes Chave

*   **`App.tsx`:** Gerencia estado global (usuário, dados, modais, abas ativas dos painéis), lógica de autenticação, e timers de sessão.
*   **`firebaseService.ts`:** Encapsula interações com Firebase (Auth, Firestore), incluindo listeners em tempo real para viaturas e solicitações.
*   **Painéis (`AdminPanel`, `ReservaPanel`, `UserPanel`):** Interfaces específicas para cada perfil.
*   **Navegação em Painéis:** Abas para navegação dentro dos painéis Admin e Reserva.
*   **Gerenciamento (`VehicleManagement`, `UserManagement`, etc.):** Componentes das abas do AdminPanel.
*   **Modais:** Login, Definir Senha Inicial, Esquecer Senha, Formulários (Viatura, Usuário), Detalhes (Viatura, Histórico), Confirmação de Ações, Processo de Cautela, Ações de Item (Viatura, Usuário), Configurações da Conta (apenas alterar senha), Cautela Manual.
*   **UI Components (`VehicleCard`, `Modal`, `Spinner`, `LocalHeader`).**

## Tecnologias Utilizadas

*   **Frontend:** React com TypeScript.
*   **Backend & Banco de Dados:** Firebase (Authentication, Cloud Firestore).
*   **Estilização:** CSS modularizado.
*   **Modo Simulado (`FULLY_SIMULATED_MODE`):** Permite rodar a aplicação com dados mockados para desenvolvimento e testes offline.

## Funcionalidades Específicas Adicionais

*   **Atualizações em Tempo Real:** Alterações em solicitações e viaturas são refletidas instantaneamente para todos os usuários conectados.
*   **Persistência de Abas:** A aba selecionada dentro dos painéis Admin e Reserva é mantida durante a sessão do usuário.
*   **Impressão de Relatório de Histórico:** Funcionalidade otimizada para impressão.
*   **Tradução de Status e Tipo de Frota:** Status internos e tipos de frota são apresentados de forma amigável.
*   **Máscara de Email:** Para feedback de recuperação de senha.

---

Este README visa fornecer uma compreensão clara do funcionamento e das capacidades atuais do Gestão Interna de Trabalho.