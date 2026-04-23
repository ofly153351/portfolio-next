<!-- BEGIN:nextjs-agent-rules -->
# 🤖 Phiraphat Portfolio AI (Frontend)

## 🧠 Purpose
- Introduce Phiraphat
- Showcase skills & projects
- Guide users with smooth AI-like interaction

---

## ⚡ Capabilities
- Answer: skills, projects, experience  
- Navigate sections (scroll)  
- Simulate AI chat (frontend only)

---

## 🎭 Personality
- Friendly, modern, AI vibe  
- Confident (senior dev tone)  
- Short replies (2–3 sentences)  
- Encourage interaction  

---

## 🎨 Theme
- Primary: #7c3aed  
- Secondary: #3b82f6  
- Tertiary: #a78bfa  
- Neutral: #0A0A0A  

**Style**
- Dark mode first  
- Glass + blur + gradient glow  
- Rounded (xl/2xl)

---

## 🧱 Architecture
- /app/[locale]/page.tsx
- /components/{layout,sections,ai,ui}
- /types/{ai,ui,portfolio,works}.ts

**Rules**
- Small, reusable components  
- Separate UI / logic  
- No monolith  
- Keep `type`/`interface` in `/types` (avoid inline types in component files)  
- Use `import type { ... } from "@/types/..."` for shared contracts  

---

## Response Rules
- No reasoning. Just answer.
- Return only necessary output
- No explanation unless asked
- Always respond with minimal code
- No explanation unless asked
- Prefer short answers

## 🌍 i18n
- en (default), th (future)  
- ❌ No hardcoded text  
- ✅ useTranslations()

---

## 📱 Responsive
- Mobile-first  
- Breakpoints: <640 / 640–1024 / >1024  
- Grid: 1 → 2 → 3 cols  

**UX**
- Mobile: hamburger + full-width chat  
- Desktop: navbar + floating chat  
- Touch ≥ 44px  

---

## ✨ UX Behavior
- Response < 800ms  
- Typing + streaming effect  
- Fade + slide animations  
- Suggest next actions  

**AOS Animation**
- Use `aos` for scroll-based reveal animations on sections/cards  
- Initialize once via `app/components/ui/AOSProvider.tsx` and include in `/app/[locale]/page.tsx`  
- Default motion: `duration: 700`, `easing: ease-out-cubic`, `offset: 70`, `once: true`  
- Prefer subtle effects (`fade-up`, `fade-left`, `fade-right`, `zoom-in`) with small stagger delays  
- Keep animation lightweight and smooth on mobile (avoid heavy chained effects)  

**Tools (mock)**
- getProjects / getSkills / getExperience  
- navigateTo(section)

---

## 🧪 Behavior
- “projects” → show + scroll  
- “skills” → summary  
- “contact” → scroll  

---

## 📏 Rules
- 2–3 sentences max  
- No hallucination  
- Prefer UI over text  
- Always guide user  

---

## 💡 Goal
Not real AI → but **fast, smooth, intelligent feel**

---

## 🚀 Future
- Connect API  
- Replace static data  
- Add RAG / MCP  
<!-- END:nextjs-agent-rules -->
