# 📄 Check Docs AI

Check Docs AI é uma plataforma inteligente e moderna para análise e verificação de documentos, utilizando IA generativa com RAG (Retrieval-Augmented Generation) para garantir respostas contextuais, precisas e confiáveis.
O sistema combina automação, processamento de linguagem natural e arquitetura modular, oferecendo uma solução escalável para empresas, escritórios jurídicos, instituições acadêmicas e órgãos corporativos que necessitam validar informações rapidamente.

O projeto nasce da necessidade de um fluxo de verificação seguro, customizável e integrável, eliminando a dependência de soluções fechadas. A combinação de Java + Spring Boot para a API principal, Python + FastAPI + LangChain para o servidor RAG e React + MUI para a interface garante alta performance, flexibilidade e usabilidade.

Ideal para ambientes onde a precisão na análise documental é crítica, o Check Docs AI se torna a base perfeita para construir sistemas de validação documental robustos e de nível empresarial.

---

## 🌟 Principais Funcionalidades

- 📑 **Análise inteligente de documentos** usando IA e RAG
- 🔍 **Busca contextual** para localizar informações específicas
- 🛡️ **Segurança e controle de acesso** para dados sensíveis
- ⚙️ **Arquitetura modularizada** facilitando manutenção e evolução
- 🚀 **Integração com modelos locais via Ollama**
- 💻 **Interface moderna e responsiva** com Material UI
- 📊 **Resultados claros e exportáveis**
- 🧠 **Uso de LangChain para orquestração de consultas inteligentes**

---

## 📌 Motivação do Projeto

A verificação manual de documentos é um processo **lento, sujeito a erros e caro**. O **Check Docs AI** foi criado para:

- ⚡ **Reduzir tempo de análise** com automação inteligente
- 📡 **Fornecer respostas contextuais e explicáveis**
- 🔧 **Permitir customização** para diferentes áreas de atuação
- 🛡️ **Garantir segurança** no tratamento de dados sigilosos
- 📱 **Disponibilizar acesso multiplataforma** com interface moderna

---

## 🎯 Casos de Uso

- 🏛️ **Escritórios jurídicos** para análise de contratos e peças processuais
- 📚 **Instituições acadêmicas** para verificação de trabalhos e referências
- 🏢 **Empresas** para validação de documentos internos e compliance
- 📑 **Auditorias** para conferência rápida de relatórios e registros

---

## 🚀 Tecnologias Utilizadas

### 🔧 Back-End (API)

<p align="left">
  <img src="https://skillicons.dev/icons?i=java,spring,postgresql,docker" />
</p>

- **Java** • Linguagem robusta e escalável
- **Spring Boot** • API REST performática e extensível
- **PostgreSQL** • Banco de dados relacional seguro e confiável
- **Docker** • Padronização de ambiente e fácil deploy

---

### 🧠 Servidor RAG

<p align="left">
  <img src="https://skillicons.dev/icons?i=python,fastapi,docker" />
</p>

- **Python** • Flexibilidade para IA e processamento de dados
- **FastAPI** • Desempenho alto com APIs modernas
- **LangChain** • Orquestração de pipelines de IA
- **Ollama** • Execução de modelos de linguagem localmente

---

### 💻 Front-End

<p align="left">
  <img src="https://skillicons.dev/icons?i=react,typescript,materialui" />
</p>

- **React.js** • Interface reativa e de alta performance
- **TypeScript** • Tipagem estática para maior segurança no código
- **Material UI** • Componentes responsivos e de design limpo

---

## 🛠️ Como Começar

### 1. Clone o repositório

```bash
git clone https://github.com/gustavoventieri/CheckDocsAI.git
cd CheckDocsAI
```

### 2. Suba os containers com Docker

```bash
docker-compose up --build
```

> Isso iniciará a API Java + Spring, o servidor RAG em Python e o front-end React, junto ao banco PostgreSQL.

### 3. Baixe o modelo do agente

```bash
docker exec -it ollama ollama pull modelName
```

> Isso baixará o modelo do agente do site do ollama

### 4. Acesse o projeto

- Front-end: `http://localhost:5173`
- API (Swagger): `http://localhost:8080/swagger/api-docs`

---

## 📄 Documentação da API

**API Java + Spring** (Swagger):

```
http://localhost:8080/swagger/api-docs
```

---

> 💡 Com o **Check Docs AI**, a análise documental se torna mais rápida, segura e inteligente, economizando tempo e reduzindo erros.
