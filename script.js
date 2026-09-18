/* ==========================================================================
   PORTFOLIO MULTIPLATEFORME — RANDRIANIRINA RAMAHERISON LUCIEN
   JavaScript Logic: Theme Switcher, Filters, Passcode Admin, Modals & State
   ========================================================================== */

/* ===== DATA DEFAULTS ===== */
const DEFAULT_SKILLS = {
  "mobile-frontend": ["Flutter", "Dart", "React", "TypeScript", "HTML5", "CSS3 / Modern UI", "Material 3"],
  "backend-api": ["Node.js", "Express.js", "RESTful APIs", "GraphQL", "Python"],
  "database-cloud": ["PostgreSQL", "MySQL", "Firebase", "MongoDB", "SQLite"],
  "devops-system": ["Git / GitHub", "Linux / Bash", "Docker", "Samba / Active Directory", "Sophos Security"]
};

const DEFAULT_EXPERIENCES = [
  {
    id: "exp-1",
    year: "2025 - PRÉSENT",
    title: "Développeur Multiplateforme & Concepteur de Solutions",
    org: "Projets Indépendants & Institutionnels",
    desc: "Conception et développement d'applications mobiles Flutter et web full-stack adaptées aux besoins de gestion territoriale, de communication citoyenne et de centralisation de données.",
    tags: ["Flutter", "React", "Node.js", "PostgreSQL", "UI/UX"]
  },
  {
    id: "exp-2",
    year: "2025",
    title: "Formateur Numérique & Facilitateur Tech",
    org: "Projet MIONJO",
    desc: "Formation aux outils bureautiques et numériques pour les communautés locales. Transmission de compétences numériques à des utilisateurs d'arrière-plans divers.",
    tags: ["Pédagogie", "Accompagnement", "Inclusion Numérique"]
  },
  {
    id: "exp-3",
    year: "2024",
    title: "Technicien Support & Sécurité IT",
    org: "Ts@ra",
    desc: "Sécurisation et maintenance préventive du parc informatique via Sophos Endpoint Protection. Support technique et optimisation des postes de travail.",
    tags: ["Sophos", "Support IT", "Sécurité", "Linux"]
  },
  {
    id: "exp-4",
    year: "2023",
    title: "Administrateur Réseau & Système",
    org: "WBS",
    desc: "Déploiement d'une infrastructure d'authentification centralisée (FreeRadius, Samba, Active Directory). Configuration et supervision du réseau local.",
    tags: ["FreeRadius", "Samba", "Linux", "Réseau"]
  }
];

const DEFAULT_PROJECTS = [
  {
    id: "proj-1",
    category: "mobile",
    title: "Itantsoroka — Plateforme Territoriale Multiplateforme",
    desc: "Application mobile (Flutter) et dashboard d'administration complet pour la monographie communale, la gestion des requêtes citoyennes et les actualités territoriales.",
    impact: "Impact : Numérisation des services communaux et facilitation de l'accès aux démarches administratives pour des milliers de citoyens.",
    tech: ["Flutter", "Dart", "React", "TypeScript", "Node.js", "PostgreSQL"],
    github: "https://github.com/ramaherison13",
    demo: "#"
  },
  {
    id: "proj-2",
    category: "mobile",
    title: "Application Mobile de Consultation & Publication",
    desc: "Application multiplateforme fluide avec navigation réactive, gestion des rôles d'administration, flux d'actualités et messagerie en temps réel.",
    impact: "Impact : Amélioration significative de l'engagement utilisateur et temps de chargement réduit de 40%.",
    tech: ["Flutter", "Dart", "Provider", "REST API", "Clean Architecture"],
    github: "https://github.com/ramaherison13",
    demo: "#"
  },
  {
    id: "proj-3",
    category: "fullstack",
    title: "Système de Gestion de Publications & Monographie",
    desc: "Interface web full-stack dédiée à la saisie, la validation et l'édition dynamique des documents officiels et des événements institutionnels.",
    impact: "Impact : Centralisation transparente des documents administratifs et suivi statistique en direct.",
    tech: ["React", "TypeScript", "Node.js", "Express", "PostgreSQL"],
    github: "https://github.com/ramaherison13",
    demo: "#"
  },
  {
    id: "proj-4",
    category: "devops",
    title: "Infrastructure d'Authentification Centralisée WBS",
    desc: "Mise en place d'une architecture serveur sécurisée combinant FreeRadius, Samba et Linux pour un contrôle d'accès réseau unifié.",
    impact: "Impact : Sécurisation accrue des accès réseaux d'entreprise et réduction des failles d'authentification.",
    tech: ["FreeRadius", "Samba", "Linux", "Bash", "Active Directory"],
    github: "https://github.com/ramaherison13",
    demo: "#"
  },
  {
    id: "proj-5",
    category: "devops",
    title: "Cluster de Haute Disponibilité & Basculement",
    desc: "Cluster sous Windows Server visant à offrir un basculement automatique et une continuité de service pour les applications critiques.",
    impact: "Impact : Disponibilité de 99.9% des services avec basculement automatique sans perte de session.",
    tech: ["Windows Server", "Failover Clustering", "High Availability"],
    github: "https://github.com/ramaherison13",
    demo: "#"
  }
];

/* ===== ADMIN SECURITY PASSCODE ===== */
const ADMIN_PASSCODE = "lucien2026"; // Code d'accès administrateur privé

/* ===== STATE MANAGEMENT ===== */
let state = {
  theme: localStorage.getItem("pf_theme") || "dark",
  skills: JSON.parse(localStorage.getItem("pf_skills") || "null") || structuredClone(DEFAULT_SKILLS),
  experiences: JSON.parse(localStorage.getItem("pf_experiences") || "null") || structuredClone(DEFAULT_EXPERIENCES),
  projects: JSON.parse(localStorage.getItem("pf_projects") || "null") || structuredClone(DEFAULT_PROJECTS),
  bio: JSON.parse(localStorage.getItem("pf_bio") || "null") || {
    title: "Développeur Multiplateforme & Architecte Web/Mobile",
    text1: "Étudiant en <strong>Master Informatique</strong> à l'ENI Fianarantsoa, je me spécialise dans la création d'applications mobiles <strong>Flutter / Dart</strong>, de plateformes web réactives et de solutions numériques territoriales.",
    text2: "Mon parcours combine une solide expertise logicielle full-stack et une maîtrise rigoureuse des infrastructures réseaux et systèmes.",
    tags: ["ENI Fianarantsoa", "Master Informatique", "Flutter & Dart", "Full-Stack", "Madagascar"]
  },
  isAdminLoggedIn: sessionStorage.getItem("pf_is_admin") === "true"
};

function saveState(key, data) {
  localStorage.setItem("pf_" + key, JSON.stringify(data));
}

/* ===== THEME SWITCHER ===== */
function initTheme() {
  document.documentElement.setAttribute("data-theme", state.theme);
  updateThemeIcon();
}

function toggleTheme() {
  state.theme = state.theme === "dark" ? "light" : "dark";
  localStorage.setItem("pf_theme", state.theme);
  document.documentElement.setAttribute("data-theme", state.theme);
  updateThemeIcon();
  showToast(state.theme === "dark" ? "🌙 Mode Sombre activé" : "☀️ Mode Clair activé");
}

function updateThemeIcon() {
  const btn = document.getElementById("theme-toggle");
  if (btn) {
    btn.innerHTML = state.theme === "dark" ? "☀️" : "🌙";
    btn.setAttribute("title", state.theme === "dark" ? "Passer au Mode Clair" : "Passer au Mode Sombre");
  }
}

/* ===== ADMIN PASSCODE AUTHENTICATION ===== */
function openAdminModal() {
  if (state.isAdminLoggedIn) {
    // If already logged in, prompt logout option
    if (confirm("Vous êtes connecté en Mode Administrateur. Souhaitez-vous vous déconnecter ?")) {
      logoutAdmin();
    }
    return;
  }
  const modalPassInput = document.getElementById("admin-passcode-input");
  if (modalPassInput) modalPassInput.value = "";
  openModal("modal-admin-login");
}

function verifyAdminPasscode() {
  const input = document.getElementById("admin-passcode-input");
  const passcode = input ? input.value.trim() : "";

  if (passcode === ADMIN_PASSCODE) {
    state.isAdminLoggedIn = true;
    sessionStorage.setItem("pf_is_admin", "true");
    closeModal("modal-admin-login");
    applyAdminVisibility();
    showToast("🔓 Connexion Admin Réussie ! Mode Édition disponible.");
  } else {
    showToast("❌ Mot de passe incorrect");
    if (input) input.value = "";
  }
}

function logoutAdmin() {
  state.isAdminLoggedIn = false;
  sessionStorage.removeItem("pf_is_admin");
  editMode = false;
  document.body.classList.remove("editing");
  applyAdminVisibility();
  showToast("🔒 Déconnexion Admin réussie. Mode public actif.");
}

function applyAdminVisibility() {
  const fab = document.getElementById("edit-fab");
  const adminFooterBtn = document.getElementById("admin-footer-link");

  if (fab) {
    fab.style.display = state.isAdminLoggedIn ? "flex" : "none";
  }
  if (adminFooterBtn) {
    adminFooterBtn.textContent = state.isAdminLoggedIn ? "🔓 Déconnexion Admin" : "🔒 Connexion Admin";
  }
}

/* ===== RENDER FUNCTIONS ===== */
function renderBio() {
  const t1 = document.getElementById("bio-text-1");
  const t2 = document.getElementById("bio-text-2");
  const tagsContainer = document.getElementById("bio-tags-container");

  if (t1) t1.innerHTML = state.bio.text1;
  if (t2) t2.innerHTML = state.bio.text2;
  if (tagsContainer) {
    tagsContainer.innerHTML = state.bio.tags.map(t => `<span class="tag-chip">${t}</span>`).join("");
  }
}

function renderSkills() {
  Object.entries(state.skills).forEach(([catId, items]) => {
    const container = document.getElementById(`skills-${catId}`);
    if (!container) return;
    container.innerHTML = items.map(skill => `
      <span class="skill-pill">
        ${skill}
        <button class="item-actions btn-danger" style="display:inline;background:none;border:none;color:#ef4444;margin-left:4px;" onclick="removeSkill('${catId}', '${skill}')">✕</button>
      </span>
    `).join("");
  });
}

function renderExperiences() {
  const container = document.getElementById("timeline-list");
  if (!container) return;
  container.innerHTML = state.experiences.map(exp => `
    <div class="timeline-item reveal">
      <div class="timeline-marker"></div>
      <div class="timeline-content">
        <div class="item-actions">
          <button class="btn btn-sm btn-outline" onclick="openExpModal('${exp.id}')">✏️ Modifier</button>
          <button class="btn btn-sm btn-outline" style="color:#ef4444;" onclick="removeExp('${exp.id}')">✕</button>
        </div>
        <div class="timeline-year">${exp.year}</div>
        <div class="timeline-role">${exp.title}</div>
        <div class="timeline-org">${exp.org}</div>
        <div class="timeline-desc">${exp.desc}</div>
        <div class="project-tech" style="margin-top:12px;">
          ${exp.tags.map(t => `<span class="tech-tag">${t}</span>`).join("")}
        </div>
      </div>
    </div>
  `).join("");
  reObserveReveals();
}

function renderProjects(filterCategory = "all") {
  const container = document.getElementById("projects-grid");
  if (!container) return;

  const filtered = filterCategory === "all" 
    ? state.projects 
    : state.projects.filter(p => p.category === filterCategory);

  container.innerHTML = filtered.map(proj => `
    <div class="project-card reveal" data-category="${proj.category}">
      <div class="project-card-top">
        <div class="project-meta">
          <span class="project-category">${proj.category === "mobile" ? "📱 Mobile Flutter" : proj.category === "fullstack" ? "💻 Web & Fullstack" : "🛠️ Réseaux & Outils"}</span>
          <div class="item-actions">
            <button class="btn btn-sm btn-outline" onclick="openProjectModal('${proj.id}')">✏️</button>
            <button class="btn btn-sm btn-outline" style="color:#ef4444;" onclick="removeProject('${proj.id}')">✕</button>
          </div>
        </div>
        <h3 class="project-title">${proj.title}</h3>
        <p class="project-desc">${proj.desc}</p>
        <p class="project-desc" style="font-weight:600;color:var(--primary);font-size:0.85rem;">${proj.impact || ''}</p>
      </div>
      <div>
        <div class="project-tech">
          ${proj.tech.map(t => `<span class="tech-tag">${t}</span>`).join("")}
        </div>
        <div class="project-actions">
          <button class="btn btn-sm btn-primary" onclick="openProjectDetailModal('${proj.id}')">Détails du projet →</button>
          ${proj.github ? `<a href="${proj.github}" target="_blank" class="project-link-btn" title="Voir Code source GitHub">GitHub ↗</a>` : ''}
        </div>
      </div>
    </div>
  `).join("");
  reObserveReveals();
}

/* ===== PROJECT DETAIL MODAL ===== */
function openProjectDetailModal(id) {
  const proj = state.projects.find(p => p.id === id);
  if (!proj) return;

  const modalBody = document.getElementById("detail-modal-body");
  if (!modalBody) return;

  modalBody.innerHTML = `
    <h3 style="font-family:var(--font-heading);font-size:1.4rem;margin-bottom:10px;">${proj.title}</h3>
    <span class="project-category" style="margin-bottom:16px;display:inline-block;">${proj.category === "mobile" ? "📱 App Mobile Multiplateforme" : "💻 Solution Full-Stack"}</span>
    <p style="color:var(--text-secondary);line-height:1.7;margin-bottom:16px;">${proj.desc}</p>
    
    <div style="background:var(--primary-dim);border:1px solid var(--border-highlight);border-radius:var(--radius-md);padding:16px;margin-bottom:20px;">
      <h4 style="font-family:var(--font-mono);font-size:0.8rem;color:var(--primary);margin-bottom:6px;text-transform:uppercase;">Impact Réalisé</h4>
      <p style="font-size:0.92rem;color:var(--text-primary);">${proj.impact || "Amélioration des performances et optimisation des processus opérationnels."}</p>
    </div>

    <h4 style="font-family:var(--font-mono);font-size:0.85rem;color:var(--primary);margin-bottom:10px;text-transform:uppercase;">Technologies Clés</h4>
    <div class="project-tech" style="margin-bottom:24px;">
      ${proj.tech.map(t => `<span class="tech-tag" style="padding:6px 12px;font-size:0.78rem;">${t}</span>`).join("")}
    </div>

    <div style="display:flex;gap:14px;">
      ${proj.github ? `<a href="${proj.github}" target="_blank" class="btn btn-secondary">Code GitHub ↗</a>` : ''}
      <button class="btn btn-outline" onclick="closeModal('modal-detail')">Fermer</button>
    </div>
  `;

  openModal("modal-detail");
}

/* ===== PROJECT FILTER TABS ===== */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll(".filter-btn");
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      filterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const category = btn.dataset.filter;
      renderProjects(category);
    });
  });
}

/* ===== TOAST NOTIFICATIONS ===== */
let toastTimeout;
function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

/* ===== MODAL HELPERS ===== */
function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add("open");
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove("open");
}

/* ===== EDIT MODE (FAB) ===== */
let editMode = false;
function initEditMode() {
  const fab = document.getElementById("edit-fab");
  const badge = document.getElementById("edit-badge");

  if (!fab) return;
  fab.addEventListener("click", () => {
    if (!state.isAdminLoggedIn) {
      openAdminModal();
      return;
    }
    editMode = !editMode;
    document.body.classList.toggle("editing", editMode);
    fab.classList.toggle("active", editMode);
    if (badge) badge.classList.toggle("show", editMode);
    showToast(editMode ? "✏️ Mode Édition Activé" : "✅ Modifications Enregistrées");
  });
}

function removeSkill(catId, skill) {
  if (!editMode) return;
  state.skills[catId] = state.skills[catId].filter(s => s !== skill);
  saveState("skills", state.skills);
  renderSkills();
  showToast("🗑️ Compétence supprimée");
}

function removeExp(id) {
  if (!editMode) return;
  state.experiences = state.experiences.filter(e => e.id !== id);
  saveState("experiences", state.experiences);
  renderExperiences();
  showToast("🗑️ Expérience supprimée");
}

function removeProject(id) {
  if (!editMode) return;
  state.projects = state.projects.filter(p => p.id !== id);
  saveState("projects", state.projects);
  renderProjects();
  showToast("🗑️ Projet supprimé");
}

/* ===== STATS ANIMATED COUNTER ===== */
function initStatsCounter() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      let count = 0;
      const step = Math.ceil(target / 25);
      const timer = setInterval(() => {
        count = Math.min(count + step, target);
        el.textContent = count;
        if (count >= target) clearInterval(timer);
      }, 40);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll(".stat-number[data-target]").forEach(el => observer.observe(el));
}

/* ===== REVEAL ON SCROLL ===== */
let revealObserver;
function initReveals() {
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));
}

function reObserveReveals() {
  document.querySelectorAll(".reveal:not(.visible)").forEach(el => revealObserver?.observe(el));
}

/* ===== MOBILE NAVIGATION ===== */
function initMobileNav() {
  const toggle = document.querySelector(".mobile-toggle");
  const menu = document.querySelector(".mobile-menu");
  const links = document.querySelectorAll(".mobile-menu a");

  if (!toggle || !menu) return;
  toggle.addEventListener("click", () => {
    menu.classList.toggle("active");
  });
  links.forEach(l => l.addEventListener("click", () => {
    menu.classList.remove("active");
  }));
}

/* ===== CV DOWNLOAD SIMULATION ===== */
function downloadCV() {
  showToast("📄 Téléchargement du CV de Randrianirina Lucien...");
}

/* ===== KEYBOARD SHORTCUT FOR ADMIN (Ctrl + Shift + A) ===== */
document.addEventListener("keydown", e => {
  if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a") {
    e.preventDefault();
    openAdminModal();
  }
});

/* ===== INIT ON DOM CONTENT LOADED ===== */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  applyAdminVisibility();
  renderBio();
  renderSkills();
  renderExperiences();
  renderProjects();
  initProjectFilters();
  initEditMode();
  initStatsCounter();
  initReveals();
  initMobileNav();

  const themeBtn = document.getElementById("theme-toggle");
  if (themeBtn) themeBtn.addEventListener("click", toggleTheme);

  // Close modals on click overlay
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });
});