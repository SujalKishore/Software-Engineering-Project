import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);

export async function GET() {
    try {
        // Path to the python script
        // Assuming the script is in d:\se\ai_ml\genetic_algorithm.py
        // We need to resolve the absolute path based on the project root
        // Since we are in src/app/api/ai/optimize, we need to go up to the root

        // Hardcoding the path as per the user's workspace for reliability in this specific environment
        // In a real app, we'd use process.cwd() and path.join
        const scriptPath = 'd:\\se\\ai_ml\\genetic_algorithm.py';

        const { stdout, stderr } = await execPromise(`python "${scriptPath}"`);

        if (stderr) {
            console.warn('Python script stderr:', stderr);
        }

        try {
            const data = JSON.parse(stdout);
            return NextResponse.json(data);
        } catch (parseError) {
            console.error('Failed to parse Python output:', stdout);
            return NextResponse.json({ error: 'Failed to parse AI output' }, { status: 500 });
        }

    } catch (error) {
        console.error('Error executing AI script:', error);
        return NextResponse.json({ error: 'Failed to execute AI optimization' }, { status: 500 });
    }
}
