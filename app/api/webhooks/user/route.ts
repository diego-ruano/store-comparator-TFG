import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

type eventType = 'user.created' | 'user.updated' | 'user.deleted';

interface ClerkUserEvent {
	data: Record<string, unknown>
	type: eventType
	object: 'event'
}

export async function POST(req: Request) {
	// Conseguir y comprobar el webhook secret
	const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
	if (!WEBHOOK_SECRET) {
		return NextResponse.json(
			{ error: 'Webhook secret no configurado' },
			{ status: 500 }
		);
	}

	// Conseguir y comprobar los headers de svix
	const headerPayload = await headers();
	const svix_id = headerPayload.get('svix-id');
	const svix_timestamp = headerPayload.get('svix-timestamp');
	const svix_signature = headerPayload.get('svix-signature');
	if (!svix_id || !svix_timestamp || !svix_signature) {
		return NextResponse.json(
			{ error: 'Faltan headers de Svix' },
			{ status: 400 }
		);
	}

	// Leer la petición y parsearla a JSON
	let payload;
	try {
		payload = await req.json();
	} catch {
		return NextResponse.json(
			{ error: 'Cuerpo de la petición inválido' },
			{ status: 400 }
		);
	}
	const body = JSON.stringify(payload);

	// Crear el webhook y el evento
	const wh = new Webhook(WEBHOOK_SECRET);
	let event: ClerkUserEvent;

	// Verificar que el webhook es válido
	try {
		event = wh.verify(body, {
			'svix-id': svix_id,
			'svix-timestamp': svix_timestamp,
			'svix-signature': svix_signature,
		}) as ClerkUserEvent;
	} catch (err) {
		console.error('Error verificando el webhook:', err);
		return NextResponse.json(
			{ error: 'Firma del webhook inválida' },
			{ status: 400 }
		);
	}

	const eventType = event.type;

	try {
		const userData = event.data;

		// Si hay alguno de estos eventos comprueba si el usuario existe
		if (eventType === 'user.created' || eventType === 'user.updated') {
			const result = await db.execute({
				sql: 'SELECT id FROM users WHERE id = ?',
				args: [userData.id as string]
			});

			// Si no existe el usuario lo crea
			if (result.rows.length === 0) {
				await db.execute({
					sql: 'INSERT INTO users (id, created_at) VALUES (?, ?)',
					args: [userData.id as string, new Date(userData.created_at as number).toISOString()]
				});
			}
		}

		// Borrar el usuario si el evento es user.deleted
		if (eventType === 'user.deleted') {
			try {
				await db.execute({
					sql: 'DELETE FROM users WHERE id = ?',
					args: [userData.id as string]
				});
			} catch {
				console.log(`Intento de borrar usuario ${userData.id as string} que no existía.`);
			}
		}

		return NextResponse.json({ success: true }, { status: 200 });

	} catch (error) {
		console.error('Error procesando el evento:', error);
		return NextResponse.json(
			{ error: 'Error interno del servidor' },
			{ status: 500 }
		);
	}
}