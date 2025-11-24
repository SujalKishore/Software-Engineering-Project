
async function verifyPagination() {
    const endpoints = [
        'http://localhost:3006/api/orders',
        'http://localhost:3006/api/inventory',
        'http://localhost:3006/api/dispatch',
        'http://localhost:3006/api/scrap'
    ];

    for (const url of endpoints) {
        console.log(`Testing ${url}...`);
        try {
            // Test default (limit 20)
            const res1 = await fetch(url);
            const data1 = await res1.json();
            console.log(`  Default: Got ${data1.data.length} records, Total: ${data1.total}`);

            if (data1.data.length !== 20) {
                console.error(`  ERROR: Expected 20 records, got ${data1.data.length}`);
            }

            // Test limit 5
            const res2 = await fetch(`${url}?limit=5`);
            const data2 = await res2.json();
            console.log(`  Limit 5: Got ${data2.data.length} records`);
            if (data2.data.length !== 5) {
                console.error(`  ERROR: Expected 5 records, got ${data2.data.length}`);
            }

            // Test offset
            const res3 = await fetch(`${url}?limit=5&offset=5`);
            const data3 = await res3.json();
            console.log(`  Offset 5: Got ${data3.data.length} records`);

            // Check if data is different (simple check)
            if (JSON.stringify(data2.data) === JSON.stringify(data3.data)) {
                console.error(`  ERROR: Data with offset 5 is same as first 5 (Pagination might be broken)`);
            } else {
                console.log(`  Offset seems to work (data matches expected behavior)`);
            }

        } catch (error) {
            console.error(`  Failed to fetch ${url}:`, error.message);
        }
    }
}

verifyPagination();
