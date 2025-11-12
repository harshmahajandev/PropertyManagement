#!/bin/bash

# PropertyHub Quick Health Check
# Verifies critical files and configurations

echo "╔════════════════════════════════════════╗"
echo "║  PropertyHub Global - Health Check    ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

total_checks=0
passed_checks=0
failed_checks=0

check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((passed_checks++))
    ((total_checks++))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((failed_checks++))
    ((total_checks++))
}

check_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# ========================================
# Check 1: Critical Entity Files
# ========================================
echo -e "${YELLOW}[1/5] Checking Core Entities...${NC}"
if grep -q "class FinancialReport" PropertyHub/PropertyHub.Core/Entities/Entities.cs 2>/dev/null; then
    check_pass "FinancialReport entity exists"
else
    check_fail "FinancialReport entity missing"
fi

if grep -q "class Property" PropertyHub/PropertyHub.Core/Entities/Entities.cs 2>/dev/null; then
    check_pass "Property entity exists"
else
    check_fail "Property entity missing"
fi

if grep -q "class Lead" PropertyHub/PropertyHub.Core/Entities/Entities.cs 2>/dev/null; then
    check_pass "Lead entity exists"
else
    check_fail "Lead entity missing"
fi
echo ""

# ========================================
# Check 2: Application Services
# ========================================
echo -e "${YELLOW}[2/5] Checking Application Services...${NC}"
if [ -f "PropertyHub/PropertyHub.Application/Services/CurrencyConversionService.cs" ]; then
    check_pass "CurrencyConversionService exists"
else
    check_fail "CurrencyConversionService missing"
fi

if [ -f "PropertyHub/PropertyHub.Application/Services/DashboardService.cs" ]; then
    check_pass "DashboardService exists"
else
    check_fail "DashboardService missing"
fi

if [ -f "PropertyHub/PropertyHub.Application/Services/PropertyManagementService.cs" ]; then
    check_pass "PropertyManagementService exists"
else
    check_fail "PropertyManagementService missing"
fi

if [ -f "PropertyHub/PropertyHub.Application/Services/CRMManagementService.cs" ]; then
    check_pass "CRMManagementService exists"
else
    check_fail "CRMManagementService missing"
fi
echo ""

# ========================================
# Check 3: API Controllers
# ========================================
echo -e "${YELLOW}[3/5] Checking API Controllers...${NC}"
if [ -f "PropertyHub/PropertyHub.API/Controllers/DashboardController.cs" ]; then
    check_pass "DashboardController exists"
else
    check_fail "DashboardController missing"
fi

if [ -f "PropertyHub/PropertyHub.API/Controllers/PropertyManagementController.cs" ]; then
    check_pass "PropertyManagementController exists"
else
    check_fail "PropertyManagementController missing"
fi

if [ -f "PropertyHub/PropertyHub.API/Controllers/CRMController.cs" ]; then
    check_pass "CRMController exists"
else
    check_fail "CRMController missing"
fi
echo ""

# ========================================
# Check 4: Blazor Components
# ========================================
echo -e "${YELLOW}[4/5] Checking Blazor Components...${NC}"

# Check for WebAssembly namespace (should NOT exist)
if grep -q "WebAssembly.Http" PropertyHub/PropertyHub.BlazorApp/_Imports.razor 2>/dev/null; then
    check_fail "WebAssembly.Http namespace found (should be removed)"
else
    check_pass "No WebAssembly namespace (correct for Blazor Server)"
fi

# Check for @bind-Selected with SelectedChanged (should NOT exist together)
if grep -q '@bind-Selected.*SelectedChanged\|SelectedChanged.*@bind-Selected' PropertyHub/PropertyHub.BlazorApp/Pages/*.razor 2>/dev/null; then
    check_fail "Duplicate @bind-Selected + SelectedChanged found"
else
    check_pass "No duplicate SelectedChanged parameters"
fi

# Check MudCarousel has TData
if grep -q 'MudCarousel TData' PropertyHub/PropertyHub.BlazorApp/Pages/Properties.razor 2>/dev/null; then
    check_pass "MudCarousel has TData parameter"
else
    check_fail "MudCarousel missing TData parameter"
fi

if [ -f "PropertyHub/PropertyHub.BlazorApp/Pages/Dashboard.razor" ]; then
    check_pass "Dashboard.razor exists"
else
    check_fail "Dashboard.razor missing"
fi

if [ -f "PropertyHub/PropertyHub.BlazorApp/Pages/Properties.razor" ]; then
    check_pass "Properties.razor exists"
else
    check_fail "Properties.razor missing"
fi

if [ -f "PropertyHub/PropertyHub.BlazorApp/Pages/Leads.razor" ]; then
    check_pass "Leads.razor exists"
else
    check_fail "Leads.razor missing"
fi
echo ""

# ========================================
# Check 5: Service Registration
# ========================================
echo -e "${YELLOW}[5/5] Checking Service Registration...${NC}"
if grep -q "CurrencyConversionService" PropertyHub/PropertyHub.API/Program.cs 2>/dev/null; then
    check_pass "CurrencyConversionService registered in DI"
else
    check_fail "CurrencyConversionService not registered"
fi

if grep -q "DashboardService" PropertyHub/PropertyHub.API/Program.cs 2>/dev/null; then
    check_pass "DashboardService registered in DI"
else
    check_fail "DashboardService not registered"
fi

if grep -q "PropertyManagementService" PropertyHub/PropertyHub.API/Program.cs 2>/dev/null; then
    check_pass "PropertyManagementService registered in DI"
else
    check_fail "PropertyManagementService not registered"
fi
echo ""

# ========================================
# Summary
# ========================================
echo "╔════════════════════════════════════════╗"
echo "║          Health Check Results          ║"
echo "╚════════════════════════════════════════╝"
echo ""
echo -e "Total Checks:  ${BLUE}$total_checks${NC}"
echo -e "Passed:        ${GREEN}$passed_checks${NC}"
echo -e "Failed:        ${RED}$failed_checks${NC}"
echo ""

if [ $failed_checks -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║   ✓ All Health Checks Passed!         ║${NC}"
    echo -e "${GREEN}║   Solution is ready to build & run    ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════╝${NC}"
    echo ""
    check_info "Ready to run: dotnet build && dotnet run"
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════╗${NC}"
    echo -e "${RED}║   ✗ Some Health Checks Failed         ║${NC}"
    echo -e "${RED}║   Please review errors above          ║${NC}"
    echo -e "${RED}╚════════════════════════════════════════╝${NC}"
    exit 1
fi
