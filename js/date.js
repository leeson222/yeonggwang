function updateDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const date = String(now.getDate()).padStart(2, '0');
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const day = days[now.getDay()];
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');

  const formatted = `${year}.${month}.${date} (${day}) ${hours}:${minutes}`;
  document.querySelector('.top-date').textContent = formatted;
}

updateDateTime();
setInterval(updateDateTime, 1000); // ⏱ 1초마다 업데이트