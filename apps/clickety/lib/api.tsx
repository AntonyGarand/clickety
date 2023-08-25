export const API_URL = process.env.API_URL || 'http://localhost:3001/api' || 'http://5.78.40.178:3000/api';

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
  const response = await fetch(`${API_URL}/clicks?key=${window.location.hash.substring(1)}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  return await response.json();
};
