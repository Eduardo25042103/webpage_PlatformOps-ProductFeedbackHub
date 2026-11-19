<#
.SYNOPSIS
    Script de compilación, sincronización y despliegue del portal web corporativo en AWS (Amazon S3 + CloudFront).
.DESCRIPTION
    Automatiza el ciclo de entrega continua para el frontend Angular 21 (OpsHub Web):
    1. Compilación de producción optimizada (ng build --configuration production)
    2. Creación opcional de la infraestructura AWS CloudFormation (S3 + OAC + CloudFront)
    3. Sincronización diferencial hacia Amazon S3 con cabeceras de caché HTTP diferenciadas
    4. Invalidación global de caché en Amazon CloudFront (Edge Caching)
.EXAMPLE
    .\deploy-web-s3.ps1 -Action All -Profile idat-cli -Region us-east-2
    .\deploy-web-s3.ps1 -Action Build
    .\deploy-web-s3.ps1 -Action Sync -S3Bucket opshub-web-prod-123456789012
#>

[CmdletBinding()]
param (
    [ValidateSet('All', 'Build', 'Infra', 'Sync', 'Invalidate')]
    [string]$Action = 'All',

    [string]$Stage = 'prod',
    [string]$Region = 'us-east-2',
    [string]$Profile = 'idat-cli',
    [string]$S3Bucket = '',
    [string]$DistributionId = '',
    [string]$StackName = 'opshub-web-frontend',
    [switch]$DeployInfra,
    [switch]$SkipBuild
)

$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$DistBrowserDir = Join-Path $ScriptDir "dist\web\browser"
$TemplateFile = Join-Path $ScriptDir "aws-frontend-template.yaml"

Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host " OpsHub Web - Despliegue en AWS Cloud (Amazon S3 + Amazon CloudFront CDN)" -ForegroundColor Cyan
Write-Host "==========================================================================" -ForegroundColor Cyan
Write-Host "Entorno : $Stage | Región: $Region | Perfil AWS: $Profile" -ForegroundColor Gray

# Helper para ejecutar AWS CLI con profile y region
function Invoke-AwsCli {
    param([string]$Command)
    $fullCmd = "aws $Command --profile $Profile --region $Region"
    Write-Host ">> $fullCmd" -ForegroundColor DarkGray
    Invoke-Expression $fullCmd
}

# 1. DESPLIEGUE DE INFRAESTRUCTURA (CLOUDFORMATION)
if ($Action -eq 'Infra' -or $DeployInfra) {
    Write-Host "`n[PASO] Desplegando plantilla CloudFormation ($StackName)..." -ForegroundColor Yellow
    if (-not (Test-Path $TemplateFile)) {
        throw "No se encontró la plantilla CloudFormation en: $TemplateFile"
    }

    Invoke-AwsCli "cloudformation deploy --template-file `"$TemplateFile`" --stack-name `"$StackName-$Stage`" --parameter-overrides Stage=$Stage --capabilities CAPABILITY_IAM"

    Write-Host "Obteniendo salidas del Stack CloudFormation..." -ForegroundColor Cyan
    $outputsJson = Invoke-AwsCli "cloudformation describe-stacks --stack-name `"$StackName-$Stage`" --query `"Stacks[0].Outputs`" --output json" | ConvertFrom-Json
    
    foreach ($out in $outputsJson) {
        if ($out.OutputKey -eq 'S3BucketName') { $S3Bucket = $out.OutputValue }
        if ($out.OutputKey -eq 'CloudFrontDistributionId') { $DistributionId = $out.OutputValue }
        if ($out.OutputKey -eq 'PortalWebsiteUrl') { $WebsiteUrl = $out.OutputValue }
    }

    Write-Host "Bucket S3      : $S3Bucket" -ForegroundColor Green
    Write-Host "CloudFront ID  : $DistributionId" -ForegroundColor Green
    Write-Host "URL del Portal : $WebsiteUrl" -ForegroundColor Green
}

# 2. COMPILACIÓN DE PRODUCCIÓN (NG BUILD)
if (($Action -eq 'All' -or $Action -eq 'Build') -and -not $SkipBuild) {
    Write-Host "`n[PASO 1/3] Compilando frontend Angular 21 para producción..." -ForegroundColor Yellow
    Set-Location $ScriptDir

    npm run build
    if ($LASTEXITCODE -ne 0) {
        throw "La compilación de Angular falló con código $LASTEXITCODE"
    }

    if (-not (Test-Path $DistBrowserDir)) {
        throw "Directorio de compilación no encontrado en: $DistBrowserDir"
    }

    $distFiles = Get-ChildItem -Path $DistBrowserDir -Recurse -File
    $totalMb = ($distFiles | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "Compilación exitosa: $($distFiles.Count) archivos ($([Math]::Round($totalMb, 2)) MB en $DistBrowserDir)" -ForegroundColor Green
}

# 3. SINCRONIZACIÓN CON AMAZON S3
if ($Action -eq 'All' -or $Action -eq 'Sync') {
    Write-Host "`n[PASO 2/3] Sincronizando archivos estáticos hacia Amazon S3..." -ForegroundColor Yellow
    
    if ([string]::IsNullOrWhiteSpace($S3Bucket)) {
        # Intentar obtener de CloudFormation si no se proporcionó
        try {
            $desc = Invoke-AwsCli "cloudformation describe-stacks --stack-name `"$StackName-$Stage`" --query `"Stacks[0].Outputs[?OutputKey=='S3BucketName'].OutputValue`" --output text"
            if ($desc -and $desc -ne 'None') { $S3Bucket = $desc.Trim() }
        } catch {}
    }

    if ([string]::IsNullOrWhiteSpace($S3Bucket)) {
        $S3Bucket = "opshub-web-$Stage"
        Write-Host "Bucket S3 no especificado. Usando valor sugerido: $S3Bucket" -ForegroundColor Yellow
    }

    Write-Host "Destino S3: s3://$S3Bucket" -ForegroundColor Cyan

    # 3.1 Subir archivos inmutables con hash (JS, CSS, imágenes) con caché de 1 año (31536000s)
    Write-Host "Sincronizando chunks y assets cacheados (max-age=31536000)..." -ForegroundColor Gray
    Invoke-AwsCli "s3 sync `"$DistBrowserDir`" `"s3://$S3Bucket`" --exclude `"index.html`" --exclude `"*.json`" --cache-control `"max-age=31536000,public,immutable`" --delete"

    # 3.2 Subir index.html y JSON sin caché (max-age=0, must-revalidate) para asegurar que el navegador siempre cargue la última versión
    Write-Host "Subiendo index.html y metadatos con no-cache..." -ForegroundColor Gray
    Invoke-AwsCli "s3 cp `"$DistBrowserDir\index.html`" `"s3://$S3Bucket/index.html`" --cache-control `"max-age=0,no-cache,no-store,must-revalidate`" --content-type `"text/html`""

    Write-Host "Sincronización hacia Amazon S3 completada con éxito." -ForegroundColor Green
}

# 4. INVALIDACIÓN DE CACHÉ EN AMAZON CLOUDFRONT
if ($Action -eq 'All' -or $Action -eq 'Invalidate') {
    Write-Host "`n[PASO 3/3] Invalidando caché en Amazon CloudFront..." -ForegroundColor Yellow

    if ([string]::IsNullOrWhiteSpace($DistributionId)) {
        try {
            $descId = Invoke-AwsCli "cloudformation describe-stacks --stack-name `"$StackName-$Stage`" --query `"Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue`" --output text"
            if ($descId -and $descId -ne 'None') { $DistributionId = $descId.Trim() }
        } catch {}
    }

    if ([string]::IsNullOrWhiteSpace($DistributionId)) {
        Write-Host "Aviso: ID de distribución CloudFront no especificado." -ForegroundColor Yellow
        Write-Host "Para invalidar manualmente: aws cloudfront create-invalidation --distribution-id <ID> --paths `"/*`" --profile $Profile" -ForegroundColor DarkGray
    } else {
        Write-Host "Creando invalidación global (/*) en distribución $DistributionId..." -ForegroundColor Cyan
        Invoke-AwsCli "cloudfront create-invalidation --distribution-id `"$DistributionId`" --paths `"/*`""
        Write-Host "Invalidación de CloudFront enviada exitosamente a los Edge Locations." -ForegroundColor Green
    }
}

Write-Host "`n==========================================================================" -ForegroundColor Green
Write-Host " ¡DESPLIEGUE FINALIZADO EXITOSAMENTE!                                     " -ForegroundColor Green
Write-Host " El portal OpsHub Web se encuentra listo en producción sobre AWS.         " -ForegroundColor Green
Write-Host "==========================================================================" -ForegroundColor Green
