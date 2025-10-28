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

function updateClock() {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // 각도 계산
  const hourDeg = ((hours % 12) + minutes / 60) * 30; // 360 / 12 = 30
  const minuteDeg = (minutes + seconds / 60) * 6;     // 360 / 60 = 6

  const hourHand = document.querySelector('.hour-hand');
  const minuteHand = document.querySelector('.minute-hand');

  if (hourHand && minuteHand) {
    hourHand.style.transform = `translate(-50%, -100%) rotate(${hourDeg}deg)`;
    minuteHand.style.transform = `translate(-50%, -100%) rotate(${minuteDeg}deg)`;
  }
}

updateClock();
setInterval(updateClock, 1000);