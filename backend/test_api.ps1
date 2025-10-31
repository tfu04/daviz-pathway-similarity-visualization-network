# PowerShell Test Script for Disease Network API
# Run this after starting the backend server

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Disease Network API - Test Suite" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:8000"

# Function to make API call and display results
function Test-Endpoint {
    param (
        [string]$Name,
        [string]$Url,
        [string]$Description
    )
    
    Write-Host "[TEST] $Name" -ForegroundColor Yellow
    Write-Host "URL: $Url" -ForegroundColor Gray
    Write-Host "Description: $Description" -ForegroundColor Gray
    Write-Host ""
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method Get -ErrorAction Stop
        Write-Host "✓ SUCCESS" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 5 -Compress | Write-Host
        Write-Host ""
        return $true
    }
    catch {
        Write-Host "✗ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host ""
        return $false
    }
    
    Start-Sleep -Milliseconds 500
}

# Check if server is running
Write-Host "Checking if server is running..." -ForegroundColor Cyan
try {
    $null = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get -TimeoutSec 5
    Write-Host "✓ Server is running" -ForegroundColor Green
    Write-Host ""
}
catch {
    Write-Host "✗ Server is not running!" -ForegroundColor Red
    Write-Host "Please start the server first:" -ForegroundColor Yellow
    Write-Host "  cd backend" -ForegroundColor Yellow
    Write-Host "  uvicorn main:app --reload" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Run tests
$results = @()

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Running API Tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
$results += Test-Endpoint `
    -Name "Health Check" `
    -Url "$baseUrl/health" `
    -Description "Check server status and data load"

# Test 2: Statistics
$results += Test-Endpoint `
    -Name "Network Statistics" `
    -Url "$baseUrl/stats" `
    -Description "Get network statistics"

# Test 3: Network with filters
$results += Test-Endpoint `
    -Name "Filtered Network" `
    -Url "$baseUrl/network?min_weight=30000&limit=5" `
    -Description "Get network with weight >= 30000, limit 5"

# Test 4: Search
$results += Test-Endpoint `
    -Name "Search Diseases" `
    -Url "$baseUrl/search?keyword=cancer" `
    -Description "Search for diseases containing 'cancer'"

# Test 5: Disease detail
$results += Test-Endpoint `
    -Name "Disease Details" `
    -Url "$baseUrl/disease/Bipolar_disorder--None" `
    -Description "Get edges for Bipolar disorder"

# Test 6: Interpretability filter
$results += Test-Endpoint `
    -Name "Interpretable Edges Only" `
    -Url "$baseUrl/network?interpretability=YES&limit=3" `
    -Description "Get interpretable edges (YES) only"

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Results Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$passed = ($results | Where-Object { $_ -eq $true }).Count
$total = $results.Count

Write-Host "Passed: $passed / $total" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Yellow" })

if ($passed -eq $total) {
    Write-Host "✓ All tests passed!" -ForegroundColor Green
} else {
    Write-Host "✗ Some tests failed" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Additional Commands to Try:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "# Get API documentation (open in browser):" -ForegroundColor Gray
Write-Host "Start-Process '$baseUrl/docs'" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Get full network (no filters):" -ForegroundColor Gray
Write-Host "Invoke-RestMethod '$baseUrl/network'" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Get edge details:" -ForegroundColor Gray
Write-Host "Invoke-RestMethod '$baseUrl/edge/Anxiety_disorder--None__Asthma--None'" -ForegroundColor Yellow
Write-Host ""
