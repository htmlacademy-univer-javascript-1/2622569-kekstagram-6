import { sendData } from './api.js';
import { resetForm, showMessage, handleEscapePress } from './form-utils.js';

/**
 * Параметры масштабирования (в процентах)
 */
const SCALE_STEP = 25;
const SCALE_MIN = 25;
const SCALE_MAX = 100;


/**
 * Инициализация формы загрузки изображения.
 * Название экспорта совпадает с оригинальным API — initForm.
 *
 * @param {Array} photosArray — массив текущих фото (моделируемая "база" в клиенте)
 * @param {Function} renderThumbnails — функция отрисовки миниатюр (из thumbnails.js)
 */


export function initForm(photosArray, renderThumbnails) {
  // Основные элементы формы
  const form = document.querySelector('.img-upload__form');
  const fileInput = form.querySelector('.img-upload__input');
  const overlay = document.querySelector('.img-upload__overlay');
  const overlayCloseBtn = overlay.querySelector('.img-upload__cancel');
  const submitBtn = form.querySelector('.img-upload__submit');
  const previewImg = overlay.querySelector('.img-upload__preview img');


  // Элементы слайдера эффектов
  const effectPanel = document.querySelector('.effect-level');
  const effectSlider = document.querySelector('.effect-level__slider');
  const effectValueField = document.querySelector('.effect-level__value');

  // Элементы эффектов и текстовых полей
  const effectRadios = document.querySelectorAll('input[name="effect"]');
  const hashtagsInput = form.querySelector('.text__hashtags');
  const descriptionInput = form.querySelector('.text__description');

  // Начальное состояние
  let currentEffect = 'none';

  // Pristine (валидатор). Создаём экземпляр для формы.
  const pristine = new Pristine(form, {
    classTo: 'img-upload__field-wrapper',
    errorClass: 'has-error',
    successClass: 'has-success',
    errorTextParent: 'img-upload__field-wrapper',
  });

  // ---------------------------------------------------------------------------
  // ---------- Управление открытием / закрытием панели редактирования ----------
  // ---------------------------------------------------------------------------

  function openOverlay() {
    overlay.classList.remove('hidden');
    document.body.classList.add('modal-open');
    document.addEventListener('keydown', onDocumentKeydown);
  }

  function closeOverlay() {
    // Сброс формы и состояния пользовательского интерфейса
    resetForm();
    overlay.classList.add('hidden');
    document.body.classList.remove('modal-open');
    document.removeEventListener('keydown', onDocumentKeydown);
  }

  function onDocumentKeydown(evt) {
    // Не закрываем модал при фокусе в полях ввода
    const active = document.activeElement;
    const isTyping = (active === hashtagsInput || active === descriptionInput);
    if (!isTyping) {
      handleEscapePress(evt, closeOverlay);
    }
  }

  overlayCloseBtn.addEventListener('click', () => {
    closeOverlay();
  });

  // ---------------------------------------------------------------------------
  // -------------------------- Загрузка выбранного файла ----------------------
  // ---------------------------------------------------------------------------

  fileInput.addEventListener('change', (evt) => {
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      return;
    }

    // Создаём временный URL для превью
    const tempUrl = URL.createObjectURL(file);
    previewImg.src = tempUrl;

    // После загрузки изображения снимаем временный URL
    previewImg.onload = () => {
      URL.revokeObjectURL(tempUrl);
    };

    // Показываем форму
    openOverlay();
  });

  // ---------------------------------------------------------------------------
  // ----------------------------- Масштабирование -----------------------------
  // ---------------------------------------------------------------------------

  function initScaleControls() {
    const valueField = document.querySelector('.scale__control--value');
    const btnSmaller = document.querySelector('.scale__control--smaller');
    const btnBigger = document.querySelector('.scale__control--bigger');

    function applyScale(percent) {
      // Защита от переполнения минимум/максимум
      let p = Number(percent);
      if (Number.isNaN(p)) p = 100;
      if (p < SCALE_MIN) p = SCALE_MIN;
      if (p > SCALE_MAX) p = SCALE_MAX;

      valueField.value = `${p}%`;
      previewImg.style.transform = `scale(${p / 100})`;
    }

    btnSmaller.addEventListener('click', () => {
      const val = parseInt(valueField.value, 10);
      applyScale(val - SCALE_STEP);
    });

    btnBigger.addEventListener('click', () => {
      const val = parseInt(valueField.value, 10);
      applyScale(val + SCALE_STEP);
    });

    // Установим значение по умолчанию
    applyScale(100);
  }

  initScaleControls();

  // ---------------------------------------------------------------------------
  // ------------------------------ Ползунок эффектов --------------------------
  // ---------------------------------------------------------------------------

  // Создаём noUiSlider, если он ещё не инициализирован
  function setupEffectSlider() {
    if (!effectSlider || typeof noUiSlider === 'undefined') {
      return;
    }

    // Если уже создан, сбросим
    if (effectSlider.noUiSlider) {
      effectSlider.noUiSlider.destroy();
    }

    noUiSlider.create(effectSlider, {
      range: { min: 0, max: 100 },
      start: 100,
      step: 1,
      connect: 'lower',
    });

    // По умолчанию скрываем слайдер (эффект none)
    effectSlider.classList.add('hidden');
    effectPanel.style.display = 'none';
    effectValueField.value = '';
  }

  setupEffectSlider();

  // Применение эффекта к previewImg на основе значения слайдера
  function applyEffect(effectName, intensity) {
    // Сброс классов/стилей
    previewImg.className = '';
    previewImg.style.filter = '';

    if (!effectName || effectName === 'none') {
      currentEffect = 'none';
      return;
    }

    currentEffect = effectName;

    // Добавляем соответствующий класс-предпросмотр (стили в CSS)
    previewImg.classList.add(`effects__preview--${effectName}`);

    // В зависимости от эффекта, рассчитываем CSS-фильтр
    const v = Number(intensity);
    switch (effectName) {
      case 'chrome':
        // grayscale: 0..1
        previewImg.style.filter = `grayscale(${(v / 100).toFixed(2)})`;
        break;
      case 'sepia':
        previewImg.style.filter = `sepia(${(v / 100).toFixed(2)})`;
        break;
      case 'marvin':
        // invert: в процентах
        previewImg.style.filter = `invert(${Math.round(v)}%)`;
        break;
      case 'phobos':
        // blur: 0..3px
        previewImg.style.filter = `blur(${((v / 100) * 3).toFixed(2)}px)`;
        break;
      case 'heat':
        // brightness: 1..3
        previewImg.style.filter = `brightness(${(1 + (v / 100) * 2).toFixed(2)})`;
        break;
      default:
        previewImg.style.filter = '';
    }
  }

  // Обновление видимости слайдера в зависимости от выбранного эффекта
  function setSliderVisibility(effectName) {
    if (!effectSlider || !effectSlider.noUiSlider) {
      return;
    }

    if (effectName === 'none') {
      effectSlider.classList.add('hidden');
      effectPanel.style.display = 'none';
      effectValueField.value = '';
      applyEffect('none', 100);
      return;
    }

    // Показать слайдер и синхронизировать значение
    effectSlider.classList.remove('hidden');
    effectPanel.style.display = '';
    const raw = effectSlider.noUiSlider.get();
    effectValueField.value = raw;
    applyEffect(effectName, raw);
  }

  // Подписываемся на изменения слайдера
  if (effectSlider && effectSlider.noUiSlider) {
    effectSlider.noUiSlider.on('update', (values) => {
      const val = Array.isArray(values) ? values[0] : values;
      effectValueField.value = val;
      applyEffect(currentEffect, val);
    });
  } else if (effectSlider) {
    // Если только что создали, привязываем обработчик после создания
    if (effectSlider.noUiSlider) {
      effectSlider.noUiSlider.on('update', (values) => {
        const val = Array.isArray(values) ? values[0] : values;
        effectValueField.value = val;
        applyEffect(currentEffect, val);
      });
    }
  }

  // Слушаем переключение радиокнопок эффектов
  effectRadios.forEach((radio) => {
    radio.addEventListener('change', () => {
      const chosen = radio.value;
      currentEffect = chosen;
      // обновляем видимость слайдера и применяем эффект
      setSliderVisibility(chosen);
    });
  });

  // Установим дефолтный эффект (взят из DOM: checked input)
  const initiallyChecked = document.querySelector('input[name="effect"]:checked');
  if (initiallyChecked) {
    currentEffect = initiallyChecked.value;
  } else {
    currentEffect = 'none';
  }
  setSliderVisibility(currentEffect);

  // ---------------------------------------------------------------------------
  // -------------------------------- Валидация -------------------------------
  // ---------------------------------------------------------------------------

  // Валидатор хэштегов: до 5 тегов, каждый начинается с '#', длина правила как в задании
  pristine.addValidator(hashtagsInput, (value) => {
    const trimmed = value.trim();
    if (trimmed === '') return true; // пустое значение — допустимо

    // Разбиваем по пробелам, отбрасываем пустые элементы
    const tags = trimmed.split(/\s+/).filter(Boolean).map((t) => t.toLowerCase());
    const tagPattern = /^#[A-Za-zА-Яа-я0-9]{2,19}$/;
    if (tags.length > 5) return false;

    const unique = new Set(tags);
    if (unique.size !== tags.length) return false;

    return tags.every((t) => tagPattern.test(t));
  }, 'Неверный формат хэш-тега или превышено количество (макс 5)');

  // Валидатор описания: максимум 140 символов
  pristine.addValidator(descriptionInput, (value) => {
    return value.length <= 140;
  }, 'Комментарий не может превышать 140 символов');

  // ---------------------------------------------------------------------------
  // --------------------------- Отправка формы на сервер ----------------------
  // ---------------------------------------------------------------------------

  form.addEventListener('submit', async (evt) => {
    evt.preventDefault();

    // Проверяем валидность
    if (!pristine.validate()) {
      return;
    }

    submitBtn.disabled = true;

    const formData = new FormData(form);

    try {
      // После успешной загрузки данных:
      await sendData(formData);
      showMessage('success');

      // Создаём новую карточку с фото
      const file = fileInput.files && fileInput.files[0];
      const newUrl = file ? URL.createObjectURL(file) : '';

      const newPhoto = {
        id: photosArray.length + 1,
        url: newUrl,
        description: descriptionInput.value || '',
        likes: 0,
        comments: [],
        effect: currentEffect === 'none' ? 'none' : currentEffect,
      };

      // Добавляем фото в общий массив
      photosArray.push(newPhoto);

      // Создаём миниатюру и добавляем её в конец галереи без перерисовки
      const galleryContainer = document.querySelector('.pictures');
      const pictureTemplate = document.querySelector('#picture').content.querySelector('.picture');

      const newThumbnail = pictureTemplate.cloneNode(true);
      const img = newThumbnail.querySelector('.picture__img');
      img.src = newPhoto.url;
      img.alt = newPhoto.description;
      newThumbnail.querySelector('.picture__comments').textContent = newPhoto.comments.length;
      newThumbnail.querySelector('.picture__likes').textContent = newPhoto.likes;

      // Добавляем клик для открытия в big-picture
      newThumbnail.addEventListener('click', (evt) => {
        evt.preventDefault();
        import('./big-picture.js').then(({ showFullView }) => showFullView(newPhoto));
      });

      // Вставляем в конец списка
      galleryContainer.appendChild(newThumbnail);

      // Сбрасываем форму
      resetForm();

    } catch (err) {
      // При ошибке показа — показываем сообщение с ошибкой
      console.error('Ошибка отправки данных:', err);
      showMessage('error');
    } finally {
      submitBtn.disabled = false;
    }
  });

  // ---------------------------------------------------------------------------
  // ----------------------------- Вспомогательные -----------------------------
  // ---------------------------------------------------------------------------

  // При клике на фон оверлея — ничего не делаем (в оригинале — закрытие по клику по фону —
  // оставим стандартное поведение: закрываем при клике на сам фон шаблонного message)
  // Важно: resetForm() внутри form-utils.js уже скрывает overlay; поэтому при
  // закрытии через другие механизмы используется closeOverlay().

  // Обеспечим дополнительный listener: если в другом месте проекта кто-то вручную вызовет resetForm,
  // то состояние корректно обновится (это делается внутри resetForm).
}
