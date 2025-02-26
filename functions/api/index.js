
export async function onRequest(context) {
    const { DB } = context.env;
    const { request } = context;
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };
    

    if (method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: corsHeaders
        });
    }
    

    if (path === '/api/' && method === 'GET') {
        const { results } = await DB.prepare("SELECT * FROM users").all();
        return Response.json(results);
    }
    
    if (path === '/api/' && method === 'POST') {
        const { key } = await request.json();
        await DB.prepare("INSERT INTO users (name, email) VALUES (?)").bind(key).run();
        return new Response('Data added', { status: 201 });
    }

    if (path.startsWith('/api/') && method === 'PUT') {
        const id = path.split('/').pop();
        const { key } = await request.json();
        console.log(`PUT request - ID: ${id}, Key: ${key}`); // Log data

        await DB.prepare("UPDATE users SET key = ? WHERE id = ?").bind(key, id).run();
        return new Response('Data updated', { status: 200 });
    }

    if (path.startsWith('/api/') && method === 'DELETE') {
        const id = path.split('/')[3]; // Mengambil ID dari URL
        console.log(`DELETE request - ID: ${id}`); // Log ID

        try {
            await DB.prepare("DELETE FROM users WHERE id = ?").bind(id).run();
            return new Response('Data deleted', { status: 200, headers: corsHeaders });
        } catch (error) {
            return new Response(`Error: ${error.message}`, { status: 500, headers: corsHeaders });
        }
    }
    

    return new Response('Not Found', { status: 404 });
}