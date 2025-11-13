import React, { useState } from "react";
import { toast } from "sonner";
import { apiContact } from "../utils/api";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email) {
      toast.error("Informe seu email");
      return;
    }
    setSending(true);
    try {
      await apiContact({ type: "forgot_password", email });
      toast.success("Email enviado com instruções (simulado)");
      setEmail("");
    } catch (err) {
      console.debug("Erro forgot password:", err);
      toast.error("Erro ao enviar email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-20">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-4">Recuperar senha</h2>
        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={sending} className="px-4 py-2 bg-[var(--color-cerrado-gold)] rounded text-[var(--color-cerrado-dark-brown)]">
              {sending ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
