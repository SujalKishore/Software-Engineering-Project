const fs = require('fs');
const path = require('path');

try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (!fs.existsSync(envPath)) {
        console.log(".env file NOT found!");
        process.exit(1);
    }

    const envContent = fs.readFileSync(envPath, 'utf8');
    const envVars = {};
    envContent.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            envVars[parts[0].trim()] = parts[1].trim();
        }
    });

    console.log("GOOGLE_CLIENT_ID set:", !!envVars['GOOGLE_CLIENT_ID']);
    console.log("GOOGLE_CLIENT_SECRET set:", !!envVars['GOOGLE_CLIENT_SECRET']);
    console.log("NEXTAUTH_SECRET set:", !!envVars['NEXTAUTH_SECRET']);
    console.log("NEXTAUTH_URL set:", !!envVars['NEXTAUTH_URL']);

} catch (err) {
    console.error("Error reading .env:", err);
}
