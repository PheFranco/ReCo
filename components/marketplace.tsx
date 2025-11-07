import { useState, useEffect } from "react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { Plus, Package, MapPin, User, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { toast } from "sonner";

interface MarketplaceProps {
  accessToken: string;
  userId: string;
  onContactDonor: (donorId: string, donorName: string, itemTitle: string) => void;
}

interface DonationItem {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  title: string;
  description: string;
  category: string;
  location: string;
  photo_url: string;
  status: string;
  created_at: string;
}

const CATEGORIES = [
  "Eletrônicos",
  "Móveis",
  "Roupas",
  "Livros",
  "Brinquedos",
  "Decoração",
  "Eletrodomésticos",
  "Materiais de Construção",
  "Outros",
];

const CATEGORY_COLORS: Record<string, string> = {
  "Eletrônicos": "bg-blue-100 text-blue-800",
  "Móveis": "bg-amber-100 text-amber-800",
  "Roupas": "bg-purple-100 text-purple-800",
  "Livros": "bg-green-100 text-green-800",
  "Brinquedos": "bg-pink-100 text-pink-800",
  "Decoração": "bg-indigo-100 text-indigo-800",
  "Eletrodomésticos": "bg-red-100 text-red-800",
  "Materiais de Construção": "bg-gray-100 text-gray-800",
  "Outros": "bg-slate-100 text-slate-800",
};

export function Marketplace({ accessToken, userId, onContactDonor }: MarketplaceProps) {
  const [items, setItems] = useState<DonationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f0497d83/donation-items`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao buscar itens");
      }

      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error("Erro ao buscar itens:", error);
      toast.error("Erro ao carregar itens de doação");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !category || !location) {
      toast.error("Preencha todos os campos");
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("location", location);
      if (photo) {
        formData.append("photo", photo);
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-f0497d83/donation-items`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao criar item");
      }

      const data = await response.json();
      
      toast.success("Item cadastrado com sucesso!");
      setIsDialogOpen(false);
      
      // Reset form
      setTitle("");
      setDescription("");
      setCategory("");
      setLocation("");
      setPhoto(null);
      
      // Refresh items
      fetchItems();
    } catch (error) {
      console.error("Erro ao criar item:", error);
      toast.error("Erro ao cadastrar item");
    } finally {
      setSubmitting(false);
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
        throw new Error("Erro ao deletar item");
      }

      toast.success("Item excluído com sucesso!");
      fetchItems();
    } catch (error) {
      console.error("Erro ao deletar item:", error);
      toast.error("Erro ao excluir item");
    }
  };

  const filteredItems = selectedCategory === "all" 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-[var(--color-cerrado-light-beige)] pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-[var(--color-cerrado-dark-brown)] mb-2">
                Marketplace de Doações
              </h1>
              <p className="text-[var(--color-cerrado-brown)]">
                Conecte-se com doadores e recebedores de materiais recicláveis
              </p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[var(--color-cerrado-green)] hover:bg-[var(--color-cerrado-green)]/90 text-white">
                  <Plus className="mr-2 h-4 w-4" />
                  Cadastrar Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Cadastrar Item para Doação</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do item que você deseja doar
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Título do Item</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Cadeira de escritório"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="location">Localização</Label>
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Ex: Brasília, DF"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Descreva o item, seu estado de conservação, etc."
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="photo">Foto do Item (opcional)</Label>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      className="bg-[var(--color-cerrado-green)] hover:bg-[var(--color-cerrado-green)]/90"
                      disabled={submitting}
                    >
                      {submitting ? "Cadastrando..." : "Cadastrar"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              onClick={() => setSelectedCategory("all")}
              size="sm"
              className={selectedCategory === "all" ? "bg-[var(--color-cerrado-brown)]" : ""}
            >
              Todos
            </Button>
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                size="sm"
                className={selectedCategory === cat ? "bg-[var(--color-cerrado-brown)]" : ""}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-[var(--color-cerrado-brown)]">Carregando itens...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-[var(--color-cerrado-brown)]/30 mb-4" />
            <p className="text-[var(--color-cerrado-brown)]">
              {selectedCategory === "all" 
                ? "Nenhum item disponível no momento" 
                : "Nenhum item nesta categoria"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {item.photo_url && (
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    <img
                      src={item.photo_url}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <Badge className={CATEGORY_COLORS[item.category] || "bg-gray-100 text-gray-800"}>
                      {item.category}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-[var(--color-cerrado-brown)]">
                      <MapPin className="h-4 w-4 mr-2" />
                      {item.location}
                    </div>
                    <div className="flex items-center text-[var(--color-cerrado-brown)]">
                      <User className="h-4 w-4 mr-2" />
                      {item.user_name}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  {item.user_id === userId ? (
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  ) : (
                    <Button
                      className="w-full bg-[var(--color-cerrado-gold)] hover:bg-[var(--color-cerrado-dark-gold)] text-[var(--color-cerrado-dark-brown)]"
                      onClick={() => onContactDonor(item.user_id, item.user_name, item.title)}
                    >
                      Entrar em Contato
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
