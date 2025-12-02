# Sistema de Gerenciamento de Agendamentos – _Deia Ateliê_

![Badge Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Badge PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![HTML](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)&nbsp;
![CSS](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)&nbsp;
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)&nbsp;

> **PAC Extensionista** – Projeto de Aprendizagem Colaborativa do Curso de Engenharia de Software da Católica de Santa Catarina.

---

## Equipe de Desenvolvimento

**Acadêmicos:**
* **André Luiz da Silva Estevão**
* **Erik Kestring**
* **Gabriel da Silva**
* **Vytor de Oliveira**

**Orientadores:**
* Prof. Luiz Carlos Camargo
* Prof. Claudinei Dias

---

## Sobre o Projeto

Este projeto tem como objetivo implantar um sistema de gerenciamento de clientes e serviços no **Deia Ateliê**, um ateliê de consertos de roupas localizado em Joinville. A iniciativa visa facilitar o agendamento de horários, melhorar a organização interna e tornar o atendimento ao cliente mais ágil, prático e eficiente.

O software conecta a demanda acadêmica do programa **PAC Extensionista** com um problema real da comunidade, entregando uma solução tecnológica acessível.

---

## Objetivos

### Objetivo Geral
Implantar um sistema digital que otimize o processo de agendamento de horários e serviços no **Deia Ateliê**, garantindo um atendimento organizado e eficiente.

### Objetivos Específicos
* Automatizar o processo de agendamento, eliminando o uso de agendas de papel.
* Criar um histórico digital de serviços realizados por cliente.
* Fornecer relatórios de serviços mais procurados para auxiliar na gestão do negócio.

---

## Tecnologias Utilizadas

### Frontend
* **HTML5 / CSS3**: Estrutura semântica e estilização responsiva.
* **JavaScript (Vanilla)**: Lógica de interação com a API e manipulação do DOM.

### Backend & Infraestrutura
* **Node.js**: Ambiente de execução para a API e regras de negócio.
* **Express**: Framework para criação das rotas e endpoints.
* **PostgreSQL (Supabase)**: Banco de dados relacional para persistência segura das informações.
* **Vercel**: Plataforma de hospedagem e deploy contínuo (Serverless).

### Segurança
* **BCrypt**: Criptografia de senhas.
* **JWT (JSON Web Tokens)**: Autenticação segura de sessões.

---

## Arquitetura e Design

O projeto segue a arquitetura **MVP (Model-View-Presenter)** adaptada para web, facilitando a separação de responsabilidades.

### Diagramas do Projeto

#### 1. Diagrama de Banco de Dados (ER)
- O banco de dados foi modelado para garantir integridade e performance.
<img width="782" height="468" alt="Captura de tela 2025-12-01 210130" src="https://github.com/user-attachments/assets/775079ed-c8c8-451b-b446-31eb939792cf" />




#### 2. Arquitetura C4
Visão geral dos containers e componentes do sistema.

<img width="388" height="413" alt="image" src="https://github.com/user-attachments/assets/db3ac98f-acbf-4c7f-ab58-ffc99890ac6d" />
<img width="418" height="795" alt="image" src="https://github.com/user-attachments/assets/c4de24a9-5f40-4c2d-8bfd-4e1326cdd236" />
<img width="796" height="482" alt="image" src="https://github.com/user-attachments/assets/851a1e12-bdf8-44e6-95d5-010e75b6aac7" />

---

## Escopo e Funcionalidades

### Para os Clientes
- [x] **Login/Cadastro**: Acesso seguro com e-mail e senha.
- [x] **Agendamento**: Visualização de horários livres e marcação de serviços.
- [x] **Descrição de Serviço**: Campo para detalhar o problema da roupa (ex: "Bainha da calça jeans").
- [x] **Histórico**: Visualização dos agendamentos passados e futuros.

### Para a Administração (Dona do Ateliê)
- [x] **Gestão de Agenda**: Visão diária/semanal dos compromissos.
- [x] **Gestão de Serviços**: Cadastrar, editar ou remover tipos de serviços e preços.
- [x] **Controle de Usuários**: Visualizar e gerenciar clientes cadastrados.
- [x] **Bloqueio de Horários**: Impedir agendamentos em dias/horários específicos.

## Galeria do Sistema

---
- Homepage
<img width="1903" height="908" alt="Captura de tela 2025-12-01 190523" src="https://github.com/user-attachments/assets/1230d8ab-05bc-48cb-a47b-94ce5860012f" />
<img width="1901" height="910" alt="Captura de tela 2025-12-01 190540" src="https://github.com/user-attachments/assets/7d074e4e-7e97-4514-9452-f02913d40eba" />

---

- Interface de Login/Cadastro
<img width="1918" height="910" alt="Captura de tela 2025-12-01 190611" src="https://github.com/user-attachments/assets/38c17148-0450-4227-8599-b1299fd710e9" />
<img width="1915" height="907" alt="Captura de tela 2025-12-01 190625" src="https://github.com/user-attachments/assets/b46d6779-8969-4551-9683-286f544489a2" />

---

- Interface de Agendamento
<img width="1916" height="912" alt="Captura de tela 2025-12-01 190805" src="https://github.com/user-attachments/assets/252a428e-68ee-4629-889b-b429a7e2cf38" />

---

- Sidebar/Histórico de Agendamento
<img width="1914" height="909" alt="Captura de tela 2025-12-01 190825" src="https://github.com/user-attachments/assets/6826afd6-9525-40d2-841c-6d79b450d714" />

---

- Interface de Login de ADMIN
<img width="1917" height="910" alt="Captura de tela 2025-12-01 203704" src="https://github.com/user-attachments/assets/a3605377-02bf-4626-8a45-602079aa3008" />

---

- Dashboard ADMIN - Visão de agendamentos diários/faturamento.
<img width="1916" height="911" alt="Captura de tela 2025-12-01 190921" src="https://github.com/user-attachments/assets/e2b7c96a-eb36-4c0e-95d3-0619ddc7e5d8" />

---

- Dashboard ADMIN - Visão geral dos agendamentos.
<img width="1902" height="911" alt="Captura de tela 2025-12-01 190935" src="https://github.com/user-attachments/assets/ea6a2524-56b8-45b9-9d77-10241e7c6856" />

---

- Dashboard ADMIN - Visão do gerenciamento de serviços.
<img width="1914" height="910" alt="Captura de tela 2025-12-01 190950" src="https://github.com/user-attachments/assets/cecfdbb3-6ded-4a7b-873a-082099f7bae4" />

---

- Dashboard ADMIN - Visão do gerenciamento total de clientes.
<img width="1900" height="907" alt="Captura de tela 2025-12-01 191003" src="https://github.com/user-attachments/assets/2f1070e1-9d3c-4af2-bc45-9678795ddb5d" />

---

## 📊 Qualidade e Requisitos

* **Desempenho**: Carregamento otimizado via CDN da Vercel (Cloud).
* **Disponibilidade**: 24/7 com monitoramento de uptime garantido pela plataforma.
* **Usabilidade**: Interface Mobile-First pensada para uso direto no navegador do celular, sem necessidade de downloads.

---

**Trello do Projeto:** [Acessar Quadro de Tarefas](https://trello.com/b/tXkeg8i1/pac-v-vi)
