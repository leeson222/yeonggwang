document.addEventListener('DOMContentLoaded', () => {
  function updateDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const date = String(now.getDate()).padStart(2, '0');
    const days = ['일', '월', '화', '수', '목', '금', '토'];
    const day = days[now.getDay()];
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const formatted = `${year}.${month}.${date} (${day})`;
    const formatted2 = `${hours}:${minutes}`;
    document.querySelector('.top-date').textContent = formatted;
    document.querySelector('.main-hours').textContent = formatted2;
  }

  updateDateTime();
  setInterval(updateDateTime, 1000);
});

let prevAmpm = '';
let prevTime = '';

function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? '오후' : '오전';

  // 12시간제로 변환
  hours = hours % 12 || 12;
  const timeFormatted = `${hours}:${minutes}`;

  const amPmEl = document.querySelector('.amPm');
  const mainHoursEl = document.querySelector('.main-hours');

  // ✅ 값이 바뀐 경우에만 DOM 갱신
  if (amPmEl && ampm !== prevAmpm) {
    amPmEl.textContent = ampm;
    prevAmpm = ampm;
  }

  if (mainHoursEl && timeFormatted !== prevTime) {
    mainHoursEl.textContent = timeFormatted;
    prevTime = timeFormatted;
  }
}

updateClock();
setInterval(updateClock, 1000);