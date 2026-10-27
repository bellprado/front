"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [concluido, setConcluido] = useState(false);
  const [erro, setErro] = useState("");

  async function solicitar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErro("Informe um e-mail válido.");
      return;
    }
    if (!API_URL) {
      setErro("A recuperação ainda não está disponível: a API não foi configurada.");
      return;
    }
    setEnviando(true);
    try {
      const resposta = await fetch(`${API_URL}/auth/esqueci-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      if (!resposta.ok) throw new Error("Falha na solicitação.");
      // A mesma mensagem é exibida para qualquer endereço, evitando enumeração de contas.
      setConcluido(true);
    } catch {
      setErro("Não foi possível enviar a solicitação. Tente novamente mais tarde.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F8F5F1] px-5 py-10 text-[#2C3E44]">
      <section className="w-full max-w-[470px] rounded-[28px] border border-[#EEE8E2] bg-white p-7 shadow-sm sm:p-10">
        <Link href="/" className="inline-flex items-center gap-3 font-extrabold tracking-widest text-[#D97D64]">
          <span className="flex h-11 w-11 items-center justify-center rounded-[15px] bg-[#D97D64] text-white">E</span> ELARA
        </Link>
        <p className="mt-9 text-xs font-extrabold uppercase tracking-widest text-[#7FA2B8]">Segurança da conta</p>
        <h1 className="mt-3 text-3xl font-extrabold">Recuperar senha</h1>
        {concluido ? (
          <div role="status" className="mt-6 rounded-2xl bg-[#EDF5ED] p-5 text-sm leading-6 text-[#4F6553]">
            Se existir uma conta vinculada a este e-mail, você receberá instruções para redefinir sua senha. Confira também a caixa de spam.
          </div>
        ) : (
          <>
            <p className="mt-3 text-sm leading-6 text-[#718187]">Informe o e-mail cadastrado para receber um link temporário de recuperação.</p>
            <form onSubmit={solicitar} className="mt-7">
              <label htmlFor="email" className="mb-2 block text-sm font-extrabold">E-mail</label>
              <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seuemail@exemplo.com" className="w-full rounded-[17px] border border-[#DED8D2] bg-white px-4 py-3.5 outline-none focus:border-[#7FA2B8]" />
              {erro && <p role="alert" className="mt-4 text-sm text-[#B95F49]">{erro}</p>}
              <button type="submit" disabled={enviando} className="mt-6 w-full rounded-full bg-[#D97D64] px-6 py-3.5 text-sm font-extrabold text-white disabled:opacity-60">{enviando ? "Enviando..." : "Enviar link de recuperação"}</button>
            </form>
          </>
        )}
        <Link href="/login" className="mt-7 block text-center text-sm font-bold text-[#668B9D]">Voltar para o login</Link>
      </section>
    </main>
  );
}
