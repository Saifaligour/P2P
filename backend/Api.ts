const BASE_URL = 'https://d95e-2401-4900-883d-69c8-1535-6972-6fd8-1860.ngrok-free.app/api/group';

export const addGroupDetails = async (groupData: any) => {
  try {
    const response = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(groupData),
    });
    if (!response.ok) throw new Error('Failed to add group');
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const fetchGroupDetails = async (roomId: string) => {
  try {
    const response = await fetch(`${BASE_URL}/${roomId}`);
    if (!response.ok) throw new Error('Failed to fetch group');
    return await response.json();
  } catch (error) {
    throw error;
  }
};