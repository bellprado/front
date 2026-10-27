"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import {
  useEffect,
  useState,
} from "react";

type Usuario = {
  nome?: string;
  email?: string;
};

const links = [
  {
    nome: "Início",
    href: "/dashboard",
    icone: "⌂",
  },
  {
    nome: "Crianças",
    href: "/crianca",
    icone: "♡",
  },
  {
    nome: "Agenda",
    href: "/agenda",
    icone: "◷",
  },
  {
    nome: "Cuidados",
    href: "/cuidados",
    icone: "✚",
  },
  {
    nome: "Biblioteca",
    href: "/biblioteca",
    icone: "▤",
  },
  {
    nome: "Fórum",
    href: "/forum",
    icone: "◌",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [menuAberto, setMenuAberto] =
    useState(false);

  const [usuario, setUsuario] =
    useState<Usuario>({
      nome: "Meu perfil",
      email: "",
    });

  /*
    Temporário.

    Depois esse número será fornecido
    pelo backend.
  */
  const notificacoesNaoLidas = 3;

  useEffect(() => {
    const usuarioSalvo =
      localStorage.getItem(
        "elara_usuario"
      );

    if (!usuarioSalvo) {
      return;
    }

    try {
      const dados =
        JSON.parse(usuarioSalvo);

      setUsuario({
        nome:
          dados.nome ||
          "Meu perfil",

        email:
          dados.email || "",
      });
    } catch {
      // Mantém os dados padrão.
    }
  }, []);

  function sair() {
    localStorage.removeItem(
      "elara_usuario"
    );

    setMenuAberto(false);

    router.push("/login");
  }

  function linkAtivo(
    href: string
  ) {
    return (
      pathname === href ||
      pathname.startsWith(
        `${href}/`
      )
    );
  }

  function abrirAcessibilidade() {
    window.dispatchEvent(
      new Event(
        "abrir-acessibilidade"
      )
    );

    setMenuAberto(false);
  }

  const conteudoSidebar = (
    <>
      {/* LOGO */}

      <div className="px-6 pb-7 pt-7">
        <Link
          href="/dashboard"
          onClick={() =>
            setMenuAberto(false)
          }
          className="block"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[16px] bg-[var(--elara-terracota)] text-lg font-black text-white shadow-sm">
              E
            </div>

            <div>
              <p className="text-[22px] font-extrabold tracking-[0.08em] text-[var(--elara-terracota)]">
                ELARA
              </p>

              <p className="mt-[-2px] text-[10px] font-semibold text-[var(--elara-texto-suave)]">
                Cuidando de quem cuida.
              </p>
            </div>
          </div>
        </Link>
      </div>

      {/* NAVEGAÇÃO */}

      <div className="flex flex-1 flex-col overflow-y-auto px-4">
        <p className="mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--elara-texto-muito-suave)]">
          Meu espaço
        </p>

        <nav className="space-y-1.5">
          {links.map((link) => {
            const ativo =
              linkAtivo(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() =>
                  setMenuAberto(false)
                }
                className={`group flex items-center gap-3 rounded-[16px] px-3.5 py-3 text-sm font-bold transition ${
                  ativo
                    ? "bg-[var(--elara-terracota-suave)] text-[var(--elara-terracota-texto)]"
                    : "text-[var(--elara-texto-secundario)] hover:bg-[var(--elara-superficie-hover)] hover:text-[var(--elara-texto)]"
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-[11px] text-lg transition ${
                    ativo
                      ? "bg-[var(--elara-terracota)] text-white shadow-sm"
                      : "bg-[var(--elara-superficie-hover)] text-[var(--elara-texto-secundario)]"
                  }`}
                >
                  {link.icone}
                </span>

                <span>
                  {link.nome}
                </span>

                {ativo && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--elara-terracota)]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* CONTA */}

        <div className="mt-7">
          <p className="mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-[var(--elara-texto-muito-suave)]">
            Conta
          </p>

          {/* NOTIFICAÇÕES */}

          <Link
            href="/notificacoes"
            onClick={() =>
              setMenuAberto(false)
            }
            className={`group flex items-center gap-3 rounded-[16px] px-3.5 py-3 text-sm font-bold transition ${
              linkAtivo(
                "/notificacoes"
              )
                ? "bg-[var(--elara-terracota-suave)] text-[var(--elara-terracota-texto)]"
                : "text-[var(--elara-texto-secundario)] hover:bg-[var(--elara-superficie-hover)]"
            }`}
          >
            <span
              className={`relative flex h-8 w-8 items-center justify-center rounded-[11px] text-base ${
                linkAtivo(
                  "/notificacoes"
                )
                  ? "bg-[var(--elara-terracota)] text-white"
                  : "bg-[var(--elara-amarelo-suave)] text-[var(--elara-amarelo-texto)]"
              }`}
            >
              ◇

              {notificacoesNaoLidas >
                0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-[var(--elara-sidebar)] bg-[var(--elara-terracota)] px-1 text-[8px] font-black leading-none text-white">
                  {notificacoesNaoLidas >
                  9
                    ? "9+"
                    : notificacoesNaoLidas}
                </span>
              )}
            </span>

            <span>
              Notificações
            </span>

            {notificacoesNaoLidas >
              0 &&
              !linkAtivo(
                "/notificacoes"
              ) && (
                <span className="ml-auto rounded-full bg-[var(--elara-terracota-suave)] px-2 py-0.5 text-[9px] font-black text-[var(--elara-terracota-texto)]">
                  {
                    notificacoesNaoLidas
                  }
                </span>
              )}

            {linkAtivo(
              "/notificacoes"
            ) && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--elara-terracota)]" />
            )}
          </Link>

          {/* PERFIL */}

          <Link
            href="/perfil"
            onClick={() =>
              setMenuAberto(false)
            }
            className={`group flex items-center gap-3 rounded-[16px] px-3.5 py-3 text-sm font-bold transition ${
              linkAtivo("/perfil")
                ? "bg-[var(--elara-azul-suave)] text-[var(--elara-azul-texto)]"
                : "text-[var(--elara-texto-secundario)] hover:bg-[var(--elara-superficie-hover)]"
            }`}
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-[11px] bg-[var(--elara-azul-suave)] text-[var(--elara-azul-texto)]">
              ♙
            </span>

            <span>
              Perfil
            </span>

            {linkAtivo(
              "/perfil"
            ) && (
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--elara-azul)]" />
            )}
          </Link>

          {/* ACESSIBILIDADE */}

          <button
            type="button"
            onClick={
              abrirAcessibilidade
            }
            className="group flex w-full items-center gap-3 rounded-[16px] px-3.5 py-3 text-left text-sm font-bold text-[var(--elara-texto-secundario)] transition hover:bg-[var(--elara-superficie-hover)]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-[11px] bg-[var(--elara-verde-suave)] text-[var(--elara-verde-texto)]">
              ♿
            </span>

            Acessibilidade
          </button>
        </div>
      </div>

      {/* CARD DO PERFIL */}

      <div className="m-4 rounded-[20px] border border-[var(--elara-borda)] bg-[var(--elara-sidebar-card)] p-3.5">
        <Link
          href="/perfil"
          onClick={() =>
            setMenuAberto(false)
          }
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--elara-terracota)] text-sm font-extrabold uppercase text-white">
            {usuario.nome
              ?.charAt(0)
              .toUpperCase() ||
              "U"}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-extrabold text-[var(--elara-texto)]">
              {usuario.nome}
            </p>

            <p className="mt-0.5 truncate text-[10px] text-[var(--elara-texto-suave)]">
              Meu perfil
            </p>
          </div>

          <span className="text-[var(--elara-texto-suave)]">
            ›
          </span>
        </Link>

        <button
          type="button"
          onClick={sair}
          className="mt-3 w-full rounded-[12px] border border-[var(--elara-borda)] bg-[var(--elara-superficie)] px-3 py-2 text-xs font-bold text-[var(--elara-texto-secundario)] transition hover:border-[var(--elara-terracota)] hover:text-[var(--elara-terracota)]"
        >
          Sair da conta
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* CABEÇALHO MOBILE */}

      <header className="fixed left-0 right-0 top-0 z-40 flex h-[68px] items-center justify-between border-b border-[var(--elara-borda)] bg-[var(--elara-sidebar)] px-5 md:hidden">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[var(--elara-terracota)] text-sm font-black text-white">
            E
          </div>

          <span className="font-extrabold tracking-[0.08em] text-[var(--elara-terracota)]">
            ELARA
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {/* NOTIFICAÇÕES MOBILE */}

          <Link
            href="/notificacoes"
            aria-label="Notificações"
            className="relative flex h-10 w-10 items-center justify-center rounded-[13px] bg-[var(--elara-amarelo-suave)] text-[var(--elara-amarelo-texto)]"
          >
            ◇

            {notificacoesNaoLidas >
              0 && (
              <span className="absolute -right-1 -top-1 flex h-[17px] min-w-[17px] items-center justify-center rounded-full border-2 border-[var(--elara-sidebar)] bg-[var(--elara-terracota)] px-1 text-[8px] font-black text-white">
                {notificacoesNaoLidas >
                9
                  ? "9+"
                  : notificacoesNaoLidas}
              </span>
            )}
          </Link>

          {/* MENU */}

          <button
            type="button"
            aria-label={
              menuAberto
                ? "Fechar menu"
                : "Abrir menu"
            }
            onClick={() =>
              setMenuAberto(
                (estado) =>
                  !estado
              )
            }
            className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-[var(--elara-terracota-suave)] text-xl font-bold text-[var(--elara-terracota-texto)]"
          >
            {menuAberto
              ? "×"
              : "☰"}
          </button>
        </div>
      </header>

      {/* OVERLAY */}

      {menuAberto && (
        <button
          type="button"
          aria-label="Fechar menu"
          onClick={() =>
            setMenuAberto(false)
          }
          className="fixed inset-0 z-40 bg-[var(--elara-overlay)] backdrop-blur-[2px] md:hidden"
        />
      )}

      {/* SIDEBAR MOBILE */}

      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 flex w-[285px] flex-col border-r border-[var(--elara-borda)] bg-[var(--elara-sidebar)] shadow-2xl transition-transform duration-300 md:hidden ${
          menuAberto
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {conteudoSidebar}
      </aside>

      {/* SIDEBAR DESKTOP */}

      <aside className="sticky top-0 hidden h-screen w-[250px] shrink-0 flex-col border-r border-[var(--elara-borda)] bg-[var(--elara-sidebar)] md:flex">
        {conteudoSidebar}
      </aside>
    </>
  );
}
