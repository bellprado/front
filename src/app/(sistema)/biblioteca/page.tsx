"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../../components/Sidebar";

type Aba = "biblioteca" | "direitos";

type Artigo = {
  id: number;
  categoria: string;
  titulo: string;
  resumo: string;
  conteudo: string;
};

type Direito = {
  id: number;
  categoria: string;
  titulo: string;
  resumo: string;
  descricao: string;
  orientacao: string;
};

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "");

const categoriasBiblioteca = [
  "Todas",
  "Desenvolvimento",
  "Cuidados",
  "Apoio",
  "Escola",
  "Organização",
];

const categoriasDireitos = [
  "Todos",
  "Educação",
  "Saúde",
  "Benefícios",
  "Assistência",
  "Proteção",
];

export default function BibliotecaPage() {
  const [aba, setAba] = useState<Aba>("biblioteca");
  const [artigos, setArtigos] = useState<Artigo[]>([]);
  const [direitos, setDireitos] = useState<Direito[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [categoria, setCategoria] = useState("Todas");

  const [artigoAbertoId, setArtigoAbertoId] = useState<
    number | null
  >(null);

  const [direitoAbertoId, setDireitoAbertoId] = useState<
    number | null
  >(null);

  const [favoritosArtigos, setFavoritosArtigos] = useState<
    number[]
  >([]);

  const [favoritosDireitos, setFavoritosDireitos] = useState<
    number[]
  >([]);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("aba") === "direitos") {
      setAba("direitos");
      setCategoria("Todos");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    async function carregarConteudos() {
      setCarregando(true);
      setErro("");
      try {
        const [respostaArtigos, respostaDireitos] = await Promise.all([
          fetch(`${API_URL}/artigos`, { signal: controller.signal, cache: "no-store" }),
          fetch(`${API_URL}/direitos`, { signal: controller.signal, cache: "no-store" }),
        ]);
        if (!respostaArtigos.ok || !respostaDireitos.ok) {
          throw new Error("Não foi possível carregar os conteúdos.");
        }
        const [dadosArtigos, dadosDireitos]: [unknown, unknown] = await Promise.all([
          respostaArtigos.json(), respostaDireitos.json(),
        ]);
        if (!Array.isArray(dadosArtigos) || !Array.isArray(dadosDireitos)) {
          throw new Error("A API retornou um formato inesperado.");
        }
        if (!controller.signal.aborted) {
          setArtigos(dadosArtigos as Artigo[]);
          setDireitos(dadosDireitos as Direito[]);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setErro(error instanceof Error ? error.message : "Erro ao carregar conteúdos.");
        }
      } finally {
        if (!controller.signal.aborted) setCarregando(false);
      }
    }
    void carregarConteudos();
    return () => controller.abort();
  }, []);

  function mudarAba(novaAba: Aba) {
    setAba(novaAba);
    setBusca("");
    setCategoria(novaAba === "biblioteca" ? "Todas" : "Todos");
  }

  function favoritarArtigo(id: number) {
    setFavoritosArtigos((atuais) =>
      atuais.includes(id)
        ? atuais.filter((item) => item !== id)
        : [...atuais, id]
    );
  }

  function favoritarDireito(id: number) {
    setFavoritosDireitos((atuais) =>
      atuais.includes(id)
        ? atuais.filter((item) => item !== id)
        : [...atuais, id]
    );
  }

  const artigosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    return artigos.filter((artigo) => {
      const combinaBusca =
        artigo.titulo.toLowerCase().includes(termo) ||
        artigo.resumo.toLowerCase().includes(termo) ||
        artigo.conteudo.toLowerCase().includes(termo);

      const combinaCategoria =
        categoria === "Todas" ||
        artigo.categoria === categoria;

      return combinaBusca && combinaCategoria;
    });
  }, [busca, categoria, artigos]);

  const direitosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase().trim();

    return direitos.filter((direito) => {
      const combinaBusca =
        direito.titulo.toLowerCase().includes(termo) ||
        direito.resumo.toLowerCase().includes(termo) ||
        direito.descricao.toLowerCase().includes(termo) ||
        direito.orientacao.toLowerCase().includes(termo);

      const combinaCategoria =
        categoria === "Todos" ||
        direito.categoria === categoria;

      return combinaBusca && combinaCategoria;
    });
  }, [busca, categoria, direitos]);

  const artigoAberto = artigos.find(
    (artigo) => artigo.id === artigoAbertoId
  );

  const direitoAberto = direitos.find(
    (direito) => direito.id === direitoAbertoId
  );

  const categorias =
    aba === "biblioteca"
      ? categoriasBiblioteca
      : categoriasDireitos;

  const quantidadeResultados =
    aba === "biblioteca"
      ? artigosFiltrados.length
      : direitosFiltrados.length;

  return (
    <div className="min-h-screen bg-[#F8F5F1] text-[#2C3E44] md:flex">
      <Sidebar />

      <main className="min-w-0 flex-1 pt-[68px] md:pt-0">
        <div className="mx-auto max-w-[1450px] px-5 py-7 sm:px-7 lg:px-10 lg:py-10">
          {/* CABEÇALHO */}

          <header>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#D97D64]" />

              <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#D97D64]">
                Informação e orientação
              </p>
            </div>

            <h1 className="text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
              Conteúdos
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#718187]">
              Informação para apoiar decisões, organizar a rotina e
              conhecer direitos importantes para sua família.
            </p>
          </header>

          {/* ABAS PRINCIPAIS */}

          <section className="mt-8 grid gap-4 md:grid-cols-2">
            <button
              type="button"
              onClick={() => mudarAba("biblioteca")}
              className={`relative overflow-hidden rounded-[28px] border p-6 text-left transition ${
                aba === "biblioteca"
                  ? "border-[#D1E2EA] bg-[#E7F0F4] shadow-sm"
                  : "border-[#EAE4DE] bg-white hover:border-[#D1E2EA]"
              }`}
            >
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-[16px] text-xl ${
                      aba === "biblioteca"
                        ? "bg-white text-[#6B93A6]"
                        : "bg-[#E7F0F4] text-[#6B93A6]"
                    }`}
                  >
                    ▤
                  </span>

                  {aba === "biblioteca" && (
                    <span className="rounded-full bg-white px-3 py-1 text-[10px] font-extrabold text-[#638A9E]">
                      SELECIONADO
                    </span>
                  )}
                </div>

                <p className="mt-6 text-xs font-bold text-[#6F94A6]">
                  Informação e apoio
                </p>

                <h2 className="mt-1 text-2xl font-extrabold">
                  Biblioteca
                </h2>

                <p className="mt-2 max-w-md text-xs leading-5 text-[#71858E]">
                  Artigos sobre rotina, desenvolvimento, cuidados,
                  escola, organização e rede de apoio.
                </p>

                <p className="mt-5 text-xs font-extrabold text-[#638A9E]">
                  {artigos.length} conteúdos disponíveis
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => mudarAba("direitos")}
              className={`relative overflow-hidden rounded-[28px] border p-6 text-left transition ${
                aba === "direitos"
                  ? "border-[#EBC8BE] bg-[#F7E4DF] shadow-sm"
                  : "border-[#EAE4DE] bg-white hover:border-[#EBC8BE]"
              }`}
            >
              <div className="relative z-10">
                <div className="flex items-start justify-between">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-[16px] text-xl ${
                      aba === "direitos"
                        ? "bg-white text-[#C06852]"
                        : "bg-[#F7E4DF] text-[#C06852]"
                    }`}
                  >
                    §
                  </span>

                  {aba === "direitos" && (
                    <span className="rounded-full bg-white px-3 py-1 text-[10px] font-extrabold text-[#BF6751]">
                      SELECIONADO
                    </span>
                  )}
                </div>

                <p className="mt-6 text-xs font-bold text-[#C06A54]">
                  Direitos e orientação
                </p>

                <h2 className="mt-1 text-2xl font-extrabold">
                  Direitos
                </h2>

                <p className="mt-2 max-w-md text-xs leading-5 text-[#7E716D]">
                  Informações sobre educação, saúde, benefícios,
                  assistência e proteção.
                </p>

                <p className="mt-5 text-xs font-extrabold text-[#BF6751]">
                  {direitos.length} informações disponíveis
                </p>
              </div>
            </button>
          </section>

          {/* BUSCA */}

          <section className="mt-6 rounded-[28px] border border-[#EAE4DE] bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#F8F5F1] text-lg text-[#7FA2B8]">
                ⌕
              </span>

              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder={
                  aba === "biblioteca"
                    ? "Buscar um conteúdo..."
                    : "Buscar um direito ou benefício..."
                }
                className="w-full bg-transparent text-sm font-semibold outline-none placeholder:font-normal placeholder:text-[#A2ACAF]"
              />

              {busca && (
                <button
                  type="button"
                  onClick={() => setBusca("")}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F8F5F1] text-sm font-bold text-[#8B989C]"
                >
                  ×
                </button>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {categorias.map((item) => {
                const selecionada = categoria === item;

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategoria(item)}
                    className={`rounded-full px-4 py-2 text-xs font-extrabold transition ${
                      selecionada
                        ? aba === "biblioteca"
                          ? "bg-[#7FA2B8] text-white"
                          : "bg-[#D97D64] text-white"
                        : "border border-[#E3DDD7] bg-[#FCFBF9] text-[#718086] hover:bg-[#F8F5F1]"
                    }`}
                  >
                    {item}
                  </button>
                );
              })}
            </div>
          </section>

          {/* RESULTADOS */}

          <section className="mt-8">
            <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <p
                  className={`text-xs font-bold ${
                    aba === "biblioteca"
                      ? "text-[#7FA2B8]"
                      : "text-[#D97D64]"
                  }`}
                >
                  {aba === "biblioteca"
                    ? "Biblioteca ELARA"
                    : "Direitos e benefícios"}
                </p>

                <h2 className="mt-1 text-2xl font-extrabold">
                  {aba === "biblioteca"
                    ? "Conteúdos disponíveis"
                    : "Informações disponíveis"}
                </h2>
              </div>

              <p className="text-xs font-bold text-[#8B989C]">
                {quantidadeResultados}{" "}
                {quantidadeResultados === 1
                  ? "resultado"
                  : "resultados"}
              </p>
            </div>

            {carregando ? (
              <p role="status" className="rounded-[28px] bg-white p-8 text-sm text-[#718086]">Carregando conteúdos...</p>
            ) : erro ? (
              <div role="alert" className="rounded-[28px] border border-[#EBCFC7] bg-white p-8">
                <h3 className="font-extrabold text-[#C36851]">Não foi possível carregar a Biblioteca</h3>
                <p className="mt-2 text-sm text-[#718086]">{erro} Verifique a conexão e a disponibilidade da API.</p>
              </div>
            ) : quantidadeResultados === 0 ? (
              <div className="rounded-[28px] border border-dashed border-[#DAD3CC] bg-white/60 p-10 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#E7F0F4] text-xl text-[#7FA2B8]">
                  ⌕
                </div>

                <h3 className="mt-5 text-lg font-extrabold">
                  Nada encontrado
                </h3>

                <p className="mt-2 text-sm text-[#819095]">
                  Tente outra palavra ou escolha uma categoria
                  diferente.
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setBusca("");
                    setCategoria(
                      aba === "biblioteca" ? "Todas" : "Todos"
                    );
                  }}
                  className="mt-5 text-sm font-extrabold text-[#D97D64]"
                >
                  Limpar filtros
                </button>
              </div>
            ) : aba === "biblioteca" ? (
              /* ARTIGOS */

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {artigosFiltrados.map((artigo, indice) => {
                  const favorito = favoritosArtigos.includes(
                    artigo.id
                  );

                  return (
                    <article
                      key={artigo.id}
                      className="group flex min-h-[290px] flex-col rounded-[28px] border border-[#D8E5EB] bg-white p-6 transition hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(44,62,68,0.07)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="rounded-full bg-[#E7F0F4] px-3 py-1 text-[10px] font-extrabold uppercase text-[#638A9E]">
                          {artigo.categoria}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            favoritarArtigo(artigo.id)
                          }
                          aria-label="Favoritar conteúdo"
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-lg transition ${
                            favorito
                              ? "bg-[#F7E4DF] text-[#D97D64]"
                              : "bg-[#F8F5F1] text-[#9AA5A9]"
                          }`}
                        >
                          {favorito ? "♥" : "♡"}
                        </button>
                      </div>

                      <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#A1ABAE]">
                        Leitura {indice + 1}
                      </p>

                      <h3 className="mt-2 text-xl font-extrabold leading-7">
                        {artigo.titulo}
                      </h3>

                      <p className="mt-3 flex-1 text-sm leading-6 text-[#718086]">
                        {artigo.resumo}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setArtigoAbertoId(artigo.id)
                        }
                        className="mt-5 w-fit text-sm font-extrabold text-[#638A9E]"
                      >
                        Ler conteúdo →
                      </button>
                    </article>
                  );
                })}
              </div>
            ) : (
              /* DIREITOS */

              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {direitosFiltrados.map((direito) => {
                  const favorito = favoritosDireitos.includes(
                    direito.id
                  );

                  return (
                    <article
                      key={direito.id}
                      className="group flex min-h-[290px] flex-col rounded-[28px] border border-[#EBCFC7] bg-white p-6 transition hover:-translate-y-1 hover:shadow-[0_15px_40px_rgba(44,62,68,0.07)]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="rounded-full bg-[#F7E4DF] px-3 py-1 text-[10px] font-extrabold uppercase text-[#BF6751]">
                          {direito.categoria}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            favoritarDireito(direito.id)
                          }
                          aria-label="Favoritar direito"
                          className={`flex h-9 w-9 items-center justify-center rounded-full text-lg ${
                            favorito
                              ? "bg-[#F7E4DF] text-[#D97D64]"
                              : "bg-[#F8F5F1] text-[#9AA5A9]"
                          }`}
                        >
                          {favorito ? "♥" : "♡"}
                        </button>
                      </div>

                      <div className="mt-6 flex h-10 w-10 items-center justify-center rounded-[13px] bg-[#FFF8F5] font-black text-[#D97D64]">
                        §
                      </div>

                      <h3 className="mt-4 text-xl font-extrabold leading-7">
                        {direito.titulo}
                      </h3>

                      <p className="mt-3 flex-1 text-sm leading-6 text-[#718086]">
                        {direito.resumo}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setDireitoAbertoId(direito.id)
                        }
                        className="mt-5 w-fit text-sm font-extrabold text-[#C36851]"
                      >
                        Ver informações →
                      </button>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          {/* FAVORITOS */}

          {(favoritosArtigos.length > 0 ||
            favoritosDireitos.length > 0) && (
            <section className="mt-9 rounded-[28px] border border-[#D8E6D8] bg-[#EDF5ED] p-6">
              <p className="text-xs font-bold text-[#6C966C]">
                Seus favoritos
              </p>

              <div className="mt-2 flex items-center gap-3">
                <span className="text-2xl text-[#D97D64]">♥</span>

                <div>
                  <h2 className="font-extrabold">
                    Conteúdos guardados
                  </h2>

                  <p className="mt-1 text-xs text-[#748576]">
                    Você favoritou{" "}
                    {favoritosArtigos.length +
                      favoritosDireitos.length}{" "}
                    {favoritosArtigos.length +
                      favoritosDireitos.length ===
                    1
                      ? "item"
                      : "itens"}{" "}
                    nesta sessão.
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      {/* MODAL ARTIGO */}

      {artigoAberto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2C3E44]/45 p-4 backdrop-blur-sm"
          onClick={() => setArtigoAbertoId(null)}
        >
          <article
            className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[30px] bg-white p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="rounded-full bg-[#E7F0F4] px-3 py-1 text-[10px] font-extrabold uppercase text-[#638A9E]">
                  {artigoAberto.categoria}
                </span>

                <h2 className="mt-4 text-2xl font-extrabold leading-8 sm:text-3xl">
                  {artigoAberto.titulo}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setArtigoAbertoId(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8F5F1] text-xl font-bold text-[#7C898D]"
              >
                ×
              </button>
            </div>

            <div className="mt-6 h-px bg-[#ECE7E2]" />

            <p className="mt-6 text-sm leading-8 text-[#5F7076]">
              {artigoAberto.conteudo}
            </p>

            <div className="mt-7 rounded-[20px] border border-[#D9E5EA] bg-[#EDF4F7] p-5">
              <p className="text-xs leading-6 text-[#667B84]">
                Este conteúdo possui caráter informativo e não
                substitui orientações individualizadas de
                profissionais especializados.
              </p>
            </div>
          </article>
        </div>
      )}

      {/* MODAL DIREITO */}

      {direitoAberto && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2C3E44]/45 p-4 backdrop-blur-sm"
          onClick={() => setDireitoAbertoId(null)}
        >
          <article
            className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-[30px] bg-white p-6 shadow-2xl sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="rounded-full bg-[#F7E4DF] px-3 py-1 text-[10px] font-extrabold uppercase text-[#BF6751]">
                  {direitoAberto.categoria}
                </span>

                <h2 className="mt-4 text-2xl font-extrabold leading-8 sm:text-3xl">
                  {direitoAberto.titulo}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setDireitoAbertoId(null)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8F5F1] text-xl font-bold text-[#7C898D]"
              >
                ×
              </button>
            </div>

            <div className="mt-6 h-px bg-[#ECE7E2]" />

            <div className="mt-6">
              <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#D97D64]">
                Sobre este direito
              </p>

              <p className="mt-3 text-sm leading-8 text-[#5F7076]">
                {direitoAberto.descricao}
              </p>
            </div>

            <div className="mt-6 rounded-[20px] bg-[#EDF4F7] p-5">
              <p className="text-xs font-extrabold text-[#638A9E]">
                Onde buscar orientação
              </p>

              <p className="mt-2 text-sm leading-7 text-[#607780]">
                {direitoAberto.orientacao}
              </p>
            </div>

            <div className="mt-5 rounded-[20px] border border-[#D8E6D8] bg-[#F3F8F3] p-5">
              <p className="text-xs leading-6 text-[#6A7D6D]">
                As informações apresentadas pelo ELARA têm caráter
                informativo. Regras, critérios e procedimentos podem
                mudar, por isso é importante consultar os canais
                oficiais responsáveis por cada serviço ou benefício.
              </p>
            </div>
          </article>
        </div>
      )}
    </div>
  );
}
