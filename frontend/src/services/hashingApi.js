const API_URL = "http://localhost:5000/api/hashing"; 

export const validateHashMove = async (guestId, tableSize, mode, clickedIndex, currentRooms) => {
  
  const occupiedIndices = [];
  
  Object.keys(currentRooms).forEach((key) => {
    const val = currentRooms[key];

    if (val !== undefined) {
      occupiedIndices.push(parseInt(key, 10));
    }
  });

  try {
    const response = await fetch(`${API_URL}/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        guestId: guestId,
        tableSize: tableSize,
        mode: mode,
        clickedIndex: clickedIndex,
        occupiedIndices: occupiedIndices
      }),
    });

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);

    return { isCorrect: false, message: "Server Error" };
  }
};