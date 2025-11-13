import React from "react";

export function MapView({ accessToken }: { accessToken?: string }) {
	return (
		<section className="min-h-screen pt-28 pb-12">
			<div className="max-w-4xl mx-auto px-4 text-center">
				<h2 className="text-2xl font-semibold mb-4">Mapa</h2>
				<p className="text-gray-600 mb-4">Mapa de doações (stub). Integre com um mapa real quando necessário.</p>
				<div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
					<span className="text-sm text-gray-500">Placeholder do mapa</span>
				</div>
			</div>
		</section>
	);
}
