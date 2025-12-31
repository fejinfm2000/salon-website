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

    if (!GITHUB_TOKEN) {
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'GitHub token not configured' }),
        };
    }

    const path = event.path.replace('/.netlify/functions/content-api', '');
    const filename = path.substring(1); // Remove leading slash

    try {
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
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: error.message || 'Internal server error' }),
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

    // First, get the current file to obtain its SHA
    const getUrl = `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}?ref=${GITHUB_BRANCH}`;
    const getResponse = await fetch(getUrl, {
        headers: {
            Authorization: `token ${GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
        },
    });

    if (!getResponse.ok) {
        throw new Error(`Failed to fetch file SHA: ${getResponse.statusText}`);
    }

    const fileData: GitHubFileResponse = await getResponse.json();

    // Update the file
    const updateUrl = `${GITHUB_API}/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
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
        throw new Error(`Failed to update file: ${errorData.message || updateResponse.statusText}`);
    }

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
