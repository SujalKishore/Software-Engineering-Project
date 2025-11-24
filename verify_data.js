
async function verify() {
    const endpoints = [
        'http://127.0.0.1:3002/api/orders',
        'http://127.0.0.1:3002/api/inventory',
        'http://127.0.0.1:3002/api/dispatch',
        'http://127.0.0.1:3002/api/scrap'
    ];

    // Wait a bit for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));

    for (const url of endpoints) {
        try {
            const res = await fetch(url);
            if (!res.ok) {
                console.error(`Failed to fetch ${url}: ${res.status} ${res.statusText}`);
                try {
                    const text = await res.text();
                    console.error('Response body:', text.substring(0, 200));
                } catch (e) { }
                continue;
            }
            const data = await res.json();
            if (Array.isArray(data)) {
                console.log(`${url}: ${data.length} records`);
            } else if (data && typeof data === 'object') {
                if (Array.isArray(data.data)) {
                    console.log(`${url}: ${data.data.length} records (in .data)`);
                } else {
                    console.log(`${url}: Received object keys: ${Object.keys(data).join(', ')}`);
                }
            } else {
                console.log(`${url}: Received ${typeof data}`);
            }
        } catch (error) {
            console.error(`Error fetching ${url}:`, error.message);
        }
    }
}

verify();
