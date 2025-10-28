# ============================================
# Script PowerShell para Resetar Senha do Programador
# ============================================
# Execute este script no PowerShell para resetar a senha
# do usuário "programador" para: conectairrig@
# ============================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   RESETAR SENHA DO PROGRAMADOR" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Constantes
$SALT = "SistemaModelo2024"
$SENHA_PADRAO = "conectairrig@"
$USERNAME = "programador"

# Função para gerar o hash da senha
function Get-PasswordHash {
    param (
        [string]$password
    )
    
    $saltedPassword = $password + $SALT
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($saltedPassword)
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    $hash = $sha256.ComputeHash($bytes)
    $base64Hash = [Convert]::ToBase64String($hash)
    
    return $base64Hash
}

# Gerar o hash da senha padrão
$novoHash = Get-PasswordHash -password $SENHA_PADRAO

Write-Host "Hash gerado para a senha padrao:" -ForegroundColor Green
Write-Host $novoHash -ForegroundColor Yellow
Write-Host ""

# Instruções para atualizar no banco de dados
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   OPCAO 1: SQL DIRETO" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Execute este comando SQL no seu banco de dados:" -ForegroundColor White
Write-Host ""
Write-Host "UPDATE Usuarios" -ForegroundColor Gray
Write-Host "SET PasswordHash = '$novoHash'" -ForegroundColor Gray
Write-Host "WHERE UserName = '$USERNAME';" -ForegroundColor Gray
Write-Host ""

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   OPCAO 2: SCRIPT SQL PRONTO" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Um arquivo SQL foi criado em:" -ForegroundColor White
Write-Host "database\ResetSenhaProgramador.sql" -ForegroundColor Yellow
Write-Host ""
Write-Host "Execute esse arquivo no SQL Server Management Studio" -ForegroundColor White
Write-Host "ou Azure Data Studio para resetar a senha." -ForegroundColor White
Write-Host ""
Write-Host "NENHUM DADO SERA PERDIDO!" -ForegroundColor Green
Write-Host ""

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   CREDENCIAIS APOS O RESET" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Usuario: $USERNAME" -ForegroundColor Green
Write-Host "Senha: $SENHA_PADRAO" -ForegroundColor Green
Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan

Write-Host ""
Write-Host "Pressione qualquer tecla para sair..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
