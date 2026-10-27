"use client";



import { useEffect, useState } from "react";

import Link from "next/link";

import Sidebar from "../../../components/Sidebar";



type Crianca = {
  id?: string | number;
  nome: string;
  dataNascimento: string;
  escola?: string;
  responsavel: string;
  diagnostico?: string;
  cid?: string;
  alergias?: string;
  terapias?: string;
  observacoes?: string;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

function cid10Valido(valor: string) {
  return /^[A-Z][0-9]{2}(?:\.[0-9A-Z]{1,2})?$/.test(valor);
}

export default function CriancaPage() {

  const [nome, setNome] = useState("");

  const [dataNascimento, setDataNascimento] = useState("");

  const [escola, setEscola] = useState("");

  const [responsavel, setResponsavel] = useState("");



  const [diagnostico, setDiagnostico] = useState("");

  const [cid, setCid] = useState("");

  const [alergias, setAlergias] = useState("");

  const [terapias, setTerapias] = useState("");



  const [observacoes, setObservacoes] = useState("");

  const [dadosSalvos, setDadosSalvos] = useState(false);



  const [criancaId, setCriancaId] = useState<string | number | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(Boolean(API_URL));
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (!API_URL) return;
    let ativo = true;
    async function carregarCrianca() {
      try {
        // Contrato provisório: GET /criancas retorna uma lista.
        const resposta = await fetch(`${API_URL}/criancas`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!resposta.ok) throw new Error("Não foi possível consultar o cadastro.");
        const retorno: unknown = await resposta.json();
        const lista = Array.isArray(retorno)
          ? retorno
          : retorno && typeof retorno === "object" && "data" in retorno && Array.isArray(retorno.data)
            ? retorno.data
            : [];
        const primeira = lista[0] as Crianca | undefined;
        if (!ativo || !primeira) return;
        setCriancaId(primeira.id ?? null);
        setNome(primeira.nome ?? "");
        setDataNascimento(primeira.dataNascimento?.slice(0, 10) ?? "");
        setEscola(primeira.escola ?? "");
        setResponsavel(primeira.responsavel ?? "");
        setDiagnostico(primeira.diagnostico ?? "");
        setCid(primeira.cid ?? "");
        setAlergias(primeira.alergias ?? "");
        setTerapias(primeira.terapias ?? "");
        setObservacoes(primeira.observacoes ?? "");
        setDadosSalvos(true);
      } catch (falha) {
        if (ativo) setErro(falha instanceof Error ? falha.message : "Erro ao carregar cadastro.");
      } finally {
        if (ativo) setCarregando(false);
      }
    }
    void carregarCrianca();
    return () => { ativo = false; };
  }, []);

  async function salvarInformacoes() {
    setErro("");
    if (!nome.trim() || !dataNascimento || !responsavel.trim()) {
      setErro("Preencha o nome, a data de nascimento e o responsável principal.");
      return;
    }
    const nascimento = new Date(`${dataNascimento}T00:00:00`);
    if (Number.isNaN(nascimento.getTime()) || nascimento > new Date()) {
      setErro("Informe uma data de nascimento válida, que não seja futura.");
      return;
    }
    const cidNormalizado = cid.trim().toUpperCase();
    if (cidNormalizado && !cid10Valido(cidNormalizado)) {
      setErro("Informe um CID-10 válido (ex.: F84.0) ou deixe o campo vazio.");
      return;
    }
    setCid(cidNormalizado);
    if (!API_URL) {
      setErro("O cadastro ainda não pode ser salvo: configure NEXT_PUBLIC_API_URL e a API de crianças. Nenhum dado foi armazenado.");
      return;
    }
    const dados: Crianca = {
      nome: nome.trim(), dataNascimento, escola: escola.trim(),
      responsavel: responsavel.trim(), diagnostico: diagnostico.trim(),
      cid: cidNormalizado, alergias: alergias.trim(),
      terapias: terapias.trim(), observacoes: observacoes.trim(),
    };
    setSalvando(true);
    try {
      // Contrato provisório: POST /criancas e PATCH /criancas/:id.
      const resposta = await fetch(
        criancaId === null ? `${API_URL}/criancas` : `${API_URL}/criancas/${encodeURIComponent(String(criancaId))}`,
        {
          method: criancaId === null ? "POST" : "PATCH",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(dados),
        }
      );
      if (!resposta.ok) throw new Error("Não foi possível salvar. Verifique a conexão e a API.");
      const retorno: Crianca | null = await resposta.json().catch(() => null);
      if (retorno?.id !== undefined) setCriancaId(retorno.id);
      setDadosSalvos(true);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Erro ao salvar informações.");
    } finally {
      setSalvando(false);
    }
  }

  function editarInformacoes() {

    setDadosSalvos(false);

  }



  function formatarData(data: string) {

    if (!data) return "Não informada";



    const [ano, mes, dia] = data.split("-");



    return `${dia}/${mes}/${ano}`;

  }



  function calcularIdade(data: string) {

    if (!data) return "";



    const nascimento = new Date(`${data}T00:00:00`);

    const hoje = new Date();



    let idade = hoje.getFullYear() - nascimento.getFullYear();



    const diferencaMes = hoje.getMonth() - nascimento.getMonth();



    if (

      diferencaMes < 0 ||

      (diferencaMes === 0 &&

        hoje.getDate() < nascimento.getDate())

    ) {

      idade--;

    }



    if (idade < 0) return "";



    return `${idade} ${idade === 1 ? "ano" : "anos"}`;

  }



  return (

    <div className="min-h-screen bg-[var(--elara-fundo)] text-[var(--elara-texto)] md:flex">

      <Sidebar />



      <main className="min-w-0 flex-1 pt-[68px] md:pt-0">

        <div className="mx-auto max-w-[1450px] px-5 py-7 sm:px-7 lg:px-10 lg:py-10">

          {/* CABEÇALHO */}

          <header className="mb-8 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">

            <div>

              <div className="mb-3 flex items-center gap-2">

                <span className="h-2 w-2 rounded-full bg-[var(--elara-terracota)]" />



                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--elara-terracota)]">

                  Perfil da criança

                </p>

              </div>



              <h1 className="text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">

                {dadosSalvos ? nome : "Informações da criança"}

              </h1>



              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--elara-texto-secundario)]">

                Reúna informações importantes sobre saúde, rotina e

                acompanhamento em um único espaço.

              </p>

            </div>



            {dadosSalvos && (

              <button

                type="button"

                onClick={editarInformacoes}

                className="w-fit rounded-full border border-[#E4B4A8] bg-[var(--elara-superficie)] px-5 py-2.5 text-sm font-extrabold text-[#C36851] transition hover:bg-[#FFF7F4]"

              >

                Editar informações

              </button>

            )}

          </header>



          {carregando && <p role="status" className="mb-5 text-sm">Carregando informações...</p>}
          {erro && (
            <p role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">
              {erro}
            </p>
          )}

          {!dadosSalvos ? (

            /* ======================================================

               FORMULÁRIO

            ====================================================== */

            <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">

              <section className="rounded-[30px] border border-[var(--elara-borda)] bg-[var(--elara-superficie)] p-6 shadow-[0_10px_40px_rgba(44,62,68,0.04)] sm:p-8">

                {/* DADOS PESSOAIS */}

                <div className="mb-7">

                  <div className="flex items-center gap-3">

                    <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[var(--elara-terracota-suave)] text-lg text-[var(--elara-terracota)]">

                      ♡

                    </span>



                    <div>

                      <p className="text-xs font-bold text-[var(--elara-terracota)]">

                        Dados principais

                      </p>



                      <h2 className="text-xl font-extrabold">

                        Sobre a criança

                      </h2>

                    </div>

                  </div>

                </div>



                <div className="grid gap-5 md:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-sm font-extrabold text-[#465B62]">

                      Nome da criança *

                    </label>



                    <input

                      type="text"

                      value={nome}

                      onChange={(e) => setNome(e.target.value)}

                      placeholder="Digite o nome"

                      className="w-full rounded-[16px] border border-[var(--elara-borda-forte)] bg-[var(--elara-input)] px-4 py-3.5 text-sm outline-none transition placeholder:text-[var(--elara-placeholder)] focus:border-[var(--elara-terracota)] focus:bg-[var(--elara-superficie)]"

                    />

                  </div>



                  <div>

                    <label className="mb-2 block text-sm font-extrabold text-[#465B62]">

                      Data de nascimento *

                    </label>



                    <input

                      type="date"

                      value={dataNascimento}

                      onChange={(e) => setDataNascimento(e.target.value)}

                      className="w-full rounded-[16px] border border-[var(--elara-borda-forte)] bg-[var(--elara-input)] px-4 py-3.5 text-sm outline-none transition focus:border-[var(--elara-terracota)] focus:bg-[var(--elara-superficie)]"

                    />

                  </div>



                  <div>

                    <label className="mb-2 block text-sm font-extrabold text-[#465B62]">

                      Escola

                    </label>



                    <input

                      type="text"

                      value={escola}

                      onChange={(e) => setEscola(e.target.value)}

                      placeholder="Nome da escola"

                      className="w-full rounded-[16px] border border-[var(--elara-borda-forte)] bg-[var(--elara-input)] px-4 py-3.5 text-sm outline-none transition placeholder:text-[var(--elara-placeholder)] focus:border-[var(--elara-azul)] focus:bg-[var(--elara-superficie)]"

                    />

                  </div>



                  <div>

                    <label className="mb-2 block text-sm font-extrabold text-[#465B62]">

                      Responsável principal *

                    </label>



                    <input

                      type="text"

                      value={responsavel}

                      onChange={(e) => setResponsavel(e.target.value)}

                      placeholder="Nome do responsável"

                      className="w-full rounded-[16px] border border-[var(--elara-borda-forte)] bg-[var(--elara-input)] px-4 py-3.5 text-sm outline-none transition placeholder:text-[var(--elara-placeholder)] focus:border-[var(--elara-azul)] focus:bg-[var(--elara-superficie)]"

                    />

                  </div>

                </div>



                {/* SAÚDE */}

                <div className="my-8 h-px bg-[#EEE9E4]" />



                <div className="mb-6 flex items-center gap-3">

                  <span className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-[var(--elara-azul-suave)] text-lg text-[#6E96AA]">

                    +

                  </span>



                  <div>

                    <p className="text-xs font-bold text-[var(--elara-azul)]">

                      Saúde e acompanhamento

                    </p>



                    <h2 className="text-xl font-extrabold">

                      Informações importantes

                    </h2>

                  </div>

                </div>



                <div className="grid gap-5 md:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-sm font-extrabold text-[#465B62]">

                      Diagnóstico

                    </label>



                    <input

                      type="text"

                      value={diagnostico}

                      onChange={(e) => setDiagnostico(e.target.value)}

                      placeholder="Ex.: TEA, TDAH..."

                      className="w-full rounded-[16px] border border-[var(--elara-borda-forte)] bg-[var(--elara-input)] px-4 py-3.5 text-sm outline-none transition placeholder:text-[var(--elara-placeholder)] focus:border-[var(--elara-azul)] focus:bg-[var(--elara-superficie)]"

                    />

                  </div>



                  <div>

                    <label className="mb-2 block text-sm font-extrabold text-[#465B62]">

                      CID

                    </label>



                    <input

                      type="text"

                      value={cid}

                      onChange={(e) => setCid(e.target.value.toUpperCase())}

                      maxLength={6}

                      aria-describedby="cid-ajuda"

                      placeholder="Ex.: F84.0"

                      className="w-full rounded-[16px] border border-[var(--elara-borda-forte)] bg-[var(--elara-input)] px-4 py-3.5 text-sm uppercase outline-none transition placeholder:normal-case placeholder:text-[var(--elara-placeholder)] focus:border-[var(--elara-azul)] focus:bg-[var(--elara-superficie)]"

                    />



                    <p id="cid-ajuda" className="mt-1.5 text-[10px] leading-4 text-[#929EA2]">

                      Campo opcional. Informe o código CID-10, se houver (ex.: F84.0).

                    </p>

                  </div>



                  <div>

                    <label className="mb-2 block text-sm font-extrabold text-[#465B62]">

                      Alergias

                    </label>



                    <input

                      type="text"

                      value={alergias}

                      onChange={(e) => setAlergias(e.target.value)}

                      placeholder="Ex.: Dipirona, lactose..."

                      className="w-full rounded-[16px] border border-[var(--elara-borda-forte)] bg-[var(--elara-input)] px-4 py-3.5 text-sm outline-none transition placeholder:text-[var(--elara-placeholder)] focus:border-[var(--elara-azul)] focus:bg-[var(--elara-superficie)]"

                    />

                  </div>



                  <div>

                    <label className="mb-2 block text-sm font-extrabold text-[#465B62]">

                      Terapias

                    </label>



                    <input

                      type="text"

                      value={terapias}

                      onChange={(e) => setTerapias(e.target.value)}

                      placeholder="Ex.: Fono, TO, psicologia..."

                      className="w-full rounded-[16px] border border-[var(--elara-borda-forte)] bg-[var(--elara-input)] px-4 py-3.5 text-sm outline-none transition placeholder:text-[var(--elara-placeholder)] focus:border-[var(--elara-azul)] focus:bg-[var(--elara-superficie)]"

                    />

                  </div>

                </div>



                {/* OBSERVAÇÕES */}

                <div className="my-8 h-px bg-[#EEE9E4]" />



                <div>

                  <label className="mb-2 block text-sm font-extrabold text-[#465B62]">

                    Observações importantes

                  </label>



                  <textarea

                    value={observacoes}

                    onChange={(e) => setObservacoes(e.target.value)}

                    placeholder="Preferências, informações de rotina, cuidados específicos ou outras informações relevantes..."

                    rows={5}

                    className="w-full resize-none rounded-[18px] border border-[var(--elara-borda-forte)] bg-[var(--elara-input)] px-4 py-3.5 text-sm leading-6 outline-none transition placeholder:text-[var(--elara-placeholder)] focus:border-[var(--elara-terracota)] focus:bg-[var(--elara-superficie)]"

                  />

                </div>



                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">

                  <button

                    type="button"

                    onClick={salvarInformacoes}

                    disabled={salvando || carregando}

                    className="rounded-full bg-[var(--elara-terracota)] px-7 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#CA7059]"

                  >

                    {salvando ? "Salvando..." : "Salvar informações"}

                  </button>



                  <p className="text-[11px] text-[#929EA2]">

                    * Campos obrigatórios

                  </p>

                </div>

              </section>



              {/* PAINEL LATERAL */}

              <aside className="space-y-5">

                <div className="relative overflow-hidden rounded-[30px] border border-[#EBCBC2] bg-[var(--elara-terracota-suave)] p-6">

                  <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[var(--elara-superficie)]/25" />



                  <div className="relative">

                    <span className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[var(--elara-superficie)]/70 text-xl text-[#C76A53]">

                      ♡

                    </span>



                    <h3 className="mt-6 text-xl font-extrabold text-[#465054]">

                      Um perfil para cada criança

                    </h3>



                    <p className="mt-3 text-sm leading-6 text-[#796B67]">

                      O ELARA foi pensado para permitir que cada criança

                      tenha suas próprias informações, rotina e cuidados.

                    </p>

                  </div>

                </div>



                <div className="rounded-[30px] border border-[#DCE8ED] bg-[var(--elara-azul-suave)] p-6">

                  <p className="text-xs font-extrabold uppercase tracking-[0.15em] text-[#6F96A9]">

                    Privacidade

                  </p>



                  <h3 className="mt-3 text-lg font-extrabold">

                    Informações sensíveis merecem cuidado

                  </h3>



                  <p className="mt-3 text-xs leading-5 text-[#70838B]">

                    Dados de saúde devem ser utilizados somente para as

                    funcionalidades necessárias da plataforma e protegidos

                    conforme as regras de segurança do ELARA.

                  </p>

                </div>



                <div className="rounded-[30px] border border-[#DCE9DC] bg-[var(--elara-verde-suave)] p-6">

                  <p className="text-xs font-extrabold text-[#6B996B]">

                    Depois do cadastro

                  </p>



                  <p className="mt-2 text-sm font-bold leading-6 text-[#4F6553]">

                    Você poderá organizar compromissos, medicamentos e

                    outros cuidados relacionados à criança.

                  </p>

                </div>

              </aside>

            </div>

          ) : (

            /* ======================================================

               PERFIL SALVO

            ====================================================== */

            <>

              {/* CARTÃO PRINCIPAL */}

              <section className="relative overflow-hidden rounded-[32px] border border-[#EAC8BE] bg-[var(--elara-terracota-suave)] p-6 sm:p-8">

                <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[var(--elara-superficie)]/20" />

                <div className="absolute -bottom-24 right-32 h-52 w-52 rounded-full border-[35px] border-white/15" />



                <div className="relative z-10 flex flex-col justify-between gap-8 lg:flex-row lg:items-center">

                  <div className="flex items-center gap-5">

                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[26px] bg-[var(--elara-superficie)]/80 text-3xl font-black uppercase text-[var(--elara-terracota)] shadow-sm">

                      {nome.charAt(0)}

                    </div>



                    <div>

                      <div className="mb-2 flex flex-wrap gap-2">

                        <span className="rounded-full bg-[var(--elara-superficie)]/70 px-3 py-1 text-[10px] font-extrabold text-[#BD6751]">

                          PERFIL ATIVO

                        </span>



                        {diagnostico && (

                          <span className="rounded-full bg-[var(--elara-superficie)]/70 px-3 py-1 text-[10px] font-extrabold text-[#6A8490]">

                            {diagnostico}

                          </span>

                        )}

                      </div>



                      <h2 className="text-3xl font-extrabold tracking-[-0.04em] text-[#3C4B50]">

                        {nome}

                      </h2>



                      <p className="mt-2 text-sm font-semibold text-[#806C66]">

                        {calcularIdade(dataNascimento)}

                        {calcularIdade(dataNascimento) && escola

                          ? " • "

                          : ""}

                        {escola || ""}

                      </p>

                    </div>

                  </div>



                  <div className="flex flex-wrap gap-3">

                    <Link

                      href="/agenda"

                      className="rounded-full bg-[var(--elara-terracota)] px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#C96E57]"

                    >

                      Ver agenda

                    </Link>



                    <Link

                      href="/cuidados"

                      className="rounded-full border border-white/80 bg-[var(--elara-superficie)]/70 px-5 py-3 text-sm font-extrabold text-[#B7614C] transition hover:bg-[var(--elara-superficie)]"

                    >

                      Ver cuidados

                    </Link>

                  </div>

                </div>

              </section>



              {/* RESUMO */}

              <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                <div className="rounded-[24px] border border-[var(--elara-borda)] bg-[var(--elara-superficie)] p-5">

                  <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[var(--elara-terracota-suave)] text-[var(--elara-terracota)]">

                    ♡

                  </span>



                  <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#9A8580]">

                    Nascimento

                  </p>



                  <p className="mt-1 font-extrabold">

                    {formatarData(dataNascimento)}

                  </p>

                </div>



                <div className="rounded-[24px] border border-[#DCE8ED] bg-[var(--elara-azul-suave)] p-5">

                  <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[var(--elara-superficie)] text-[#7198AA]">

                    +

                  </span>



                  <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#78909A]">

                    Diagnóstico

                  </p>



                  <p className="mt-1 font-extrabold">

                    {diagnostico || "Não informado"}

                  </p>

                </div>



                <div className="rounded-[24px] border border-[#DCE8ED] bg-[var(--elara-azul-suave)] p-5">

                  <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[var(--elara-superficie)] text-xs font-black text-[#7198AA]">

                    CID

                  </span>



                  <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#78909A]">

                    Código CID

                  </p>



                  <p className="mt-1 font-extrabold uppercase">

                    {cid || "Não informado"}

                  </p>

                </div>



                <div className="rounded-[24px] border border-[#DCE9DC] bg-[var(--elara-verde-suave)] p-5">

                  <span className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[var(--elara-superficie)] text-[#709A70]">

                    ♙

                  </span>



                  <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#799079]">

                    Responsável

                  </p>



                  <p className="mt-1 truncate font-extrabold">

                    {responsavel}

                  </p>

                </div>

              </section>



              {/* DETALHES */}

              <section className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">

                <article className="rounded-[30px] border border-[var(--elara-borda)] bg-[var(--elara-superficie)] p-6 sm:p-7">

                  <div>

                    <p className="text-xs font-bold text-[var(--elara-azul)]">

                      Acompanhamento

                    </p>



                    <h2 className="mt-1 text-2xl font-extrabold">

                      Saúde e cuidados

                    </h2>

                  </div>



                  <div className="mt-6 space-y-3">

                    <div className="flex flex-col justify-between gap-2 rounded-[18px] bg-[var(--elara-superficie-secundaria)] p-4 sm:flex-row sm:items-center">

                      <div>

                        <p className="text-xs font-bold text-[#8C989C]">

                          Alergias

                        </p>



                        <p className="mt-1 text-sm font-extrabold">

                          {alergias || "Nenhuma informada"}

                        </p>

                      </div>



                      <span className="w-fit rounded-full bg-[var(--elara-terracota-suave)] px-3 py-1 text-[10px] font-extrabold text-[#BD6751]">

                        ATENÇÃO

                      </span>

                    </div>



                    <div className="flex flex-col justify-between gap-2 rounded-[18px] bg-[var(--elara-superficie-secundaria)] p-4 sm:flex-row sm:items-center">

                      <div>

                        <p className="text-xs font-bold text-[#8C989C]">

                          Terapias

                        </p>



                        <p className="mt-1 text-sm font-extrabold">

                          {terapias || "Nenhuma informada"}

                        </p>

                      </div>



                      <Link

                        href="/agenda"

                        className="text-xs font-extrabold text-[#7094A6]"

                      >

                        Ver agenda →

                      </Link>

                    </div>



                    <div className="flex flex-col justify-between gap-2 rounded-[18px] bg-[var(--elara-superficie-secundaria)] p-4 sm:flex-row sm:items-center">

                      <div>

                        <p className="text-xs font-bold text-[#8C989C]">

                          Escola

                        </p>



                        <p className="mt-1 text-sm font-extrabold">

                          {escola || "Não informada"}

                        </p>

                      </div>

                    </div>

                  </div>

                </article>



                <article className="rounded-[30px] border border-[#DCE8ED] bg-[var(--elara-azul-suave)] p-6 sm:p-7">

                  <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-[#6E94A6]">

                    Observações

                  </p>



                  <h2 className="mt-2 text-xl font-extrabold">

                    Informações importantes

                  </h2>



                  <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-[#647A83]">

                    {observacoes ||

                      "Nenhuma observação importante foi cadastrada."}

                  </p>

                </article>

              </section>



              {/* ACESSOS RÁPIDOS */}

              <section className="mt-8">

                <div className="mb-4">

                  <p className="text-xs font-bold text-[var(--elara-terracota)]">

                    Acesso rápido

                  </p>



                  <h2 className="mt-1 text-xl font-extrabold">

                    Organizar rotina

                  </h2>

                </div>



                <div className="grid gap-4 md:grid-cols-3">

                  <Link

                    href="/agenda"

                    className="group rounded-[24px] border border-[#D4E4EB] bg-[var(--elara-azul-suave)] p-5 transition hover:-translate-y-1 hover:shadow-md"

                  >

                    <p className="text-xs font-bold text-[#7194A5]">

                      Agenda

                    </p>



                    <p className="mt-2 font-extrabold">

                      Consultas e terapias

                    </p>



                    <p className="mt-5 text-sm font-extrabold text-[#63899C]">

                      Acessar →

                    </p>

                  </Link>



                  <Link

                    href="/cuidados"

                    className="group rounded-[24px] border border-[#D5E7D5] bg-[var(--elara-verde-suave)] p-5 transition hover:-translate-y-1 hover:shadow-md"

                  >

                    <p className="text-xs font-bold text-[#719771]">

                      Cuidados

                    </p>



                    <p className="mt-2 font-extrabold">

                      Medicamentos e dieta

                    </p>



                    <p className="mt-5 text-sm font-extrabold text-[#699469]">

                      Acessar →

                    </p>

                  </Link>



                  <Link

                    href="/biblioteca"

                    className="group rounded-[24px] border border-[#EACAC1] bg-[var(--elara-terracota-suave)] p-5 transition hover:-translate-y-1 hover:shadow-md"

                  >

                    <p className="text-xs font-bold text-[#C06A54]">

                      Conteúdos

                    </p>



                    <p className="mt-2 font-extrabold">

                      Informação e direitos

                    </p>



                    <p className="mt-5 text-sm font-extrabold text-[#BD6751]">

                      Acessar →

                    </p>

                  </Link>

                </div>

              </section>

            </>

          )}

        </div>

      </main>

    </div>

  );

}
