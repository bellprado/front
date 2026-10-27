"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CadastroPage() {
  const router = useRouter();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] =
    useState(false);
  const [carregando, setCarregando] = useState(false);

  async function criarConta(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (carregando) return;
    setErro("");

    if (!nome.trim()) {
      setErro("Digite seu nome completo.");
      return;
    }

    const emailNormalizado = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado)) {
      setErro("Digite um e-mail válido.");
      return;
    }

    if (senha.length < 6) {
      setErro("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      setErro("As senhas não são iguais.");
      return;
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
    if (!apiUrl) {
      setErro("O cadastro ainda não está disponível: configure NEXT_PUBLIC_API_URL e conecte o backend.");
      return;
    }

    setCarregando(true);
    try {
      // Contrato provisório: confirmar rota e campos com o backend.
      const resposta = await fetch(`${apiUrl}/auth/cadastro`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome.trim(),
          email: emailNormalizado,
          senha,
        }),
      });

      if (!resposta.ok) {
        if (resposta.status === 409) {
          setErro("Já existe uma conta cadastrada com este e-mail.");
        } else if (resposta.status === 400 || resposta.status === 422) {
          setErro("Não foi possível validar os dados. Confira as informações e tente novamente.");
        } else {
          setErro("Não foi possível criar a conta. Tente novamente mais tarde.");
        }
        return;
      }

      setSenha("");
      setConfirmarSenha("");
      router.push("/login?cadastro=sucesso");
    } catch {
      setErro("Não foi possível conectar ao servidor. Verifique se a API está disponível.");
    } finally {
      setCarregando(false);
    }
  }

  const senhaTemTamanho = senha.length >= 6;
  const senhasIguais =
    confirmarSenha.length > 0 && senha === confirmarSenha;

  return (
    <main className="min-h-screen bg-[#F8F5F1] text-[#2C3E44] lg:grid lg:grid-cols-[0.95fr_1.05fr]">
      {/* FORMULÁRIO */}

      <section className="relative flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:bg-[#FDFBF7] lg:px-12">
        {/* LOGO MOBILE */}

        <Link
          href="/"
          className="absolute left-5 top-5 flex items-center gap-2.5 lg:hidden"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[#D97D64] text-sm font-black text-white">
            E
          </div>

          <div>
            <p className="font-extrabold tracking-[0.09em] text-[#D97D64]">
              ELARA
            </p>

            <p className="text-[9px] font-semibold text-[#859397]">
              Cuidando de quem cuida.
            </p>
          </div>
        </Link>

        <div className="w-full max-w-[470px] pb-5 pt-20 lg:py-10">
          {/* CABEÇALHO */}

          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[#D97D64]">
              Comece por aqui
            </p>

            <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
              Crie sua conta
            </h1>

            <p className="mt-3 max-w-md text-sm leading-6 text-[#718187]">
              Crie seu espaço no ELARA para organizar
              informações, compromissos e cuidados da sua família.
            </p>
          </div>

          {/* FORMULÁRIO */}

          <form
            onSubmit={criarConta}
            className="mt-8"
          >
            {/* NOME */}

            <div>
              <label
                htmlFor="nome"
                className="mb-2 block text-sm font-extrabold text-[#465B62]"
              >
                Nome completo
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#8DA0A7]">
                  A
                </span>

                <input
                  id="nome"
                  type="text"
                  value={nome}
                  onChange={(event) => {
                    setNome(event.target.value);
                    setErro("");
                  }}
                  placeholder="Digite seu nome completo"
                  autoComplete="name"
                  className="w-full rounded-[17px] border border-[#DED8D2] bg-white py-3.5 pl-11 pr-4 text-sm font-semibold outline-none transition placeholder:font-normal placeholder:text-[#A6AFB2] focus:border-[#7FA2B8] focus:ring-4 focus:ring-[#7FA2B8]/10"
                />
              </div>
            </div>

            {/* EMAIL */}

            <div className="mt-5">
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-extrabold text-[#465B62]"
              >
                E-mail
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#8DA0A7]">
                  @
                </span>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setErro("");
                  }}
                  placeholder="seuemail@exemplo.com"
                  autoComplete="email"
                  className="w-full rounded-[17px] border border-[#DED8D2] bg-white py-3.5 pl-11 pr-4 text-sm font-semibold outline-none transition placeholder:font-normal placeholder:text-[#A6AFB2] focus:border-[#7FA2B8] focus:ring-4 focus:ring-[#7FA2B8]/10"
                />
              </div>
            </div>

            {/* SENHA */}

            <div className="mt-5">
              <label
                htmlFor="senha"
                className="mb-2 block text-sm font-extrabold text-[#465B62]"
              >
                Senha
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#8DA0A7]">
                  ●
                </span>

                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  value={senha}
                  onChange={(event) => {
                    setSenha(event.target.value);
                    setErro("");
                  }}
                  placeholder="Crie uma senha"
                  autoComplete="new-password"
                  className="w-full rounded-[17px] border border-[#DED8D2] bg-white py-3.5 pl-11 pr-20 text-sm font-semibold outline-none transition placeholder:font-normal placeholder:text-[#A6AFB2] focus:border-[#7FA2B8] focus:ring-4 focus:ring-[#7FA2B8]/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setMostrarSenha((estado) => !estado)
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-extrabold text-[#71858D] hover:text-[#D97D64]"
                >
                  {mostrarSenha ? "OCULTAR" : "MOSTRAR"}
                </button>
              </div>

              {/* INDICADOR */}

              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    senhaTemTamanho
                      ? "bg-[#8FBC8F]"
                      : "bg-[#D8D2CC]"
                  }`}
                />

                <p
                  className={`text-[11px] font-semibold ${
                    senhaTemTamanho
                      ? "text-[#6F996F]"
                      : "text-[#919B9E]"
                  }`}
                >
                  Pelo menos 6 caracteres
                </p>
              </div>
            </div>

            {/* CONFIRMAR SENHA */}

            <div className="mt-5">
              <label
                htmlFor="confirmarSenha"
                className="mb-2 block text-sm font-extrabold text-[#465B62]"
              >
                Confirmar senha
              </label>

              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#8DA0A7]">
                  ●
                </span>

                <input
                  id="confirmarSenha"
                  type={
                    mostrarConfirmacao ? "text" : "password"
                  }
                  value={confirmarSenha}
                  onChange={(event) => {
                    setConfirmarSenha(event.target.value);
                    setErro("");
                  }}
                  placeholder="Digite a senha novamente"
                  autoComplete="new-password"
                  className="w-full rounded-[17px] border border-[#DED8D2] bg-white py-3.5 pl-11 pr-20 text-sm font-semibold outline-none transition placeholder:font-normal placeholder:text-[#A6AFB2] focus:border-[#7FA2B8] focus:ring-4 focus:ring-[#7FA2B8]/10"
                />

                <button
                  type="button"
                  onClick={() =>
                    setMostrarConfirmacao(
                      (estado) => !estado
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-extrabold text-[#71858D] hover:text-[#D97D64]"
                >
                  {mostrarConfirmacao
                    ? "OCULTAR"
                    : "MOSTRAR"}
                </button>
              </div>

              {confirmarSenha.length > 0 && (
                <div className="mt-2 flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      senhasIguais
                        ? "bg-[#8FBC8F]"
                        : "bg-[#D97D64]"
                    }`}
                  />

                  <p
                    className={`text-[11px] font-semibold ${
                      senhasIguais
                        ? "text-[#6F996F]"
                        : "text-[#C36A54]"
                    }`}
                  >
                    {senhasIguais
                      ? "As senhas são iguais"
                      : "As senhas ainda não são iguais"}
                  </p>
                </div>
              )}
            </div>

            {/* ERRO */}

            {erro && (
              <div
                role="alert"
                className="mt-5 flex gap-3 rounded-[18px] border border-[#F1D0C7] bg-[#FFF4F1] p-4"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F7E4DF] text-xs font-black text-[#C66650]">
                  !
                </span>

                <div>
                  <p className="text-xs font-extrabold text-[#B95F49]">
                    Verifique seus dados
                  </p>

                  <p className="mt-1 text-xs leading-5 text-[#876F69]">
                    {erro}
                  </p>
                </div>
              </div>
            )}

            {/* TERMOS */}

            <div className="mt-6 rounded-[18px] border border-[#E5E0DA] bg-[#FCFBF9] p-4">
              <p className="text-[11px] leading-5 text-[#7D898D]">
                Ao criar uma conta, você estará criando um
                perfil de responsável para utilizar os recursos
                do ELARA.
              </p>
            </div>

            {/* BOTÃO */}

            <button
              type="submit"
              disabled={carregando}
              className="mt-5 flex w-full items-center justify-center rounded-full bg-[#D97D64] px-6 py-3.5 text-sm font-extrabold text-white shadow-[0_8px_25px_rgba(217,125,100,0.22)] transition hover:-translate-y-0.5 hover:bg-[#CA7059] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando
                ? "Criando conta..."
                : "Criar minha conta →"}
            </button>
          </form>

          {/* LOGIN */}

          <div className="my-7 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#E8E2DC]" />

            <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#A0AAAD]">
              Já possui uma conta?
            </span>

            <div className="h-px flex-1 bg-[#E8E2DC]" />
          </div>

          <Link
            href="/login"
            className="flex w-full items-center justify-center rounded-full border border-[#D7E3E8] bg-[#F5F9FA] px-6 py-3.5 text-sm font-extrabold text-[#668B9D] transition hover:border-[#7FA2B8] hover:bg-[#E7F0F4]"
          >
            Entrar na minha conta
          </Link>

          <div className="mt-7 text-center">
            <Link
              href="/"
              className="text-xs font-bold text-[#89969A] transition hover:text-[#D97D64]"
            >
              ← Voltar para o início
            </Link>
          </div>
        </div>
      </section>

      {/* LADO VISUAL */}

      <section className="relative hidden min-h-screen overflow-hidden bg-[#F7E4DF] p-10 lg:flex lg:flex-col lg:justify-between xl:p-14">
        {/* DECORAÇÃO */}

        <div className="pointer-events-none absolute -right-28 -top-28 h-96 w-96 rounded-full bg-white/35" />

        <div className="pointer-events-none absolute -bottom-36 -left-28 h-[440px] w-[440px] rounded-full border-[75px] border-white/25" />

        <div className="pointer-events-none absolute left-[16%] top-[24%] h-24 w-24 rounded-full bg-[#E7F0F4]/70" />

        {/* LOGO */}

        <div className="relative z-10 flex justify-end">
          <Link
            href="/"
            className="inline-flex items-center gap-3"
          >
            <div className="text-right">
              <p className="text-2xl font-extrabold tracking-[0.1em] text-[#D97D64]">
                ELARA
              </p>

              <p className="text-[10px] font-bold text-[#806F6A]">
                Cuidando de quem cuida.
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-[17px] bg-[#D97D64] text-lg font-black text-white shadow-sm">
              E
            </div>
          </Link>
        </div>

        {/* CONTEÚDO */}

        <div className="relative z-10 ml-auto max-w-xl">
          <div className="mb-5 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#7FA2B8]" />

            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#A05E4D]">
              Um lugar para sua rotina
            </p>
          </div>

          <h2 className="max-w-lg text-5xl font-extrabold leading-[1.08] tracking-[-0.055em] text-[#3D4C51] xl:text-6xl">
            Tudo que importa,{" "}
            <span className="text-[#D97D64]">
              mais perto.
            </span>
          </h2>

          <p className="mt-6 max-w-lg text-base leading-7 text-[#796C68]">
            O ELARA foi pensado para reunir informações que
            costumam ficar espalhadas pela rotina e facilitar o
            acompanhamento do dia a dia.
          </p>

          {/* RECURSOS */}

          <div className="mt-10 grid max-w-lg gap-3">
            <div className="flex items-center gap-4 rounded-[22px] border border-white/60 bg-white/55 p-4 backdrop-blur-sm">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#E7F0F4] font-black text-[#6B93A6]">
                1
              </span>

              <div>
                <p className="text-sm font-extrabold text-[#4D5E63]">
                  Organize a rotina
                </p>

                <p className="mt-1 text-xs text-[#7B7774]">
                  Agenda, compromissos e cuidados em um só lugar.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-[22px] border border-white/60 bg-white/55 p-4 backdrop-blur-sm">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#EDF5ED] font-black text-[#729B72]">
                2
              </span>

              <div>
                <p className="text-sm font-extrabold text-[#4D5E63]">
                  Acompanhe informações
                </p>

                <p className="mt-1 text-xs text-[#7B7774]">
                  Registre dados importantes para consultar
                  quando precisar.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-[22px] border border-white/60 bg-white/55 p-4 backdrop-blur-sm">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#F7E4DF] font-black text-[#C46852]">
                3
              </span>

              <div>
                <p className="text-sm font-extrabold text-[#4D5E63]">
                  Encontre apoio
                </p>

                <p className="mt-1 text-xs text-[#7B7774]">
                  Conteúdos, direitos e comunidade para apoiar
                  quem cuida.
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-right text-xs font-semibold text-[#927A73]">
          ELARA • Informação, organização e acolhimento.
        </p>
      </section>
    </main>
  );
}
