$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$target = Join-Path $projectRoot '.env'
if (Test-Path -LiteralPath $target) {
    Write-Output '.env already exists; no changes made.'
    exit 0
}
function New-RandomSecret {
    param([int]$Length = 32)
    $bytes = New-Object byte[] $Length
    $generator = [System.Security.Cryptography.RandomNumberGenerator]::Create()
    try { $generator.GetBytes($bytes) } finally { $generator.Dispose() }
    return [Convert]::ToBase64String($bytes)
}
$settings = @(
    'DB_USERNAME=postgres'
    ('DB_PASSWORD=' + (New-RandomSecret 24))
    ('JWT_SECRET=' + (New-RandomSecret 48))
    'JWT_ACCESS_EXPIRATION_MS=900000'
    'JWT_REFRESH_EXPIRATION_MS=604800000'
    'FRONTEND_PORT=8080'
    'BACKEND_PORT=8000'
    'BOOTSTRAP_ADMIN_USERNAME=admin'
    'BOOTSTRAP_ADMIN_EMAIL=admin@example.com'
    ('BOOTSTRAP_ADMIN_PASSWORD=' + (New-RandomSecret 18))
)
[System.IO.File]::WriteAllLines($target, $settings, (New-Object System.Text.UTF8Encoding $false))
Write-Output '.env created. Admin login: admin. Password: BOOTSTRAP_ADMIN_PASSWORD in .env.'
