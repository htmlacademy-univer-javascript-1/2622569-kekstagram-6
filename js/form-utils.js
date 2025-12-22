// js/form-utils.js

/**
 * handleEscapePress — универсальный обработчик Escape
 * вызывает callback, если нажата клавиша Escape
 * @param {KeyboardEvent} evt
 * @param {Function} callback
 */
export function handleEscapePress(evt, callback) {
  if (!evt) return;
  const key = evt.key || evt.keyCode;
  if (key === 'Escape' || key === 'Esc' || key === 27) {
    evt.preventDefault && evt.preventDefault();
    callback && callback();
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
export function resetForm() {
  const form = document.querySelector('.img-upload__form');
  const overlay = document.querySelector('.img-upload__overlay');
  const previewImg = overlay ? overlay.querySelector('.img-upload__preview img') : null;
  const hashtagsInput = form ? form.querySelector('.text__hashtags') : null;
  const descriptionInput = form ? form.querySelector('.text__description') : null;
  const fileInput = form ? form.querySelector('.img-upload__input') : null;
  const scaleValue = document.querySelector('.scale__control--value');
  const effectSliderEl = document.querySelector('.effect-level__slider');
  const effectWrapper = document.querySelector('.effect-level');


  try {
    if (form) form.reset();
  } catch (err) {
    // ignore
  }

  // Сброс содержимого превью
  if (previewImg) {
    previewImg.src = '';
    previewImg.className = '';
    previewImg.style.filter = '';
    previewImg.style.transform = 'scale(1)';
  }

  if (hashtagsInput) hashtagsInput.value = '';
  if (descriptionInput) descriptionInput.value = '';

  if (fileInput) {
    // Удаляем выбранный файл (если был)
    try {
      fileInput.value = '';
    } catch (err) {
      // IE может не позволить обновить .value, но это некритично
    }
  }

  if (scaleValue) scaleValue.value = '100%';

  // Если используем noUiSlider — сброс к 100
  if (effectSliderEl && effectSliderEl.noUiSlider) {
    try {
      effectSliderEl.noUiSlider.set(100);
    } catch (err) {
      // безопасный игнор
    }
  }

  // Скрываем панель эффектов
  if (effectWrapper) {
    effectWrapper.style.display = 'none';
  }

  // Убираем overlay если открыт
  if (overlay) {
    overlay.classList.add('hidden');
  }

  // Убираем глобальный класс блокировки прокрутки
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
  if (!type) return;

  const templateId = `#${type}`;
  const template = document.querySelector(templateId);
  if (!template || !template.content) {
    console.error('Шаблон сообщения не найден:', templateId);
    return;
  }

  // Найдём корневой блок внутри template (section.success или section.error)
  const inner = template.content.querySelector(`.${type}`);
  if (!inner) {
    console.error('В шаблоне не найден ожидаемый элемент:', type);
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
    document.removeEventListener('keydown', onEsc);
    // безопасно удалить listener клика по документу (если был)
    document.removeEventListener('click', onOutsideClick);
  }

  function onEsc(evt) {
    handleEscapePress(evt, removeMessage);
  }

  function onOutsideClick(evt) {
    // Закрываем только если кликнули по самому затемнённому overlay (root instance)
    if (evt.target === instance) {
      removeMessage();
    }
  }

  // Назначим слушатели
  document.addEventListener('keydown', onEsc);
  document.addEventListener('click', onOutsideClick);

  if (closeBtn) {
    closeBtn.addEventListener('click', removeMessage);
  }
}
