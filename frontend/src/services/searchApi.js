const BASE_URL = "http://localhost:5000/api/search";

export async function startLevel(levelId) {
    const response = await fetch(`${BASE_URL}/start/${levelId}`, {
        method: "POST"
    });
    return await response.json();
}

export async function clickBox(index) {
    const response = await fetch(`${BASE_URL}/click/${index}`, {
        method: "POST"
    });
    return await response.json();
}
