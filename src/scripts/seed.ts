const fetchSeedAPI = async () => {
    const res = await fetch('http://localhost:3000/api/seed', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer bbae9587-5b23-4cd0-9411-c42a361a6f10`
        },
    })
}

fetchSeedAPI()