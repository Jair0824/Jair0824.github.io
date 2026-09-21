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
  if (!target) return;
  target.replaceChildren(...values.map(itemFactory));
}

function renderSite(data) {
  document.title = data.meta.siteTitle;
  document.querySelector('meta[name="description"]').setAttribute('content', data.meta.description);
  document.documentElement.style.setProperty('--accent', data.meta.accent || '#a84336');

  text('brand-name', data.profile.name);
  text('profile-name', data.profile.name);
  text('profile-headline', data.profile.headline);
  text('profile-introduction', data.profile.introduction);

  renderList('focus-list', data.focus, (item) => make('li', '', item));
  renderList('credential-list', data.credentials, (item, index) => {
    const wrapper = make('div', 'credential-item');
    wrapper.append(make('span', 'credential-index', String(index + 1).padStart(2, '0')));
    wrapper.append(make('span', 'credential-title', item));
    return wrapper;
  });

  renderList('project-list', data.projects, (project, index) => {
    const article = make('article', 'project');
    const visual = make('div', 'project-visual');
    visual.setAttribute('aria-label', `${project.title} 项目视觉`);

    const top = make('div', 'project-visual-row');
    top.append(make('span', '', project.visualLabel), make('span', '', project.visualMeta));
    const middle = make('div', 'project-visual-middle');
    middle.append(make('span', 'project-accent-line'), make('strong', '', project.visualTitle));
    const bottom = make('div', 'project-visual-row');
    bottom.append(
      make('span', '', new URL(project.url).hostname.toUpperCase()),
      make('span', '', `ARCHIVE ${String(index + 1).padStart(2, '0')}`)
    );
    visual.append(top, middle, bottom);

    const copy = make('div', 'project-copy');
    copy.style.setProperty('--case-index', `'${String(index + 1).padStart(2, '0')}'`);
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
    const item = make('article', 'service');
    item.append(
      make('span', 'service-index', String(index + 1).padStart(2, '0')),
      make('h3', '', service.title),
      make('p', '', service.description),
      make('span', 'service-arrow', '→')
    );
    return item;
  });

  const email = document.getElementById('email-link');
  email.href = `mailto:${data.contact.email}`;
  email.querySelector('strong').textContent = data.contact.email;
  text('wechat-value', data.contact.wechat);

  const github = document.getElementById('github-link');
  const githubName = data.contact.github.split('/').filter(Boolean).pop();
  github.href = data.contact.github;
  github.querySelector('strong').textContent = `GitHub / ${githubName}`;

  text('footer-copyright', `© ${new Date().getFullYear()} ${data.profile.name}`);
  text('footer-text', data.footer);
  initializeFlowField(data.visual || {});
}

function colorToRgb(hex, fallback) {
  const normalized = String(hex || '').replace('#', '');
  if (!/^[0-9a-f]{6}$/i.test(normalized)) return fallback;
  return [0, 2, 4].map((offset) => Number.parseInt(normalized.slice(offset, offset + 2), 16));
}

function initializeFlowField(config) {
  const canvas = document.getElementById('flow-field');
  const context = canvas?.getContext('2d');
  if (!context) return;

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const motionEnabled = config.motionEnabled !== false && !reducedMotion;
  const primary = colorToRgb(config.primaryColor, [185, 75, 62]);
  const secondary = colorToRgb(config.secondaryColor, [63, 136, 125]);
  const speed = Math.max(0.25, Math.min(1.5, Number(config.flowSpeed) || 0.8));
  const requestedDensity = Math.max(70, Math.min(280, Number(config.particleDensity) || 170));
  const background = [21, 61, 56];
  let particles = [];
  let width = 0;
  let height = 0;
  let frameId = 0;
  let previousTime = performance.now();

  function resetParticle(particle, randomX = true) {
    particle.x = randomX ? Math.random() * width : 28 + Math.random() * 14;
    particle.y = 32 + Math.random() * Math.max(1, height - 78);
    particle.age = Math.random() * 220;
    particle.life = 170 + Math.random() * 210;
    particle.color = Math.random() > 0.38 ? primary : secondary;
  }

  function drawGrid(alpha = 0.16) {
    context.save();
    context.strokeStyle = `rgba(232, 227, 216, ${alpha})`;
    context.lineWidth = 0.55;
    for (let column = 1; column < 6; column += 1) {
      const x = (width / 6) * column;
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, height);
      context.stroke();
    }
    for (let row = 1; row < 5; row += 1) {
      const y = (height / 5) * row;
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }
    context.restore();
  }

  function drawReferenceCurves(time, alpha = 0.2) {
    context.save();
    context.lineWidth = 0.75;
    [0.27, 0.5, 0.73].forEach((level, curveIndex) => {
      context.strokeStyle = curveIndex === 1
        ? `rgba(${primary.join(', ')}, ${alpha + 0.12})`
        : `rgba(232, 227, 216, ${alpha})`;
      context.beginPath();
      for (let x = 0; x <= width; x += 4) {
        const wave = Math.sin(x * 0.018 + time * 0.0002 + curveIndex) * 13;
        const coupling = Math.cos(x * 0.006 - time * 0.00012) * 7;
        const y = height * level + wave + coupling;
        if (x === 0) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();
    });
    context.restore();
  }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    const scale = Math.min(devicePixelRatio || 1, 2);
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    context.setTransform(scale, 0, 0, scale, 0, 0);
    const mobileFactor = width < 440 ? 0.65 : 1;
    const count = Math.round(requestedDensity * mobileFactor);
    particles = Array.from({ length: count }, () => {
      const particle = {};
      resetParticle(particle);
      return particle;
    });
    context.fillStyle = `rgb(${background.join(', ')})`;
    context.fillRect(0, 0, width, height);
    drawGrid();
    drawReferenceCurves(performance.now(), 0.28);
  }

  function flowAngle(x, y, time) {
    const horizontal = Math.sin(x * 0.009 + time * 0.0002);
    const vertical = Math.cos(y * 0.012 - time * 0.00016);
    const coupling = Math.sin((x + y) * 0.004 + time * 0.00011);
    return (horizontal + vertical + coupling * 0.58) * 2.65;
  }

  function paintParticle(particle, time, delta) {
    const angle = flowAngle(particle.x, particle.y, time);
    const step = speed * delta * 0.052;
    const previousX = particle.x;
    const previousY = particle.y;
    particle.x += Math.cos(angle) * step + 0.12;
    particle.y += Math.sin(angle) * step;
    particle.age += delta * 0.06;

    if (
      particle.x < -8 || particle.x > width + 8 ||
      particle.y < 20 || particle.y > height - 25 ||
      particle.age > particle.life
    ) {
      resetParticle(particle, false);
      return;
    }

    const [red, green, blue] = particle.color;
    context.strokeStyle = `rgba(${red}, ${green}, ${blue}, 0.48)`;
    context.lineWidth = 0.75;
    context.beginPath();
    context.moveTo(previousX, previousY);
    context.lineTo(particle.x, particle.y);
    context.stroke();
  }

  function drawStatic() {
    context.fillStyle = `rgb(${background.join(', ')})`;
    context.fillRect(0, 0, width, height);
    drawGrid(0.22);
    drawReferenceCurves(0, 0.34);
    particles.forEach((particle, index) => {
      const [red, green, blue] = particle.color;
      context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${index % 4 === 0 ? 0.75 : 0.4})`;
      const size = index % 6 === 0 ? 1.8 : 1;
      context.fillRect(particle.x, particle.y, size, size);
    });
  }

  function tick(time) {
    const delta = Math.min(34, time - previousTime || 16);
    previousTime = time;
    context.fillStyle = `rgba(${background.join(', ')}, 0.085)`;
    context.fillRect(0, 0, width, height);
    drawGrid(0.055);
    drawReferenceCurves(time, 0.1);
    context.save();
    context.globalCompositeOperation = 'screen';
    particles.forEach((particle) => paintParticle(particle, time, delta));
    context.restore();
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
