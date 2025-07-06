// netlify/functions/get-supabase-config.js
// Fonction serverless pour récupérer la configuration Supabase de manière sécurisée

exports.handler = async (event, context) => {
    // Vérification de la méthode HTTP
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    // Gérer les requêtes OPTIONS pour CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            },
            body: ''
        };
    }

    try {
        // Parser le body de la requête
        const { accessKey } = JSON.parse(event.body || '{}');
        
        // Vérifier la clé d'accès
        if (accessKey !== 'emailsortpro-2025') {
            return {
                statusCode: 401,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ error: 'Unauthorized' })
            };
        }

        // Récupérer les variables d'environnement
        const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
        const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

        // Vérifier que les variables sont définies
        if (!supabaseUrl || !supabaseAnonKey) {
            console.error('Supabase configuration not found in environment variables');
            return {
                statusCode: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                body: JSON.stringify({ 
                    error: 'Server configuration error',
                    message: 'Supabase configuration not found'
                })
            };
        }

        // Retourner la configuration
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Cache-Control': 'no-cache, no-store, must-revalidate'
            },
            body: JSON.stringify({
                url: supabaseUrl,
                anonKey: supabaseAnonKey
            })
        };
        
    } catch (error) {
        console.error('Function error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            body: JSON.stringify({ 
                error: 'Internal Server Error',
                message: error.message
            })
        };
    }
};
