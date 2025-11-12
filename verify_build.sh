#!/bin/bash

# PropertyHub Build Verification Script
# This script verifies that all required files exist and are properly configured

echo "=================================="
echo "PropertyHub Build Verification"
echo "=================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check counter
checks_passed=0
checks_failed=0

# Function to check file existence
check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}✓${NC} $1 exists"
        ((checks_passed++))
        return 0
    else
        echo -e "${RED}✗${NC} $1 NOT FOUND"
        ((checks_failed++))
        return 1
    fi
}

# Function to check if pattern exists in file
check_pattern() {
    if grep -q "$2" "$1" 2>/dev/null; then
        echo -e "${GREEN}✓${NC} $3"
        ((checks_passed++))
        return 0
    else
        echo -e "${RED}✗${NC} $3"
        ((checks_failed++))
        return 1
    fi
}

echo "Checking Core Files..."
echo "----------------------"
check_file "PropertyHub/PropertyHub.Core/Entities/Entities.cs"
check_pattern "PropertyHub/PropertyHub.Core/Entities/Entities.cs" "class FinancialReport" "FinancialReport entity exists"
echo ""

echo "Checking Application Layer..."
echo "----------------------------"
check_file "PropertyHub/PropertyHub.Application/Services/DashboardService.cs"
check_file "PropertyHub/PropertyHub.Application/Services/CurrencyConversionService.cs"
check_file "PropertyHub/PropertyHub.Application/Services/PropertyManagementService.cs"
check_file "PropertyHub/PropertyHub.Application/Services/CRMManagementService.cs"
check_pattern "PropertyHub/PropertyHub.Application/Services/CurrencyConversionService.cs" "ConvertCurrencyAsync" "Currency conversion methods exist"
echo ""

echo "Checking Infrastructure Layer..."
echo "-------------------------------"
check_file "PropertyHub/PropertyHub.Infrastructure/Data/ApplicationDbContext.cs"
check_pattern "PropertyHub/PropertyHub.Infrastructure/Data/ApplicationDbContext.cs" "DbSet<FinancialReport>" "FinancialReport DbSet registered"
check_pattern "PropertyHub/PropertyHub.Infrastructure/Data/ApplicationDbContext.cs" "DbSet<Property>" "Property DbSet registered"
check_pattern "PropertyHub/PropertyHub.Infrastructure/Data/ApplicationDbContext.cs" "DbSet<Lead>" "Lead DbSet registered"
echo ""

echo "Checking API Layer..."
echo "--------------------"
check_file "PropertyHub/PropertyHub.API/Program.cs"
check_file "PropertyHub/PropertyHub.API/Controllers/DashboardController.cs"
check_file "PropertyHub/PropertyHub.API/Controllers/PropertyManagementController.cs"
check_file "PropertyHub/PropertyHub.API/Controllers/CRMController.cs"
check_pattern "PropertyHub/PropertyHub.API/Program.cs" "CurrencyConversionService" "CurrencyConversionService registered in DI"
check_pattern "PropertyHub/PropertyHub.API/Program.cs" "DashboardService" "DashboardService registered in DI"
check_pattern "PropertyHub/PropertyHub.API/Program.cs" "PropertyManagementService" "PropertyManagementService registered in DI"
check_pattern "PropertyHub/PropertyHub.API/Program.cs" "CRMManagementService" "CRMManagementService registered in DI"
echo ""

echo "Checking Blazor Application..."
echo "-----------------------------"
check_file "PropertyHub/PropertyHub.BlazorApp/Pages/Dashboard.razor"
check_file "PropertyHub/PropertyHub.BlazorApp/Pages/Properties.razor"
check_file "PropertyHub/PropertyHub.BlazorApp/Pages/Leads.razor"
check_file "PropertyHub/PropertyHub.BlazorApp/Services/DashboardClientService.cs"
check_file "PropertyHub/PropertyHub.BlazorApp/Services/PropertyClientService.cs"
check_file "PropertyHub/PropertyHub.BlazorApp/Services/CRMClientService.cs"
echo ""

echo "Checking Documentation..."
echo "------------------------"
check_file "PropertyHub/README.md"
check_file "PropertyHub/BUILD_ERRORS_FIXED.md"
echo ""

echo "=================================="
echo "Verification Summary"
echo "=================================="
echo -e "Checks Passed: ${GREEN}$checks_passed${NC}"
echo -e "Checks Failed: ${RED}$checks_failed${NC}"
echo ""

if [ $checks_failed -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed! Solution is ready to build.${NC}"
    exit 0
else
    echo -e "${RED}✗ Some checks failed. Please review the errors above.${NC}"
    exit 1
fi
