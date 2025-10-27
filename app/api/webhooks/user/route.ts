import { Webhook } from 'svix';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

type eventType = 'user.created' | 'user.updated' | 'user.deleted';

interface ClerkUserEvent {
	data: Record<string, any>
	type: eventType
	object: 'event'
}

export async function POST(req: Request) {
	console.log('Recibiendo el wekhook de clerk')
	const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

	if (!WEBHOOK_SECRET) {
		console.error('CLERK_WEBHOOK_SECRET no está configurado');
		return NextResponse.json(
			{ error: 'Webhook secret no configurado' },
			{ status: 500 }
		);
	}

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

	let payload;
	try {
		payload = await req.json();
	} catch (err) {
		console.error('Error parseando JSON:', err);
		return NextResponse.json(
			{ error: 'Cuerpo de la petición inválido' },
			{ status: 400 }
		);
	}

	const body = JSON.stringify(payload);

	const wh = new Webhook(WEBHOOK_SECRET);
	let event: ClerkUserEvent;

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
		const eventType = event.type;
		const userData = event.data;

		if (eventType === 'user.created' || eventType === 'user.updated') {
			const existingUser = await prisma.users.findUnique({
				where: { id: userData.id },
			});

			if (!existingUser) {
				await prisma.users.create({
					data: {
						id: userData.id,
						created_at: new Date(userData.created_at),
					},
				});
			}
		}

		if (eventType === 'user.deleted') {
			try {
				await prisma.users.delete({
					where: { id: userData.id },
				});
			} catch (error) {
				console.log(`Intento de borrar usuario ${userData.id} que no existía.`);
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