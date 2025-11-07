import { useState, useEffect } from "react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { getSupabaseClient } from "../utils/supabase/client";
import { User, Mail, Package, Edit2, Save, X, UserCircle } from "lucide-react";
import { toast } from "sonner";

interface ProfileProps {
  accessToken: string;
  userId: string;
}

interface UserProfile {
  name: string;
  email: string;
  userType: "doador" | "recebedor";
}

interface DonationItem {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  photo_url: string;
  status: string;
  created_at: string;
}

export function Profile({ accessToken, userId }: ProfileProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [myDonations, setMyDonations] = useState<DonationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
    loadMyDonations();
  }, []);

  const loadProfile = async () => {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.auth.getUser(accessToken);

      if (error) throw error;

      if (data?.user) {
        setProfile({
          name: data.user.user_metadata?.name || "Usuário",
          email: data.user.email || "",
          userType: data.user.user_metadata?.userType || "recebedor",
        });
        setEditedName(data.user.user_metadata?.name || "Usuário");
      }
    } catch (error: any) {
      console.error("Erro ao carregar perfil:", error);
      toast.error("Erro ao carregar perfil");
    } finally {
      setLoading(false);
    }
  };

  const loadMyDonations = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f0497d83/donation-items/my-items`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao carregar doações");
      }

      const data = await response.json();
      setMyDonations(data.items || []);
    } catch (error: any) {
      console.error("Erro ao carregar minhas doações:", error);
    }
  };

  const handleSaveProfile = async () => {
    if (!editedName.trim()) {
      toast.error("Nome não pode estar vazio");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f0497d83/profile`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            name: editedName,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao atualizar perfil");
      }

      setProfile({ ...profile!, name: editedName });
      setEditMode(false);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error: any) {
      console.error("Erro ao salvar perfil:", error);
      toast.error("Erro ao atualizar perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm("Tem certeza que deseja excluir este item?")) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f0497d83/donation-items/${itemId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao excluir item");
      }

      setMyDonations(myDonations.filter((item) => item.id !== itemId));
      toast.success("Item excluído com sucesso!");
    } catch (error: any) {
      console.error("Erro ao excluir item:", error);
      toast.error("Erro ao excluir item");
    }
  };

  const handleMarkAsDonated = async (itemId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f0497d83/donation-items/${itemId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            status: "doado",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao atualizar status");
      }

      setMyDonations(
        myDonations.map((item) =>
          item.id === itemId ? { ...item, status: "doado" } : item
        )
      );
      toast.success("Item marcado como doado!");
    } catch (error: any) {
      console.error("Erro ao atualizar status:", error);
      toast.error("Erro ao atualizar status");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 bg-gradient-to-br from-[var(--color-cerrado-cream)] to-[var(--color-cerrado-light-cream)]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[var(--color-cerrado-dark-brown)]">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-4 bg-gradient-to-br from-[var(--color-cerrado-cream)] to-[var(--color-cerrado-light-cream)]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-red-600">Erro ao carregar perfil</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen pt-32 pb-20 px-4 bg-gradient-to-br from-[var(--color-cerrado-cream)] to-[var(--color-cerrado-light-cream)]">
      <div className="max-w-4xl mx-auto">
        {/* Cabeçalho do Perfil */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gradient-to-br from-[var(--color-cerrado-gold)] to-[var(--color-cerrado-brown)] rounded-full flex items-center justify-center">
                <UserCircle className="w-12 h-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl text-[var(--color-cerrado-dark-brown)] mb-2">
                  Meu Perfil
                </h1>
                <p className="text-[var(--color-cerrado-brown)]">
                  Gerencie suas informações e doações
                </p>
              </div>
            </div>
            {!editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-[var(--color-cerrado-gold)] text-[var(--color-cerrado-dark-brown)] rounded-lg hover:bg-[var(--color-cerrado-dark-gold)] transition-colors flex items-center gap-2"
              >
                <Edit2 className="w-4 h-4" />
                Editar
              </button>
            )}
          </div>

          {/* Informações do Perfil */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-[var(--color-cerrado-cream)] rounded-lg">
              <User className="w-5 h-5 text-[var(--color-cerrado-brown)]" />
              {editMode ? (
                <div className="flex-1 flex items-center gap-2">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="flex-1 px-3 py-2 border-2 border-[var(--color-cerrado-gold)]/30 rounded-lg focus:border-[var(--color-cerrado-gold)] focus:outline-none"
                  />
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-4 py-2 bg-[var(--color-cerrado-green)] text-white rounded-lg hover:bg-[var(--color-cerrado-green)]/90 transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Salvando..." : "Salvar"}
                  </button>
                  <button
                    onClick={() => {
                      setEditMode(false);
                      setEditedName(profile.name);
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-[var(--color-cerrado-brown)]">Nome</p>
                  <p className="text-[var(--color-cerrado-dark-brown)]">{profile.name}</p>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 p-4 bg-[var(--color-cerrado-cream)] rounded-lg">
              <Mail className="w-5 h-5 text-[var(--color-cerrado-brown)]" />
              <div>
                <p className="text-sm text-[var(--color-cerrado-brown)]">Email</p>
                <p className="text-[var(--color-cerrado-dark-brown)]">{profile.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-[var(--color-cerrado-cream)] rounded-lg">
              <Package className="w-5 h-5 text-[var(--color-cerrado-brown)]" />
              <div>
                <p className="text-sm text-[var(--color-cerrado-brown)]">Tipo de Usuário</p>
                <p className="text-[var(--color-cerrado-dark-brown)] capitalize">
                  {profile.userType}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Minhas Doações (apenas para doadores) */}
        {profile.userType === "doador" && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-6 h-6 text-[var(--color-cerrado-brown)]" />
              <h2 className="text-2xl text-[var(--color-cerrado-dark-brown)]">
                Minhas Doações
              </h2>
            </div>

            {myDonations.length === 0 ? (
              <div className="text-center py-12 text-[var(--color-cerrado-brown)]">
                <Package className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p>Você ainda não cadastrou nenhum item para doação.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myDonations.map((item) => (
                  <div
                    key={item.id}
                    className="border-2 border-[var(--color-cerrado-gold)]/30 rounded-xl p-4 hover:border-[var(--color-cerrado-gold)] transition-all"
                  >
                    {item.photo_url && (
                      <img
                        src={item.photo_url}
                        alt={item.title}
                        className="w-full h-48 object-cover rounded-lg mb-4"
                      />
                    )}
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg text-[var(--color-cerrado-dark-brown)]">
                        {item.title}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.status === "disponível"
                            ? "bg-[var(--color-cerrado-green)] text-white"
                            : "bg-gray-400 text-white"
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="text-sm text-[var(--color-cerrado-brown)] mb-2 line-clamp-2">
                      {item.description}
                    </p>
                    <p className="text-xs text-[var(--color-cerrado-brown)]/70 mb-4">
                      📍 {item.location}
                    </p>

                    <div className="flex gap-2">
                      {item.status === "disponível" && (
                        <button
                          onClick={() => handleMarkAsDonated(item.id)}
                          className="flex-1 px-4 py-2 bg-[var(--color-cerrado-green)] text-white rounded-lg hover:bg-[var(--color-cerrado-green)]/90 transition-colors text-sm"
                        >
                          Marcar como Doado
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Mensagem para recebedores */}
        {profile.userType === "recebedor" && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center py-8">
              <Package className="w-16 h-16 mx-auto mb-4 text-[var(--color-cerrado-brown)]" />
              <h2 className="text-2xl text-[var(--color-cerrado-dark-brown)] mb-2">
                Explore o Marketplace
              </h2>
              <p className="text-[var(--color-cerrado-brown)] mb-4">
                Como recebedor, você pode navegar pelos itens disponíveis e entrar em
                contato com os doadores.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
