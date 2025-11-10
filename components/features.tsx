import React from "react";

export function Features() {
	const items = [
		{ title: "Doações locais", desc: "Encontre itens próximos a você." },
		{ title: "Fácil de usar", desc: "Cadastro rápido e comunicação direta." },
		{ title: "Sustentável", desc: "Reduza o desperdício reutilizando itens." },
	];

	return (
		<section className="py-12">
			<div className="max-w-4xl mx-auto px-4">
				<h2 className="text-2xl font-semibold mb-6 text-center">Recursos</h2>
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{items.map((it) => (
						<div key={it.title} className="p-4 bg-white rounded-lg shadow">
							<h3 className="font-semibold mb-2">{it.title}</h3>
							<p className="text-sm text-gray-600">{it.desc}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
}
