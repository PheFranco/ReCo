import React, { useState } from "react";
import { toast } from "sonner";
import { apiContact } from "../utils/api";

interface RegisterProps {
  onRegisterSuccess: (token: string, id: string, role?: string) => void;
}

export function Register({ onRegisterSuccess }: RegisterProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [role, setRole] = useState<"doador" | "recebedor">("doador");
  const [doadorType, setDoadorType] = useState<"pf" | "ong">("pf");
  const [razao, setRazao] = useState("");
  const [recebedorSubtype, setRecebedorSubtype] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Preencha todos os campos");
      return;
    }
    setSubmitting(true);
    try {
      // Simples envio para backend de dev; servidor pode responder com ok
      await apiContact({ type: "register", name, email, role, doadorType, razao, recebedorSubtype });
      toast.success("Cadastro realizado. Você foi logado.");
      // enviar role para App para persistência
      onRegisterSuccess("fake-token-123", "user-registered-1", role);
    } catch (err) {
      console.debug("Erro no registro:", err);
      toast.error("Erro ao cadastrar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-20">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h2 className="text-2xl font-semibold mb-4">Cadastre-se</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Nome</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Senha</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>

          <div>
            <label className="block text-sm mb-1">Tipo de perfil</label>
            <div className="flex gap-4">
              <label className="text-sm"><input type="radio" name="role" checked={role === 'doador'} onChange={() => setRole('doador')} /> Doador</label>
              <label className="text-sm"><input type="radio" name="role" checked={role === 'recebedor'} onChange={() => setRole('recebedor')} /> Recebedor</label>
            </div>
          </div>

          {role === 'doador' && (
            <div>
              <label className="block text-sm mb-1">Sou (doador)</label>
              <div className="flex gap-4 items-center">
                <label><input type="radio" name="doador_type" checked={doadorType === 'pf'} onChange={() => setDoadorType('pf')} /> Pessoa física</label>
                <label><input type="radio" name="doador_type" checked={doadorType === 'ong'} onChange={() => setDoadorType('ong')} /> ONG / Empresa</label>
              </div>
              {doadorType === 'ong' && (
                <div className="mt-2">
                  <label className="block text-sm mb-1">Razão social</label>
                  <input value={razao} onChange={(e) => setRazao(e.target.value)} className="w-full border rounded px-3 py-2" />
                </div>
              )}
            </div>
          )}

          {role === 'recebedor' && (
            <div>
              <label className="block text-sm mb-1">Tipo de recebedor</label>
              <select value={recebedorSubtype} onChange={(e) => setRecebedorSubtype(e.target.value)} className="w-full border rounded px-3 py-2">
                <option value="ong">ONG</option>
                <option value="artista">Artista</option>
                <option value="conserto_pc">Consertador de PC</option>
                <option value="outro">Pessoa física</option>
              </select>
            </div>
          )}
          <div className="flex justify-end">
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-[var(--color-cerrado-green)] text-white rounded">
              {submitting ? "Cadastrando..." : "Cadastrar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;
