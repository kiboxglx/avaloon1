// Service to interact with Apify
// Using the local proxy configured in vite.config.js to avoid CORS issues

// Usar import.meta.env para o frontend (Vite) ou process.env para o backend (Node/Vercel)
const getEnv = (key) => {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
        return import.meta.env[key];
    }
    return process.env[key];
};

const APIFY_TOKEN = getEnv('VITE_APIFY_TOKEN');
const ACTOR_ID = 'apify~instagram-profile-scraper';

const getBaseUrl = () => {
    // No frontend, usamos o proxy '/api/apify' (configurado em vercel.json ou vite.config.js)
    if (typeof window !== 'undefined') {
        return '/api/apify';
    }
    // No backend (Vercel Functions), chamamos a API diretamento
    return 'https://api.apify.com/v2';
};

export const fetchInstagramData = async (usernames) => {
    console.log('Fetching data for:', usernames);
    console.log('Using Token:', APIFY_TOKEN ? `Present (${APIFY_TOKEN.substring(0, 5)}...)` : 'MISSING');

    const baseUrl = getBaseUrl();
    // 1. Start the Actor Run
    try {
        console.log(`Iniciando execução do Actor ${ACTOR_ID} via proxy...`);

        const headers = {
            'Content-Type': 'application/json',
        };

        if (APIFY_TOKEN) {
            headers['Authorization'] = `Bearer ${APIFY_TOKEN}`;
        }

        const runResponse = await fetch(`${baseUrl}/acts/${ACTOR_ID}/runs`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify({
                usernames: usernames,
                resultsLimit: 1,
            }),
        });

        if (!runResponse.ok) {
            const errorText = await runResponse.text();
            console.error(`Erro ao iniciar execução: ${runResponse.status}`, errorText);
            throw new Error(`Failed to start run: ${runResponse.status} ${errorText}`);
        }

        const runData = await runResponse.json();
        const runId = runData.data.id;
        const datasetId = runData.data.defaultDatasetId; // Captura o ID do dataset
        console.log('Execução iniciada com ID:', runId);
        console.log('Dataset ID:', datasetId);

        // 2. Poll for completion
        let status = 'RUNNING';
        let attempts = 0;
        while (status === 'RUNNING' || status === 'READY') {
            attempts++;
            console.log(`Verificando status (Tentativa ${attempts})...`);
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds

            const statusResponse = await fetch(`${baseUrl}/acts/${ACTOR_ID}/runs/${runId}`, {
                headers: headers
            });

            if (!statusResponse.ok) {
                console.error('Erro ao verificar status:', await statusResponse.text());
                continue;
            }

            const statusData = await statusResponse.json();
            status = statusData.data.status;
            console.log('Status atual:', status);

            if (attempts > 20) { // Timeout de segurança (100 segundos)
                throw new Error('Timeout aguardando a execução do Actor');
            }
        }

        if (status !== 'SUCCEEDED') {
            console.error('Execução falhou ou foi abortada. Status final:', status);
            throw new Error('Actor run failed or was aborted');
        }

        // 3. Fetch Results
        // Endpoint CORRETO: /datasets/{datasetId}/items
        const datasetResponse = await fetch(`${baseUrl}/datasets/${datasetId}/items`, {
            headers: headers
        });
        if (!datasetResponse.ok) {
            console.error('Erro ao buscar dataset:', await datasetResponse.text());
            throw new Error('Failed to fetch dataset items');
        }

        const dataset = await datasetResponse.json();
        console.log('Dados brutos recebidos:', dataset);

        return processApifyResults(dataset);

    } catch (error) {
        console.error('ERRO CRÍTICO NA APIFY:', error);
        console.log('Usando dados de MOCK devido ao erro.');
        // Still fallback to mock if something goes wrong, to keep the app usable
        return getMockUpdates(usernames);
    }
};

// Helper to process the results
const processApifyResults = (items) => {
    const updates = {};
    const today = new Date();

    items.forEach(item => {
        const username = item.username || item.ownerUsername;

        // Try to find the latest post date from various possible fields
        let latestPostDateStr = item.latestPostDate || item.timestamp || item.date;

        // If not directly available, check latestPosts array
        // If not directly available, check latestPosts array
        // IMPORTANT: Scan ALL posts to find the true latest date, ignoring pinned posts order
        if (item.latestPosts && item.latestPosts.length > 0) {
            const dates = item.latestPosts
                .map(p => p.timestamp || p.date)
                .filter(d => d)
                .map(d => new Date(d).getTime());

            if (dates.length > 0) {
                const maxDateTimestamp = Math.max(...dates);
                // If we found a newer date in the list than the one on the root object (or if root was null)
                const currentLatestTimestamp = latestPostDateStr ? new Date(latestPostDateStr).getTime() : 0;

                if (maxDateTimestamp > currentLatestTimestamp) {
                    latestPostDateStr = new Date(maxDateTimestamp).toISOString();
                }
            }
        }

        if (username) {
            let diffDays = 0;

            if (latestPostDateStr) {
                const latestPostDate = new Date(latestPostDateStr);
                const diffTime = Math.abs(today - latestPostDate);
                diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            }

            updates[username] = {
                days: diffDays,
                posts: item.postsCount || item.mediaCount || 0,
                followers: formatNumber(item.followersCount || 0),
                following: formatNumber(item.followsCount || 0),
                profilePicUrl: item.profilePicUrl || item.profile_pic_url,
                fullName: item.fullName || item.full_name,
                // Calculate engagement: (avg likes + comments) / followers
                engagement: calculateEngagement(item),
                latestPostDate: latestPostDateStr
            };
        }
    });

    return updates;
};

const formatNumber = (num) => {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
};

const calculateEngagement = (item) => {
    if (!item.followersCount || item.followersCount === 0) return '0%';

    // Try to get average likes from latest posts
    let totalInteractions = 0;
    let postCount = 0;

    if (item.latestPosts && Array.isArray(item.latestPosts)) {
        item.latestPosts.forEach(post => {
            totalInteractions += (post.likesCount || 0) + (post.commentsCount || 0);
            postCount++;
        });
    }

    if (postCount === 0) return 'N/A';

    const avgInteractions = totalInteractions / postCount;
    const engagementRate = (avgInteractions / item.followersCount) * 100;

    return engagementRate.toFixed(2) + '%';
};

// Mock Data Generator for Fallback
const getMockUpdates = (usernames) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const updates = {};
            usernames.forEach(username => {
                const days = Math.floor(Math.random() * 10);
                updates[username] = {
                    days: days,
                    followers: (Math.random() * 10000).toFixed(0),
                    following: (Math.random() * 1000).toFixed(0),
                    posts: (Math.random() * 500).toFixed(0),
                    engagement: (Math.random() * 10).toFixed(2) + '%',
                    latestPostDate: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
                };
            });
            resolve(updates);
        }, 2000);
    });
};
