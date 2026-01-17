# Legal Compliance Requirements

## Overview

This document outlines the legal requirements for Downstream Studio to operate legally in Romania, Hungary, US, and EU.

**Research Date:** January 2026

---

## Required Documents

### 1. Privacy Policy (LEGALLY REQUIRED)

Since we serve EU users and collect personal data (name, email via the contact form), GDPR mandates a privacy policy.

**Must include:**
- Company identity & contact info (business name, address, email)
- Data controller details (who is responsible for the data)
- What data we collect (name, email, story submissions, usage analytics)
- Legal basis for processing (consent for form submission, legitimate interest for analytics)
- How long we keep data (define retention periods)
- Third-party sharing (Vercel hosting, Umami analytics, email services)
- User rights (access, rectification, deletion, portability, objection)
- How to contact us for data requests

**Status:** [ ] Not created

**Page URL:** `/privacy`

---

### 2. Cookie Consent Banner (REQUIRED for EU)

Since we use Umami analytics (even though it's privacy-focused), we should have:
- Banner that appears before non-essential cookies are set
- Clear accept/reject options
- Link to cookie policy explaining what cookies we use

**Note:** Umami is designed to be GDPR-compliant and doesn't use cookies by default. However, a consent banner demonstrates compliance and builds trust.

**Status:** [ ] Not created

---

### 3. Terms of Service (RECOMMENDED)

Not legally required, but protects us legally.

**Should cover:**
- Acceptable use of the service
- Intellectual property (our content, submitted stories)
- Limitation of liability
- Dispute resolution
- Right to modify terms

**Status:** [ ] Not created

**Page URL:** `/terms`

---

## Country-Specific Requirements

### EU / GDPR (Applies to all EU visitors)

| Requirement | Status | Notes |
|-------------|--------|-------|
| Privacy Policy | [ ] | Required |
| Cookie consent | [ ] | Required for tracking |
| Data processing records | [ ] | Required if >250 employees OR processing sensitive data |
| DPO appointment | N/A | Not required for our size |

**Penalties:** Up to EUR 20M or 4% global annual revenue (whichever is higher)

### Romania

| Requirement | Status | Notes |
|-------------|--------|-------|
| ANSPDCP compliance | [ ] | National data authority |
| Law 190 compliance | [ ] | For special categories of data |
| NIS2 Directive | [ ] | Effective October 2024 |

**Data Authority:** ANSPDCP (Autoritatea Nationala de Supraveghere a Prelucrarii Datelor cu Caracter Personal)

### Hungary

| Requirement | Status | Notes |
|-------------|--------|-------|
| NAIH compliance | [ ] | National data authority |
| Advertising Act | [ ] | Clear commercial disclosures |

**Data Authority:** NAIH (Nemzeti Adatvedelmi es Informacioszabadsag Hatosag)

### United States

| Requirement | Status | Notes |
|-------------|--------|-------|
| CCPA (California) | [ ] | If >$25M revenue OR >50k CA consumers |
| State privacy laws | [ ] | 21+ states have laws as of 2025 |
| CAN-SPAM | [ ] | For email marketing |

**Note:** Most US state privacy laws have revenue/data thresholds that small businesses don't meet. Monitor as we grow.

---

## Data We Currently Collect

### Via Contact Form
- Name (required)
- Email (required)
- Story description (required)
- Usage intent (required)
- Link to existing work (optional)

### Via Analytics (Umami)
- Page views
- Referrer
- Browser/device info
- Country (no IP stored)
- Session duration

**Note:** Umami is privacy-focused and doesn't use cookies or collect personal data by default.

---

## Third-Party Services

| Service | Purpose | Data Shared | Privacy Policy |
|---------|---------|-------------|----------------|
| Vercel | Hosting | Server logs | https://vercel.com/legal/privacy-policy |
| Umami Cloud | Analytics | Anonymized visits | https://umami.is/privacy |
| Cal.com | Booking | Name, email | https://cal.com/privacy |

---

## Implementation Checklist

### Phase 1: Essential (Before Public Launch)
- [ ] Create `/privacy` page
- [ ] Create `/terms` page
- [ ] Add footer links to Privacy Policy and Terms
- [ ] Configure Umami to respect DNT (Do Not Track)

### Phase 2: Enhanced Compliance
- [ ] Add cookie consent banner (optional for Umami, but good practice)
- [ ] Create data request process (email template for GDPR requests)
- [ ] Document data retention periods

### Phase 3: As We Scale
- [ ] Review US state law thresholds annually
- [ ] Consider appointing DPO if processing sensitive data
- [ ] Implement data processing agreements with vendors

---

## Resources

- [GDPR Official Text](https://gdpr.eu/)
- [ANSPDCP Romania](https://www.dataprotection.ro/)
- [NAIH Hungary](https://naih.hu/)
- [CCPA California](https://oag.ca.gov/privacy/ccpa)
- [Umami GDPR Compliance](https://umami.is/docs/guides/gdpr-compliance)

---

## Notes

- Umami was chosen specifically because it's GDPR-compliant by design
- We do NOT sell user data
- We do NOT use advertising/retargeting
- We do NOT process sensitive personal data (health, religion, etc.)

Last updated: January 2026
