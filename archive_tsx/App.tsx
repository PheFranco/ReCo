import React, { useState, useEffect } from "react";
import { getSupabaseClient } from "./utils/supabase/client";
import { Header } from "./components/header";
import { Hero } from "./components/hero";
import { About } from "./components/about";
import { Features } from "./components/features";
import { Contact } from "./components/contato";
import { Auth } from "./components/auth";
import { Register } from "./components/register";
import { ForgotPassword } from "./components/forgotPassword";
import { Chat } from "./components/chat";
import { MapView } from "./components/mapview";
import { Marketplace } from "./components/marketplace";
import { Profile } from "./components/profile";
import { Toaster } from "sonner";

export default function App() {
  const DEBUG_RENDER = false; // set to true for debugging
  const [currentSection, setCurrentSection] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [userId, setUserId] = useState("");
  const [userRole, setUserRole] = useState<string | null>(null);
  const [chatInitialMessage, setChatInitialMessage] = useState("");

  useEffect(() => {
    // Verificar se há sessão ativa
    checkSession();
  }, []);

  const checkSession = async () => {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getSession();
    if (data?.session?.access_token && data?.session?.user?.id) {
      setAccessToken(data.session.access_token);
      setUserId(data.session.user.id);
      setIsLoggedIn(true);
      // try to load role from localStorage if present
      const storedRole = localStorage.getItem('reco_role');
      if (storedRole) setUserRole(storedRole);
      return;
    }

    // fallback: check localStorage (simple dev/session persistence)
    const token = localStorage.getItem('reco_token');
    const id = localStorage.getItem('reco_userId');
    const role = localStorage.getItem('reco_role');
    if (token && id) {
      setAccessToken(token);
      setUserId(id);
      setUserRole(role);
      setIsLoggedIn(true);
    }
  };

  const handleLoginSuccess = (token: string, id: string, role?: string) => {
    setAccessToken(token);
    setUserId(id);
    setIsLoggedIn(true);
    if (role) {
      setUserRole(role);
      localStorage.setItem('reco_role', role);
    }
    // persist simple session for dev
    try { localStorage.setItem('reco_token', token); localStorage.setItem('reco_userId', id); } catch (e) {}
    // Após login, ir direto para o perfil do usuário
    setCurrentSection("profile");
  };

  const handleLogout = async () => {
    const supabase = getSupabaseClient();
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setAccessToken("");
    setUserId("");
    setUserRole(null);
    try { localStorage.removeItem('reco_token'); localStorage.removeItem('reco_userId'); localStorage.removeItem('reco_role'); } catch(e){}
    setCurrentSection("home");
  };

  const handleNavigate = (section: string) => {
    // Limpar mensagem inicial do chat quando navegar para outra seção
    if (section !== "chat") {
      setChatInitialMessage("");
    }
    setCurrentSection(section);
  };

  const handleGetStarted = () => {
    if (isLoggedIn) {
      setCurrentSection("marketplace");
    } else {
      setCurrentSection("login");
    }
  };

  const handleContactDonor = (donorId: string, donorName: string, itemTitle: string) => {
    // Preparar mensagem inicial mencionando o item e o doador
    const message = `Olá ${donorName}, tenho interesse no item "${itemTitle}". Podemos conversar?`;
    setChatInitialMessage(message);
    setCurrentSection("chat");
  };

  if (DEBUG_RENDER) {
    return (
      <div style={{padding:32,fontFamily:'system-ui'}}>
        <h1 style={{color:'#8B4513'}}>ReCo — Debug Mode</h1>
        <p>O React foi montado com sucesso. Use os botões abaixo para testar navegação.</p>
        <div style={{marginTop:16,display:'flex',gap:8}}>
          <button onClick={() => setCurrentSection('home')}>Home</button>
          <button onClick={() => setCurrentSection('login')}>Login</button>
          <button onClick={() => setCurrentSection('marketplace')}>Marketplace</button>
          <button onClick={() => setCurrentSection('chat')}>Chat</button>
        </div>
        <div style={{marginTop:24}}>
          <pre>currentSection: {currentSection}</pre>
          <pre>isLoggedIn: {String(isLoggedIn)}</pre>
          <pre>accessToken: {accessToken ? '[present]' : '[empty]'}</pre>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Toaster position="top-right" richColors />
      <Header 
        onNavigate={handleNavigate} 
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />
      
      {currentSection === "home" && (
        <>
          <Hero onGetStarted={handleGetStarted} />
          <About />
          <Features />
          <Contact />
        </>
      )}
      
      {currentSection === "about" && (
        <>
          <div className="pt-20">
            <About />
          </div>
          <Features />
        </>
      )}
      
      {currentSection === "contact" && (
        <div className="pt-20">
          <Contact />
        </div>
      )}
      
      {currentSection === "login" && (
        <Auth onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />
      )}

      {currentSection === "register" && (
        <Register onRegisterSuccess={handleLoginSuccess} />
      )}

      {currentSection === "forgot" && (
        <ForgotPassword />
      )}
      
      {currentSection === "marketplace" && isLoggedIn && (
        <Marketplace 
          accessToken={accessToken} 
          userId={userId} 
          onContactDonor={handleContactDonor}
        />
      )}
      
      {currentSection === "chat" && isLoggedIn && (
        <Chat 
          accessToken={accessToken} 
          userId={userId} 
          initialMessage={chatInitialMessage}
        />
      )}
      
      {currentSection === "map" && isLoggedIn && (
        <MapView accessToken={accessToken} />
      )}
      
      {currentSection === "profile" && isLoggedIn && (
        <Profile accessToken={accessToken} userId={userId} />
      )}

      <footer className="bg-[var(--color-cerrado-dark-brown)] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="mb-4">
            <span className="text-2xl">
              <span className="text-[var(--color-cerrado-gold)]">Re</span>
              <span className="text-[var(--color-cerrado-green)]">Co</span>
            </span>
            <span className="mx-4 text-white/30">|</span>
            <span className="text-xl">TR3VOS</span>
          </div>
          <p className="text-white/70">
            Re-utiliza e Co-necta - Juntos por um futuro mais sustentável
          </p>
          <p className="text-white/50 text-sm mt-4">
            © 2024 ReCo by TR3VOS. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
