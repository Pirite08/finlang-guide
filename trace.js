(() => {
  const root = document.querySelector('#rule-trace');
  if (!root) return;

  // These values are selected from a fin v0.5.0 rule-only run, with a synthetic input.
  const stages = [
    {
      title: '입력',
      comment: '// 원금, 연이율, 기간을 입력으로 받습니다.',
      code: 'input principal in "KRW"\ninput annual_rate as decimal\ninput years as decimal',
      detail: '원금은 통화가 있는 Money입니다. 연이율 0.05는 5%, 기간 0.5는 반년을 뜻합니다.',
      values: [['principal', 'KRW 100'], ['annual_rate', '0.05'], ['years', '0.5']],
    },
    {
      title: '계산',
      comment: '// 원금에 연이율과 기간을 차례로 곱합니다.',
      code: 'let interest = principal * annual_rate * years',
      detail: '첫 곱셈에서 5원이 나옵니다. 여기에 0.5년을 곱해 정산 전 이자 2.5원을 얻습니다.',
      values: [['principal × annual_rate', 'KRW 5'], ['interest', 'KRW 2.5']],
    },
    {
      title: '정산',
      comment: '// 소수 자릿수 0에서 HALF_UP으로 반올림합니다.',
      code: 'let result = settle(interest, 0, "HALF_UP")',
      detail: '2.5원은 2원과 3원의 중간입니다. HALF_UP이 절댓값이 큰 쪽인 3원을 선택합니다.',
      values: [['interest', 'KRW 2.5'], ['result', 'KRW 3']],
    },
    {
      title: '반환',
      comment: '// 원 단위 정산이 끝난 결과를 반환합니다.',
      code: 'return result',
      detail: '이 실행의 JSON 결과에는 통화가 KRW, 금액이 문자열 "3"으로 기록됩니다.',
      values: [['result', 'KRW 3']],
    },
  ];

  root.innerHTML = `
    <p class="trace-note">합성 입력으로 실행한 fin v0.5.0 기록</p>
    <div class="trace-nav" role="group" aria-label="실행 단계 선택"></div>
    <div class="trace-panel" aria-live="polite" aria-atomic="true">
      <h3 class="trace-title"></h3>
      <pre class="trace-code" tabindex="0"><code><span class="trace-comment"></span>
<span class="trace-line"></span></code></pre>
      <p class="trace-detail"></p>
      <dl class="trace-values"></dl>
    </div>
    <div class="trace-controls" role="group" aria-label="실행 기록 이동">
      <button type="button" class="trace-prev">← 이전 단계</button>
      <button type="button" class="trace-next">다음 단계 →</button>
    </div>
  `;

  const nav = root.querySelector('.trace-nav');
  const panel = root.querySelector('.trace-panel');
  const title = root.querySelector('.trace-title');
  const comment = root.querySelector('.trace-comment');
  const code = root.querySelector('.trace-line');
  const detail = root.querySelector('.trace-detail');
  const values = root.querySelector('.trace-values');
  const prev = root.querySelector('.trace-prev');
  const next = root.querySelector('.trace-next');
  let active = -1;
  let transition;

  const buttons = stages.map(({ title: name }, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'trace-step';
    button.textContent = `${index + 1}. ${name}`;
    button.addEventListener('click', () => select(index));
    nav.append(button);
    return button;
  });

  function select(index) {
    if (index < 0 || index >= stages.length || index === active) return;

    const previous = active;
    active = index;
    const stage = stages[active];
    buttons.forEach((button, position) => {
      button.setAttribute('aria-pressed', String(position === active));
    });
    panel.dataset.stage = String(active + 1);
    title.textContent = `${active + 1} / ${stages.length} · ${stage.title}`;
    comment.textContent = stage.comment;
    code.textContent = stage.code;
    detail.textContent = stage.detail;
    values.replaceChildren(...stage.values.map(([name, value]) => {
      const row = document.createElement('div');
      const term = document.createElement('dt');
      const amount = document.createElement('dd');
      term.textContent = name;
      amount.textContent = value;
      row.append(term, amount);
      return row;
    }));
    prev.setAttribute('aria-disabled', String(active === 0));
    next.setAttribute('aria-disabled', String(active === stages.length - 1));

    transition?.cancel();
    if (previous !== -1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && panel.animate) {
      const offset = active > previous ? 5 : -5;
      transition = panel.animate(
        [{ opacity: 0.68, transform: `translateX(${offset}px)` }, { opacity: 1, transform: 'none' }],
        { duration: 200, easing: 'cubic-bezier(.2,.75,.25,1)' },
      );
    }
  }

  prev.addEventListener('click', () => select(active - 1));
  next.addEventListener('click', () => select(active + 1));
  select(0);
})();
