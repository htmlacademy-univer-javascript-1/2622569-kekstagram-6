// js/form-utils.js

/**
 * handleEscapePress — универсальный обработчик Escape
 * вызывает callback, если нажата клавиша Escape
 * @param {KeyboardEvent} evt
 * @param {Function} callback
 */
export function handleEscapePress(evt, callback) {
  if (!evt) {
    return;
  }

  const key = evt.key || evt.keyCode;
  const isEscape = (key === 'Escape' || key === 'Esc' || key === 27);

  if (!isEscape) {
    return;
  }

  if (typeof evt.preventDefault === 'function') {
    evt.preventDefault();
  }

  if (typeof callback === 'function') {
    callback();
  }
}


/**
 * resetForm — аккуратно сбрасывает форму и интерфейс редактирования:
 * - сбрасывает значения полей формы
 * - убирает фильтры и эффекты с превью
 * - скрывает overlay и убирает класс modal-open с body
 * - сбрасывает масштаб в value и style
 * - если есть noUiSlider — сбрасывает его значение на 100
 */
// form-utils.js

const DEFAULT_SCALE = 100;

export function resetForm({
  form,
  overlay,
  previewImg,
  fileInput,
  hashtagsInput,
  descriptionInput,
  scaleValue,
  effectSlider,
  effectLevelContainer,
  pristine,
  effectRadios,
}) {
  form.reset();

  // pristine: убрать тексты ошибок и классы
  if (pristine) {
    pristine.reset();
  }

  // scale
  if (scaleValue) {
    scaleValue.value = `${DEFAULT_SCALE}%`;
  }
  if (previewImg) {
    previewImg.style.transform = `scale(${DEFAULT_SCALE / 100})`;
    previewImg.style.filter = '';
    previewImg.className = '';
  }

  if (effectRadios && effectRadios.length) {
    effectRadios.forEach((radio) => {
      radio.checked = (radio.value === 'none');
    });
  }

  if (effectSlider && effectSlider.noUiSlider) {
    effectSlider.noUiSlider.set(100);
  }
  if (effectLevelContainer) {
    effectLevelContainer.classList.add('hidden');
  }

  if (hashtagsInput) {
    hashtagsInput.value = '';
  }

  if (descriptionInput) {
    descriptionInput.value = '';
  }

  if (fileInput) {
    fileInput.value = '';
  }

  if (overlay) {
    overlay.classList.add('hidden');
  }
  document.body.classList.remove('modal-open');
}


/**
 * showMessage — клонирует шаблон success/error и выводит его на экран.
 * Сообщение закрывается:
 * - нажатием на кнопку внутри блока
 * - кликом по затемнённому фону (вне внутреннего окна)
 * - нажатием Escape.
 *
 * type: 'success' | 'error' — должен соответствовать id шаблона (#success / #error)
 */
export function showMessage(type) {
  if (!type) {
    return;
  }

  const templateId = `#${type}`;
  const template = document.querySelector(templateId);
  if (!template || !template.content) {
    return;
  }

  // Найдём корневой блок внутри template (section.success или section.error)
  const inner = template.content.querySelector(`.${type}`);
  if (!inner) {
    return;
  }

  const instance = inner.cloneNode(true);
  // Добавляем в body
  document.body.appendChild(instance);

  // Найдём кнопку закрытия внутри сообщения
  const closeBtn = instance.querySelector(`.${type}__button`);

  // Обработчик закрытия — аккуратно снимает слушатели
  function removeMessage() {
    // если instance ещё в DOM — удалим
    if (instance && instance.parentNode) {
      instance.parentNode.removeChild(instance);
    }
    document.removeEventListener('keydown', onDocumentKeydown);
    // безопасно удалить listener клика по документу (если был)
    document.removeEventListener('click', onOverlayClick);
  }

  function onDocumentKeydown(evt) {
    handleEscapePress(evt, removeMessage);
  }

  function onOverlayClick(evt) {
    // Закрываем только если кликнули по самому затемнённому overlay (root instance)
    if (evt.target === instance) {
      removeMessage();
    }
  }

  // Назначим слушатели
  document.addEventListener('keydown', onDocumentKeydown);
  document.addEventListener('click', onOverlayClick);

  if (closeBtn) {
    closeBtn.addEventListener('click', removeMessage);
  }
}
