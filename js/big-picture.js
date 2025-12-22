import { handleEscapePress } from './form-utils.js';

/**
 * Количество комментариев, показываемых за одну порцию
 */
const COMMENTS_BATCH_SIZE = 5;


// Основные DOM-элементы для полноэкранного режима
const fullViewSection = document.querySelector('.big-picture');
const fullImage = fullViewSection.querySelector('.big-picture__img img');
const likesCounter = fullViewSection.querySelector('.likes-count');
const commentsCounter = fullViewSection.querySelector('.comments-count');
const commentsList = fullViewSection.querySelector('.social__comments');
const descriptionField = fullViewSection.querySelector('.social__caption');
const commentsStatus = fullViewSection.querySelector('.social__comment-count');
const loadMoreBtn = fullViewSection.querySelector('.comments-loader');
const closeBtn = fullViewSection.querySelector('.big-picture__cancel');


let allComments = [];
let renderedCount = 0;
//исправить
/**
 * Создание DOM-элемента комментария
 */
function buildCommentItem(comment) {
  const item = document.createElement('li');
  item.classList.add('social__comment');

  const avatar = document.createElement('img');
  avatar.classList.add('social__picture');
  avatar.src = comment.avatar;
  avatar.alt = comment.name;
  avatar.width = 35;
  avatar.height = 35;

  const text = document.createElement('p');
  text.classList.add('social__text');
  text.textContent = comment.message;

  item.appendChild(avatar);
  item.appendChild(text);
  return item;
}

/**
 * Отображает следующую порцию комментариев
 */
function renderNextComments() {
  const nextBatch = allComments.slice(renderedCount, renderedCount + COMMENTS_BATCH_SIZE);

  nextBatch.forEach((comment) => {
    const commentElement = buildCommentItem(comment);
    commentsList.appendChild(commentElement);
  });

  renderedCount += nextBatch.length;
  commentsStatus.textContent = `${renderedCount} из ${allComments.length} комментариев`;

  if (renderedCount >= allComments.length) {
    loadMoreBtn.classList.add('hidden');
  }
}

/**
 * Открывает модальное окно с полноэкранным просмотром фотографии
 */
export function showFullView(photoData) {
  // Устанавливаем данные
  fullImage.src = photoData.url;
  fullImage.alt = photoData.description;
  likesCounter.textContent = String(photoData.likes);
  commentsCounter.textContent = String(photoData.comments.length);
  descriptionField.textContent = photoData.description || '';

  commentsList.innerHTML = '';

  // Сбрасываем классы фильтров
  fullImage.className = '';
  if (photoData.effect && photoData.effect !== 'none') {
    fullImage.classList.add(`effects__preview--${photoData.effect}`);
  }

  // Инициализация комментариев
  allComments = photoData.comments.slice();
  renderedCount = 0;
  renderNextComments();

  // Настраиваем кнопки и статус
  if (allComments.length === 0) {
    commentsStatus.classList.add('hidden');
    loadMoreBtn.classList.add('hidden');
  } else if (allComments.length <= COMMENTS_BATCH_SIZE) {
    commentsStatus.classList.remove('hidden');
    loadMoreBtn.classList.add('hidden');
  } else {
    commentsStatus.classList.remove('hidden');
    loadMoreBtn.classList.remove('hidden');
  }

  // Отображаем модальное окно
  fullViewSection.classList.remove('hidden');
  document.body.classList.add('modal-open');

  // Добавляем слушатели
  closeBtn.addEventListener('click', onCloseButton);
  document.addEventListener('keydown', onEscClose);
}

/**
 * Закрывает полноэкранное окно
 */
function hideFullView() {
  fullViewSection.classList.add('hidden');
  document.body.classList.remove('modal-open');
  closeBtn.removeEventListener('click', onCloseButton);
  document.removeEventListener('keydown', onEscClose);
}

/**
 * Обработчики
 */
function onCloseButton() {
  hideFullView();
}

function onEscClose(evt) {
  handleEscapePress(evt, hideFullView);
}

function onLoadMore() {
  renderNextComments();
}

loadMoreBtn.addEventListener('click', onLoadMore);
