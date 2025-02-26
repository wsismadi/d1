
// Worker code (index.js)
export default {
    async fetch(request, env) {
        const { method } = request;
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        if (method === 'GET') {
            const { results } = await env.DB.prepare('SELECT * FROM users').all();
            return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
        }

        if (method === 'POST') {
            const { name, email } = await request.json();
            await env.DB.prepare('INSERT INTO users (name, email) VALUES (?, ?)').bind(name, email).run();
            return new Response('Created', { status: 201 });
        }

        if (method === 'DELETE' && id) {
            await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
            return new Response('Deleted', { status: 200 });
        }

        return new Response('Not Found', { status: 404 });
    }
};

// SQL DDL for D1 Database
// CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT);
