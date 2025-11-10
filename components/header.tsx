import { Logo, TR3VOSLogo } from "./logo";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerFooter, DrawerClose } from "./ui/drawer";
import { Menu, X } from "lucide-react";

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
          <div className="flex items-center gap-4">
            <Logo />
            <div className="hidden sm:flex flex-col">
              <span className="text-xs text-[var(--color-cerrado-brown)]">Re</span>
              <TR3VOSLogo className="text-xs" />
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-4">
            <button
              onClick={() => onNavigate('home')}
              className="text-sm px-3 py-2 rounded-md hover:bg-[var(--color-cerrado-cream)] transition"
            >
              Início
            </button>
            <button
              onClick={() => onNavigate('about')}
              className="text-sm px-3 py-2 rounded-md hover:bg-[var(--color-cerrado-cream)] transition"
            >
              Sobre
            </button>
            <button
              onClick={() => onNavigate('contact')}
              className="text-sm px-3 py-2 rounded-md hover:bg-[var(--color-cerrado-cream)] transition"
            >
              Contato
            </button>
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => onNavigate('marketplace')}
                  className="text-sm px-3 py-2 rounded-md hover:bg-[var(--color-cerrado-cream)] transition"
                >
                  Marketplace
                </button>
                <button
                  onClick={() => onNavigate('chat')}
                  className="text-sm px-3 py-2 rounded-md hover:bg-[var(--color-cerrado-cream)] transition"
                >
                  Chat
                </button>
                <button
                  onClick={() => onNavigate('map')}
                  className="text-sm px-3 py-2 rounded-md hover:bg-[var(--color-cerrado-cream)] transition"
                >
                  Mapa
                </button>
                <button
                  onClick={() => onNavigate('profile')}
                  className="text-sm px-3 py-2 rounded-md hover:bg-[var(--color-cerrado-cream)] transition"
                >
                  Perfil
                </button>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 bg-[var(--color-cerrado-brown)] text-white rounded-lg text-sm hover:bg-[var(--color-cerrado-dark-brown)] transition-shadow shadow-sm"
                >
                  Sair
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate('login')}
                className="px-4 py-2 bg-gradient-to-br from-[var(--color-cerrado-gold)] to-[var(--color-cerrado-dark-gold)] text-[var(--color-cerrado-dark-brown)] rounded-lg text-sm shadow-md"
              >
                Entrar
              </button>
            )}
          </nav>

          {/* Mobile: drawer menu */}
          <div className="md:hidden">
            <Drawer>
              <DrawerTrigger asChild>
                <button className="p-2 bg-[var(--color-cerrado-cream)] rounded-md">
                  <Menu className="w-5 h-5 text-[var(--color-cerrado-brown)]" />
                </button>
              </DrawerTrigger>

              <DrawerContent className="data-[vaul-drawer-direction=right]:w-80">
                <DrawerHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Logo />
                      <TR3VOSLogo />
                    </div>
                    <DrawerClose asChild>
                      <button className="p-2 rounded-md hover:bg-[var(--color-cerrado-cream)]">
                        <X className="w-5 h-5 text-[var(--color-cerrado-brown)]" />
                      </button>
                    </DrawerClose>
                  </div>
                </DrawerHeader>

                <nav className="flex flex-col gap-3 p-4">
                  <button onClick={() => onNavigate('home')} className="text-left py-2 px-3 rounded-md hover:bg-[var(--color-cerrado-cream)]">Início</button>
                  <button onClick={() => onNavigate('about')} className="text-left py-2 px-3 rounded-md hover:bg-[var(--color-cerrado-cream)]">Sobre</button>
                  <button onClick={() => onNavigate('contact')} className="text-left py-2 px-3 rounded-md hover:bg-[var(--color-cerrado-cream)]">Contato</button>
                  {isLoggedIn ? (
                    <>
                      <button onClick={() => onNavigate('marketplace')} className="text-left py-2 px-3 rounded-md hover:bg-[var(--color-cerrado-cream)]">Marketplace</button>
                      <button onClick={() => onNavigate('chat')} className="text-left py-2 px-3 rounded-md hover:bg-[var(--color-cerrado-cream)]">Chat</button>
                      <button onClick={() => onNavigate('map')} className="text-left py-2 px-3 rounded-md hover:bg-[var(--color-cerrado-cream)]">Mapa</button>
                      <button onClick={() => onNavigate('profile')} className="text-left py-2 px-3 rounded-md hover:bg-[var(--color-cerrado-cream)]">Perfil</button>
                      <button onClick={onLogout} className="mt-2 px-3 py-2 bg-[var(--color-cerrado-brown)] text-white rounded-md">Sair</button>
                    </>
                  ) : (
                    <button onClick={() => onNavigate('login')} className="mt-2 px-3 py-2 bg-gradient-to-br from-[var(--color-cerrado-gold)] to-[var(--color-cerrado-dark-gold)] text-[var(--color-cerrado-dark-brown)] rounded-md">Entrar</button>
                  )}
                </nav>

                <DrawerFooter>
                  <div className="text-sm text-[var(--color-cerrado-brown)]/80 px-4">Versão dev • ReCo</div>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>
    </header>
  );
}
