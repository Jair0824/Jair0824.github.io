const form = document.getElementById('content-form');
const saveButton = document.getElementById('save-button');
const publishButton = document.getElementById('publish-button');
const confirmPublish = document.getElementById('confirm-publish');
const publishDialog = document.getElementById('publish-dialog');
const saveState = document.getElementById('save-state');
const preview = document.getElementById('site-preview');
const toast = document.getElementById('toast');
let content = null;
let toastTimer = null;

function value(id, nextValue) {
  const input = document.getElementById(id);
  if (nextValue !== undefined) input.value = nextValue ?? '';
  return input.value;
}

function lines(raw) {
  return raw.split('\n').map((item) => item.trim()).filter(Boolean);
}

function notify(message, isError = false) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.toggle('is-error', isError);
  toast.classList.add('is-visible');
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 4200);
}

function setDirty(dirty) {
  saveState.textContent = dirty ? '有未保存更改' : '所有更改已保存';
  saveState.classList.toggle('is-dirty', dirty);
}

function fillRepeatItem(element, item) {
  element.querySelectorAll('[data-field]').forEach((input) => {
    const key = input.dataset.field;
    input.value = Array.isArray(item[key]) ? item[key].join(', ') : (item[key] ?? '');
  });
}

function addRepeatItem(kind, item) {
  const template = document.getElementById(`${kind}-template`);
  const container = document.getElementById(`${kind}-editor`);
  const element = template.content.firstElementChild.cloneNode(true);
  fillRepeatItem(element, item);
  element.querySelector('.remove-item').addEventListener('click', () => {
    element.remove();
    setDirty(true);
  });
  container.append(element);
}

function renderEditor(data) {
  value('profile-name', data.profile.name);
  value('profile-mark', data.profile.mark);
  value('profile-eyebrow', data.profile.eyebrow);
  value('profile-headline', data.profile.headline);
  value('profile-introduction', data.profile.introduction);
  value('meta-title', data.meta.siteTitle);
  value('meta-description', data.meta.description);
  value('meta-accent', data.meta.accent);
  document.getElementById('visual-motion').checked = data.visual?.motionEnabled !== false;
  value('visual-density', data.visual?.particleDensity ?? 180);
  value('visual-speed', data.visual?.flowSpeed ?? 0.85);
  value('visual-primary', data.visual?.primaryColor ?? '#e84c3d');
  value('visual-secondary', data.visual?.secondaryColor ?? '#46a99a');
  value('density-output', value('visual-density'));
  value('speed-output', Number(value('visual-speed')).toFixed(2));
  value('focus-list', data.focus.join('\n'));
  value('credential-list', data.credentials.join('\n'));
  value('contact-email', data.contact.email);
  value('contact-wechat', data.contact.wechat);
  value('contact-github', data.contact.github);
  value('footer-text', data.footer);

  document.getElementById('project-editor').replaceChildren();
  data.projects.forEach((project) => addRepeatItem('project', project));
  document.getElementById('service-editor').replaceChildren();
  data.services.forEach((service) => addRepeatItem('service', service));
  setDirty(false);
}

function collectRepeater(kind) {
  return [...document.querySelectorAll(`#${kind}-editor .${kind}-item`)].map((element) => {
    const item = {};
    element.querySelectorAll('[data-field]').forEach((input) => {
      item[input.dataset.field] = input.dataset.field === 'tags' ? input.value.split(',').map((tag) => tag.trim()).filter(Boolean) : input.value.trim();
    });
    return item;
  });
}

function collectContent() {
  return {
    meta: {
      siteTitle: value('meta-title').trim(),
      description: value('meta-description').trim(),
      accent: value('meta-accent')
    },
    visual: {
      motionEnabled: document.getElementById('visual-motion').checked,
      particleDensity: Number(value('visual-density')),
      flowSpeed: Number(value('visual-speed')),
      primaryColor: value('visual-primary'),
      secondaryColor: value('visual-secondary')
    },
    profile: {
      name: value('profile-name').trim(),
      mark: value('profile-mark').trim(),
      eyebrow: value('profile-eyebrow').trim(),
      headline: value('profile-headline').trim(),
      introduction: value('profile-introduction').trim()
    },
    focus: lines(value('focus-list')),
    credentials: lines(value('credential-list')),
    projects: collectRepeater('project'),
    services: collectRepeater('service'),
    contact: {
      email: value('contact-email').trim(),
      wechat: value('contact-wechat').trim(),
      github: value('contact-github').trim()
    },
    footer: value('footer-text').trim()
  };
}

async function request(url, options = {}) {
  const response = await fetch(url, options);
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `请求失败：${response.status}`);
  return result;
}

async function save({ reloadPreview = true } = {}) {
  if (!form.reportValidity()) throw new Error('请先补全必填内容');
  content = collectContent();
  saveButton.disabled = true;
  saveState.textContent = '正在保存...';
  try {
    await request('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(content)
    });
    setDirty(false);
    if (reloadPreview) preview.src = `/?preview=${Date.now()}`;
    notify('内容已保存，预览已更新');
  } finally {
    saveButton.disabled = false;
  }
}

async function publish() {
  confirmPublish.disabled = true;
  publishButton.disabled = true;
  try {
    await save({ reloadPreview: false });
    const message = value('commit-message').trim() || 'Update personal website';
    const result = await request('/api/publish', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    publishDialog.close();
    notify(result.message || '已经推送到 GitHub');
  } catch (error) {
    notify(error.message, true);
  } finally {
    confirmPublish.disabled = false;
    publishButton.disabled = false;
  }
}

async function initialize() {
  try {
    content = await request('/api/content');
    renderEditor(content);
  } catch (error) {
    saveState.textContent = '读取失败';
    notify(error.message, true);
  }
}

form.addEventListener('input', () => setDirty(true));
saveButton.addEventListener('click', () => save().catch((error) => notify(error.message, true)));
publishButton.addEventListener('click', () => publishDialog.showModal());
confirmPublish.addEventListener('click', publish);
document.getElementById('add-service').addEventListener('click', () => {
  addRepeatItem('service', { title: '', description: '' });
  setDirty(true);
});
document.getElementById('add-project').addEventListener('click', () => {
  addRepeatItem('project', { title: '', status: '', summary: '', url: 'https://', linkLabel: '访问项目', tags: [], visualLabel: '', visualMeta: '', visualTitle: '' });
  setDirty(true);
});
document.getElementById('visual-density').addEventListener('input', (event) => value('density-output', event.target.value));
document.getElementById('visual-speed').addEventListener('input', (event) => value('speed-output', Number(event.target.value).toFixed(2)));
document.querySelectorAll('[data-preview]').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('[data-preview]').forEach((item) => item.classList.toggle('is-active', item === button));
    const mobile = button.dataset.preview === 'mobile';
    document.getElementById('preview-stage').classList.toggle('is-mobile', mobile);
    document.getElementById('preview-label').textContent = mobile ? '手机预览' : '桌面预览';
  });
});

initialize();
