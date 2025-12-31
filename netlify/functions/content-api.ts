import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

const GITHUB_API = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = process.env.GITHUB_OWNER || 'your-username';
const GITHUB_REPO = process.env.GITHUB_REPO || 'salon-website';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const CONTENT_PATH = 'src/assets/data';

interface GitHubFileResponse {
    content: string;
    sha: string;
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
    // Enable CORS
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Content-Type': 'application/json',
    };

    // Handle preflight
    if (event.httpMethod === 'OPTIONS') {
        return { statusCode: 200, headers, body: '' };
    }

    // Validate environment variables
    const missingVars = [];
    if (!GITHUB_TOKEN) missingVars.push('GITHUB_TOKEN');
    if (!GITHUB_OWNER || GITHUB_OWNER === 'your-username') missingVars.push('GITHUB_OWNER');
    if (!GITHUB_REPO || GITHUB_REPO === 'salon-website') missingVars.push('GITHUB_REPO');

    if (missingVars.length > 0) {
        console.error(`[Error] Missing or default environment variables: ${missingVars.join(', ')}`);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Server configuration error',
                details: `Missing environment variables: ${missingVars.join(', ')}`,
                hint: 'Check your Netlify environment variables settings.'
            }),
        };
    }

    const path = event.path.replace('/.netlify/functions/content-api', '');
    const filename = path.substring(1); // Remove leading slash

    try {
        console.log(`[Request] ${event.httpMethod} for filename: ${filename}`);
        switch (event.httpMethod) {
            case 'GET':
                return await getContent(filename, headers);
            case 'PUT':
                return await updateContent(filename, event.body, headers);
            case 'POST':
                return await createContent(event.body, headers);
            case 'DELETE':
                return await deleteContent(filename, headers);
            default:
                return {
                    statusCode: 405,
                    headers,
                    body: JSON.stringify({ error: 'Method not allowed' }),
                };
        }
    } catch (error: any) {
        console.error('[Fatal Error]:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: error.message || 'Internal server error',
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
                type: error.constructor.name
            }),
        };
    }
};

async function getContent(filename: string, headers: any) {
    const filePath = `${CONTENT_PATH}/${filename}.json`;
    const url = `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`;

    const response = await fetch(url, {
        headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const data: GitHubFileResponse = await response.json();
    const content = Buffer.from(data.content, 'base64').toString('utf-8');

    return {
        statusCode: 200,
        headers,
        body: content,
    };
}

async function updateContent(filename: string, body: string | null, headers: any) {
    if (!body) {
        throw new Error('Request body is required');
    }

    const { content, message } = JSON.parse(body);
    const filePath = `${CONTENT_PATH}/${filename}.json`;

    console.log(`[Config] Owner: ${GITHUB_OWNER}, Repo: ${GITHUB_REPO}, Branch: ${GITHUB_BRANCH}`);
    console.log(`[Update] Target file: ${filePath}`);

    // First, get the current file to obtain its SHA
    const getUrl = `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`;
    console.log(`[Update] Fetching SHA from: ${getUrl}`);

    const getResponse = await fetch(getUrl, {
        headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
        },
    });

    if (!getResponse.ok) {
        const errorText = await getResponse.text();
        console.error(`[Update] Failed to fetch SHA: ${getResponse.status} ${getResponse.statusText}`, errorText);
        throw new Error(`Failed to fetch file SHA: ${getResponse.statusText} (${getResponse.status}). Check if repo owner/name/branch/path are correct in Netlify env.`);
    }

    const fileData: GitHubFileResponse = await getResponse.json();
    console.log(`[Update] Found file SHA: ${fileData.sha}`);

    // Update the file
    const updateUrl = `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
    console.log(`[Update] Sending update to: ${updateUrl}`);

    const updateResponse = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: message || `Update ${filename}.json via Admin Dashboard`,
            content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
            sha: fileData.sha,
            branch: GITHUB_BRANCH,
        }),
    });

    if (!updateResponse.ok) {
        const errorData = await updateResponse.json();
        console.error(`[Update] Update failed:`, errorData);
        throw new Error(`Failed to update file: ${errorData.message || updateResponse.statusText}`);
    }

    console.log(`[Update] Successfully updated ${filename}.json`);

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Content updated successfully' }),
    };
}

async function createContent(body: string | null, headers: any) {
    if (!body) {
        throw new Error('Request body is required');
    }

    const { filename, content, message } = JSON.parse(body);

    if (!filename) {
        throw new Error('Filename is required');
    }

    const filePath = `${CONTENT_PATH}/${filename}.json`;

    // Check if file already exists
    const checkUrl = `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`;
    const checkResponse = await fetch(checkUrl, {
        headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
        },
    });

    if (checkResponse.ok) {
        throw new Error('File already exists');
    }

    // Create the file
    const createUrl = `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
    const createResponse = await fetch(createUrl, {
        method: 'PUT',
        headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: message || `Create ${filename}.json via Admin Dashboard`,
            content: Buffer.from(JSON.stringify(content, null, 2)).toString('base64'),
            branch: GITHUB_BRANCH,
        }),
    });

    if (!createResponse.ok) {
        const errorData = await createResponse.json();
        throw new Error(`Failed to create file: ${errorData.message || createResponse.statusText}`);
    }

    return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ success: true, message: 'Content created successfully' }),
    };
}

async function deleteContent(filename: string, headers: any) {
    const filePath = `${CONTENT_PATH}/${filename}.json`;

    // First, get the file SHA
    const getUrl = `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`;
    const getResponse = await fetch(getUrl, {
        headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
        },
    });

    if (!getResponse.ok) {
        throw new Error(`File not found: ${getResponse.statusText}`);
    }

    const fileData: GitHubFileResponse = await getResponse.json();

    // Delete the file
    const deleteUrl = `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
    const deleteResponse = await fetch(deleteUrl, {
        method: 'DELETE',
        headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            message: `Delete ${filename}.json via Admin Dashboard`,
            sha: fileData.sha,
            branch: GITHUB_BRANCH,
        }),
    });

    if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        throw new Error(`Failed to delete file: ${errorData.message || deleteResponse.statusText}`);
    }

    return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, message: 'Content deleted successfully' }),
    };
}

export { handler };
