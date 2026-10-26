"use client";



import { useEffect, useMemo, useState } from "react";

import Sidebar from "../../../components/Sidebar";



type Compromisso = {

  id: number;

  titulo: string;

  local: string;

  data: string;

  horario: string;

  observacoes: string;

  tipo: string;

};



const tiposCompromisso = [

  "Consulta",

  "Terapia",

  "Exame",

  "Escola",

  "Outro",

];



const nomesMeses = [

  "Janeiro",

  "Fevereiro",

  "Março",

  "Abril",

  "Maio",

  "Junho",

  "Julho",

  "Agosto",

  "Setembro",

  "Outubro",

  "Novembro",

  "Dezembro",

];



export default function AgendaPage() {

  const [formularioAberto, setFormularioAberto] = useState(false);

  const [idEditando, setIdEditando] = useState<number | null>(null);



  const [titulo, setTitulo] = useState("");

  const [local, setLocal] = useState("");

  const [data, setData] = useState("");

  const [horario, setHorario] = useState("");

  const [observacoes, setObservacoes] = useState("");

  const [tipo, setTipo] = useState("Terapia");



  const [mesAtual, setMesAtual] = useState(() => new Date().getMonth());
  const [anoAtual, setAnoAtual] = useState(() => new Date().getFullYear());
  const [diaSelecionado, setDiaSelecionado] = useState<number | null>(null);
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState<number | null>(null);
  const [erro, setErro] = useState("");

  // Contrato provisório: GET/POST /compromissos e PATCH/DELETE /compromissos/:id.
  // Ajustar os caminhos e os campos quando o backend NestJS definir sua API.
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001").replace(/\/$/, "");

  useEffect(() => {
    const controller = new AbortController();
    async function carregarCompromissos() {
      setCarregando(true);
      setErro("");
      try {
        const resposta = await fetch(`${apiUrl}/compromissos`, {
          signal: controller.signal,
          credentials: "include",
          cache: "no-store",
        });
        if (!resposta.ok) throw new Error(`Falha ao carregar compromissos (${resposta.status}).`);
        const resultado: unknown = await resposta.json();
        if (!Array.isArray(resultado)) throw new Error("Formato de resposta inesperado da API.");
        setCompromissos(resultado as Compromisso[]);
      } catch (falha) {
        if (controller.signal.aborted) return;
        setErro(falha instanceof Error ? falha.message : "Não foi possível acessar a agenda.");
      } finally {
        if (!controller.signal.aborted) setCarregando(false);
      }
    }
    void carregarCompromissos();
    return () => controller.abort();
  }, [apiUrl]);

  function limparFormulario() {

    setTitulo("");

    setLocal("");

    setData("");

    setHorario("");

    setObservacoes("");

    setTipo("Terapia");

    setIdEditando(null);

  }



  function abrirNovoCompromisso() {

    limparFormulario();



    if (diaSelecionado !== null) {

      const mes = String(mesAtual + 1).padStart(2, "0");

      const dia = String(diaSelecionado).padStart(2, "0");

      setData(`${anoAtual}-${mes}-${dia}`);

    }



    setFormularioAberto(true);

  }



  function fecharFormulario() {

    limparFormulario();

    setFormularioAberto(false);

  }



  async function salvarCompromisso() {
    if (!titulo.trim() || !data || !horario) {
      alert("Preencha o compromisso, a data e o horário.");
      return;
    }
    setSalvando(true);
    setErro("");
    const payload = {
      titulo: titulo.trim(), local: local.trim(), data, horario,
      observacoes: observacoes.trim(), tipo,
    };
    try {
      const editando = idEditando !== null;
      const resposta = await fetch(
        editando ? `${apiUrl}/compromissos/${idEditando}` : `${apiUrl}/compromissos`,
        {
          method: editando ? "PATCH" : "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!resposta.ok) throw new Error(`Não foi possível salvar o compromisso (${resposta.status}).`);
      const salvo: Compromisso = await resposta.json();
      if (salvo == null || salvo.id == null) throw new Error("A API não retornou o compromisso salvo com ID.");
      setCompromissos((lista) => editando
        ? lista.map((item) => item.id === idEditando ? salvo : item)
        : [...lista, salvo]);
      limparFormulario();
      setFormularioAberto(false);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Erro ao salvar compromisso.");
    } finally {
      setSalvando(false);
    }
  }

  function editarCompromisso(compromisso: Compromisso) {

    setIdEditando(compromisso.id);

    setTitulo(compromisso.titulo);

    setLocal(compromisso.local || "");

    setData(compromisso.data.slice(0, 10));

    setHorario(compromisso.horario);

    setObservacoes(compromisso.observacoes || "");

    setTipo(compromisso.tipo);

    setFormularioAberto(true);



    window.scrollTo({

      top: 0,

      behavior: "smooth",

    });

  }



  async function excluirCompromisso(id: number) {
    if (!window.confirm("Deseja realmente excluir este compromisso?")) return;
    setExcluindoId(id);
    setErro("");
    try {
      const resposta = await fetch(`${apiUrl}/compromissos/${id}`, {
        method: "DELETE", credentials: "include",
      });
      if (!resposta.ok) throw new Error(`Não foi possível excluir o compromisso (${resposta.status}).`);
      setCompromissos((lista) => lista.filter((item) => item.id !== id));
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Erro ao excluir compromisso.");
    } finally {
      setExcluindoId(null);
    }
  }

  function formatarData(dataCompromisso: string) {

    const [ano, mes, dia] = dataCompromisso.slice(0, 10).split("-");



    return {

      dia,

      mes: nomesMeses[Number(mes) - 1].slice(0, 3).toUpperCase(),

      completa: `${dia}/${mes}/${ano}`,

    };

  }



  function mesAnterior() {

    if (mesAtual === 0) {

      setMesAtual(11);

      setAnoAtual((ano) => ano - 1);

    } else {

      setMesAtual((mes) => mes - 1);

    }



    setDiaSelecionado(null);

  }



  function proximoMes() {

    if (mesAtual === 11) {

      setMesAtual(0);

      setAnoAtual((ano) => ano + 1);

    } else {

      setMesAtual((mes) => mes + 1);

    }



    setDiaSelecionado(null);

  }



  function dataDoDia(dia: number) {

    const mes = String(mesAtual + 1).padStart(2, "0");

    const diaFormatado = String(dia).padStart(2, "0");



    return `${anoAtual}-${mes}-${diaFormatado}`;

  }



  function temCompromisso(dia: number) {

    const dataProcurada = dataDoDia(dia);



    return compromissos.some(

      (compromisso) => compromisso.data.slice(0, 10) === dataProcurada

    );

  }



  const diasCalendario = useMemo(() => {

    const primeiroDia = new Date(

      anoAtual,

      mesAtual,

      1

    ).getDay();



    const quantidadeDias = new Date(

      anoAtual,

      mesAtual + 1,

      0

    ).getDate();



    return [

      ...Array(primeiroDia).fill(null),

      ...Array.from(

        { length: quantidadeDias },

        (_, indice) => indice + 1

      ),

    ];

  }, [mesAtual, anoAtual]);



  const compromissosOrdenados = useMemo(() => {

    return [...compromissos].sort((a, b) => {

      const primeiro = `${a.data}T${a.horario}`;

      const segundo = `${b.data}T${b.horario}`;



      return primeiro.localeCompare(segundo);

    });

  }, [compromissos]);



  const compromissosVisiveis = useMemo(() => {

    if (diaSelecionado !== null) {

      const dataSelecionada = dataDoDia(diaSelecionado);



      return compromissosOrdenados.filter(

        (compromisso) =>

          compromisso.data.slice(0, 10) === dataSelecionada

      );

    }



    return compromissosOrdenados.filter((compromisso) => {

      const [ano, mes] = compromisso.data.slice(0, 10).split("-");



      return (

        Number(ano) === anoAtual &&

        Number(mes) === mesAtual + 1

      );

    });

  }, [

    compromissosOrdenados,

    diaSelecionado,

    mesAtual,

    anoAtual,

  ]);



  function corTipo(tipoCompromisso: string) {

    if (tipoCompromisso === "Terapia") {

      return {

        fundo: "bg-[var(--elara-terracota-suave)]",

        texto: "text-[var(--elara-terracota-texto)]",

        barra: "bg-[var(--elara-terracota)]",

      };

    }



    if (tipoCompromisso === "Consulta") {

      return {

        fundo: "bg-[var(--elara-azul-suave)]",

        texto: "text-[var(--elara-azul-texto)]",

        barra: "bg-[var(--elara-azul)]",

      };

    }



    if (tipoCompromisso === "Exame") {

      return {

        fundo: "bg-[var(--elara-verde-suave)]",

        texto: "text-[var(--elara-verde-texto)]",

        barra: "bg-[var(--elara-verde)]",

      };

    }



    if (tipoCompromisso === "Escola") {

      return {

        fundo: "bg-[#F5EEDF]",

        texto: "text-[#9A7C45]",

        barra: "bg-[#C7A76B]",

      };

    }



    return {

      fundo: "bg-[#F1EEEE]",

      texto: "text-[#747474]",

      barra: "bg-[#969696]",

    };

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

                <span className="h-2 w-2 rounded-full bg-[var(--elara-azul)]" />



                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-[var(--elara-azul)]">

                  Organização da rotina

                </p>

              </div>



              <h1 className="text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">

                Agenda

              </h1>



              <p className="mt-3 max-w-xl text-sm leading-6 text-[var(--elara-texto-secundario)]">

                Organize consultas, terapias, exames e outros

                compromissos importantes.

              </p>

            </div>



            <button

              type="button"

              onClick={abrirNovoCompromisso}

              className="w-fit rounded-full bg-[var(--elara-terracota)] px-6 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--elara-terracota-hover)]"

            >

              + Novo compromisso

            </button>

          </header>



          {erro && (
            <div role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {erro}
            </div>
          )}

          {/* RESUMO */}

          <section className="mb-6 grid gap-4 sm:grid-cols-3">

            <div className="rounded-[24px] border border-[#EBCBC2] bg-[var(--elara-terracota-suave)] p-5">

              <p className="text-xs font-bold text-[#BD6751]">

                Compromissos

              </p>



              <p className="mt-2 text-3xl font-black text-[#A85B48]">

                {compromissos.length}

              </p>



              <p className="mt-1 text-xs text-[#8C746E]">

                cadastrados na agenda

              </p>

            </div>



            <div className="rounded-[24px] border border-[#D5E4EB] bg-[var(--elara-azul-suave)] p-5">

              <p className="text-xs font-bold text-[#668B9E]">

                Mês visualizado

              </p>



              <p className="mt-2 text-xl font-extrabold capitalize text-[#506D7B]">

                {nomesMeses[mesAtual]}

              </p>



              <p className="mt-1 text-xs text-[#738891]">

                {anoAtual}

              </p>

            </div>



            <div className="rounded-[24px] border border-[#D7E7D7] bg-[var(--elara-verde-suave)] p-5">

              <p className="text-xs font-bold text-[#6D986D]">

                Dia selecionado

              </p>



              <p className="mt-2 text-xl font-extrabold text-[#526E56]">

                {diaSelecionado

                  ? `${diaSelecionado} de ${nomesMeses[mesAtual]}`

                  : "Todos"}

              </p>



              <p className="mt-1 text-xs text-[#788A7A]">

                Clique em um dia no calendário

              </p>

            </div>

          </section>



          {/* FORMULÁRIO */}

          {formularioAberto && (

            <section className="mb-6 overflow-hidden rounded-[30px] border border-[#E8D4CD] bg-[var(--elara-superficie)] shadow-[0_12px_45px_rgba(44,62,68,0.06)]">

              <div className="flex flex-col justify-between gap-4 border-b border-[var(--elara-borda)] bg-[var(--elara-superficie-secundaria)] px-6 py-5 sm:flex-row sm:items-center sm:px-8">

                <div>

                  <p className="text-xs font-bold text-[var(--elara-terracota)]">

                    {idEditando !== null

                      ? "Alterar informações"

                      : "Adicionar à rotina"}

                  </p>



                  <h2 className="mt-1 text-2xl font-extrabold">

                    {idEditando !== null

                      ? "Editar compromisso"

                      : "Novo compromisso"}

                  </h2>

                </div>



                <button

                  type="button"

                  onClick={fecharFormulario}

                  className="flex h-10 w-10 items-center justify-center self-end rounded-full border border-[#E6DDD7] bg-[var(--elara-superficie)] text-xl font-bold text-[#7E8B8F] transition hover:border-[#D97D64] hover:text-[var(--elara-terracota)] sm:self-auto"

                  aria-label="Fechar formulário"

                >

                  ×

                </button>

              </div>



              <div className="p-6 sm:p-8">

                <div className="grid gap-5 md:grid-cols-2">

                  <div>

                    <label className="mb-2 block text-sm font-extrabold text-[#465B62]">

                      Compromisso \*

                    </label>



                    <input

                      type="text"

                      value={titulo}

                      onChange={(e) => setTitulo(e.target.value)}

                      placeholder="Ex.: Terapia ocupacional"

                      className="w-full rounded-[16px] border border-[var(--elara-borda-forte)] bg-[var(--elara-input)] px-4 py-3.5 text-sm outline-none transition placeholder:text-[var(--elara-placeholder)] focus:border-[#D97D64] focus:bg-[var(--elara-superficie)]"

                    />

                  </div>



                  <div>

                    <label className="mb-2 block text-sm font-extrabold text-[#465B62]">

                      Tipo

                    </label>



                    <select

                      value={tipo}

                      onChange={(e) => setTipo(e.target.value)}

                      className="w-full rounded-[16px] border border-[var(--elara-borda-forte)] bg-[var(--elara-input)] px-4 py-3.5 text-sm outline-none transition focus:border-[#7FA2B8] focus:bg-[var(--elara-superficie)]"

                    >

                      {tiposCompromisso.map((opcao) => (

                        <option key={opcao} value={opcao}>

                          {opcao}

                        </option>

                      ))}

                    </select>

                  </div>



                  <div>

                    <label className="mb-2 block text-sm font-extrabold text-[#465B62]">

                      Local

                    </label>



                    <input

                      type="text"

                      value={local}

                      onChange={(e) => setLocal(e.target.value)}

                      placeholder="Ex.: Clínica Bem Cuidar"

                      className="w-full rounded-[16px] border border-[var(--elara-borda-forte)] bg-[var(--elara-input)] px-4 py-3.5 text-sm outline-none transition placeholder:text-[var(--elara-placeholder)] focus:border-[#7FA2B8] focus:bg-[var(--elara-superficie)]"

                    />

                  </div>



                  <div className="grid grid-cols-2 gap-3">

                    <div>

                      <label className="mb-2 block text-sm font-extrabold text-[#465B62]">

                        Data \*

                      </label>



                      <input

                        type="date"

                        value={data}

                        onChange={(e) => setData(e.target.value)}

                        className="w-full rounded-[16px] border border-[var(--elara-borda-forte)] bg-[var(--elara-input)] px-3 py-3.5 text-sm outline-none transition focus:border-[#7FA2B8] focus:bg-[var(--elara-superficie)]"

                      />

                    </div>



                    <div>

                      <label className="mb-2 block text-sm font-extrabold text-[#465B62]">

                        Horário \*

                      </label>



                      <input

                        type="time"

                        value={horario}

                        onChange={(e) => setHorario(e.target.value)}

                        className="w-full rounded-[16px] border border-[var(--elara-borda-forte)] bg-[var(--elara-input)] px-3 py-3.5 text-sm outline-none transition focus:border-[#7FA2B8] focus:bg-[var(--elara-superficie)]"

                      />

                    </div>

                  </div>

                </div>



                <div className="mt-5">

                  <label className="mb-2 block text-sm font-extrabold text-[#465B62]">

                    Observações

                  </label>



                  <textarea

                    value={observacoes}

                    onChange={(e) => setObservacoes(e.target.value)}

                    placeholder="Ex.: levar exames, documentos, receitas ou outras informações importantes..."

                    rows={4}

                    className="w-full resize-none rounded-[18px] border border-[var(--elara-borda-forte)] bg-[var(--elara-input)] px-4 py-3.5 text-sm leading-6 outline-none transition placeholder:text-[var(--elara-placeholder)] focus:border-[#D97D64] focus:bg-[var(--elara-superficie)]"

                  />

                </div>



                <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                  <button

                    type="button"

                    onClick={() => void salvarCompromisso()}
                  disabled={salvando}

                    className="rounded-full bg-[var(--elara-terracota)] px-6 py-3 text-sm font-extrabold text-white transition hover:bg-[var(--elara-terracota-hover)]"

                  >

                    {idEditando !== null

                      ? "Salvar alterações"

                      : "Salvar compromisso"}

                  </button>



                  <button

                    type="button"

                    onClick={fecharFormulario}

                    className="rounded-full border border-[var(--elara-borda-forte)] bg-[var(--elara-superficie)] px-6 py-3 text-sm font-extrabold text-[#758489] transition hover:bg-[var(--elara-fundo)]"

                  >

                    Cancelar

                  </button>

                </div>

              </div>

            </section>

          )}



          {/* CALENDÁRIO + COMPROMISSOS */}

          <section className="grid gap-6 xl:grid-cols-[0.75fr_1.25fr]">

            {/* CALENDÁRIO */}

            <aside className="h-fit rounded-[30px] border border-[#D7E5EB] bg-[var(--elara-azul-suave)] p-5 sm:p-6 xl:sticky xl:top-6">

              <div className="flex items-center justify-between">

                <button

                  type="button"

                  onClick={mesAnterior}

                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--elara-superficie)] text-xl font-bold text-[#66899A] shadow-sm transition hover:-translate-x-0.5"

                  aria-label="Mês anterior"

                >

                  ‹

                </button>



                <div className="text-center">

                  <p className="text-lg font-extrabold">

                    {nomesMeses[mesAtual]}

                  </p>



                  <p className="text-xs font-bold text-[var(--elara-azul)]">

                    {anoAtual}

                  </p>

                </div>



                <button

                  type="button"

                  onClick={proximoMes}

                  className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--elara-superficie)] text-xl font-bold text-[#66899A] shadow-sm transition hover:translate-x-0.5"

                  aria-label="Próximo mês"

                >

                  ›

                </button>

              </div>



              <div className="mt-6 grid grid-cols-7 gap-1 text-center">

                {["D", "S", "T", "Q", "Q", "S", "S"].map(

                  (diaSemana, indice) => (

                    <div

                      key={`${diaSemana}-${indice}`}

                      className="py-2 text-[10px] font-extrabold text-[var(--elara-texto-suave)]"

                    >

                      {diaSemana}

                    </div>

                  )

                )}



                {diasCalendario.map((diaCalendario, indice) => {

                  const selecionado =

                    diaCalendario === diaSelecionado;



                  const possuiCompromisso =

                    diaCalendario !== null &&

                    temCompromisso(diaCalendario);



                  return (

                    <div

                      key={indice}

                      className="flex min-h-[46px] items-center justify-center"

                    >

                      {diaCalendario !== null && (

                        <button

                          type="button"

                          onClick={() =>

                            setDiaSelecionado((diaAnterior) =>

                              diaAnterior === diaCalendario

                                ? null

                                : diaCalendario

                            )

                          }

                          className={`relative flex h-9 w-9 items-center justify-center rounded-full text-xs font-extrabold transition ${

                            selecionado

                              ? "bg-[var(--elara-azul)] text-white shadow-md"

                              : "text-[#5F737B] hover:bg-[var(--elara-superficie)]"

                          }`}

                        >

                          {diaCalendario}



                          {possuiCompromisso && !selecionado && (

                            <span className="absolute bottom-0.5 h-1.5 w-1.5 rounded-full bg-[var(--elara-terracota)]" />

                          )}

                        </button>

                      )}

                    </div>

                  );

                })}

              </div>



              <div className="mt-5 border-t border-[var(--elara-borda)] pt-5">

                <div className="flex items-center gap-2 text-xs text-[#72868F]">

                  <span className="h-2 w-2 rounded-full bg-[var(--elara-terracota)]" />

                  Dia com compromisso

                </div>



                {diaSelecionado !== null && (

                  <button

                    type="button"

                    onClick={() => setDiaSelecionado(null)}

                    className="mt-4 text-xs font-extrabold text-[#678D9F] hover:underline"

                  >

                    Mostrar o mês inteiro

                  </button>

                )}

              </div>

            </aside>



            {/* LISTA */}

            <div>

              <div className="mb-5 flex items-end justify-between gap-4">

                <div>

                  <p className="text-xs font-bold text-[var(--elara-terracota)]">

                    {diaSelecionado

                      ? "Compromissos do dia"

                      : "Visão mensal"}

                  </p>



                  <h2 className="mt-1 text-2xl font-extrabold">

                    {diaSelecionado

                      ? `${diaSelecionado} de ${nomesMeses[mesAtual]}`

                      : `${nomesMeses[mesAtual]} de ${anoAtual}`}

                  </h2>

                </div>



                <span className="rounded-full bg-[var(--elara-superficie)] px-3 py-1.5 text-xs font-bold text-[#7A898E]">

                  {compromissosVisiveis.length}{" "}

                  {compromissosVisiveis.length === 1

                    ? "compromisso"

                    : "compromissos"}

                </span>

              </div>



              {carregando ? (
                <p role="status" className="rounded-[30px] bg-[var(--elara-superficie)] p-8 text-sm">Carregando compromissos...</p>
              ) : compromissosVisiveis.length === 0 ? (

                <div className="rounded-[30px] border border-dashed border-[var(--elara-borda-forte)] bg-[var(--elara-superficie)]/60 px-6 py-14 text-center">

                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-[var(--elara-azul-suave)] text-2xl text-[var(--elara-azul)]">

                    ◷

                  </div>



                  <h3 className="mt-5 text-lg font-extrabold">

                    Nenhum compromisso por aqui

                  </h3>



                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[var(--elara-texto-secundario)]">

                    Este período está livre. Você pode adicionar um

                    compromisso quando precisar.

                  </p>



                  <button

                    type="button"

                    onClick={abrirNovoCompromisso}

                    className="mt-5 rounded-full bg-[var(--elara-terracota)] px-5 py-2.5 text-sm font-extrabold text-white"

                  >

                    + Adicionar compromisso

                  </button>

                </div>

              ) : (

                <div className="space-y-4">

                  {compromissosVisiveis.map((compromisso) => {

                    const dataFormatada = formatarData(

                      compromisso.data

                    );



                    const cores = corTipo(compromisso.tipo);



                    return (

                      <article

                        key={compromisso.id}

                        className="group relative overflow-hidden rounded-[26px] border border-[var(--elara-borda)] bg-[var(--elara-superficie)] p-5 shadow-[0_8px_30px_rgba(44,62,68,0.035)] transition hover:-translate-y-0.5 hover:shadow-md sm:p-6"

                      >

                        <div

                          className={`absolute bottom-0 left-0 top-0 w-1.5 ${cores.barra}`}

                        />



                        <div className="flex flex-col gap-5 sm:flex-row">

                          <div className="flex shrink-0 gap-3 sm:block sm:w-[75px] sm:text-center">

                            <div>

                              <p className={`text-2xl font-black ${cores.texto}`}>

                                {dataFormatada.dia}

                              </p>



                              <p className={`text-[10px] font-extrabold ${cores.texto}`}>

                                {dataFormatada.mes}

                              </p>

                            </div>



                            <div className="sm:mt-4">

                              <p className="text-sm font-extrabold text-[var(--elara-texto-secundario)]">

                                {compromisso.horario}

                              </p>

                            </div>

                          </div>



                          <div className="min-w-0 flex-1">

                            <div className="flex flex-wrap items-center gap-2">

                              <span

                                className={`rounded-full px-3 py-1 text-[10px] font-extrabold ${cores.fundo} ${cores.texto}`}

                              >

                                {compromisso.tipo.toUpperCase()}

                              </span>



                              <span className="text-[10px] font-bold text-[var(--elara-texto-suave)]">

                                {dataFormatada.completa}

                              </span>

                            </div>



                            <h3 className="mt-3 text-xl font-extrabold tracking-[-0.02em]">

                              {compromisso.titulo}

                            </h3>



                            <p className="mt-2 text-sm font-semibold text-[var(--elara-texto-secundario)]">

                              {compromisso.local ||

                                "Local não informado"}

                            </p>



                            {compromisso.observacoes && (

                              <div className="mt-4 rounded-[16px] bg-[var(--elara-superficie-secundaria)] px-4 py-3">

                                <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--elara-texto-suave)]">

                                  Observação

                                </p>



                                <p className="mt-1.5 text-xs leading-5 text-[var(--elara-texto-secundario)]">

                                  {compromisso.observacoes}

                                </p>

                              </div>

                            )}



                            <div className="mt-5 flex flex-wrap gap-2">

                              <button

                                type="button"

                                onClick={() =>

                                  editarCompromisso(compromisso)

                                }

                                className="rounded-full border border-[#CFDFE6] bg-[var(--elara-azul-suave)] px-4 py-2 text-xs font-extrabold text-[#668A9C] transition hover:bg-[var(--elara-azul-suave)]"

                              >

                                Editar

                              </button>



                              <button

                                type="button"

                                onClick={() =>

                                  excluirCompromisso(

                                    compromisso.id

                                  )

                                }

                                className="rounded-full border border-[#EED3CB] bg-[var(--elara-terracota-suave)] px-4 py-2 text-xs font-extrabold text-[#C56851] transition hover:bg-[var(--elara-terracota-suave)]"

                              >

                                {excluindoId === compromisso.id ? "Excluindo..." : "Excluir"}

                              </button>

                            </div>

                          </div>

                        </div>

                      </article>

                    );

                  })}

                </div>

              )}

            </div>

          </section>

        </div>

      </main>

    </div>

  );

}
