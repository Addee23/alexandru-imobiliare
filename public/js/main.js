(function () {
  // Property filters on the home page
  document.querySelectorAll('.chip[data-filter]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.dataset.filter;
      document.querySelectorAll('.chip[data-filter]').forEach(function (c) { c.classList.toggle('is-active', c === chip); });
      document.querySelectorAll('.card[data-type]').forEach(function (card) {
        card.hidden = f !== 'all' && card.dataset.type !== f;
      });
    });
  });

  // Share button
  var share = document.querySelector('.share-btn');
  if (share) share.addEventListener('click', function () {
    var data = { title: share.dataset.title, url: share.dataset.url };
    if (navigator.share) return navigator.share(data).catch(function () {});
    navigator.clipboard.writeText(data.url).then(function () {
      var old = share.innerHTML;
      share.textContent = 'Link copiat!';
      setTimeout(function () { share.innerHTML = old; }, 1800);
    });
  });

  // Gallery + lightbox
  var imgs = window.GALLERY || [];
  var main = document.querySelector('.gallery-main');
  if (!main || !imgs.length) return;
  var mainImg = main.querySelector('img');
  var thumbs = document.querySelectorAll('.thumb');
  var lb = document.querySelector('.lightbox');
  var lbImg = lb.querySelector('img');
  var lbCount = lb.querySelector('.lb-count');
  var current = 0;

  function showLb() {
    lbImg.src = imgs[current];
    lbCount.textContent = (current + 1) + ' / ' + imgs.length;
  }
  function select(i) {
    current = (i + imgs.length) % imgs.length;
    mainImg.src = imgs[current];
    thumbs.forEach(function (t, j) { t.classList.toggle('is-active', j === current); });
    if (thumbs[current]) thumbs[current].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    if (!lb.hidden) showLb();
  }
  function open() { lb.hidden = false; showLb(); document.body.style.overflow = 'hidden'; }
  function close() { lb.hidden = true; document.body.style.overflow = ''; }

  thumbs.forEach(function (t) { t.addEventListener('click', function () { select(+t.dataset.index); }); });
  main.addEventListener('click', open);
  document.querySelectorAll('.gallery-side').forEach(function (tile) {
    tile.addEventListener('click', function () { current = +tile.dataset.index; open(); });
  });
  lb.querySelector('.lb-close').addEventListener('click', close);
  lb.querySelector('.lb-prev').addEventListener('click', function () { select(current - 1); });
  lb.querySelector('.lb-next').addEventListener('click', function () { select(current + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') select(current - 1);
    if (e.key === 'ArrowRight') select(current + 1);
  });
  var x0 = null;
  lb.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) select(current + (dx < 0 ? 1 : -1));
    x0 = null;
  });
})();

// FAQ tabs (buyers / sellers)
(function () {
  var tabs = document.querySelectorAll('.faq-tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', on);
      });
      document.querySelectorAll('.faq[data-group]').forEach(function (panel) {
        panel.hidden = panel.dataset.group !== tab.dataset.tab;
      });
    });
  });
})();
