const API_KEY = '58b67e4587b71afc9671da56daa3b31a';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// ===== 고정 위치(전라남도 영광군) =====
const DEFAULT_POS = { latitude: 35.277, longitude: 126.511 };
const FORCE_KO_CITY = '전라남도 영광군';

// ===== 공통 유틸 =====
const IMG_BASE = './img';

function getCustomIcon(code, small = false) {
  const base = String(code || '').replace(/[dn]$/, 'd');
  const map = {
    '01d': 'sun','02d': 'partly-cloudy','03d': 'cloud','04d': 'overcast',
    '09d': 'shower','10d': 'rain','11d': 'thunder','13d': 'snow','50d': 'fog'
  };
  const filename = map[base] || 'default';
  const suffix = small ? '-small' : '';
  return `${IMG_BASE}/${filename}${suffix}.png`;
}

// 날씨 코드 → 배경 그라디언트
function getBgGradient(iconCode) {
  const base = String(iconCode || '').replace(/[dn]$/, 'd');
  const nameMap = {
    '01d': 'sun','02d': 'partly-cloudy','03d': 'cloud','04d': 'overcast',
    '09d': 'shower','10d': 'rain','11d': 'thunder','13d': 'snow','50d': 'fog'
  };
  const name = nameMap[base] || 'default';

  const gradientMap = {
    sun: 'linear-gradient(45deg, #00a7ff 50%, #b5e5ff)',
    'partly-cloudy': 'linear-gradient(45deg, #58a6c5 50%, #c6efff)',
    cloud: 'linear-gradient(45deg, #58a6c5 50%, #c6efff)',
    overcast: 'linear-gradient(45deg, #59879b 50%, #b3e2f6)',
    shower: 'linear-gradient(45deg, #5a656a 50%, #92aab5)',
    rain: 'linear-gradient(45deg, #5a656a 50%, #92aab5)',
    thunder: 'linear-gradient(45deg, #373c3e 50%, #7f8070)',
    snow: 'linear-gradient(45deg, #aaaaaa 50%, #f3f3f3)',
    fog: 'linear-gradient(45deg, #909090 50%, #d0d0d0)',
    default: 'linear-gradient(45deg, #7fa7c7 50%, #d3e4ef)'
  };
  return gradientMap[name];
}

function getSmallIconUrl(iconCode) {
  const base = String(iconCode || '').replace(/[dn]$/, 'd');
  const map = {
    '01d':'sun','02d':'partly-cloudy','03d':'cloud','04d':'overcast',
    '09d':'shower','10d':'rain','11d':'thunder','13d':'snow','50d':'fog'
  };
  const name = map[base] || 'default';
  return `${IMG_BASE}/${name}-small.png`;
}

function getKoreanWeekday(dateLike) {
  const d = (dateLike instanceof Date) ? dateLike : new Date(dateLike);
  return ['일','월','화','수','목','금','토'][d.getDay()];
}

// ===== API =====
async function fetchWeather(lat, lon) {
  const url = `${BASE_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`;
  const resp = await fetch(url, { cache: 'no-store' });
  if (!resp.ok) throw new Error(`API 요청 실패: ${resp.status}`);
  return await resp.json();
}

// 주간(내일부터 6일)
async function fetchDailyForecast(lat, lon) {
  // 1차: One Call 3.0
  try {
    const url1 = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=current,minutely,hourly,alerts&appid=${API_KEY}&units=metric&lang=kr`;
    const r1 = await fetch(url1, { cache: 'no-store' });
    if (r1.ok) {
      const d1 = await r1.json();
      if (Array.isArray(d1.daily) && d1.daily.length) {
        return { type: 'onecall', data: d1.daily };
      }
    }
  } catch (_) {}

  // 2차: 3시간 간격 → 날짜별 대표값(정오 근접)
  const url2 = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=kr`;
  const r2 = await fetch(url2, { cache: 'no-store' });
  if (!r2.ok) throw new Error('예보 API 실패');
  const d2 = await r2.json();

  const byDate = {};
  for (const item of d2.list) {
    const dt = new Date(item.dt * 1000);
    const key = dt.toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
    (byDate[key] ||= []).push(item);
  }

  const daily = Object.values(byDate).map(items => {
    let best = items[0], bestDiff = Infinity;
    for (const it of items) {
      const t = new Date(it.dt * 1000);
      const diff = Math.abs(t.getHours() + t.getMinutes()/60 - 12);
      if (diff < bestDiff) { bestDiff = diff; best = it; }
    }
    return { dt: best.dt, weather: best.weather };
  });

  const todayKey = new Date().toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' });
  const filtered = daily.filter(d =>
    new Date(d.dt * 1000).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }) !== todayKey
  );

  return { type: 'fallback', data: filtered };
}

// ===== 렌더 =====
function renderWidget(root, data) {
  if (!root) return;

  const city = FORCE_KO_CITY; // 한글 고정
  const temp = data?.main?.temp;
  let desc = (data?.weather?.[0]?.description || '').trim();  // ← let으로!
  const iconCode = data?.weather?.[0]?.icon || '';

  // ✅ 한글 표현 자연스럽게 보정
  const descMap = {
    '약간의 구름이 낀 하늘': '조금 흐림',
    '튼구름': '조금 흐림',
    '구름조금': '조금 흐림',
    '온흐림': '흐림',
    '흐린 구름': '흐림',
    '맑음': '맑음',
  };
  if (descMap[desc]) desc = descMap[desc];

  const small = !!root.closest('.top-banner');
  const iconUrl = getCustomIcon(iconCode, small);

  const cityEl = root.querySelector('#city');
  const tempEl = root.querySelector('#temp');
  const descEl = root.querySelector('#desc');
  const figEl  = root.querySelector('#weather-icon');

  const loadingEl = (root.parentElement && root.parentElement.querySelector('#loading'))
                 || (root.closest('article, .top-right-box, body')?.querySelector('#loading'));
  if (loadingEl) loadingEl.style.display = 'none';
  root.style.display = 'block';

  if (cityEl) cityEl.textContent = city;
  if (tempEl) tempEl.textContent = Number.isFinite(temp) ? `${temp}°C` : '';
  if (descEl) descEl.textContent = desc;

  if (figEl) {
    figEl.innerHTML = `<img src="${iconUrl}" alt="${desc}" onerror="this.src='${IMG_BASE}/default.png'">`;
    figEl.style.display = 'block';
  }

  // 배경: 그라디언트 적용
  const bgBox = document.querySelector('.main-box.weather-box');
  if (bgBox) {
    const gradient = getBgGradient(iconCode);
    bgBox.style.background = gradient;
    bgBox.style.transition = 'background 0.6s ease';
  }
}
function buildNext6DaysFrom(dataArr) {
  const out = [];
  const base = new Date();
  for (let i = 1; i <= 6; i++) {
    const target = new Date(base);
    target.setDate(base.getDate() + i);
    const sameDay = dataArr.find(d => {
      const dd = new Date(d.dt * 1000);
      return dd.getFullYear() === target.getFullYear()
          && dd.getMonth() === target.getMonth()
          && dd.getDate() === target.getDate();
    });
    out.push({
      dt: target.getTime() / 1000,
      icon: sameDay?.weather?.[0]?.icon || '',
    });
  }
  return out;
}

function renderWeeklyInto(containerSelector, dailyArray) {
  const wrap = document.querySelector(containerSelector);
  if (!wrap) return;
  const ul = wrap.querySelector('ul');
  if (!ul) return;

  const sorted = [...dailyArray].sort((a,b) => (a.dt||0) - (b.dt||0));
  const six = buildNext6DaysFrom(sorted);

  const html = six.map(it => {
    const date = new Date(it.dt * 1000);
    const dayKo = getKoreanWeekday(date);
    const iconUrl = it.icon ? getSmallIconUrl(it.icon) : `${IMG_BASE}/default-small.png`;
    return `
      <li class="day">
        <figure class="w-icon"><img src="${iconUrl}" alt="${dayKo} 날씨" onerror="this.src='${IMG_BASE}/sun-small.png'"></figure>
        <h4 class="day-label">${dayKo}</h4>
      </li>`;
  }).join('');

  ul.innerHTML = html;
}

// ===== 초기화 =====
function initWeather() {
  const widgets = [
    document.querySelector('.top-weather'),
    document.querySelector('.main-weather')
  ].filter(Boolean);
  if (!widgets.length) return;

  const onData = (data) => widgets.forEach(root => renderWidget(root, data));
  const onErrorTextAll = (txt) => {
    document.querySelectorAll('#loading').forEach(el => el.textContent = txt);
  };

  // 위치 요청 없이 고정 좌표 사용
  fetchWeather(DEFAULT_POS.latitude, DEFAULT_POS.longitude)
    .then(onData)
    .catch(e => {
      console.error(e);
      onErrorTextAll('날씨 정보를 가져오지 못했어요.');
    });
}

async function initWeeklyWeather() {
  const weeklySel = '.weekly-weather-wrap';
  if (!document.querySelector(weeklySel)) return;

  try {
    const { data: raw } = await fetchDailyForecast(DEFAULT_POS.latitude, DEFAULT_POS.longitude);
    renderWeeklyInto(weeklySel, raw);
  } catch (e) {
    console.error('[weekly] error', e);
    const ul = document.querySelector(`${weeklySel} ul`);
    if (ul) {
      const base = new Date();
      let html = '';
      for (let i=1;i<=6;i++){
        const t = new Date(base); t.setDate(base.getDate()+i);
        const dayKo = getKoreanWeekday(t);
        html += `
          <li class="day">
            <figure class="w-icon"><img src="${IMG_BASE}/sun-small.png" alt="${dayKo} 날씨"></figure>
            <h4 class="day-label">${dayKo}</h4>
          </li>`;
      }
      ul.innerHTML = html;
    }
  }
}

document.addEventListener('DOMContentLoaded', initWeather);
document.addEventListener('DOMContentLoaded', initWeeklyWeather);