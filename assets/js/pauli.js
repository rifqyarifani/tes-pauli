
(function(){
  const startScreen = document.querySelector('[data-start-screen]');
  const exercise = document.querySelector('[data-exercise]');
  const resultScreen = document.querySelector('[data-result-screen]');
  const grid = document.querySelector('[data-pauli-grid]');
  const modeLabel = document.querySelector('[data-mode-label]');
  const timerEl = document.querySelector('[data-timer]');
  const progressText = document.querySelector('[data-progress-text]');
  const progressBar = document.querySelector('[data-progress-bar]');
  const rowCountEl = document.querySelector('[data-row-count]');
  const pauseBtn = document.querySelector('[data-pause]');
  const finishBtn = document.querySelector('[data-finish]');
  const resetBtn = document.querySelector('[data-reset]');
  const helpBtn = document.querySelector('[data-help]');
  if(!grid) return;

  const modes = {
    bebas: {label:'Latihan Bebas', minutes:0, columns:5, rows:16, description:'Tanpa batas waktu. Cocok untuk memahami pola.'},
    cepat: {label:'Latihan Cepat 10 Menit', minutes:10, columns:6, rows:20, description:'Pemanasan cepat sebelum latihan penuh.'},
    simulasi: {label:'Simulasi Tes 60 Menit', minutes:60, columns:8, rows:30, description:'Mode paling mirip tes asli dengan tekanan waktu.'}
  };

  let state = null;
  let tick = null;

  function qs(name){
    return new URLSearchParams(window.location.search).get(name);
  }

  function randomDigit(){
    return Math.floor(Math.random()*10);
  }

  function generate(mode){
    const config = modes[mode] || modes.cepat;
    const cols = [];
    for(let c=0;c<config.columns;c++){
      const digits = Array.from({length: config.rows + 1}, randomDigit);
      cols.push(digits);
    }
    return {config, cols};
  }

  function pad(n){ return String(n).padStart(2,'0'); }

  function formatTime(seconds){
    if(seconds < 0) seconds = 0;
    const m = Math.floor(seconds/60);
    const s = seconds % 60;
    return pad(m)+':'+pad(s);
  }

  function expectedFor(col, row){
    const sum = state.cols[col][row] + state.cols[col][row+1];
    return String(sum % 10);
  }

  function totalInputs(){
    return state.config.columns * state.config.rows;
  }

  function start(mode){
    const data = generate(mode);
    state = {
      mode,
      config:data.config,
      cols:data.cols,
      startedAt:null,
      elapsed:0,
      paused:false,
      finished:false,
      answers:{}
    };
    startScreen.style.display = 'none';
    resultScreen.classList.remove('active');
    exercise.classList.add('active');
    modeLabel.textContent = state.config.label;
    buildGrid();
    updateStats();
    if(tick) clearInterval(tick);
    tick = setInterval(onTick, 1000);
    const first = grid.querySelector('input');
    if(first) first.focus();
  }

  function buildGrid(){
    grid.innerHTML = '';
    state.cols.forEach((digits, colIndex) => {
      const col = document.createElement('div');
      col.className = 'pauli-column';
      col.setAttribute('aria-label', 'Kolom '+(colIndex+1));
      digits.forEach((digit, rowIndex) => {
        const num = document.createElement('div');
        num.className = 'pauli-number';
        num.textContent = digit;
        col.appendChild(num);
        if(rowIndex < state.config.rows){
          const input = document.createElement('input');
          input.className = 'pauli-input';
          input.type = 'tel';
          input.inputMode = 'numeric';
          input.pattern = '[0-9]*';
          input.maxLength = 1;
          input.autocomplete = 'off';
          input.setAttribute('aria-label', 'Jawaban kolom '+(colIndex+1)+' baris '+(rowIndex+1));
          input.dataset.col = colIndex;
          input.dataset.row = rowIndex;
          input.addEventListener('input', onInput);
          input.addEventListener('keydown', onKeyDown);
          col.appendChild(input);
        }
      });
      grid.appendChild(col);
    });
  }

  function onInput(e){
    const input = e.target;
    input.value = input.value.replace(/\D/g,'').slice(0,1);
    if(!state.startedAt && input.value){
      state.startedAt = Date.now();
    }
    state.answers[input.dataset.col+'-'+input.dataset.row] = input.value;
    updateStats();
    if(input.value){
      const inputs = Array.from(grid.querySelectorAll('input'));
      const idx = inputs.indexOf(input);
      if(inputs[idx+1]) inputs[idx+1].focus();
    }
  }

  function onKeyDown(e){
    if(e.key === 'Enter'){
      e.preventDefault();
      const inputs = Array.from(grid.querySelectorAll('input'));
      const idx = inputs.indexOf(e.target);
      if(inputs[idx+1]) inputs[idx+1].focus();
    }
    if(e.key === 'Escape'){
      togglePause();
    }
  }

  function onTick(){
    if(!state || state.finished || state.paused) return;
    if(state.startedAt) state.elapsed += 1;
    if(state.config.minutes > 0){
      const remaining = state.config.minutes * 60 - state.elapsed;
      if(remaining <= 0) finish();
    }
    updateStats();
  }

  function answeredCount(){
    return Object.values(state.answers).filter(Boolean).length;
  }

  function updateStats(){
    if(!state) return;
    const total = totalInputs();
    const answered = answeredCount();
    const progress = total ? Math.round((answered/total)*100) : 0;
    progressText.textContent = progress + '%';
    progressBar.style.width = progress + '%';
    rowCountEl.textContent = answered + ' / ' + total;

    if(state.config.minutes > 0){
      const remaining = state.config.minutes * 60 - state.elapsed;
      timerEl.textContent = formatTime(remaining);
      timerEl.style.color = remaining < 60 ? '#FCA5A5' : remaining < 180 ? '#FCD34D' : '#fff';
    } else {
      timerEl.textContent = formatTime(state.elapsed);
      timerEl.style.color = '#fff';
    }
  }

  function togglePause(){
    if(!state || state.finished) return;
    state.paused = !state.paused;
    pauseBtn.textContent = state.paused ? '▶ Lanjut' : '⏸ Jeda';
    grid.querySelectorAll('input').forEach(input => input.disabled = state.paused);
  }

  function finish(){
    if(!state || state.finished) return;
    state.finished = true;
    if(tick) clearInterval(tick);
    const inputs = Array.from(grid.querySelectorAll('input'));
    let correct = 0, wrong = 0, blank = 0;
    inputs.forEach(input => {
      const c = Number(input.dataset.col), r = Number(input.dataset.row);
      const val = input.value;
      const exp = expectedFor(c,r);
      if(!val){ blank++; return; }
      if(val === exp){ correct++; input.classList.add('correct'); }
      else { wrong++; input.classList.add('wrong'); }
      input.disabled = true;
    });
    const total = totalInputs();
    const answered = correct + wrong;
    const accuracy = answered ? Math.round((correct/answered)*1000)/10 : 0;
    const speed = state.elapsed ? Math.round((answered/state.elapsed)*60*10)/10 : answered;
    const score = Math.max(0, Math.round((accuracy * .65) + ((answered/total)*100 * .35)));
    const result = {
      date: new Date().toISOString(),
      mode: state.mode,
      label: state.config.label,
      total, answered, correct, wrong, blank, accuracy, speed, score, elapsed:state.elapsed
    };
    saveResult(result);
    showResult(result);
  }

  function saveResult(result){
    const key = 'tespauli-history';
    const history = JSON.parse(localStorage.getItem(key) || '[]');
    history.push(result);
    localStorage.setItem(key, JSON.stringify(history.slice(-12)));
  }

  function showResult(result){
    exercise.classList.remove('active');
    resultScreen.classList.add('active');
    document.querySelector('[data-result-score]').textContent = result.score;
    document.querySelector('[data-result-circle]').style.setProperty('--score-deg', Math.round(result.score*3.6)+'deg');
    document.querySelector('[data-result-correct]').textContent = result.correct;
    document.querySelector('[data-result-wrong]').textContent = result.wrong;
    document.querySelector('[data-result-accuracy]').textContent = result.accuracy + '%';
    document.querySelector('[data-result-speed]').textContent = result.speed + '/menit';
    document.querySelector('[data-result-summary]').textContent =
      result.score >= 85 ? 'Sangat baik. Pertahankan ritme dan konsistensi.' :
      result.score >= 70 ? 'Baik. Tingkatkan kecepatan sambil menjaga akurasi.' :
      'Masih bisa naik. Latihan singkat setiap hari akan sangat membantu.';
    renderHistory();
    window.scrollTo({top:0, behavior:'smooth'});
  }

  function renderHistory(){
    const wrap = document.querySelector('[data-history]');
    if(!wrap) return;
    const history = JSON.parse(localStorage.getItem('tespauli-history') || '[]').slice(-6).reverse();
    if(!history.length){
      wrap.innerHTML = '<p>Belum ada riwayat latihan.</p>';
      return;
    }
    wrap.innerHTML = history.map((item, idx) => {
      const d = new Date(item.date);
      return '<div><strong>'+item.label+' · '+item.score+'</strong><div class="history-bar"><span style="width:'+item.score+'%"></span></div><small>'+d.toLocaleDateString('id-ID')+' · Akurasi '+item.accuracy+'%</small></div>';
    }).join('');
  }

  document.querySelectorAll('[data-start-mode]').forEach(btn => {
    btn.addEventListener('click', () => start(btn.dataset.startMode));
  });
  if(pauseBtn) pauseBtn.addEventListener('click', togglePause);
  if(finishBtn) finishBtn.addEventListener('click', finish);
  if(resetBtn) resetBtn.addEventListener('click', () => {
    if(state) start(state.mode);
  });
  if(helpBtn) helpBtn.addEventListener('click', () => {
    alert('Cara mengerjakan: jumlahkan dua angka yang berdekatan secara vertikal. Jika hasilnya dua digit, tulis digit terakhirnya saja. Contoh: 7 + 8 = 15, maka jawab 5.');
  });

  document.querySelectorAll('[data-start-again]').forEach(btn => {
    btn.addEventListener('click', () => {
      startScreen.style.display = 'block';
      resultScreen.classList.remove('active');
      exercise.classList.remove('active');
      window.scrollTo({top:0, behavior:'smooth'});
    });
  });

  const initial = qs('mode');
  if(initial && modes[initial]) {
    start(initial);
  }
  renderHistory();
})();
