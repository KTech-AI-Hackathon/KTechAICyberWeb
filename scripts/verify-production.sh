#!/usr/bin/env bash
#
# @file scripts/verify-production.sh
# @description Production verification script for Issue #448
# @ticket #448
#
# Automated production site verification script that tests all 10 functional areas
# from REQUIREMENTS.md. Validates HTTP accessibility, content presence, i18n,
# theme application, and cross-cutting features.
#
# Usage:
#   bash scripts/verify-production.sh [options]
#
# Options:
#   --production    Verify against production site (default)
#   --local         Verify against local dev server
#   --verbose       Enable detailed output
#   --routes-only   Only verify route accessibility
#   --full          Full verification (routes + content + features)
#
# Output:
#   Structured verification results to stdout and optionally to JSON file
#

set -euo pipefail

# Script configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
PRODUCTION_URL="https://ktech-ai-hackathon.github.io/KTechAICyberWeb"
LOCAL_URL="http://localhost:3000/KTechAICyberWeb"
BASE_URL="${PRODUCTION_URL}"
VERBOSE=false
MODE="full"

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --production)
      BASE_URL="${PRODUCTION_URL}"
      shift
      ;;
    --local)
      BASE_URL="${LOCAL_URL}"
      shift
      ;;
    --verbose)
      VERBOSE=true
      shift
      ;;
    --routes-only)
      MODE="routes"
      shift
      ;;
    --full)
      MODE="full"
      shift
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Global counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0
WARNED_CHECKS=0

# Log functions
log_info() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
  echo -e "${GREEN}[PASS]${NC} $1"
  ((TOTAL_CHECKS++, PASSED_CHECKS++))
}

log_failure() {
  echo -e "${RED}[FAIL]${NC} $1"
  ((TOTAL_CHECKS++, FAILED_CHECKS++))
}

log_warning() {
  echo -e "${YELLOW}[WARN]${NC} $1"
  ((TOTAL_CHECKS++, WARNED_CHECKS++))
}

log_verbose() {
  if [[ "${VERBOSE}" == "true" ]]; then
    echo -e "[VERBOSE] $1"
  fi
}

# HTTP request function
check_route() {
  local route="$1"
  local expected_status="${2:-200}"
  local full_url="${BASE_URL}${route}"

  log_verbose "Checking route: ${route}"

  local response
  response=$(curl -s -o /dev/null -w "%{http_code}" "${full_url}" 2>/dev/null || echo "000")

  if [[ "${response}" == "${expected_status}" ]]; then
    log_success "Route ${route} returned ${response}"
    return 0
  else
    log_failure "Route ${route} returned ${response} (expected ${expected_status})"
    return 1
  fi
}

# Content verification function
check_content() {
  local route="$1"
  local content_pattern="$2"
  local description="$3"
  local full_url="${BASE_URL}${route}"

  log_verbose "Checking content on ${route}: ${description}"

  local content
  content=$(curl -s "${full_url}" 2>/dev/null || echo "")

  if [[ "${content}" =~ ${content_pattern} ]]; then
    log_success "${description} found on ${route}"
    return 0
  else
    log_failure "${description} NOT found on ${route}"
    return 1
  fi
}

# Theme verification function
check_theme() {
  local route="$1"
  local full_url="${BASE_URL}${route}"

  log_verbose "Checking cyberpunk theme on ${route}"

  local content
  content=$(curl -s "${full_url}" 2>/dev/null || echo "")

  # Check for cyberpunk theme indicators
  local theme_found=false

  if [[ "${content}" =~ --cyan ]]; then
    log_success "CSS variable --cyan found on ${route}"
    theme_found=true
  else
    log_warning "CSS variable --cyan NOT found on ${route}"
  fi

  if [[ "${content}" =~ cyber ]]; then
    log_success "Cyberpunk theme class found on ${route}"
    theme_found=true
  else
    log_warning "Cyberpunk theme class NOT found on ${route}"
  fi

  if [[ "${content}" =~ neon ]]; then
    log_success "Neon effect found on ${route}"
    theme_found=true
  else
    log_warning "Neon effect NOT found on ${route}"
  fi

  if [[ "${content}" =~ scanline ]]; then
    log_success "Scanline effect found on ${route}"
    theme_found=true
  else
    log_warning "Scanline effect NOT found on ${route}"
  fi

  return 0
}

# Accessibility verification function
check_accessibility() {
  local route="$1"
  local full_url="${BASE_URL}${route}"

  log_verbose "Checking accessibility features on ${route}"

  local content
  content=$(curl -s "${full_url}" 2>/dev/null || echo "")

  # Check for accessibility indicators
  local a11y_found=false

  if [[ "${content}" =~ skip-link ]]; then
    log_success "Skip link found on ${route}"
    a11y_found=true
  else
    log_warning "Skip link NOT found on ${route}"
  fi

  if [[ "${content}" =~ aria- ]]; then
    log_success "ARIA attributes found on ${route}"
    a11y_found=true
  else
    log_warning "ARIA attributes NOT found on ${route}"
  fi

  if [[ "${content}" =~ role= ]]; then
    log_success "Role attributes found on ${route}"
    a11y_found=true
  else
    log_warning "Role attributes NOT found on ${route}"
  fi

  return 0
}

# i18n verification function
check_i18n() {
  local route="$1"
  local full_url="${BASE_URL}${route}"

  log_verbose "Checking i18n support on ${route}"

  local content
  content=$(curl -s "${full_url}" 2>/dev/null || echo "")

  # Check for bilingual content indicators
  local i18n_found=false

  # Check for Chinese characters
  if echo "${content}" | grep -qP '[\x{4e00}-\x{9fff}]'; then
    log_success "Chinese content found on ${route}"
    i18n_found=true
  else
    log_warning "Chinese content NOT found on ${route}"
  fi

  # Check for English content
  if echo "${content}" | grep -qP '[a-zA-Z]{10,}'; then
    log_success "English content found on ${route}"
    i18n_found=true
  else
    log_warning "English content NOT found on ${route}"
  fi

  return 0
}

# CI/CD workflow verification
check_cicd() {
  log_info "Checking CI/CD workflow status"

  # Check if gh CLI is available
  if ! command -v gh &> /dev/null; then
    log_warning "gh CLI not found - skipping CI/CD checks"
    return 0
  fi

  # Check recent workflow runs
  local workflow_runs
  workflow_runs=$(gh run list --limit 5 --json databaseId,status,conclusion,name 2>/dev/null || echo "")

  if [[ -n "${workflow_runs}" ]]; then
    log_success "CI/CD workflow runs retrieved"
    log_verbose "Recent workflows: ${workflow_runs}"

    # Check for recent successful runs
    local success_count
    success_count=$(echo "${workflow_runs}" | grep -c "success" || echo "0")

    if [[ "${success_count}" -gt 0 ]]; then
      log_success "Found ${success_count} successful workflow runs"
    else
      log_warning "No successful workflow runs in recent history"
    fi
  else
    log_warning "Could not retrieve CI/CD workflow status"
  fi

  return 0
}

# Main verification function
verify_route() {
  local route="$1"
  local name="$2"
  local type="${3:-full}"

  log_info "Verifying: ${name} (${route})"

  # Always check route accessibility
  check_route "${route}" 200

  if [[ "${MODE}" == "routes" ]]; then
    return 0
  fi

  if [[ "${MODE}" == "full" ]]; then
    # Content checks based on route type
    case "${route}" in
      /)
        check_content "${route}" "KTech" "KTech branding"
        check_content "${route}" "开泰科技" "Chinese branding"
        ;;
      /about)
        check_content "${route}" "About" "About content"
        ;;
      /news)
        check_content "${route}" "News" "News content"
        ;;
      /contact)
        check_content "${route}" "Contact" "Contact content"
        ;;
      /join-us)
        check_content "${route}" "Join" "Join Us content"
        ;;
      /careers)
        check_content "${route}" "Position" "Careers content"
        ;;
      /privacy)
        check_content "${route}" "Privacy" "Privacy content"
        ;;
      /terms)
        check_content "${route}" "Terms" "Terms content"
        ;;
      /services/*)
        check_content "${route}" "Service" "Service content"
        ;;
    esac

    # Theme and accessibility checks
    check_theme "${route}"
    check_accessibility "${route}"
    check_i18n "${route}"
  fi

  return 0
}

# Main execution
main() {
  log_info "Starting production verification"
  log_info "Target URL: ${BASE_URL}"
  log_info "Verification mode: ${MODE}"
  echo ""

  # FR1: Home Page
  verify_route "/" "FR1: Home Page"

  # FR2: About Page
  verify_route "/about" "FR2: About Page"

  # FR3: News & Insights
  verify_route "/news" "FR3: News Listing"
  verify_route "/news/blockchain-integration-2024" "FR3: News Detail" "minimal"

  # FR4: Services Pages
  verify_route "/services" "FR4: Services Overview"
  verify_route "/services/blockchain" "FR4: Blockchain Services"
  verify_route "/services/big-data-ai" "FR4: Big Data & AI Services"
  verify_route "/services/supply-chain-finance" "FR4: Supply Chain Finance"

  # FR5: Contact Page
  verify_route "/contact" "FR5: Contact Page"

  # FR6: Careers/Join Us
  verify_route "/join-us" "FR6: Join Us Page"
  verify_route "/careers" "FR6: Careers Page"

  # FR7: Neon Pulse Visualizer
  verify_route "/pulse" "FR7: Neon Pulse Visualizer" "minimal"

  # FR8: Blockchain Services (already covered in FR4)

  # FR9: Legal Pages
  verify_route "/privacy" "FR9: Privacy Policy"
  verify_route "/terms" "FR9: Terms of Service"

  # FR10: NotFound Page (404)
  verify_route "/nonexistent-route-12345" "FR10: NotFound Page" "minimal"

  # CI/CD workflow check
  if [[ "${MODE}" == "full" ]]; then
    echo ""
    check_cicd
  fi

  # Summary
  echo ""
  log_info "Verification complete"
  echo "=========================================="
  echo "Total checks: ${TOTAL_CHECKS}"
  echo -e "${GREEN}Passed: ${PASSED_CHECKS}${NC}"
  echo -e "${RED}Failed: ${FAILED_CHECKS}${NC}"
  echo -e "${YELLOW}Warnings: ${WARNED_CHECKS}${NC}"
  echo "=========================================="

  local pass_rate=0
  if [[ ${TOTAL_CHECKS} -gt 0 ]]; then
    pass_rate=$(( (PASSED_CHECKS * 100) / TOTAL_CHECKS ))
  fi

  echo "Pass rate: ${pass_rate}%"

  if [[ ${FAILED_CHECKS} -eq 0 ]]; then
    log_info "Verification PASSED"
    exit 0
  else
    log_failure "Verification FAILED"
    exit 1
  fi
}

# Run main function
main "$@"
