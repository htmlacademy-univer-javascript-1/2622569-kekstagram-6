// js/main.js
import { getData } from './api.js';
import { initForm } from './form.js';
import { renderThumbnails } from './thumbnails.js';
import { showMessage } from './form-utils.js';

/**
 * Настройки фильтрации и дебаунса
 */
const DEBOUNCE_DELAY = 500;
const RANDOM_PHOTO_LIMIT = 10;

const filtersSection = document.querySelector('.img-filters'); // контейнер с кнопками фильтров
const galleryRoot = document.querySelector('.pictures'); // контейнер галереи

// текущее состояние наборов фотографий
let allPhotos = [];
let currentDisplayed = [];

/**
 * Простая утилита debounce — возвращает обёртку, которая вызывает fn спустя delay
 * Последний вызов перезаписывает таймер.
 */
function debounce(fn, delay) {
  let timer = null;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}


function pickRandomPhotos(photos) {
  const copy = photos.slice();
  // простой shuffle
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, Math.min(RANDOM_PHOTO_LIMIT, copy.length));
}


/**
 * Возвращает массив, отсортированный по количеству комментариев (убывание)
 */
function pickMostDiscussed(photos) {
  return photos.slice().sort((a, b) => (b.comments?.length || 0) - (a.comments?.length || 0));
}

/**
 * Полностью очищает DOM-галерею (все миниатюры)
 */
function clearGallery() {
  galleryRoot.querySelectorAll('.picture').forEach((node) => node.remove());
}


/**
 * Функция, которая применяется при переключении фильтра.
 * Обёрнута в debounce в конфигурации слушателя.
 */
const applyFilter = debounce((filterId) => {
  clearGallery();

  switch (filterId) {
    case 'filter-random':
      currentDisplayed = pickRandomPhotos(allPhotos);
      break;
    case 'filter-discussed':
      currentDisplayed = pickMostDiscussed(allPhotos);
      break;
    case 'filter-default':
    default:
      currentDisplayed = allPhotos.slice();
      break;
  }


  // Рисуем миниатюры для выбранного набора
  renderThumbnails(currentDisplayed);
}, DEBOUNCE_DELAY);

/**
 * Настройка UI переключения фильтров (кнопки)
 */
function enableFilters() {
  // Делаем панель видимой
  filtersSection.classList.remove('img-filters--inactive');

  filtersSection.addEventListener('click', (evt) => {
    const target = evt.target;
    if (!target.classList.contains('img-filters__button')) return;

    const active = filtersSection.querySelector('.img-filters__button--active');
    if (active) active.classList.remove('img-filters__button--active');
    target.classList.add('img-filters__button--active');

    applyFilter(target.id);
  });
}

/**
 * Загружает данные с сервера, инициализирует фильтры, галерею и форму
 */
async function loadAndInit() {
  try {
    const data = await getData();
    if (!Array.isArray(data)) {
      throw new Error('Неправильный формат данных от сервера');
    }

    allPhotos = data.slice();
    currentDisplayed = allPhotos.slice();

    // Включаем фильтры и отрисовываем начальную галерею
    enableFilters();
    renderThumbnails(currentDisplayed);

    // Инициализируем форму. Передаём массив и функцию отрисовки,
    // чтобы при добавлении новой фотографии рендерить её в галерее.
    initForm(allPhotos, renderThumbnails);

  } catch (err) {
    console.error('Ошибка при получении/инициализации данных:', err);
    // Покажем пользователю шаблон ошибки (встраивается в DOM из index.html)
    showMessage('error');
  }
}

// Запускаем загрузку при старте скрипта
loadAndInit();
