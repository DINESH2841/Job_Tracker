export async function GET() {
	return new Response(JSON.stringify({ error: 'NextAuth disabled' }), { status: 410 })
}

export async function POST() {
	return new Response(JSON.stringify({ error: 'NextAuth disabled' }), { status: 410 })
}
