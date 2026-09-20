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
