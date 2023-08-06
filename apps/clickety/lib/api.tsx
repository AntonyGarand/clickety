export const API_URL = 'http://localhost:3000/api';

export const doClick = async (x: number, y: number) => {
  const response = await fetch(`${API_URL}/click`, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      x,
      y,
    }),
  });
  await response.text();
};

export const getClicks = async () => {
  const response = await fetch(`${API_URL}/clicks`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};
