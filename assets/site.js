const CONTENT_PATH = 'content/site.json';

function text(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value || '';
}

function make(tag, className, value) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (value !== undefined) element.textContent = value;
  return element;
}

function renderList(targetId, values, itemFactory) {
  const target = document.getElementById(targetId);
  target.replaceChildren(...values.map(itemFactory));
}

function renderSite(data) {
  document.title = data.meta.siteTitle;
  document.querySelector('meta[name="description"]').setAttribute('content', data.meta.description);
  document.documentElement.style.setProperty('--accent', data.meta.accent || '#e84c3d');

  text('brand-mark', data.profile.mark);
  text('brand-name', data.profile.name);
  text('profile-name', data.profile.name);
  text('profile-eyebrow', data.profile.eyebrow);
  text('profile-headline', data.profile.headline);
  text('profile-introduction', data.profile.introduction);

  renderList('focus-list', data.focus, (item) => make('li', '', item));
  renderList('credential-list', data.credentials, (item, index) => {
    const wrapper = make('div', 'credential-item');
    wrapper.append(make('span', 'credential-index', String(index + 1).padStart(2, '0')));
    wrapper.append(make('span', 'credential-title', item));
    return wrapper;
  });

  renderList('project-list', data.projects, (project) => {
    const article = make('article', 'project');
    const visual = make('div', 'project-visual');
    visual.setAttribute('aria-label', `${project.title} 项目视觉`);
    const top = make('div', 'project-visual-row');
    top.append(make('span', '', project.visualLabel), make('span', '', project.visualMeta));
    const middle = make('div', 'project-visual-middle');
    middle.append(make('span', 'project-accent-line'), make('strong', '', project.visualTitle));
    const bottom = make('div', 'project-visual-row');
    bottom.append(make('span', '', new URL(project.url).hostname.toUpperCase()), make('span', '', 'LIVE'));
    visual.append(top, middle, bottom);

    const copy = make('div', 'project-copy');
    copy.append(make('p', 'project-status', project.status));
    copy.append(make('h3', '', project.title));
    copy.append(make('p', 'project-summary', project.summary));
    const tags = make('div', 'tag-list');
    project.tags.forEach((tag) => tags.append(make('span', '', tag)));
    const link = make('a', 'project-link', `${project.linkLabel} ↗`);
    link.href = project.url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    copy.append(tags, link);
    article.append(visual, copy);
    return article;
  });

  renderList('service-list', data.services, (service, index) => {
    const item = make('article', `service service-${(index % 3) + 1}`);
    item.append(make('h3', '', service.title), make('p', '', service.description));
    return item;
  });

  const email = document.getElementById('email-link');
  email.textContent = data.contact.email;
  email.href = `mailto:${data.contact.email}`;
  text('wechat-value', `微信 ${data.contact.wechat}`);
  const github = document.getElementById('github-link');
  github.href = data.contact.github;
  github.textContent = `GitHub / ${data.contact.github.split('/').filter(Boolean).pop()}`;
  text('footer-copyright', `© ${new Date().getFullYear()} ${data.profile.name}`);
  text('footer-text', data.footer);
  initializeFlowField(data.visual || {});
}

function colorToRgb(hex) {
  const normalized = String(hex || '').replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return [232, 76, 61];
  return [0, 2, 4].map((offset) => Number.parseInt(normalized.slice(offset, offset + 2), 16));
}

function initializeFlowField(config) {
  const canvas = document.getElementById('flow-field');
  const context = canvas?.getContext('2d');
  if (!context) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motionEnabled = config.motionEnabled !== false && !reducedMotion;
  const primary = colorToRgb(config.primaryColor || '#e84c3d');
  const secondary = colorToRgb(config.secondaryColor || '#46a99a');
  const speed = Math.max(0.25, Math.min(1.5, Number(config.flowSpeed) || 0.85));
  const requestedDensity = Math.max(60, Math.min(320, Number(config.particleDensity) || 180));
  let particles = [];
  let width = 0;
  let height = 0;
  let frameId = 0;
  let previousTime = performance.now();

  function resetParticle(particle, randomX = true) {
    particle.x = randomX ? Math.random() * width : 0;
    particle.y = Math.random() * height;
    particle.age = Math.random() * 240;
    particle.life = 160 + Math.random() * 220;
    particle.color = Math.random() > 0.42 ? primary : secondary;
  }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    const scale = Math.min(devicePixelRatio || 1, 2);
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    const mobileFactor = width < 720 ? 0.55 : 1;
    const count = Math.round(requestedDensity * mobileFactor);
    particles = Array.from({ length: count }, () => {
      const particle = {};
      resetParticle(particle);
      return particle;
    });
    context.fillStyle = '#0d1210';
    context.fillRect(0, 0, width, height);
  }

  function flowAngle(x, y, time) {
    const horizontal = Math.sin(x * 0.0065 + time * 0.00018);
    const vertical = Math.cos(y * 0.008 - time * 0.00014);
    const coupling = Math.sin((x + y) * 0.0032 + time * 0.00009);
    return (horizontal + vertical + coupling * 0.7) * Math.PI;
  }

  function paintParticle(particle, time, delta) {
    const angle = flowAngle(particle.x, particle.y, time);
    const step = speed * delta * 0.065;
    const previousX = particle.x;
    const previousY = particle.y;
    particle.x += Math.cos(angle) * step;
    particle.y += Math.sin(angle) * step;
    particle.age += delta * 0.06;

    if (particle.x < -8 || particle.x > width + 8 || particle.y < -8 || particle.y > height + 8 || particle.age > particle.life) {
      resetParticle(particle, false);
      return;
    }

    const [red, green, blue] = particle.color;
    context.strokeStyle = `rgba(${red}, ${green}, ${blue}, 0.34)`;
    context.lineWidth = 0.85;
    context.beginPath();
    context.moveTo(previousX, previousY);
    context.lineTo(particle.x, particle.y);
    context.stroke();
  }

  function drawStatic() {
    context.fillStyle = '#0d1210';
    context.fillRect(0, 0, width, height);
    particles.forEach((particle, index) => {
      const [red, green, blue] = particle.color;
      context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${index % 4 === 0 ? 0.42 : 0.18})`;
      context.fillRect(particle.x, particle.y, index % 5 === 0 ? 1.6 : 1, index % 5 === 0 ? 1.6 : 1);
    });
  }

  function tick(time) {
    const delta = Math.min(34, time - previousTime || 16);
    previousTime = time;
    context.fillStyle = 'rgba(13, 18, 16, 0.075)';
    context.fillRect(0, 0, width, height);
    context.globalCompositeOperation = 'lighter';
    particles.forEach((particle) => paintParticle(particle, time, delta));
    context.globalCompositeOperation = 'source-over';
    frameId = requestAnimationFrame(tick);
  }

  resize();
  if (motionEnabled) frameId = requestAnimationFrame(tick);
  else drawStatic();

  const observer = new ResizeObserver(() => {
    cancelAnimationFrame(frameId);
    resize();
    if (motionEnabled && !document.hidden) frameId = requestAnimationFrame(tick);
    else drawStatic();
  });
  observer.observe(canvas);

  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(frameId);
    if (!document.hidden && motionEnabled) {
      previousTime = performance.now();
      frameId = requestAnimationFrame(tick);
    }
  });
}

async function loadSite() {
  try {
    const response = await fetch(`${CONTENT_PATH}?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`内容加载失败：${response.status}`);
    renderSite(await response.json());
  } catch (error) {
    console.error(error);
    document.body.classList.add('content-error');
  }
}

loadSite();
