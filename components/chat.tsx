import React from "react";

interface ChatProps {
	accessToken: string;
	userId: string;
	initialMessage?: string;
}

export function Chat({ accessToken, userId, initialMessage }: ChatProps) {
	return (
		<div className="min-h-screen flex items-center justify-center py-24">
			<div className="w-full max-w-3xl bg-white p-6 rounded-lg shadow">
				<h2 className="text-xl font-semibold mb-2">Chat (modo stub)</h2>
				<p className="text-sm text-gray-600 mb-4">Este é um stub do componente Chat para desenvolvimento.</p>
				<div className="mb-4">
					<pre className="text-xs bg-gray-100 p-3 rounded">accessToken: {accessToken ? '[present]' : '[empty]'}</pre>
					<pre className="text-xs bg-gray-100 p-3 rounded mt-2">userId: {userId || '[empty]'}</pre>
					<pre className="text-xs bg-gray-100 p-3 rounded mt-2">initialMessage: {initialMessage || '[none]'}</pre>
				</div>
				<button
					className="px-4 py-2 bg-[var(--color-cerrado-gold)] rounded text-[var(--color-cerrado-dark-brown)]"
					onClick={() => alert('Stub: abrir conversa')}
				>
					Abrir conversa (stub)
				</button>
			</div>
		</div>
	);
}

