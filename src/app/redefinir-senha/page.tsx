"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

function FormularioRedefinicao() {
  const parametros = useSearchParams();
  const token = parametros.get("token") || "";
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [erro, setErro] = useState("");

  async function redefinir(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    if (!token) { setErro("Link inválido ou incompleto. Solicite outro link."); return; }
    if (senha.length < 12) { setErro("A senha deve ter pelo menos 12 caracteres."); return; }
    if (senha !== confirmacao) { setErro("As senhas não coincidem."); return; }
    if (!API_URL) { setErro("A recuperação ainda não está disponível: a API não foi configurada."); return; }
    setSalvando(true);
    try {
      const resposta = await fetch(`${API_URL}/auth/redefinir-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, novaSenha: senha }),
      });
      if (!resposta.ok) throw new Error("Token inválido, expirado ou indisponível.");
      setSenha(""); setConfirmacao(""); setSucesso(true);
    } catch {
      setErro("Não foi possível redefinir a senha. O link pode estar expirado ou já ter sido usado.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F5F1] px-5 py-10 text-[#2C3E44]">
      <section className="w-full max-w-[470px] rounded-[28px] border border-[#EEE8E2] bg-white p-7 shadow-sm sm:p-10">
        <Link href="/" className="inline-flex items-center gap-3 font-extrabold tracking-widest text-[#D97D64]"><span className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-[#D97D64] text-white">E</span> ELARA</Link>
        <p className="mt-9 text-xs font-extrabold uppercase tracking-widest text-[#7FA2B8]">Segurança da conta</p>
        <h1 className="mt-3 text-3xl font-extrabold">Criar nova senha</h1>
        {sucesso ? (
          <div role="status" className="mt-6 rounded-2xl bg-[#EDF5ED] p-5 text-sm text-[#4F6553]">Senha atualizada. Você já pode entrar com a nova senha.</div>
        ) : !token ? (
          <p role="alert" className="mt-6 text-sm text-[#B95F49]">Este link não contém um token válido. Solicite uma nova recuperação.</p>
        ) : (
          <form onSubmit={redefinir} className="mt-7 space-y-5">
            <p className="text-sm leading-6 text-[#718187]">Escolha uma senha de pelo menos 12 caracteres.</p>
            <div><label htmlFor="senha" className="mb-2 block text-sm font-extrabold">Nova senha</label><input id="senha" type={mostrarSenha ? "text" : "password"} autoComplete="new-password" required minLength={12} value={senha} onChange={(e) => setSenha(e.target.value)} className="w-full rounded-[17px] border border-[#DED8D2] px-4 py-3.5 outline-none focus:border-[#7FA2B8]" /></div>
            <div><label htmlFor="confirmacao" className="mb-2 block text-sm font-extrabold">Confirmar nova senha</label><input id="confirmacao" type={mostrarSenha ? "text" : "password"} autoComplete="new-password" required minLength={12} value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} className="w-full rounded-[17px] border border-[#DED8D2] px-4 py-3.5 outline-none focus:border-[#7FA2B8]" /></div>
            <label className="flex items-center gap-2 text-sm text-[#718187]"><input type="checkbox" checked={mostrarSenha} onChange={(e) => setMostrarSenha(e.target.checked)} /> Mostrar senhas</label>
            {erro && <p role="alert" className="text-sm text-[#B95F49]">{erro}</p>}
            <button type="submit" disabled={salvando} className="w-full rounded-full bg-[#D97D64] px-6 py-3.5 text-sm font-extrabold text-white disabled:opacity-60">{salvando ? "Salvando..." : "Salvar nova senha"}</button>
          </form>
        )}
        <Link href={sucesso ? "/login" : "/esqueci-senha"} className="mt-7 block text-center text-sm font-bold text-[#668B9D]">{sucesso ? "Ir para o login" : "Solicitar outro link"}</Link>
      </section>
    </main>
  );
}

export default function RedefinirSenhaPage() {
  return <Suspense fallback={<p className="p-8">Carregando...</p>}><FormularioRedefinicao /></Suspense>;
}
