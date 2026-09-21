const CONTENT_PATH = 'content/site.json';
const LANGUAGE_KEY = 'garrylee-language';

const interfaceCopy = {
  zh: {
    skip: '跳到正文',
    brandTag: 'Research & Practice',
    navLabel: '主要导航',
    languageLabel: '语言切换',
    navAbout: '关于',
    navResearch: '研究兴趣',
    navEducation: '学术概览',
    navWorkstation: '个人工作站',
    profileLabel: '个人信息',
    graduateRole: '研究生',
    ustc: '中国科学技术大学',
    fieldLabel: '方向',
    locationLabel: '地点',
    location: '中国 · 合肥',
    emailLabel: '邮箱',
    wechatLabel: '微信',
    academicEyebrow: 'ACADEMIC PROFILE · 学术主页',
    viewResearch: '查看研究方向',
    enterWorkstation: '进入个人工作站',
    currentFocus: '当前关注',
    identityTitle: '身份',
    identityCopy: '研究生 · 独立开发者\n科研与实际应用的交叉实践',
    researchKicker: 'RESEARCH INTERESTS',
    researchTitle: '研究兴趣',
    researchIntro: '从物理机制出发，关注理论、计算与数据表达之间的联系。',
    overviewKicker: 'ACADEMIC OVERVIEW',
    overviewTitle: '学术概览',
    overviewIntro: '目前公开展示基本研究身份，后续将逐步补充成熟的项目与成果。',
    noteTitle: '关于公开内容',
    noteCopy: '科研经历与成果将在适合公开时持续更新。现阶段，这里主要用于呈现我的研究方向、工作方法与联系方式。',
    beyondResearch: 'BEYOND RESEARCH · 研究之外',
    workstationEntryTitle: '个人工作站',
    workstationEntryCopy: '我也承接数据分析、网站制作与物理辅导等独立工作。相关能力、案例和合作方式集中放在工作站页面。',
    openWorkstation: '打开工作站',
    contactMe: '联系我',
    academicHome: '学术主页',
    servicesNav: '服务',
    projectsNav: '案例',
    contactNav: '联系',
    workEyebrow: 'GARRYLEE WORKSTATION · 个人工作站',
    workHeadline: '把问题讲清楚，\n把结果做出来。',
    workIntroduction: '这是我的独立工作入口。我利用科研训练、代码能力与 AI Agent 协作，为个人和小型团队完成数据分析、网站制作与物理辅导。',
    viewServices: '查看可做的工作',
    discussProject: '沟通一个项目',
    availableStatus: '可接受线上与线下合作',
    responseLabel: '沟通语言',
    responseValue: '中文优先 / English available',
    deliveryLabel: '工作方式',
    deliveryValue: '阶段确认 · 可预览 · 可复核',
    toolsLabel: '开发协作',
    toolsValue: 'Codex 与多 Agent 工作流',
    servicesKicker: 'WHAT I CAN DO',
    servicesTitle: '可承接的工作',
    servicesIntro: '适合需求边界清楚、重视沟通与交付质量的中小型任务。',
    projectsKicker: 'SELECTED PROJECT',
    projectsTitle: '已完成案例',
    projectsIntro: '真实上线的项目比功能清单更能说明工作方式。',
    processKicker: 'WORKING PROCESS',
    processTitle: '简单、透明的合作过程',
    processOneTitle: '明确需求',
    processOneCopy: '先确认目标、交付物、周期与判断完成的标准。',
    processTwoTitle: '阶段预览',
    processTwoCopy: '关键节点提供可查看的中间结果，及时校准方向。',
    processThreeTitle: '完整交付',
    processThreeCopy: '交付成品、必要说明与可继续维护的文件。',
    contactKicker: 'START A CONVERSATION',
    contactTitle: '先把你的问题发给我。',
    contactCopy: '请简单说明目标、现有材料和期望时间。我会先判断是否适合承接，再给出清晰的下一步。',
    backAcademic: '返回学术主页'
  },
  en: {
    skip: 'Skip to content',
    brandTag: 'Research & Practice',
    navLabel: 'Primary navigation',
    languageLabel: 'Language switcher',
    navAbout: 'About',
    navResearch: 'Research',
    navEducation: 'Overview',
    navWorkstation: 'Workstation',
    profileLabel: 'Profile information',
    graduateRole: 'Graduate Student',
    ustc: 'University of Science and Technology of China',
    fieldLabel: 'Field',
    locationLabel: 'Based in',
    location: 'Hefei, China',
    emailLabel: 'Email',
    wechatLabel: 'WeChat',
    academicEyebrow: 'ACADEMIC PROFILE',
    viewResearch: 'View research interests',
    enterWorkstation: 'Enter personal workstation',
    currentFocus: 'Current interests',
    identityTitle: 'Roles',
    identityCopy: 'Graduate student · Independent developer\nResearch and practical applications',
    researchKicker: 'RESEARCH INTERESTS',
    researchTitle: 'Research Interests',
    researchIntro: 'Starting from physical mechanisms, I am interested in the links between theory, computation, and data representation.',
    overviewKicker: 'ACADEMIC OVERVIEW',
    overviewTitle: 'Academic Overview',
    overviewIntro: 'This page currently presents my academic profile. Mature projects and results will be added over time.',
    noteTitle: 'About public materials',
    noteCopy: 'Research experience and results will be added when appropriate for public release. For now, this page focuses on my interests, working methods, and contact information.',
    beyondResearch: 'BEYOND RESEARCH',
    workstationEntryTitle: 'Personal Workstation',
    workstationEntryCopy: 'I also take on independent work in data analysis, website development, and physics tutoring. Capabilities, cases, and collaboration details are collected on a separate workstation page.',
    openWorkstation: 'Open workstation',
    contactMe: 'Contact',
    academicHome: 'Academic Home',
    servicesNav: 'Services',
    projectsNav: 'Case Study',
    contactNav: 'Contact',
    workEyebrow: 'GARRYLEE WORKSTATION',
    workHeadline: 'Clarify the problem.\nDeliver the result.',
    workIntroduction: 'This is my independent work portal. Combining research training, coding, and AI agent workflows, I help individuals and small teams with data analysis, website development, and physics tutoring.',
    viewServices: 'View services',
    discussProject: 'Discuss a project',
    availableStatus: 'Available for online and local work',
    responseLabel: 'Language',
    responseValue: 'Chinese preferred / English available',
    deliveryLabel: 'Delivery',
    deliveryValue: 'Milestones · Previews · Verifiable results',
    toolsLabel: 'Workflow',
    toolsValue: 'Codex and multi-agent collaboration',
    servicesKicker: 'WHAT I CAN DO',
    servicesTitle: 'Services',
    servicesIntro: 'Best suited to small and medium assignments with clear scope, communication, and delivery standards.',
    projectsKicker: 'SELECTED PROJECT',
    projectsTitle: 'Completed Work',
    projectsIntro: 'A real, deployed project explains my working style better than a feature list.',
    processKicker: 'WORKING PROCESS',
    processTitle: 'A simple, transparent process',
    processOneTitle: 'Define',
    processOneCopy: 'We first agree on the goal, deliverables, timeline, and acceptance criteria.',
    processTwoTitle: 'Preview',
    processTwoCopy: 'Reviewable intermediate results are shared at key milestones to keep the direction aligned.',
    processThreeTitle: 'Deliver',
    processThreeCopy: 'You receive the finished work, essential documentation, and maintainable source files.',
    contactKicker: 'START A CONVERSATION',
    contactTitle: 'Send me the problem first.',
    contactCopy: 'Briefly describe your goal, available materials, and expected timeline. I will first assess the fit and then suggest a clear next step.',
    backAcademic: 'Back to academic home'
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
    article.append(make('span', '', String(index + 1).padStart(2, '0')));
    article.append(make('h3', '', item));
    article.append(make('p', '', focusDetails[index] || ''));
    return article;
  }));

  const credentials = localizedArray(data, 'credentials');
  const credentialsList = document.getElementById('credential-list');
  credentialsList.replaceChildren(...credentials.map((item, index) => {
    const row = make('div', 'timeline-item');
    row.append(make('span', '', String(index + 1).padStart(2, '0')), make('p', '', item));
    return row;
  }));
}

function renderWorkstation(data) {
  const serviceList = document.getElementById('service-list');
  serviceList.replaceChildren(...data.services.map((service, index) => {
    const article = make('article', 'service-card');
    article.append(make('span', 'service-number', String(index + 1).padStart(2, '0')));
    article.append(make('h3', '', localized(service, 'title')));
    article.append(make('p', '', localized(service, 'description')));
    return article;
  }));

  const projectList = document.getElementById('project-list');
  projectList.replaceChildren(...data.projects.map((project, index) => {
    const article = make('article', 'project-item');
    const preview = make('div', 'project-preview');
    preview.setAttribute('aria-label', localized(project, 'title'));
    const top = make('div', 'project-preview-top');
    top.append(make('span', '', localized(project, 'visualLabel')), make('span', '', localized(project, 'visualMeta')));
    const center = make('div', 'project-preview-center');
    center.append(make('strong', '', localized(project, 'visualTitle')));
    const bottom = make('div', 'project-preview-bottom');
    bottom.append(make('span', '', new URL(project.url).hostname.toUpperCase()), make('span', '', `CASE ${String(index + 1).padStart(2, '0')}`));
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

  setText('wechat-value', data.contact.wechat);
  setText('footer-copyright', `© ${new Date().getFullYear()} ${data.profile.name}`);
  setText('footer-text', localized(data, 'footer'));
}

function renderSite(data) {
  applyInterfaceLanguage();
  const title = currentLanguage === 'en' ? data.meta.siteTitleEn : data.meta.siteTitle;
  const description = currentLanguage === 'en' ? data.meta.descriptionEn : data.meta.description;
  document.title = document.body.dataset.page === 'workstation'
    ? (currentLanguage === 'en' ? 'GarryLee Workstation | Services & Projects' : 'GarryLee 工作站 | 服务与项目')
    : title;
  document.querySelector('meta[name="description"]').setAttribute('content', description);
  document.documentElement.style.setProperty('--accent', data.meta.accent || '#de6f5c');

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

function initializePlasmaBackground(config) {
  const canvas = document.getElementById('plasma-background');
  const context = canvas?.getContext('2d');
  if (!context) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motionEnabled = config.motionEnabled !== false && !reducedMotion;
  const primary = colorToRgb(config.primaryColor, [101, 182, 176]);
  const secondary = colorToRgb(config.secondaryColor, [239, 159, 135]);
  const density = Math.max(40, Math.min(220, Number(config.particleDensity) || 120));
  const speed = Math.max(0.2, Math.min(1.2, Number(config.flowSpeed) || 0.55));
  let width = 0;
  let height = 0;
  let particles = [];
  let frameId = 0;
  let lastTime = performance.now();

  function resetParticle(particle, randomizeX = true) {
    particle.x = randomizeX ? Math.random() * width : -8;
    particle.y = Math.random() * height;
    particle.radius = 0.45 + Math.random() * 1.15;
    particle.color = Math.random() > 0.35 ? primary : secondary;
    particle.alpha = 0.14 + Math.random() * 0.22;
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
    const count = Math.round(density * (width < 700 ? 0.55 : 1));
    particles = Array.from({ length: count }, () => {
      const particle = {};
      resetParticle(particle);
      return particle;
    });
  }

  function fieldAngle(x, y, time) {
    const a = Math.sin(x * 0.004 + time * 0.00011);
    const b = Math.cos(y * 0.006 - time * 0.00008);
    const c = Math.sin((x + y) * 0.0022 + time * 0.00006);
    return (a + b + c * 0.7) * 1.5;
  }

  function drawFieldLines(time) {
    context.save();
    for (let line = 0; line < 5; line += 1) {
      const color = line % 2 === 0 ? primary : secondary;
      context.strokeStyle = `rgba(${color.join(', ')}, ${line === 2 ? 0.13 : 0.075})`;
      context.lineWidth = line === 2 ? 1.2 : 0.8;
      context.beginPath();
      for (let x = -10; x <= width + 10; x += 12) {
        const baseline = height * (0.13 + line * 0.19);
        const wave = Math.sin(x * 0.006 + line * 1.2 + time * 0.00008) * 34;
        const drift = Math.cos(x * 0.0025 - time * 0.00005) * 20;
        const y = baseline + wave + drift;
        if (x === -10) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
    }
    context.restore();
  }

  function drawParticles(time, delta, move) {
    particles.forEach((particle) => {
      if (move) {
        const angle = fieldAngle(particle.x, particle.y, time);
        particle.x += (Math.cos(angle) * 0.36 + 0.35) * speed * delta * 0.06;
        particle.y += Math.sin(angle) * 0.3 * speed * delta * 0.06;
        if (particle.x > width + 10 || particle.y < -10 || particle.y > height + 10) resetParticle(particle, false);
      }
      context.fillStyle = `rgba(${particle.color.join(', ')}, ${particle.alpha})`;
      context.beginPath();
      context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      context.fill();
    });
  }

  function draw(time, move = true) {
    const delta = Math.min(34, time - lastTime || 16);
    lastTime = time;
    context.clearRect(0, 0, width, height);
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

  const resizeObserver = new ResizeObserver(() => {
    cancelAnimationFrame(frameId);
    resize();
    if (motionEnabled && !document.hidden) frameId = requestAnimationFrame(tick);
    else draw(0, false);
  });
  resizeObserver.observe(document.documentElement);

  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(frameId);
    if (!document.hidden && motionEnabled) {
      lastTime = performance.now();
      frameId = requestAnimationFrame(tick);
    }
  });
}

async function loadSite() {
  try {
    const response = await fetch(`${CONTENT_PATH}?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Content request failed: ${response.status}`);
    siteData = await response.json();
    renderSite(siteData);
    initializePlasmaBackground(siteData.visual || {});
  } catch (error) {
    console.error(error);
    document.body.classList.add('content-error');
  }
}

document.querySelectorAll('[data-lang-option]').forEach((button) => {
  button.addEventListener('click', () => setLanguage(button.dataset.langOption));
});

loadSite();
