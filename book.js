const chapters = Array.from(document.querySelectorAll('[data-chapter]'));
const toc = document.querySelector('#book-toc');
const breadcrumb = document.querySelector('#book-location');
const pager = document.querySelector('#book-pagination');
const sidebar = document.querySelector('#book-sidebar');
const toggle = document.querySelector('#book-menu');
const filter = document.querySelector('#book-filter');
const noResults = document.querySelector('#book-no-results');
const count = document.querySelector('#book-count');
const narrow = window.matchMedia('(max-width: 760px)');
const groups = new Map();
const entries = [];
let active = -1;

count.textContent += ' · ' + chapters.length + '개 장';

function chapterLink(chapter, text) {
  const link = document.createElement('a');
  link.href = '#' + chapter.id;
  link.textContent = text;
  return link;
}

for (const [index, chapter] of chapters.entries()) {
  const { group, title, search = '' } = chapter.dataset;
  if (!groups.has(group)) {
    const section = document.createElement('div');
    section.className = 'toc-group';
    const heading = document.createElement('p');
    heading.textContent = group;
    const list = document.createElement('ol');
    section.append(heading, list);
    toc.append(section);
    groups.set(group, { section, list });
  }
  const row = document.createElement('li');
  const link = chapterLink(chapter, title);
  const number = document.createElement('span');
  number.className = 'toc-number';
  number.textContent = String(index).padStart(2, '0');
  number.setAttribute('aria-hidden', 'true');
  link.prepend(number);
  row.append(link);
  groups.get(group).list.append(row);
  entries.push({ row, link, search: (title + ' ' + search).toLowerCase() });
}

function showToc(open) {
  toggle.setAttribute('aria-expanded', String(open));
  sidebar.classList.toggle('is-open', open);
}

function showChapter() {
  const hash = location.hash.slice(1);
  if (hash === 'content' && active >= 0) return;
  const index = Math.max(0, chapters.findIndex(chapter => chapter.id === hash));
  if (index === active) return;
  const moveFocus = active >= 0;
  active = index;

  for (const [position, chapter] of chapters.entries()) {
    const current = position === index;
    chapter.hidden = !current;
    chapter.classList.toggle('chapter-visible', current);
    if (current) entries[position].link.setAttribute('aria-current', 'page');
    else entries[position].link.removeAttribute('aria-current');
  }

  const chapter = chapters[index];
  const { group, title } = chapter.dataset;
  breadcrumb.textContent = group + ' / ' + title;
  document.title = title + ' | finlang 기초 문법 가이드';
  const previous = chapters[index - 1];
  const next = chapters[index + 1];
  pager.replaceChildren();
  for (const [neighbor, direction] of [[previous, 'previous'], [next, 'next']]) {
    if (!neighbor) continue;
    const link = chapterLink(neighbor, neighbor.dataset.title);
    link.className = 'pager-' + direction;
    const label = document.createElement('span');
    label.textContent = direction === 'previous' ? '← 이전 장' : '다음 장 →';
    link.prepend(label);
    pager.append(link);
  }

  showToc(false);
  window.scrollTo(0, 0);
  if (moveFocus) {
    const heading = chapter.querySelector('h1, h2');
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
}

filter.addEventListener('input', () => {
  const query = filter.value.trim().toLowerCase();
  for (const entry of entries) entry.row.hidden = !entry.search.includes(query);
  for (const { section, list } of groups.values()) {
    section.hidden = !list.querySelector('li:not([hidden])');
  }
  noResults.hidden = entries.some(entry => !entry.row.hidden);
});
toggle.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'false';
  showToc(open);
  if (open) filter.focus();
});
sidebar.addEventListener('keydown', event => {
  if (event.key === 'Escape' && narrow.matches && sidebar.classList.contains('is-open')) {
    showToc(false);
    toggle.focus();
  }
});
toc.addEventListener('click', event => {
  if (narrow.matches && event.target.closest('a') === entries[active]?.link) {
    showToc(false);
    toggle.focus();
  }
});
window.addEventListener('hashchange', showChapter);
document.body.classList.add('book-ready');
showChapter();
