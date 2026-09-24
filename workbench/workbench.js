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

function educationLines(items) {
  return (Array.isArray(items) ? items : []).map((item) => {
    if (typeof item === 'string') return item;
    return [item.period, item.institution, item.degree, item.details].filter(Boolean).join('｜');
  });
}

function parseEducation(raw, fallback = []) {
  return lines(raw).map((entry, index) => {
    const parts = entry.split(/\s*[|｜]\s*/);
    const previous = fallback[index] || {};
    if (parts.length < 2) {
      return {
        period: previous.period || '',
        institution: previous.institution || entry,
        degree: previous.degree || '',
        details: previous.details || ''
      };
    }
    return {
      period: parts[0] || previous.period || '',
      institution: parts[1] || previous.institution || '',
      degree: parts[2] || previous.degree || '',
      details: parts.slice(3).join('｜') || previous.details || ''
    };
  });
}

const defaultNote = {
  text: '科研经历与成果将在适合公开时持续更新，这里先呈现研究方向、教育经历与工作方法',
  textEn: 'Research experience and results will be added when appropriate for public release, while this page focuses on my interests, education, and working methods'
};

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
  container.querySelector('.empty-repeater')?.remove();
  const element = template.content.firstElementChild.cloneNode(true);
  fillRepeatItem(element, item);
  element.querySelector('.remove-item').addEventListener('click', () => {
    element.remove();
    renderEmptyRepeater(kind);
    setDirty(true);
  });
  container.append(element);
}

function renderEmptyRepeater(kind) {
  const container = document.getElementById(`${kind}-editor`);
  if (container.querySelector(`.${kind}-item`)) return;
  const empty = document.createElement('p');
  empty.className = 'empty-repeater';
  empty.textContent = container.dataset.emptyLabel || '暂无内容，可直接保存';
  container.append(empty);
}

function renderEditor(data) {
  value('profile-name', data.profile.name);
  value('profile-mark', data.profile.mark);
  value('profile-eyebrow', data.profile.eyebrow);
  value('profile-eyebrow-en', data.profile.eyebrowEn);
  value('profile-headline', data.profile.headline);
  value('profile-headline-en', data.profile.headlineEn);
  value('profile-introduction', data.profile.introduction);
  value('profile-introduction-en', data.profile.introductionEn);
  value('meta-title', data.meta.siteTitle);
  value('meta-title-en', data.meta.siteTitleEn);
  value('meta-description', data.meta.description);
  value('meta-description-en', data.meta.descriptionEn);
  value('meta-accent', data.meta.accent);
  document.getElementById('visual-motion').checked = data.visual?.motionEnabled !== false;
  value('visual-density', data.visual?.particleDensity ?? 180);
  value('visual-speed', data.visual?.flowSpeed ?? 0.85);
  value('visual-primary', data.visual?.primaryColor ?? '#e84c3d');
  value('visual-secondary', data.visual?.secondaryColor ?? '#46a99a');
  value('density-output', value('visual-density'));
  value('speed-output', Number(value('visual-speed')).toFixed(2));
  value('focus-list', (data.focus || []).join('\n'));
  value('focus-list-en', (data.focusEn || []).join('\n'));
  value('focus-details', (data.focusDetails || []).join('\n'));
  value('focus-details-en', (data.focusDetailsEn || []).join('\n'));
  value('credential-list', educationLines(data.education?.length ? data.education : data.credentials).join('\n'));
  value('credential-list-en', educationLines(data.educationEn?.length ? data.educationEn : data.credentialsEn).join('\n'));
  const note = data.note && typeof data.note === 'object' ? data.note : defaultNote;
  value('note-copy', note.text);
  value('note-copy-en', note.textEn);
  value('contact-email', data.contact.email);
  value('contact-wechat', data.contact.wechat);
  value('contact-github', data.contact.github);
  value('footer-text', data.footer);
  value('footer-text-en', data.footerEn);

  document.getElementById('project-editor').replaceChildren();
  (data.projects || []).forEach((project) => addRepeatItem('project', project));
  renderEmptyRepeater('project');
  document.getElementById('service-editor').replaceChildren();
  (data.services || []).forEach((service) => addRepeatItem('service', service));
  renderEmptyRepeater('service');
  setDirty(false);
}

function collectRepeater(kind) {
  return [...document.querySelectorAll(`#${kind}-editor .${kind}-item`)].map((element) => {
    const item = {};
    element.querySelectorAll('[data-field]').forEach((input) => {
      item[input.dataset.field] = ['tags', 'tagsEn'].includes(input.dataset.field)
        ? input.value.split(',').map((tag) => tag.trim()).filter(Boolean)
        : input.value.trim();
    });
    return item;
  });
}

function collectContent() {
  return {
    ...content,
    meta: {
      ...content.meta,
      siteTitle: value('meta-title').trim(),
      siteTitleEn: value('meta-title-en').trim(),
      description: value('meta-description').trim(),
      descriptionEn: value('meta-description-en').trim(),
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
      ...content.profile,
      name: value('profile-name').trim(),
      mark: value('profile-mark').trim(),
      eyebrow: value('profile-eyebrow').trim(),
      eyebrowEn: value('profile-eyebrow-en').trim(),
      headline: value('profile-headline').trim(),
      headlineEn: value('profile-headline-en').trim(),
      introduction: value('profile-introduction').trim(),
      introductionEn: value('profile-introduction-en').trim()
    },
    focus: lines(value('focus-list')),
    focusEn: lines(value('focus-list-en')),
    focusDetails: lines(value('focus-details')),
    focusDetailsEn: lines(value('focus-details-en')),
    education: parseEducation(value('credential-list'), content.education),
    educationEn: parseEducation(value('credential-list-en'), content.educationEn),
    credentials: lines(value('credential-list')),
    credentialsEn: lines(value('credential-list-en')),
    note: {
      text: value('note-copy').trim(),
      textEn: value('note-copy-en').trim()
    },
    projects: collectRepeater('project'),
    services: collectRepeater('service'),
    contact: {
      ...content.contact,
      email: value('contact-email').trim(),
      wechat: value('contact-wechat').trim(),
      github: value('contact-github').trim()
    },
    footer: value('footer-text').trim(),
    footerEn: value('footer-text-en').trim()
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
  addRepeatItem('service', { title: '', titleEn: '', description: '', descriptionEn: '' });
  setDirty(true);
});
document.getElementById('add-project').addEventListener('click', () => {
  addRepeatItem('project', {
    title: '', titleEn: '', status: '', statusEn: '', summary: '', summaryEn: '',
    url: 'https://', linkLabel: '访问项目', linkLabelEn: 'Visit project', tags: [], tagsEn: [],
    visualLabel: '', visualLabelEn: '', visualMeta: '', visualMetaEn: '', visualTitle: '', visualTitleEn: ''
  });
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
