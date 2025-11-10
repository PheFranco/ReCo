import React from "react";
import { apiLogin } from "../utils/api";

interface AuthProps {
	onLoginSuccess: (token: string, id: string) => void;
}

export function Auth({ onLoginSuccess }: AuthProps) {
		const handleFakeLogin = async () => {
			// Tenta usar o backend Python se disponível (VITE_API_URL), senão faz fallback fake
			try {
				const res = await apiLogin("dev@reco.local");
				if (res?.access_token && res?.user_id) {
					onLoginSuccess(res.access_token, res.user_id);
					return;
				}
			} catch (err) {
				// ignore e usa fallback
				// console.warn('apiLogin failed', err);
			}

			// Fallback local
			onLoginSuccess("fake-token-123", "user-abc-1");
		};

	return (
		<div className="min-h-screen flex items-center justify-center py-20">
			<div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
				<h2 className="text-2xl font-semibold mb-4">Entrar</h2>
				<p className="mb-6 text-sm text-gray-600">Use o botão abaixo para simular um login (modo dev).</p>
				<button
					onClick={handleFakeLogin}
					className="px-4 py-2 bg-[var(--color-cerrado-gold)] rounded text-[var(--color-cerrado-dark-brown)]"
				>
					Simular login
				</button>
			</div>
		</div>
	);
}

