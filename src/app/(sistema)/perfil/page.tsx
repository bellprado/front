"use client";

import { useEffect, useState } from "react";
import Sidebar from "../../../components/Sidebar";

type Usuario = {
  nome?: string;
  email?: string;
  telefone?: string;
  cpf?: string;
  relacao?: string;
  logado?: boolean;
};

function formatarCpf(valor: string) {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);
  return numeros.replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
}

function cpfValido(valor: string) {
  const cpf = valor.replace(/\D/g, "");
  if (!/^\d{11}$/.test(cpf) || /^(\d)\1{10}$/.test(cpf)) return false;
  for (let tamanho = 9; tamanho < 11; tamanho++) {
    let soma = 0;
    for (let i = 0; i < tamanho; i++) soma += Number(cpf[i]) * (tamanho + 1 - i);
    const digito = (soma * 10) % 11 % 10;
    if (digito !== Number(cpf[tamanho])) return false;
  }
  return true;
}

export default function PerfilPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [cpf, setCpf] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [relacao, setRelacao] = useState("Responsável");

  const [editando, setEditando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [mensagem, setMensagem] = useState("");

  const [dadosOriginais, setDadosOriginais] = useState<Usuario>({});

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem("elara_usuario");

    if (usuarioSalvo) {
      try {
        const usuario: Usuario = JSON.parse(usuarioSalvo);

        setNome(usuario.nome || "");
        setEmail(usuario.email || "");
        setTelefone(usuario.telefone || "");
        setRelacao(usuario.relacao || "Responsável");

        setDadosOriginais({
          nome: usuario.nome || "",
          email: usuario.email || "",
          telefone: usuario.telefone || "",
          relacao: usuario.relacao || "Responsável",
          logado: usuario.logado ?? true,
        });
      } catch {
        console.log("Não foi possível carregar os dados do usuário.");
      }
    }

    setCarregando(false);
  }, []);

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_API_URL;
    if (!url) return;
    const controlador = new AbortController();
    async function carregarCpf() {
      try {
        const resposta = await fetch(`${url!.replace(/\/$/, "")}/perfil`, {
          credentials: "include",
          signal: controlador.signal,
        });
        if (!resposta.ok) return;
        const dados: Usuario = await resposta.json();
        if (dados.cpf) setCpf(formatarCpf(dados.cpf));
      } catch {
        // A API pode não estar disponível durante o desenvolvimento.
      }
    }
    void carregarCpf();
    return () => controlador.abort();
  }, []);

  function iniciarEdicao() {
    setDadosOriginais({
      nome,
      email,
      telefone,
      relacao,
      logado: true,
    });

    setMensagem("");
    setErro("");
    setEditando(true);
  }

  async function salvarPerfil() {
    if (!nome.trim()) {
      alert("Digite seu nome.");
      return;
    }

    if (!email.trim()) {
      alert("Digite seu e-mail.");
      return;
    }

    if (!email.includes("@")) {
      alert("Digite um e-mail válido.");
      return;
    }

    if (cpf.trim() && !cpfValido(cpf)) {
      setErro("Digite um CPF válido.");
      return;
    }

    setErro("");
    setSalvando(true);
    const usuarioAtualizado: Usuario = {
      nome: nome.trim(),
      email: email.trim(),
      telefone: telefone.trim(),
      relacao,
      logado: true,
    };

    // O CPF não deve ser armazenado no localStorage.
    const url = process.env.NEXT_PUBLIC_API_URL;
    if (cpf.trim() && !url) {
      setErro("O CPF não pode ser salvo enquanto a API do perfil não estiver configurada.");
      setSalvando(false);
      return;
    }
    if (url) {
      try {
        const resposta = await fetch(`${url.replace(/\/$/, "")}/perfil`, {
          method: "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...usuarioAtualizado, cpf: cpf.replace(/\D/g, "") || null }),
        });
        if (!resposta.ok) throw new Error("Falha ao salvar perfil na API.");
      } catch {
        setErro("Não foi possível salvar na API. Nenhuma alteração foi confirmada.");
        setSalvando(false);
        return;
      }
    }
    localStorage.setItem("elara_usuario", JSON.stringify(usuarioAtualizado));

    setDadosOriginais(usuarioAtualizado);
    setEditando(false);
    setMensagem(url ? "Perfil atualizado com sucesso!" : "Dados básicos atualizados neste navegador. A sincronização com a API ainda não está disponível.");
    setSalvando(false);
  }

  function cancelarEdicao() {
    setNome(dadosOriginais.nome || "");
    setEmail(dadosOriginais.email || "");
    setTelefone(dadosOriginais.telefone || "");
    setRelacao(dadosOriginais.relacao || "Responsável");

    setErro("");
    setMensagem("");
    setEditando(false);
  }

  if (carregando) {
    return (
      <main className="min-h-screen bg-[var(--elara-offwhite)]">
        <div className="flex min-h-screen">
          <Sidebar />

          <section className="flex-1 p-6 md:p-10">
            <p className="text-[var(--elara-grafite)]">
              Carregando perfil...
            </p>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--elara-offwhite)]">
      <div className="flex min-h-screen">
        <Sidebar />

        <section className="flex-1 p-6 md:p-10">
          <div>
            <p className="font-semibold text-[var(--elara-azul)]">
              Minha conta
            </p>

            <h2 className="mt-2 text-4xl font-bold text-[var(--elara-grafite)]">
              Perfil
            </h2>

            <p className="mt-2 max-w-3xl text-[var(--elara-grafite)]">
              Consulte e atualize as informações da sua conta no ELARA.
            </p>
          </div>

          {erro && (
            <div role="alert" className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-800">
              {erro}
            </div>
          )}

          {mensagem && (
            <div className="mt-8 rounded-2xl bg-green-50 p-4">
              <p className="font-semibold text-green-700">
                {mensagem}
              </p>
            </div>
          )}

          {!editando ? (
            <div className="mt-10 max-w-3xl rounded-3xl bg-white p-6 shadow-sm md:p-8">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--elara-terracota)] text-2xl font-bold text-white">
                    {nome
                      ? nome.charAt(0).toUpperCase()
                      : "U"}
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-[var(--elara-grafite)]">
                      {nome || "Usuário ELARA"}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {relacao}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={iniciarEdicao}
                  className="w-fit rounded-full bg-[var(--elara-terracota)] px-6 py-3 font-bold text-white"
                >
                  Editar perfil
                </button>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <div className="rounded-2xl bg-[var(--elara-offwhite)] p-5">
                  <p className="text-sm font-semibold text-[var(--elara-azul)]">
                    Nome completo
                  </p>

                  <p className="mt-2 font-bold text-[var(--elara-grafite)]">
                    {nome || "Não informado"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[var(--elara-offwhite)] p-5">
                  <p className="text-sm font-semibold text-[var(--elara-azul)]">
                    E-mail
                  </p>

                  <p className="mt-2 break-words font-bold text-[var(--elara-grafite)]">
                    {email || "Não informado"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[var(--elara-offwhite)] p-5">
                  <p className="text-sm font-semibold text-[var(--elara-azul)]">CPF</p>
                  <p className="mt-2 font-bold text-[var(--elara-grafite)]">{cpf || "Não informado"}</p>
                </div>

                <div className="rounded-2xl bg-[var(--elara-offwhite)] p-5">
                  <p className="text-sm font-semibold text-[var(--elara-verde)]">
                    Telefone
                  </p>

                  <p className="mt-2 font-bold text-[var(--elara-grafite)]">
                    {telefone || "Não informado"}
                  </p>
                </div>

                <div className="rounded-2xl bg-[var(--elara-offwhite)] p-5">
                  <p className="text-sm font-semibold text-[var(--elara-verde)]">
                    Relação com a criança
                  </p>

                  <p className="mt-2 font-bold text-[var(--elara-grafite)]">
                    {relacao || "Não informado"}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-10 max-w-3xl rounded-3xl bg-white p-6 shadow-sm md:p-8">
              <div>
                <h3 className="text-2xl font-bold text-[var(--elara-grafite)]">
                  Editar informações
                </h3>

                <p className="mt-2 text-sm text-gray-500">
                  Atualize os dados que desejar.
                </p>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="nome"
                    className="mb-2 block font-semibold"
                  >
                    Nome completo
                  </label>

                  <input
                    id="nome"
                    type="text"
                    value={nome}
                    onChange={(event) =>
                      setNome(event.target.value)
                    }
                    placeholder="Digite seu nome"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[var(--elara-azul)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block font-semibold"
                  >
                    E-mail
                  </label>

                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="Digite seu e-mail"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[var(--elara-azul)]"
                  />
                </div>

                <div>
                  <label htmlFor="cpf" className="mb-2 block font-semibold">CPF</label>
                  <input
                    id="cpf"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={14}
                    value={cpf}
                    onChange={(event) => setCpf(formatarCpf(event.target.value))}
                    placeholder="000.000.000-00"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[var(--elara-azul)]"
                  />
                  <p className="mt-1 text-xs text-gray-500">O CPF será enviado somente à API segura do perfil.</p>
                </div>

                <div>
                  <label
                    htmlFor="telefone"
                    className="mb-2 block font-semibold"
                  >
                    Telefone
                  </label>

                  <input
                    id="telefone"
                    type="tel"
                    value={telefone}
                    onChange={(event) =>
                      setTelefone(event.target.value)
                    }
                    placeholder="(11) 99999-9999"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[var(--elara-azul)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="relacao"
                    className="mb-2 block font-semibold"
                  >
                    Relação com a criança
                  </label>

                  <select
                    id="relacao"
                    value={relacao}
                    onChange={(event) =>
                      setRelacao(event.target.value)
                    }
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[var(--elara-azul)]"
                  >
                    <option value="Responsável">
                      Responsável
                    </option>

                    <option value="Mãe">
                      Mãe
                    </option>

                    <option value="Pai">
                      Pai
                    </option>

                    <option value="Avó">
                      Avó
                    </option>

                    <option value="Avô">
                      Avô
                    </option>

                    <option value="Familiar">
                      Familiar
                    </option>

                    <option value="Outro">
                      Outro
                    </option>
                  </select>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  type="button"
                  onClick={salvarPerfil}
                  disabled={salvando}
                  className="rounded-full bg-[var(--elara-terracota)] px-6 py-3 font-bold text-white"
                >
                  {salvando ? "Salvando..." : "Salvar alterações"}
                </button>

                <button
                  type="button"
                  onClick={cancelarEdicao}
                  className="rounded-full border border-gray-300 px-6 py-3 font-bold text-[var(--elara-grafite)]"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
