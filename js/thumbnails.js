// js/thumbnails.js
import { showFullView } from './big-picture.js';

/**
 * Контейнер для миниатюр изображений
 */
const galleryContainer = document.querySelector('.pictures');

/**
 * Шаблон миниатюры
 */
const pictureTemplate = document.querySelector('#picture').content.querySelector('.picture');

/**
 * Удаляет старые миниатюры перед перерисовкой
 */
function clearGallery() {
  galleryContainer.querySelectorAll('.picture').forEach((pic) => pic.remove());
}

/**
 * Создает миниатюру на основе данных о фото
 * @param {Object} photo — данные изображения
 * @returns {HTMLElement}
 */
function createThumbnail(photo) {
  const element = pictureTemplate.cloneNode(true);
  const img = element.querySelector('.picture__img');
  const comments = element.querySelector('.picture__comments');
  const likes = element.querySelector('.picture__likes');

  img.src = photo.url;
  img.alt = photo.description || 'Фото пользователя';
  comments.textContent = photo.comments ? photo.comments.length : 0;
  likes.textContent = (photo.likes === undefined || photo.likes === null) ? 0 : photo.likes;

  // При клике открывается полноэкранный просмотр
  element.addEventListener('click', (evt) => {
    evt.preventDefault();
    showFullView(photo);
  });

  return element;
}

/**
 * Отрисовывает миниатюры на странице
 * @param {Array} photos — массив объектов с данными изображений
 */
export function renderThumbnails(photos) {
  clearGallery();

  const fragment = document.createDocumentFragment();

  photos.forEach((photo) => {
    const thumb = createThumbnail(photo);
    fragment.appendChild(thumb);
  });

  galleryContainer.appendChild(fragment);
}

/**
 * Инициализация миниатюр (может вызываться при первой загрузке данных)
 */
export function initializeThumbnails(photos) {
  renderThumbnails(photos);
}
