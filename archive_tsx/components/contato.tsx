import React from "react";

export function Contact() {
	return (
		<section id="contact" className="py-16 bg-[var(--color-cerrado-light-brown)]/10">
			<div className="max-w-3xl mx-auto px-4 text-center">
				<h2 className="text-2xl font-semibold mb-4">Contato</h2>
				<p className="text-gray-700 mb-6">
					Se tiver dúvidas ou quiser colaborar, entre em contato conosco.
				</p>
				<a href="mailto:contato@reco.example" className="text-[var(--color-cerrado-gold)] underline">
					contato@reco.example
				</a>
			</div>
		</section>
	);
}

