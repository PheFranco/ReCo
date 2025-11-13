import React from "react";

export function Hero({ onGetStarted }: { onGetStarted?: () => void }) {
	return (
		<section className="pt-28 pb-16 bg-gradient-to-br from-[var(--color-cerrado-cream)] to-white text-center">
			<div className="max-w-4xl mx-auto px-4">
				<h1 className="text-5xl sm:text-6xl font-extrabold mb-4 leading-tight">
					ReCo — reutilize, conecte, transforme
				</h1>
				<p className="text-lg sm:text-xl text-[var(--color-cerrado-brown)] mb-8">
					Uma plataforma simples para conectar doadores e recebedores de itens reutilizáveis. Doe o que não usa
					e dê nova vida a objetos.
				</p>

				<div className="flex items-center justify-center gap-4">
					<button
						onClick={() => onGetStarted && onGetStarted()}
						className="px-8 py-3 bg-[var(--color-cerrado-green)] text-white rounded-full shadow-lg hover:shadow-xl transition"
					>
						Começar
					</button>
					<button
						onClick={() => onGetStarted && onGetStarted()}
						className="px-6 py-3 bg-white border border-[var(--color-cerrado-brown)] text-[var(--color-cerrado-brown)] rounded-full hover:bg-[var(--color-cerrado-cream)] transition"
					>
						Ver Marketplace
					</button>
				</div>

				<div className="mt-10 text-sm text-[var(--color-cerrado-brown)]/70">
					<span className="inline-block mr-2">🌱</span>
					Contribua com sua comunidade — é grátis, seguro e sustentável.
				</div>
			</div>
		</section>
	);
}
