const CONTENT_PATH = 'content/site.json';
const LANGUAGE_KEY = 'garrylee-language';

const interfaceCopy = {
  zh: {
    skip: '跳到正文',
    homepageLabel: '',
    brandTag: 'Research & Practice',
    navLabel: '主要导航',
    languageLabel: '语言切换',
    navAbout: '关于',
    navResearch: '研究兴趣',
    navEducation: '学术概览',
    navWorkstation: '服务',
    navServices: '服务',
    profileLabel: '个人信息',
    plasmaVisualLabel: '等离子体动态视觉',
    labValue: 'KMAX 实验室',
    educationLabel: '教育经历',
    educationMasters: '硕士研究生 · 能源动力',
    educationBachelor: '本科 · 空间科学与技术',
    mastersPeriod: '2026.09 — 至今',
    bachelorPeriod: '2022.09 — 2026.06',
    researchgateLabel: 'ResearchGate',
    ustc: '中国科学技术大学',
    fieldLabel: '方向',
    locationLabel: '地点',
    location: '中国 · 合肥',
    emailLabel: '邮箱',
    wechatLabel: '微信',
    academicEyebrow: 'ACADEMIC PROFILE · 学术主页',
    aboutTitle: '关于我',
    aboutSecond: '这个网站用于记录我的研究兴趣、阶段性工作与长期积累，适合公开的项目、笔记与工具会在这里持续补充',
    viewResearch: '查看研究方向',
    enterWorkstation: '进入服务',
    currentFocus: '当前关注',
    identityTitle: '身份',
    identityCopy: '独立开发者 · 科研与实际应用的交叉实践',
    researchKicker: 'RESEARCH INTERESTS',
    researchTitle: '研究兴趣',
    researchIntro: '从物理机制出发，关注理论、诊断、计算与数据表达之间的联系',
    overviewKicker: 'ACADEMIC OVERVIEW',
    overviewTitle: '学术概览',
    overviewIntro: '这里整理教育经历与研究训练，后续将逐步补充成熟的项目与成果',
    noteTitle: '关于公开内容',
    noteCopy: '科研经历与成果将在适合公开时持续更新，这里先呈现研究方向、教育经历与工作方法',
    beyondResearch: 'BEYOND RESEARCH · 研究之外',
    workstationEntryTitle: '独立合作',
    workstationEntryCopy: '我也承接数据分析、网站制作与物理辅导等独立工作，相关能力、案例和合作方式集中放在服务页面',
    openWorkstation: '查看服务',
    contactMe: '联系我',
    academicHome: '研究',
    servicesNav: '服务',
    projectsNav: '案例',
    contactNav: '联系',
    workEyebrow: 'INDEPENDENT WORK · 独立合作',
    workIdentityCopy: '独立开发与技术服务',
    workHeadline: '把问题讲清楚，把结果做出来',
    workIntroduction: '这是我的独立工作入口，我利用科研训练、代码能力与 Agent 协作，为个人和小型团队完成数据分析、网站制作与物理辅导',
    viewServices: '查看可做的工作',
    discussProject: '沟通一个项目',
    availableStatus: '可接受线上与线下合作',
    responseLabel: '沟通语言',
    responseValue: '中文优先 / English available',
    deliveryLabel: '工作方式',
    deliveryValue: '阶段确认 · 可预览 · 可复核',
    toolsLabel: '开发协作',
    toolsValue: 'Agent 协作工作流',
    servicesKicker: 'WHAT I CAN DO',
    servicesTitle: '可承接的工作',
    servicesIntro: '适合需求边界清楚、重视沟通与交付质量的中小型任务',
    projectsKicker: 'SELECTED PROJECT',
    projectsTitle: '已完成案例',
    projectsIntro: '真实上线的项目比功能清单更能说明工作方式',
    processKicker: 'WORKING PROCESS',
    processTitle: '简单、透明的合作过程',
    processOneTitle: '明确需求',
    processOneCopy: '先确认目标、交付物、周期与判断完成的标准',
    processTwoTitle: '阶段预览',
    processTwoCopy: '关键节点提供可查看的中间结果，及时校准方向',
    processThreeTitle: '完整交付',
    processThreeCopy: '交付成品、必要说明与可继续维护的文件',
    contactKicker: 'START A CONVERSATION',
    contactTitle: '先把你的问题发给我',
    contactCopy: '请简单说明目标、现有材料和期望时间，我会先判断是否适合承接，再给出清晰的下一步',
    backAcademic: '返回研究'
  },
  en: {
    skip: 'Skip to content',
    homepageLabel: '',
    brandTag: 'Research & Practice',
    navLabel: 'Primary navigation',
    languageLabel: 'Language switcher',
    navAbout: 'About',
    navResearch: 'Research',
    navEducation: 'Overview',
    navWorkstation: 'Services',
    navServices: 'Services',
    profileLabel: 'Profile information',
    plasmaVisualLabel: 'Animated plasma field',
    labValue: 'KMAX Laboratory',
    educationLabel: 'Education',
    educationMasters: 'M.Eng. · Energy and Power Engineering',
    educationBachelor: 'B.S. · Space Science and Technology',
    mastersPeriod: 'Sep. 2026 — Present',
    bachelorPeriod: 'Sep. 2022 — Jun. 2026',
    researchgateLabel: 'ResearchGate',
    ustc: 'University of Science and Technology of China',
    fieldLabel: 'Field',
    locationLabel: 'Based in',
    location: 'Hefei, China',
    emailLabel: 'Email',
    wechatLabel: 'WeChat',
    academicEyebrow: 'ACADEMIC PROFILE',
    aboutTitle: 'About Me',
    aboutSecond: 'This site records my research interests, work in progress, and long-term practice, with suitable projects, notes, and tools added over time',
    viewResearch: 'View research interests',
    enterWorkstation: 'View services',
    currentFocus: 'Current interests',
    identityTitle: 'Roles',
    identityCopy: 'Independent developer · Research and practical applications',
    researchKicker: 'RESEARCH INTERESTS',
    researchTitle: 'Research Interests',
    researchIntro: 'Starting from physical mechanisms, I am interested in the links between theory, diagnostics, computation, and data representation',
    overviewKicker: 'ACADEMIC OVERVIEW',
    overviewTitle: 'Academic Overview',
    overviewIntro: 'This page brings together my education and research training, with mature projects and results added over time',
    noteTitle: 'About public materials',
    noteCopy: 'Research experience and results will be added when appropriate for public release, while this page focuses on my interests, education, and working methods',
    beyondResearch: 'BEYOND RESEARCH',
    workstationEntryTitle: 'Independent Work',
    workstationEntryCopy: 'I also take on independent work in data analysis, website development, and physics tutoring, with capabilities, cases, and collaboration details collected on the services page',
    openWorkstation: 'View services',
    contactMe: 'Contact',
    academicHome: 'Research',
    servicesNav: 'Services',
    projectsNav: 'Case Study',
    contactNav: 'Contact',
    workEyebrow: 'INDEPENDENT WORK',
    workIdentityCopy: 'Independent development and technical services',
    workHeadline: 'Clarify the problem. Deliver the result',
    workIntroduction: 'This is my independent work portal, combining research training, coding, and agent workflows to help individuals and small teams with data analysis, website development, and physics tutoring',
    viewServices: 'View services',
    discussProject: 'Discuss a project',
    availableStatus: 'Available for online and local work',
    responseLabel: 'Language',
    responseValue: 'Chinese preferred / English available',
    deliveryLabel: 'Delivery',
    deliveryValue: 'Milestones · Previews · Verifiable results',
    toolsLabel: 'Workflow',
    toolsValue: 'Agent-assisted workflow',
    servicesKicker: 'WHAT I CAN DO',
    servicesTitle: 'Services',
    servicesIntro: 'Best suited to small and medium assignments with clear scope, communication, and delivery standards',
    projectsKicker: 'SELECTED PROJECT',
    projectsTitle: 'Completed Work',
    projectsIntro: 'A real, deployed project explains my working style better than a feature list',
    processKicker: 'WORKING PROCESS',
    processTitle: 'A simple, transparent process',
    processOneTitle: 'Define',
    processOneCopy: 'We first agree on the goal, deliverables, timeline, and acceptance criteria',
    processTwoTitle: 'Preview',
    processTwoCopy: 'Reviewable intermediate results are shared at key milestones to keep the direction aligned',
    processThreeTitle: 'Deliver',
    processThreeCopy: 'You receive the finished work, essential documentation, and maintainable source files',
    contactKicker: 'START A CONVERSATION',
    contactTitle: 'Send me the problem first',
    contactCopy: 'Briefly describe your goal, available materials, and expected timeline, and I will first assess the fit before suggesting a clear next step',
    backAcademic: 'Back to research'
  }
};

let siteData = null;
let currentLanguage = readLanguage();

function readLanguage() {
  try {
    return localStorage.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'zh';
  } catch {
    return 'zh';
  }
}

function writeLanguage(language) {
  try {
    localStorage.setItem(LANGUAGE_KEY, language);
  } catch {
    // The language still changes for this page when storage is unavailable.
  }
}

function localized(item, key, language = currentLanguage) {
  if (language === 'en') return item?.[`${key}En`] || item?.[key] || '';
  return item?.[key] || '';
}

function localizedArray(data, key, language = currentLanguage) {
  const fallback = Array.isArray(data?.[key]) ? data[key] : [];
  if (language !== 'en') return fallback;
  const translated = data?.[`${key}En`];
  return Array.isArray(translated) && translated.length ? translated : fallback;
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value || '';
}

function make(tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (value !== undefined) element.textContent = value;
  return element;
}

function applyInterfaceLanguage() {
  const copy = interfaceCopy[currentLanguage];
  document.documentElement.lang = currentLanguage === 'zh' ? 'zh-CN' : 'en';
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const value = copy[element.dataset.i18n];
    if (value !== undefined) element.textContent = value;
  });
  document.querySelectorAll('[data-i18n-aria]').forEach((element) => {
    const value = copy[element.dataset.i18nAria];
    if (value !== undefined) element.setAttribute('aria-label', value);
  });
  document.querySelectorAll('[data-lang-option]').forEach((button) => {
    button.setAttribute('aria-pressed', String(button.dataset.langOption === currentLanguage));
  });
}

function renderAcademic(data) {
  setText('profile-name', data.profile.name);
  setText('profile-field', localized(data.profile, 'eyebrow'));
  setText('profile-headline', localized(data.profile, 'headline'));
  setText('profile-introduction', localized(data.profile, 'introduction'));

  const focus = localizedArray(data, 'focus');
  const focusDetails = localizedArray(data, 'focusDetails');
  const summary = document.getElementById('focus-summary');
  summary.replaceChildren(...focus.slice(0, 3).map((item) => make('li', '', item)));

  const list = document.getElementById('focus-list');
  list.replaceChildren(...focus.map((item, index) => {
    const article = make('article', 'interest-item');
    article.append(make('h3', '', item));
    article.append(make('p', '', focusDetails[index] || ''));
    return article;
  }));

  const education = currentLanguage === 'en' && Array.isArray(data.educationEn) && data.educationEn.length
    ? data.educationEn
    : (Array.isArray(data.education) ? data.education : []);
  const credentialsList = document.getElementById('credential-list');
  credentialsList.replaceChildren(...education.map((item) => {
    const row = make('article', 'timeline-item');
    row.append(make('time', 'timeline-period', localized(item, 'period')));
    const copy = make('div', 'timeline-copy');
    copy.append(make('h3', '', localized(item, 'institution')));
    copy.append(make('p', 'timeline-degree', localized(item, 'degree')));
    copy.append(make('p', 'timeline-detail', localized(item, 'details')));
    row.append(copy);
    return row;
  }));
}

function renderWorkstation(data) {
  const serviceList = document.getElementById('service-list');
  serviceList.replaceChildren(...data.services.map((service) => {
    const article = make('article', 'service-card');
    article.append(make('h3', '', localized(service, 'title')));
    article.append(make('p', '', localized(service, 'description')));
    return article;
  }));

  const projectList = document.getElementById('project-list');
  projectList.replaceChildren(...data.projects.map((project) => {
    const article = make('article', 'project-item');
    const preview = make('div', 'project-preview');
    preview.setAttribute('aria-label', localized(project, 'title'));
    const top = make('div', 'project-preview-top');
    top.append(make('span', '', localized(project, 'visualLabel')), make('span', '', localized(project, 'visualMeta')));
    const center = make('div', 'project-preview-center');
    center.append(make('strong', '', localized(project, 'visualTitle')));
    const bottom = make('div', 'project-preview-bottom');
    bottom.append(make('span', '', new URL(project.url).hostname.toUpperCase()));
    preview.append(top, center, bottom);

    const copy = make('div', 'project-copy');
    copy.append(make('p', 'project-status', localized(project, 'status')));
    copy.append(make('h3', '', localized(project, 'title')));
    copy.append(make('p', 'project-summary', localized(project, 'summary')));
    const tags = make('div', 'tag-list');
    const selectedTags = currentLanguage === 'en' && Array.isArray(project.tagsEn) && project.tagsEn.length ? project.tagsEn : project.tags;
    selectedTags.forEach((tag) => tags.append(make('span', '', tag)));
    const link = make('a', 'project-link', `${localized(project, 'linkLabel')} ↗`);
    link.href = project.url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    copy.append(tags, link);
    article.append(preview, copy);
    return article;
  }));
}

function renderContact(data) {
  ['email-link', 'work-email-link'].forEach((id) => {
    const link = document.getElementById(id);
    if (!link) return;
    link.href = `mailto:${data.contact.email}`;
    const strong = link.querySelector('strong');
    if (strong) strong.textContent = data.contact.email;
  });

  ['github-link', 'work-github-link'].forEach((id) => {
    const link = document.getElementById(id);
    if (!link) return;
    link.href = data.contact.github;
    const strong = link.querySelector('strong');
    if (strong) strong.textContent = data.contact.github.split('/').filter(Boolean).pop();
  });

  ['researchgate-link', 'work-researchgate-link'].forEach((id) => {
    const link = document.getElementById(id);
    if (!link || !data.contact.researchgate) return;
    link.href = data.contact.researchgate;
  });

  setText('wechat-value', data.contact.wechat);
  setText('footer-copyright', `© ${new Date().getFullYear()} ${data.profile.name}`);
  setText('footer-text', localized(data, 'footer'));
}

function renderSite(data) {
  applyInterfaceLanguage();
  const title = currentLanguage === 'en' ? data.meta.siteTitleEn : data.meta.siteTitle;
  const description = currentLanguage === 'en' ? data.meta.descriptionEn : data.meta.description;
  document.title = document.body.dataset.page === 'workstation'
    ? (currentLanguage === 'en' ? 'GarryLee | Independent Work' : 'GarryLee | 独立合作')
    : title;
  document.querySelector('meta[name="description"]').setAttribute('content', description);
  document.documentElement.style.setProperty('--accent', data.meta.accent || '#6f9db5');

  if (document.body.dataset.page === 'academic') renderAcademic(data);
  else renderWorkstation(data);
  renderContact(data);
}

function setLanguage(language) {
  currentLanguage = language === 'en' ? 'en' : 'zh';
  writeLanguage(currentLanguage);
  if (siteData) renderSite(siteData);
}

function colorToRgb(hex, fallback) {
  const normalized = String(hex || '').replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return fallback;
  return [0, 2, 4].map((offset) => Number.parseInt(normalized.slice(offset, offset + 2), 16));
}

function initializeProfileOrb(config) {
  const canvas = document.getElementById('plasma-portrait');
  const context = canvas?.getContext('2d');
  if (!context) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motionEnabled = config.motionEnabled !== false && !reducedMotion;
  // Match the active aurora palette instead of the former light-theme blue
  const palette = [
    [126, 226, 192], // emerald
    [102, 213, 230], // ice cyan
    [83, 203, 166],  // mint
    [220, 233, 121]  // lemon highlight
  ];
  const primary = palette[0];
  const secondary = palette[1];
  const particles = Array.from({ length: 84 }, (_, index) => ({
    longitude: (index * 2.399963) % (Math.PI * 2),
    latitude: Math.acos(1 - (2 * (index + 0.5)) / 84),
    size: 0.65 + (index % 5) * 0.16,
    color: index % 4 === 0 ? secondary : primary
  }));
  let size = 0;
  let frameId = 0;

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    const scale = Math.min(devicePixelRatio || 1, 2);
    size = Math.max(1, Math.round(Math.min(bounds.width, bounds.height)));
    canvas.width = Math.round(size * scale);
    canvas.height = Math.round(size * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
  }

  function draw(time) {
    const center = size / 2;
    const radius = size * 0.405;
    const phase = time * 0.00018;
    context.clearRect(0, 0, size, size);
    context.fillStyle = '#f8fafc';
    context.beginPath();
    context.arc(center, center, size * 0.49, 0, Math.PI * 2);
    context.fill();

    context.save();
    context.beginPath();
    context.arc(center, center, radius * 1.06, 0, Math.PI * 2);
    context.clip();

    for (let band = -4; band <= 4; band += 1) {
      const vertical = band / 5;
      const ringWidth = radius * Math.sqrt(Math.max(0.08, 1 - vertical * vertical));
      context.strokeStyle = band % 2 === 0
        ? `rgba(${primary.join(', ')}, 0.46)`
        : `rgba(${secondary.join(', ')}, 0.32)`;
      context.lineWidth = band === 0 ? 1.05 : 0.65;
      context.beginPath();
      for (let step = 0; step <= 72; step += 1) {
        const angle = (step / 72) * Math.PI * 2;
        const wobble = Math.sin(angle * 3 + phase * 5 + band) * radius * 0.018;
        const x = center + Math.cos(angle) * ringWidth;
        const y = center + vertical * radius * 0.82 + Math.sin(angle) * radius * 0.12 + wobble;
        if (step === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.closePath();
      context.stroke();
    }

    particles
      .map((particle) => {
        const longitude = particle.longitude + phase;
        const sinLatitude = Math.sin(particle.latitude);
        const x = sinLatitude * Math.cos(longitude);
        const y = Math.cos(particle.latitude);
        const z = sinLatitude * Math.sin(longitude);
        return { ...particle, x, y, z };
      })
      .sort((a, b) => a.z - b.z)
      .forEach((particle) => {
        const perspective = 0.78 + (particle.z + 1) * 0.11;
        const x = center + particle.x * radius * perspective;
        const y = center + particle.y * radius * 0.88;
        const alpha = 0.34 + (particle.z + 1) * 0.2;
        context.fillStyle = `rgba(${particle.color.join(', ')}, ${alpha})`;
        context.beginPath();
        context.arc(x, y, particle.size * perspective, 0, Math.PI * 2);
        context.fill();
      });

    context.restore();
    context.strokeStyle = `rgba(${primary.join(', ')}, 0.64)`;
    context.lineWidth = 0.7;
    context.beginPath();
    context.arc(center, center, radius * 1.06, 0, Math.PI * 2);
    context.stroke();
  }

  function tick(time) {
    draw(time);
    frameId = requestAnimationFrame(tick);
  }

  resize();
  if (motionEnabled) frameId = requestAnimationFrame(tick);
  else draw(0);

  new ResizeObserver(() => {
    cancelAnimationFrame(frameId);
    resize();
    draw(performance.now());
    if (motionEnabled && !document.hidden) frameId = requestAnimationFrame(tick);
  }).observe(canvas.parentElement);
}

function initializePlasmaBackground(config) {
  const canvas = document.getElementById('plasma-background');
  const context = canvas?.getContext('2d');
  if (!context) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motionEnabled = config.motionEnabled !== false && !reducedMotion;
  // Keep the beam aligned with the dark aurora theme rather than the old light-theme colors
  const palette = [
    [126, 226, 192], // emerald
    [102, 213, 230], // ice cyan
    [83, 203, 166],  // mint
    [220, 233, 121]  // lemon highlight
  ];
  const primary = palette[0];
  const secondary = palette[1];
  const density = Math.max(70, Math.min(280, Number(config.particleDensity) || 180));
  const speed = Math.max(0.2, Math.min(1.2, Number(config.flowSpeed) || 0.55));
  let width = 0;
  let height = 0;
  let stars = [];
  let particles = [];
  let frameId = 0;
  let lastTime = performance.now();
  const pointer = { x: -9999, y: -9999, target: 0, current: 0 };

  window.addEventListener('pointermove', (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.target = 1;
  }, { passive: true });

  window.addEventListener('pointerleave', () => {
    pointer.target = 0;
  }, { passive: true });

  function resetParticle(particle, randomizeX = true) {
    particle.x = randomizeX ? Math.random() * width : -8;
    particle.y = Math.random() * height;
    particle.radius = 0.5 + Math.random() * 1.1;
    const colorRoll = Math.random();
    particle.color = colorRoll < 0.48 ? palette[0]
      : colorRoll < 0.8 ? palette[1]
        : colorRoll < 0.96 ? palette[2] : palette[3];
    particle.alpha = 0.18 + Math.random() * 0.24;
    particle.drift = Math.random() * Math.PI * 2;
  }

  function resize() {
    const scale = Math.min(devicePixelRatio || 1, 2);
    width = innerWidth;
    height = innerHeight;
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    context.setTransform(scale, 0, 0, scale, 0, 0);
    const starCount = Math.round((width * height) / 10500);
    stars = Array.from({ length: Math.max(55, Math.min(170, starCount)) }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 0.35 + Math.random() * 0.8,
      alpha: 0.11 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2
    }));
    const count = Math.round(density * (width < 700 ? 0.55 : 1));
    particles = Array.from({ length: count }, () => {
      const particle = {};
      resetParticle(particle);
      return particle;
    });
  }

  function fieldAngle(x, y, time) {
    const a = Math.sin(x * 0.0043 + time * 0.00009);
    const b = Math.cos(y * 0.0052 - time * 0.00007);
    const c = Math.sin((x + y) * 0.002 + time * 0.00005);
    return (a + b + c * 0.65) * 1.35;
  }

  function drawStars(time) {
    stars.forEach((star) => {
      const pulse = 0.72 + Math.sin(time * 0.00055 + star.phase) * 0.28;
      context.fillStyle = `rgba(${palette[1].join(', ')}, ${star.alpha * pulse * 0.72})`;
      context.beginPath();
      context.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      context.fill();
    });
  }

  function drawFieldLines(time) {
    context.save();
    for (let line = 0; line < 7; line += 1) {
      const color = line === 2 || line === 5 ? secondary : primary;
      const lineAlpha = line === 3 ? 0.42 : (line === 2 || line === 5 ? 0.3 : 0.23);
      context.strokeStyle = `rgba(${color.join(', ')}, ${lineAlpha})`;
      context.lineWidth = line === 3 ? 1.35 : 0.85;
      context.shadowBlur = line === 2 || line === 5 ? 8 : 4;
      context.shadowColor = `rgba(${color.join(', ')}, ${lineAlpha * 0.72})`;
      context.beginPath();
      for (let x = -16; x <= width + 16; x += 13) {
        const baseline = height * (0.08 + line * 0.145);
        const wave = Math.sin(x * 0.0055 + line * 0.92 + time * 0.00006) * (23 + line * 2);
        const drift = Math.cos(x * 0.0022 - time * 0.00004 + line) * 17;
        const y = baseline + wave + drift;
        if (x === -16) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
    }
    context.shadowBlur = 0;
    context.restore();
  }

  function drawParticles(time, delta, move) {
    pointer.current += (pointer.target - pointer.current) * 0.08;
    particles.forEach((particle) => {
      const angle = fieldAngle(particle.x, particle.y, time) + Math.sin(particle.drift + time * 0.0001) * 0.12;
      if (move) {
        const dx = particle.x - pointer.x;
        const dy = particle.y - pointer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (pointer.current > 0.01 && distance < 130 && distance > 0.01) {
          const falloff = (1 - distance / 130) ** 2 * pointer.current * 1.8;
          particle.x += (dx / distance) * falloff;
          particle.y += (dy / distance) * falloff;
        }
        particle.x += (Math.cos(angle) * 0.26 + 0.29) * speed * delta * 0.055;
        particle.y += Math.sin(angle) * 0.24 * speed * delta * 0.055;
        if (particle.x > width + 10 || particle.y < -10 || particle.y > height + 10) resetParticle(particle, false);
      }
      context.fillStyle = `rgba(${particle.color.join(', ')}, ${particle.alpha})`;
      context.strokeStyle = `rgba(${particle.color.join(', ')}, ${particle.alpha * 0.72})`;
      context.lineWidth = Math.max(0.55, particle.radius * 0.72);
      context.beginPath();
      context.moveTo(particle.x, particle.y);
      context.lineTo(particle.x - Math.cos(angle) * 5, particle.y - Math.sin(angle) * 5);
      context.stroke();
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();
    });
  }

  function draw(time, move = true) {
    const delta = Math.min(34, time - lastTime || 16);
    lastTime = time;
    context.clearRect(0, 0, width, height);
    drawStars(time);
    drawFieldLines(time);
    drawParticles(time, delta, move);
  }

  function tick(time) {
    draw(time, true);
    frameId = requestAnimationFrame(tick);
  }

  resize();
  if (motionEnabled) frameId = requestAnimationFrame(tick);
  else draw(0, false);

  window.addEventListener('resize', () => {
    cancelAnimationFrame(frameId);
    resize();
    draw(performance.now(), false);
    if (motionEnabled && !document.hidden) frameId = requestAnimationFrame(tick);
  }, { passive: true });

  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(frameId);
    if (!document.hidden && motionEnabled) {
      lastTime = performance.now();
      frameId = requestAnimationFrame(tick);
    }
  });
}

function initializeNavigation() {
  const links = [...document.querySelectorAll('.site-nav a[href^="#"]')];
  if (!links.length) return;
  const sections = links.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);
  if (!sections.length) return;

  const observer = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    links.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${visible.target.id}`);
    });
  }, { rootMargin: '-18% 0px -62% 0px', threshold: [0, 0.2, 0.6] });

  sections.forEach((section) => observer.observe(section));
  links[0].classList.add('is-active');
}

async function loadSite() {
  try {
    const response = await fetch(`${CONTENT_PATH}?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Content request failed: ${response.status}`);
    siteData = await response.json();
    renderSite(siteData);
    initializePlasmaBackground(siteData.visual || {});
    initializeProfileOrb(siteData.visual || {});
    initializeNavigation();
  } catch (error) {
    console.error(error);
    document.body.classList.add('content-error');
  }
}

document.querySelectorAll('[data-lang-option]').forEach((button) => {
  button.addEventListener('click', () => setLanguage(button.dataset.langOption));
});

loadSite();
