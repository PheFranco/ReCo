// @ts-nocheck
import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

app.use("*", cors({ origin: "*" }));
app.use("*", logger(console.log));

const supabase = createClient(
  // Note: runtime Deno env variables expected on server deployment
  Deno?.env?.get("SUPABASE_URL")!,
  Deno?.env?.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// Inicializar bucket de fotos
const BUCKET_NAME = "make-f0497d83-photos";

async function initStorage() {
  try {
    const { data: buckets } =
      await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(
      (bucket) => bucket.name === BUCKET_NAME,
    );
    if (!bucketExists) {
      await supabase.storage.createBucket(BUCKET_NAME, {
        public: false,
        fileSizeLimit: 5242880, // 5MB
      });
      console.log(`Bucket ${BUCKET_NAME} criado com sucesso`);
    }
  } catch (error) {
    console.error("Erro ao inicializar storage:", error);
  }
}

initStorage();

// Rota de registro de usuários
app.post("/make-server-f0497d83/signup", async (c) => {
  try {
    const { email, password, name, userType } =
      await c.req.json();

    if (!email || !password || !name) {
      return c.json(
        { error: "Email, senha e nome são obrigatórios" },
        400,
      );
    }

    const { data, error } =
      await supabase.auth.admin.createUser({
        email,
        password,
        user_metadata: {
          name,
          userType: userType || "recebedor",
        },
        // Confirma automaticamente o email já que não há servidor de email configurado
        email_confirm: true,
      });

    if (error) {
      console.error("Erro ao criar usuário:", error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, user: data.user });
  } catch (error: any) {
    console.error("Erro no signup:", error);
    return c.json(
      { error: error.message || "Erro ao criar conta" },
      500,
    );
  }
});

// Rota para obter mensagens do chat
app.get("/make-server-f0497d83/messages", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const { data: userData, error: authError } =
      await supabase.auth.getUser(accessToken);

    if (!userData?.user?.id) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const messagesData = await kv.getByPrefix("message:");
    const messages = messagesData
      .map((item) => item.value)
      .sort(
        (a: any, b: any) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime(),
      );

    return c.json({ messages });
  } catch (error: any) {
    console.error("Erro ao buscar mensagens:", error);
    return c.json(
      { error: error.message || "Erro ao buscar mensagens" },
      500,
    );
  }
});

// Rota para enviar mensagens no chat
app.post("/make-server-f0497d83/messages", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const { data: userData, error: authError } =
      await supabase.auth.getUser(accessToken);

    if (!userData?.user?.id) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const formData = await c.req.formData();
    const message = formData.get("message") as string;
    const photo = formData.get("photo") as File | null;

    let photoUrl = "";

    if (photo) {
      const fileName = `${Date.now()}_${photo.name}`;
      const arrayBuffer = await photo.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      const { data: uploadData, error: uploadError } =
        await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, buffer, {
            contentType: photo.type,
            upsert: false,
          });

      if (uploadError) {
        console.error(
          "Erro ao fazer upload da foto:",
          uploadError,
        );
        throw new Error("Erro ao fazer upload da foto");
      }

      const { data: signedUrlData } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(fileName, 31536000); // URL válida por 1 ano

      if (signedUrlData?.signedUrl) {
        photoUrl = signedUrlData.signedUrl;
      }
    }

    const messageId = `message:${Date.now()}:${userData.user.id}`;
    const messageData = {
      id: messageId,
      user_id: userData.user.id,
      user_name:
        userData.user.user_metadata?.name ||
        userData.user.email?.split("@")[0] ||
        "Usuário",
      message: message || "",
      photo_url: photoUrl,
      created_at: new Date().toISOString(),
    };

    await kv.set(messageId, messageData);

    return c.json({ success: true, message: messageData });
  } catch (error: any) {
    console.error("Erro ao enviar mensagem:", error);
    return c.json(
      { error: error.message || "Erro ao enviar mensagem" },
      500,
    );
  }
});

// Rota para obter pontos de coleta
app.get(
  "/make-server-f0497d83/collection-points",
  async (c) => {
    try {
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      const { data: userData, error: authError } =
        await supabase.auth.getUser(accessToken);

      if (!userData?.user?.id) {
        return c.json({ error: "Não autorizado" }, 401);
      }

      const pointsData = await kv.getByPrefix("point:");
      const points = pointsData.map((item) => item.value);

      return c.json({ points });
    } catch (error: any) {
      console.error("Erro ao buscar pontos de coleta:", error);
      return c.json(
        { error: error.message || "Erro ao buscar pontos" },
        500,
      );
    }
  },
);

// Rota para adicionar ponto de coleta
app.post(
  "/make-server-f0497d83/collection-points",
  async (c) => {
    try {
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      const { data: userData, error: authError } =
        await supabase.auth.getUser(accessToken);

      if (!userData?.user?.id) {
        return c.json({ error: "Não autorizado" }, 401);
      }

      const { name, address, description, lat, lng } =
        await c.req.json();

      if (
        !name ||
        !address ||
        !description ||
        lat === undefined ||
        lng === undefined
      ) {
        return c.json(
          { error: "Todos os campos são obrigatórios" },
          400,
        );
      }

      const pointId = `point:${Date.now()}:${userData.user.id}`;
      const pointData = {
        id: pointId,
        user_id: userData.user.id,
        name,
        address,
        description,
        lat,
        lng,
        created_at: new Date().toISOString(),
      };

      await kv.set(pointId, pointData);

      return c.json({ success: true, point: pointData });
    } catch (error: any) {
      console.error(
        "Erro ao adicionar ponto de coleta:",
        error,
      );
      return c.json(
        { error: error.message || "Erro ao adicionar ponto" },
        500,
      );
    }
  },
);

// Rota para deletar ponto de coleta
app.delete(
  "/make-server-f0497d83/collection-points/:id",
  async (c) => {
    try {
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      const { data: userData, error: authError } =
        await supabase.auth.getUser(accessToken);

      if (!userData?.user?.id) {
        return c.json({ error: "Não autorizado" }, 401);
      }

      const pointId = c.req.param("id");

      const pointData = await kv.get(pointId);
      if (!pointData) {
        return c.json({ error: "Ponto não encontrado" }, 404);
      }

      // Verificar se o usuário é o dono do ponto
      if (pointData.user_id !== userData.user.id) {
        return c.json(
          {
            error:
              "Você não tem permissão para deletar este ponto",
          },
          403,
        );
      }

      await kv.del(pointId);

      return c.json({ success: true });
    } catch (error: any) {
      console.error("Erro ao deletar ponto de coleta:", error);
      return c.json(
        { error: error.message || "Erro ao deletar ponto" },
        500,
      );
    }
  },
);

// Rota para obter itens de doação do usuário (DEVE VIR ANTES DA ROTA GENÉRICA)
app.get(
  "/make-server-f0497d83/donation-items/my-items",
  async (c) => {
    try {
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      const { data: userData, error: authError } =
        await supabase.auth.getUser(accessToken);

      if (!userData?.user?.id) {
        return c.json({ error: "Não autorizado" }, 401);
      }

      const itemsData = await kv.getByPrefix("donation_item:");
      const items = itemsData
        .map((item) => item.value)
        .filter((item) => item.user_id === userData.user.id)
        .sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime(),
        );

      return c.json({ items });
    } catch (error: any) {
      console.error("Erro ao buscar itens do usuário:", error);
      return c.json(
        { error: error.message || "Erro ao buscar itens" },
        500,
      );
    }
  },
);

// Rota para obter itens de doação
app.get("/make-server-f0497d83/donation-items", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const { data: userData, error: authError } =
      await supabase.auth.getUser(accessToken);

    if (!userData?.user?.id) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const itemsData = await kv.getByPrefix("donation_item:");
    const items = itemsData
      .map((item) => item.value)
      .filter((item) => item.status === "disponível")
      .sort(
        (a: any, b: any) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime(),
      );

    return c.json({ items });
  } catch (error: any) {
    console.error("Erro ao buscar itens de doação:", error);
    return c.json(
      { error: error.message || "Erro ao buscar itens" },
      500,
    );
  }
});

// Rota para criar item de doação
app.post("/make-server-f0497d83/donation-items", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const { data: userData, error: authError } =
      await supabase.auth.getUser(accessToken);

    if (!userData?.user?.id) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const formData = await c.req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const category = formData.get("category") as string;
    const location = formData.get("location") as string;
    const photo = formData.get("photo") as File | null;

    if (!title || !description || !category || !location) {
      return c.json(
        { error: "Todos os campos são obrigatórios" },
        400,
      );
    }

    let photoUrl = "";

    if (photo) {
      const fileName = `donation_${Date.now()}_${photo.name}`;
      const arrayBuffer = await photo.arrayBuffer();
      const buffer = new Uint8Array(arrayBuffer);

      const { data: uploadData, error: uploadError } =
        await supabase.storage
          .from(BUCKET_NAME)
          .upload(fileName, buffer, {
            contentType: photo.type,
            upsert: false,
          });

      if (uploadError) {
        console.error(
          "Erro ao fazer upload da foto:",
          uploadError,
        );
        throw new Error("Erro ao fazer upload da foto");
      }

      const { data: signedUrlData } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(fileName, 31536000); // URL válida por 1 ano

      if (signedUrlData?.signedUrl) {
        photoUrl = signedUrlData.signedUrl;
      }
    }

    const itemId = `donation_item:${Date.now()}:${userData.user.id}`;
    const itemData = {
      id: itemId,
      user_id: userData.user.id,
      user_name:
        userData.user.user_metadata?.name ||
        userData.user.email?.split("@")[0] ||
        "Usuário",
      user_email: userData.user.email,
      title,
      description,
      category,
      location,
      photo_url: photoUrl,
      status: "disponível",
      created_at: new Date().toISOString(),
    };

    await kv.set(itemId, itemData);

    return c.json({ success: true, item: itemData });
  } catch (error: any) {
    console.error("Erro ao criar item de doação:", error);
    return c.json(
      { error: error.message || "Erro ao criar item" },
      500,
    );
  }
});

// Rota para atualizar status do item de doação
app.patch(
  "/make-server-f0497d83/donation-items/:id",
  async (c) => {
    try {
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      const { data: userData, error: authError } =
        await supabase.auth.getUser(accessToken);

      if (!userData?.user?.id) {
        return c.json({ error: "Não autorizado" }, 401);
      }

      const itemId = c.req.param("id");
      const { status } = await c.req.json();

      const itemData = await kv.get(itemId);
      if (!itemData) {
        return c.json({ error: "Item não encontrado" }, 404);
      }

      // Verificar se o usuário é o dono do item
      if (itemData.user_id !== userData.user.id) {
        return c.json(
          {
            error:
              "Você não tem permissão para atualizar este item",
          },
          403,
        );
      }

      const updatedItem = { ...itemData, status };
      await kv.set(itemId, updatedItem);

      return c.json({ success: true, item: updatedItem });
    } catch (error: any) {
      console.error("Erro ao atualizar item de doação:", error);
      return c.json(
        { error: error.message || "Erro ao atualizar item" },
        500,
      );
    }
  },
);

// Rota para deletar item de doação
app.delete(
  "/make-server-f0497d83/donation-items/:id",
  async (c) => {
    try {
      const accessToken = c.req
        .header("Authorization")
        ?.split(" ")[1];
      const { data: userData, error: authError } =
        await supabase.auth.getUser(accessToken);

      if (!userData?.user?.id) {
        return c.json({ error: "Não autorizado" }, 401);
      }

      const itemId = c.req.param("id");

      const itemData = await kv.get(itemId);
      if (!itemData) {
        return c.json({ error: "Item não encontrado" }, 404);
      }

      // Verificar se o usuário é o dono do item
      if (itemData.user_id !== userData.user.id) {
        return c.json(
          {
            error:
              "Você não tem permissão para deletar este item",
          },
          403,
        );
      }

      await kv.del(itemId);

      return c.json({ success: true });
    } catch (error: any) {
      console.error("Erro ao deletar item de doação:", error);
      return c.json(
        { error: error.message || "Erro ao deletar item" },
        500,
      );
    }
  },
);

// Rota para atualizar perfil do usuário
app.patch("/make-server-f0497d83/profile", async (c) => {
  try {
    const accessToken = c.req
      .header("Authorization")
      ?.split(" ")[1];
    const { data: userData, error: authError } =
      await supabase.auth.getUser(accessToken);

    if (!userData?.user?.id) {
      return c.json({ error: "Não autorizado" }, 401);
    }

    const { name } = await c.req.json();

    if (!name || !name.trim()) {
      return c.json({ error: "Nome é obrigatório" }, 400);
    }

    const { data, error } =
      await supabase.auth.admin.updateUserById(
        userData.user.id,
        {
          user_metadata: {
            ...userData.user.user_metadata,
            name: name.trim(),
          },
        },
      );

    if (error) {
      console.error("Erro ao atualizar perfil:", error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, user: data.user });
  } catch (error: any) {
    console.error("Erro ao atualizar perfil:", error);
    return c.json(
      { error: error.message || "Erro ao atualizar perfil" },
      500,
    );
  }
});

Deno.serve(app.fetch);