<#
scripts/setup_backend.ps1
Uso: abra o PowerShell na raiz do projeto e execute:
  # Apenas prepara o ambiente (não inicia o servidor)
  .\scripts\setup_backend.ps1

  # Prepara e inicia o servidor (mantém processo em foreground)
  .\scripts\setup_backend.ps1 -Run

O script cria um venv em .venv, instala dependências do backend/requirements.txt e pode iniciar o uvicorn.
#>

param(
    [switch]$Run
)

Write-Host "== ReCo: setup backend (FastAPI) =="

# 1) Verificar python
try {
    $py = python --version 2>&1
    Write-Host "Python detectado:" $py
} catch {
    Write-Error "Python não encontrado no PATH. Instale Python 3.11 e execute novamente."
    exit 1
}

# 2) Criar venv
if (-Not (Test-Path ".venv")) {
    Write-Host "Criando venv em .venv..."
    python -m venv .venv
} else {
    Write-Host ".venv já existe. Pulando criação."
}

# 3) Ativar venv no PowerShell (script precisa ser executado na mesma sessão para ativar)
Write-Host "Para ativar o ambiente nesta sessão execute:"
Write-Host "  .\\.venv\\Scripts\\Activate.ps1"

# 4) Instalar dependências
Write-Host "Instalando dependências do backend..."
Write-Host "Ative o venv e rode: pip install -r backend/requirements.txt"

# 5) Iniciar servidor se solicitado
if ($Run) {
    Write-Host "Iniciando uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000"
    Write-Host "(Deixe esta janela aberta enquanto desenvolve)"
    # Atente: este comando roda em foreground
    & .\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
} else {
    Write-Host "Concluído. Para iniciar o servidor agora, ative o venv e rode:"
    Write-Host "  uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000"
}
