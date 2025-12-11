# Copilot / AI agent instructions for this repository

Essas instruções ajudam agentes de codificação a serem produtivos rapidamente neste repositório Django minimal.

- **Projeto:** pasta raiz `Recco/` contém o Django project; o pacote do projeto está em `Recco/ReCo/`.
- **Entrypoint:** `Recco/manage.py` — use `python manage.py <command>` a partir de `Recco/`.

Arquitetura e decisões rápidas
- Projeto gerado pelo `django-admin startproject` (comentário em `Recco/ReCo/settings.py` menciona Django 5.2.8).
- Banco de dados dev: SQLite em `Recco/db.sqlite3` (definido em `Recco/ReCo/settings.py`).
- Apenas apps Django nativos estão listados em `INSTALLED_APPS` (veja `Recco/ReCo/settings.py`).
- URLs principais estão em `Recco/ReCo/urls.py` — atualmente só expõe `admin/`.

Comandos úteis (exemplos reproducíveis)
- Criar ambiente e instalar Django (exemplo mínimo):
  - `cd Recco`
  - `python -m venv .venv`
  - `source .venv/bin/activate`
  - `pip install "django==5.2.8"`
- Migrar e rodar servidor (dev):
  - `python manage.py migrate`
  - `python manage.py runserver`
- Usuais de manutenção:
  - `python manage.py createsuperuser`
  - `python manage.py shell`

Padrões do repositório que o agente deve seguir
- Nome/Capitalização: a pasta do projeto é `Recco/` e o pacote Django é `ReCo` (preste atenção em case-sensitive imports/paths).
- Alterações de configuração: editar `Recco/ReCo/settings.py` para adicionar `INSTALLED_APPS`, middleware ou variáveis de deployment.
- Adicionar apps: crie a pasta do app em `Recco/`, atualize `INSTALLED_APPS` e inclua `include('app.urls')` em `Recco/ReCo/urls.py`.

Integrações externas e limites detectáveis
- Não há arquivos de configuração para serviços externos (ex.: Docker, CI, requirements.txt) no repositório atual — assumir setup local simples.
- Banco de dados é local (sqlite); nenhum conector externo detectado.

O que evitar / observações importantes
- Não altere `SECRET_KEY` no branch principal sem um plano de deploy — ele está hard-coded em `Recco/ReCo/settings.py` (apenas para dev).
- `DEBUG = True` está ativo; para alterações que toquem deploy, documente como e onde definir `DEBUG=False` e variáveis sensíveis.

Arquivos-chave para referência rápida
- `Recco/manage.py` — comandos de gerenciamento.
- `Recco/ReCo/settings.py` — configuração (DB, INSTALLED_APPS, DEBUG, STATIC_URL).
- `Recco/ReCo/urls.py` — roteamento inicial (atualmente só `admin/`).
- `Recco/db.sqlite3` — arquivo de banco de dados local (dev).

Se algo estiver faltando nesta descrição (por exemplo: dependências externas, scripts de CI/CD, ou apps adicionais), peça para o mantenedor fornecer arquivos/configs correspondentes e eu atualizo essas instruções.

Pergunta de validação: alguma convenção interna (venv, requirements, workflows) não listada aqui que devo incorporar?
