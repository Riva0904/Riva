# Riva Application Roadmap

## Phase 1: Cleanup & Database
- [ ] Delete unwanted files (README noise, stubs, duplicates)
- [ ] Write SQL V2 schema (Categories, EmailOtp, new Templates, alter Users)

## Phase 2: Domain & DTOs
- [ ] Rewrite Domain entities (User, Template, Category, EmailOtp)
- [ ] Rewrite DTOs (Auth, Template, Category)

## Phase 3: CQRS Layer
- [ ] Write CQRS Commands (AdminRegister, VerifyOtp, ResendOtp, AddTemplate)
- [ ] Write CQRS Queries (GetTemplates, GetTemplateById, GetCategories)
- [ ] Write Command Handlers (auth OTP + admin template)
- [ ] Write Query Handlers (templates, categories)

## Phase 4: Infrastructure
- [ ] Write Repository interfaces + implementations
- [ ] Write EmailService (MailKit SMTP)
- [ ] Update Program.cs + appsettings.json + csproj (add MailKit)

## Phase 5: API Layer
- [ ] Write Controllers (Auth, Template, Category)

## Phase 6: Frontend
- [ ] Write Frontend API layer (auth, templates, categories)
- [ ] Write Frontend Admin components (OTP modal, template form, list)
- [ ] Update App.tsx and AdminPage

---

Last Updated: 2026-05-06
