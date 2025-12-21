const BASE_URL = 'https://29.javascript.htmlacademy.pro/kekstagram';

// Загрузка данных с сервера
const getData = async () => {
  const response = await fetch(`${BASE_URL}/data`);
  if (!response.ok) {
    throw new Error('Ошибка загрузки данных');
  }
  return await response.json();
};


// Отправка данных на сервер
const sendData = async (data) => {
  const response = await fetch(BASE_URL, {
    method: 'POST',
    body: data,
  });
  if (!response.ok) {
    throw new Error('Ошибка отправки данных');
  }
  return await response.json();
};


export { getData, sendData };
