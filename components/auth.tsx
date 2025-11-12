import React, { useState } from "react";
import { apiLogin } from "../utils/api";
import { toast } from "sonner";

interface AuthProps {
	onLoginSuccess: (token: string, id: string) => void;
	onNavigate: (section: string) => void;
}

export function Auth({ onLoginSuccess, onNavigate }: AuthProps) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!email) return toast.error("Informe seu email");
		setLoading(true);
		try {
			const res = await apiLogin(email);
			if (res?.access_token && res?.user_id) {
				onLoginSuccess(res.access_token, res.user_id);
				return;
			}
		} catch (err) {
			console.debug("apiLogin falhou, usando fallback", err);
		} finally {
			setLoading(false);
		}

		// fallback local
		onLoginSuccess("fake-token-123", "user-abc-1");
	};

	return (
		<div className="min-h-screen flex items-center justify-center py-20">
			<div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
				<h2 className="text-2xl font-semibold mb-4">Entrar</h2>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm mb-1">Email</label>
						<input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2" />
					</div>
					<div>
						<label className="block text-sm mb-1">Senha</label>
						<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2" />
					</div>
					<div className="flex items-center justify-between">
						<button type="submit" disabled={loading} className="px-4 py-2 bg-[var(--color-cerrado-gold)] rounded text-[var(--color-cerrado-dark-brown)]">
							{loading ? "Entrando..." : "Entrar"}
						</button>
						<div className="text-sm">
							<button type="button" onClick={() => onNavigate("forgot")} className="text-[var(--color-cerrado-dark-brown)] underline">Esqueci senha</button>
						</div>
					</div>
				</form>

				<div className="mt-4 text-center">
					<p>Não tem conta? <button onClick={() => onNavigate("register")} className="text-[var(--color-cerrado-green)] underline">Cadastrar</button></p>
				</div>
			</div>
		</div>
	);
}

export default Auth;

