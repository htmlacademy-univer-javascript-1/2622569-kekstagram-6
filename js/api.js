const BASE_URL = 'https://29.javascript.htmlacademy.pro/kekstagram';

const Route = {
  GET_DATA: '/data',
  SEND_DATA: '',
};

async function request(route, options = {}) {
  const response = await fetch(`${BASE_URL}${route}`, options);

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const getData = () => request(Route.GET_DATA);

export const sendData = (body) =>
  request(Route.SEND_DATA, { method: 'POST', body });
