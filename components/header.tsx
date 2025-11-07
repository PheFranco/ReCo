import { Logo, TR3VOSLogo } from "./logo";

interface HeaderProps {
  onNavigate: (section: string) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
}

export function Header({ onNavigate, isLoggedIn, onLogout }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-6">
            <Logo />
            <div className="hidden sm:block w-px h-8 bg-[var(--color-cerrado-brown)]/20"></div>
            <TR3VOSLogo className="hidden sm:block text-sm" />
          </div>
          
          <nav className="flex items-center gap-6">
            <button 
              onClick={() => onNavigate('home')} 
              className="text-sm hover:text-[var(--color-cerrado-brown)] transition-colors"
            >
              Início
            </button>
            <button 
              onClick={() => onNavigate('about')} 
              className="text-sm hover:text-[var(--color-cerrado-brown)] transition-colors"
            >
              Sobre
            </button>
            <button 
              onClick={() => onNavigate('contact')} 
              className="text-sm hover:text-[var(--color-cerrado-brown)] transition-colors"
            >
              Contato
            </button>
            {isLoggedIn ? (
              <>
                <button 
                  onClick={() => onNavigate('marketplace')} 
                  className="text-sm hover:text-[var(--color-cerrado-brown)] transition-colors"
                >
                  Marketplace
                </button>
                <button 
                  onClick={() => onNavigate('chat')} 
                  className="text-sm hover:text-[var(--color-cerrado-brown)] transition-colors"
                >
                  Chat
                </button>
                <button 
                  onClick={() => onNavigate('map')} 
                  className="text-sm hover:text-[var(--color-cerrado-brown)] transition-colors"
                >
                  Mapa
                </button>
                <button 
                  onClick={() => onNavigate('profile')} 
                  className="text-sm hover:text-[var(--color-cerrado-brown)] transition-colors"
                >
                  Perfil
                </button>
                <button 
                  onClick={onLogout} 
                  className="px-4 py-2 bg-[var(--color-cerrado-brown)] text-white rounded-lg text-sm hover:bg-[var(--color-cerrado-dark-brown)] transition-colors"
                >
                  Sair
                </button>
              </>
            ) : (
              <button 
                onClick={() => onNavigate('login')} 
                className="px-4 py-2 bg-[var(--color-cerrado-gold)] text-[var(--color-cerrado-dark-brown)] rounded-lg text-sm hover:bg-[var(--color-cerrado-dark-gold)] transition-colors"
              >
                Entrar
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
