const BASE_URL = "http://localhost:5000/api/stack";

export async function startLevel(levelId) {
    const res = await fetch(`${BASE_URL}/start/${levelId}`, {
        method: "POST"
    });
    return await res.json();
}

export async function makeMove(from, to) {
    const res = await fetch(`${BASE_URL}/move`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            from: from,
            to: to
        })
    });
    return await res.json();
}
