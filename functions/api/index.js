
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
    
 
// Method POST
if (path === '/api/' && method === 'POST') {
    try {
        const { name, email } = await request.json();
        await DB.prepare("INSERT INTO users (name, email) VALUES (?, ?)").bind(name, email).run();
        return new Response('Data added', { status: 201 });
    } catch (error) {
        return new Response(`Error: ${error.message}`, { status: 500, headers: corsHeaders });
    }
}

// Method PUT
if (path.startsWith('/api/') && method === 'PUT') {
    // const id = path.split('/').pop();
    const id = url.searchParams.get('id'); // Mengambil ID dari query parameter

    try {
        const { name, email } = await request.json();
        console.log(`PUT request - ID: ${id}, Name: ${name}, Email: ${email}`);
        await DB.prepare("UPDATE users SET name = ?, email = ? WHERE id = ?").bind(name, email, id).run();
        return new Response('Data updated', { status: 200 });
    } catch (error) {
        return new Response(`Error: ${error.message}`, { status: 500, headers: corsHeaders });
    }
}

if (path === '/api/' && method === 'DELETE') {
    const url = new URL(request.url);
    const id = url.searchParams.get('id'); // Mengambil ID dari query parameter
    console.log(`DELETE request - ID: ${id}`); // Logging ID

    if (!id) {
        return new Response('ID not provided', { status: 400, headers: corsHeaders });
    }
    try {
        const result = await DB.prepare("DELETE FROM users WHERE id = ?").bind(id).run();
        // Cek apakah ada baris yang terpengaruh (dihapus)
        if (result.changes === 0) {
            return new Response('No data found to delete', { status: 404, headers: corsHeaders });
        }
        return new Response('Data deleted', { status: 200, headers: corsHeaders });
    } catch (error) {
        console.error('Error during DELETE:', error);
        return new Response(`Error: ${error.message}`, { status: 500, headers: corsHeaders });
    }
}



    return new Response('Not Found', { status: 404 });
}