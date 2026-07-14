# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Security
- Fixed high-severity command injection vulnerability in glob package (GHSA-5j98-mcp5-4vw2)
  - Updated glob from 10.4.5 to 10.5.0
  - Non-breaking security fix via `npm audit fix`
  - Eliminated command injection risk via shell:true execution
  - See Issue #366 for full security audit details

### Dependencies
- **glob**: 10.4.5 → 10.5.0 (security fix)
- No other dependency changes (remaining vulnerabilities documented as acceptable risk)

## [Previous Versions]

For changes prior to this security audit, please refer to git history.

---

**Security Notes**:
- This changelog entry documents the security fixes from Issue #366
- For full vulnerability analysis and risk assessment, see SECURITY-AUDIT-REPORT.md
- Remaining vulnerabilities are documented and accepted due to package abandonment or breaking change requirements