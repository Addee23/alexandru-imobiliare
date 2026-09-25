(function () {
  // Confirm destructive actions
  document.querySelectorAll('form[data-confirm]').forEach(function (f) {
    f.addEventListener('submit', function (e) { if (!confirm(f.dataset.confirm)) e.preventDefault(); });
  });

  // Existing images: reorder (drag or arrows) and mark for deletion
  var manager = document.getElementById('imgManager');
  var orderInput = document.getElementById('imgOrder');
  function syncOrder() {
    orderInput.value = Array.prototype.map.call(manager.children, function (li) { return li.dataset.src; }).join('\n');
  }
  if (manager) {
    var dragged = null;
    manager.addEventListener('dragstart', function (e) { dragged = e.target.closest('li'); dragged.classList.add('dragging'); });
    manager.addEventListener('dragend', function () { if (dragged) dragged.classList.remove('dragging'); dragged = null; syncOrder(); });
    manager.addEventListener('dragover', function (e) {
      e.preventDefault();
      var over = e.target.closest('li');
      if (!dragged || !over || over === dragged) return;
      var r = over.getBoundingClientRect();
      manager.insertBefore(dragged, e.clientX > r.left + r.width / 2 ? over.nextSibling : over);
    });
    manager.addEventListener('click', function (e) {
      var li = e.target.closest('li');
      if (!li) return;
      if (e.target.closest('.img-left') && li.previousElementSibling) manager.insertBefore(li, li.previousElementSibling);
      if (e.target.closest('.img-right') && li.nextElementSibling) manager.insertBefore(li.nextElementSibling, li);
      syncOrder();
    });
    manager.addEventListener('change', function (e) {
      if (e.target.name === 'deleteImages') e.target.closest('li').classList.toggle('is-deleted', e.target.checked);
    });
  }

  // New images: preview + shrink large phone photos before upload
  var inputs = document.querySelectorAll('input[type=file][data-shrink]');
  if (!inputs.length) return;
  var MAX = 1920;

  function shrink(file) {
    return new Promise(function (resolve) {
      if (!/^image\/(jpeg|png|webp)$/.test(file.type) || !window.createImageBitmap) return resolve(file);
      createImageBitmap(file, { imageOrientation: 'from-image' }).then(function (bmp) {
        var scale = Math.min(1, MAX / Math.max(bmp.width, bmp.height));
        if (scale === 1 && file.size < 1.5e6) return resolve(file);
        var c = document.createElement('canvas');
        c.width = Math.round(bmp.width * scale);
        c.height = Math.round(bmp.height * scale);
        c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
        c.toBlob(function (blob) {
          if (!blob) return resolve(file);
          resolve(new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }));
        }, 'image/jpeg', 0.85);
      }).catch(function () { resolve(file); });
    });
  }

  var form = inputs[0].form;
  var btn = form.querySelector('.save-btn');
  var label = btn.textContent;
  var pending = 0;

  Array.prototype.forEach.call(inputs, function (input) {
    var dz = input.closest('.dropzone');
    var preview = dz.nextElementSibling;
    input.addEventListener('change', function () {
      var files = Array.prototype.slice.call(input.files);
      preview.innerHTML = '';
      files.forEach(function (f) {
        var img = document.createElement('img');
        img.src = URL.createObjectURL(f);
        preview.appendChild(img);
      });
      if (!files.length || typeof DataTransfer === 'undefined') return;
      pending++;
      btn.disabled = true;
      btn.textContent = 'Se pregătesc fotografiile...';
      Promise.all(files.map(shrink)).then(function (out) {
        var dt = new DataTransfer();
        out.forEach(function (f) { dt.items.add(f); });
        input.files = dt.files;
      }).finally(function () {
        if (--pending === 0) { btn.disabled = false; btn.textContent = label; }
      });
    });
    ['dragenter', 'dragover'].forEach(function (ev) { dz.addEventListener(ev, function () { dz.classList.add('is-over'); }); });
    ['dragleave', 'drop'].forEach(function (ev) { dz.addEventListener(ev, function () { dz.classList.remove('is-over'); }); });
  });

  form.addEventListener('submit', function (e) {
    if (pending) { e.preventDefault(); return; }
    btn.textContent = 'Se salvează...';
    setTimeout(function () { btn.disabled = true; }, 0);
  });
})();
