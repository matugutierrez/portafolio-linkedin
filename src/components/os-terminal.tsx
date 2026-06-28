import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import { useProfile } from "@/lib/use-profile";
import { useOS } from "@/lib/os-theme";

type Line = { kind: "in" | "out" | "sys"; text: string; html?: boolean; wrapIndent?: number };

interface OsTerminalProps {
  years: number;
  projects: number;
  tech: number;
  techList: string[];
  commitment: string;
  labels: { years: string; projects: string; tech: string; commitment: string };
}

export function OsTerminal({ years, projects, tech, techList, commitment, labels }: OsTerminalProps) {
  const { lang } = useI18n();
  const { data: profile } = useProfile();
  const [os] = useOS();
  const isMac = os === "mac";
  const es = lang === "es";

  const [input, setInput] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [hIdx, setHIdx] = useState<number>(-1);
  const [extra, setExtra] = useState<Line[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initial banner + stats — Windows CMD or macOS Terminal
  const initial = useMemo<Line[]>(() => {
    const techCount = techList.length > 0 ? techList.length : tech;
    const rows: Array<{ hex: string; label: string; value: string; isTech?: boolean }> = [
        { hex: "0x01", label: labels.years,      value: `+${years}` },
        { hex: "0x02", label: labels.projects,   value: `+${projects}` },
        { hex: "0x03", label: labels.tech,       value: `+${techCount}`, isTech: true },
        { hex: "0x04", label: labels.commitment, value: commitment },
    ];
    const out: Line[] = isMac
      ? [
          { kind: "sys", text: `Last login: ${new Date().toDateString()} on ttys000` },
          { kind: "in", text: "stats --all" },
        ]
      : [
          { kind: "sys", text: "Microsoft Windows [Version 10.0.19045]" },
          { kind: "sys", text: "(c) Matu Corporation. " + (es ? "Todos los derechos reservados." : "All rights reserved.") },
          { kind: "in", text: "stats /all" },
        ];
      const techIdx = rows.findIndex((r) => r.isTech);
      const before = rows.slice(0, techIdx + 1)
        .map((r) => `${`[${r.hex}] ${r.label}`.padEnd(40, ".")}${r.value.padStart(8, " ")}`)
        .join("\n");
      out.push({ kind: "out", text: before });
      if (techList.length) {
        out.push({ kind: "out", text: `     > ${techList.join(", ")}`, wrapIndent: 7 });
      }
      const after = rows.slice(techIdx + 1)
        .map((r) => `${`[${r.hex}] ${r.label}`.padEnd(40, ".")}${r.value.padStart(8, " ")}`)
        .join("\n");
      if (after) out.push({ kind: "out", text: after });
      return out;
  }, [years, projects, tech, techList, commitment, labels, es, isMac]);

  useEffect(() => {
    setExtra([]);
    setInput("");
    setHistory([]);
    setHIdx(-1);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [extra]);

  const commands: Record<string, () => Line[]> = {
    help: () => [{
      kind: "out",
      text:
        (es ? "Comandos:" : "Commands:") + "\n" +
        "  help, about, whoami, skills, projects, contact, social, cv, date, echo <txt>, clear",
    }],
    about: () => [{ kind: "out", text: (es ? profile?.bio_es : profile?.bio_en) ?? "Full Stack Developer." }],
    whoami: () => [{ kind: "out", text: profile?.name ?? "Matías Gutiérrez" }],
    skills: () => [{ kind: "out", text: techList.length ? techList.join(" · ") : "TypeScript · React · Node.js · Tailwind" }],
    tech: () => [{ kind: "out", text: techList.length ? techList.join(" · ") : "TypeScript · React · Node.js" }],
    projects: () => [{ kind: "out", html: true, text: `→ <a href="/proyectos" class="underline">/proyectos</a>` }],
    contact: () => [{
      kind: "out", html: true,
      text:
        `email    <a href="mailto:${profile?.email ?? "matugutierrez7@gmail.com"}" class="underline">${profile?.email ?? "matugutierrez7@gmail.com"}</a>\n` +
        `whatsapp <a href="https://wa.me/5491159371225" target="_top" class="underline">+54 9 11 5937-1225</a>`,
    }],
    social: () => [{
      kind: "out", html: true,
      text:
        (profile?.github_url ? `github   <a href="${profile.github_url}" target="_blank" rel="noreferrer" class="underline">${profile.github_url}</a>\n` : "") +
        (profile?.linkedin_url ? `linkedin <a href="${profile.linkedin_url}" target="_blank" rel="noreferrer" class="underline">${profile.linkedin_url}</a>` : ""),
    }],
    cv: () => [{ kind: "out", text: es ? "usá el botón 'Descargar CV' arriba" : "use the 'Download CV' button above" }],
    date: () => [{ kind: "out", text: new Date().toString() }],
    clear: () => { setTimeout(() => setExtra([]), 0); return []; },
    ls: () => [{ kind: "out", text: "about  projects  skills  contact  cv  social" }],
    exit: () => [{ kind: "out", text: es ? "No podés salir de la matrix." : "You can't exit the matrix." }],
    sudo: () => [{ kind: "out", text: "¯\\_(ツ)_/¯" }],
  };

  function run(raw: string) {
    const cmdLine = raw.trim();
    const promptLine: Line = { kind: "in", text: cmdLine };
    if (!cmdLine) { setExtra((l) => [...l, promptLine]); return; }
    setHistory((h) => [...h, cmdLine]);
    setHIdx(-1);
    const [cmd, ...rest] = cmdLine.split(/\s+/);
    const arg = rest.join(" ");
    let out: Line[] = [];
    if (cmd === "echo") out = [{ kind: "out", text: arg }];
    else if (commands[cmd]) out = commands[cmd]();
    else out = [{ kind: "out", text: `${cmd}: ${es ? "comando no encontrado. Probá 'help'." : "command not found. Try 'help'."}` }];
    setExtra((l) => [...l, promptLine, ...out]);
  }

  const allLines = [...initial, ...extra];

  if (isMac) {
    return (
      <section className="mt-12">
        <div
          onClick={() => inputRef.current?.focus()}
          className="relative overflow-hidden"
          style={{
            backgroundColor: "#1d1d1d",
            color: "#f2f2f2",
            borderRadius: 10,
            border: "1px solid #000",
            boxShadow: "0 20px 50px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04) inset",
            fontFamily: '"SF Mono", Menlo, Monaco, "JetBrains Mono", ui-monospace, monospace',
          }}
        >
          {/* macOS title bar */}
          <div
            className="flex items-center px-3 py-2 relative"
            style={{
              background: "linear-gradient(180deg, #3c3c3c 0%, #2a2a2a 100%)",
              borderBottom: "1px solid #000",
            }}
          >
            <div className="flex items-center gap-2">
              <MacDot color="#ff5f57" />
              <MacDot color="#febc2e" />
              <MacDot color="#28c840" />
            </div>
            <span
              className="absolute left-1/2 -translate-x-1/2 text-[12px] font-semibold"
              style={{ color: "#d0d0d0" }}
            >
              matias — -zsh — 80×24
            </span>
          </div>
          <TerminalBody
            scrollRef={scrollRef}
            inputRef={inputRef}
            lines={allLines}
            input={input}
            setInput={setInput}
            run={run}
            history={history}
            hIdx={hIdx}
            setHIdx={setHIdx}
            promptEl={
              <span>
                <span style={{ color: "#7ee787" }}>matias@MacBook-Pro</span>
                <span style={{ color: "#d0d0d0" }}> ~ </span>
                <span style={{ color: "#7ee787" }}>%</span>
              </span>
            }
            linkClass="text-sky-300"
            outClass="text-[#f2f2f2]"
            inputCaret="caret-white"
            placeholder={es ? "escribí 'help' y ENTER" : "type 'help' and ENTER"}
            noWrap
            fontFamily='"SF Mono", Menlo, Monaco, "JetBrains Mono", ui-monospace, monospace'
          />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          {es ? "Tip: probá 'help', 'projects', 'contact'." : "Tip: try 'help', 'projects', 'contact'."}
          {" "}<Link to="/proyectos" className="text-green-400 hover:underline">/proyectos</Link>
        </p>
      </section>
    );
  }

  return (
    <section className="mt-12">
      <div
          onClick={() => inputRef.current?.focus()}
          className="relative font-mono overflow-hidden"
          style={{
            backgroundColor: "#012456",
            color: "#e8e8e8",
            border: "2px solid",
            borderTopColor: "#dfdfdf",
            borderLeftColor: "#dfdfdf",
            borderRightColor: "#000000",
            borderBottomColor: "#000000",
            boxShadow: "4px 4px 12px rgba(0,0,0,0.35)",
            fontFamily: '"Lucida Console", "Perfect DOS VGA 437", Consolas, monospace',
          }}
        >
          {/* Classic Windows title bar */}
          <div
            className="flex items-center justify-between px-2 py-1 text-white"
            style={{ background: "linear-gradient(180deg, #0a246a 0%, #000080 100%)" }}
          >
            <div className="flex items-center gap-2">
              <ClassicWinFlag className="size-3.5" />
              <span className="text-[12px] font-bold tracking-wide">C:\Windows\System32\cmd.exe</span>
            </div>
            <div className="flex items-center gap-1">
              <ClassicWinBtn>_</ClassicWinBtn>
              <ClassicWinBtn>▢</ClassicWinBtn>
              <ClassicWinBtn>×</ClassicWinBtn>
            </div>
          </div>
          <TerminalBody
            scrollRef={scrollRef}
            inputRef={inputRef}
            lines={allLines}
            input={input}
            setInput={setInput}
            run={run}
            history={history}
            hIdx={hIdx}
            setHIdx={setHIdx}
            promptEl={<span className="text-white">C:\Users\matu&gt;</span>}
            linkClass="text-yellow-300"
            outClass="text-white"
            inputCaret="caret-white"
            placeholder={es ? "escribí 'help' y ENTER" : "type 'help' and ENTER"}
            noWrap
            fontFamily='"Lucida Console", "Perfect DOS VGA 437", Consolas, monospace'
          />
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {es ? "Tip: probá 'help', 'projects', 'contact'." : "Tip: try 'help', 'projects', 'contact'."}
        {" "}<Link to="/proyectos" className="text-green-400 hover:underline">/proyectos</Link>
      </p>
    </section>
  );
}

function TerminalBody({
  scrollRef, inputRef, lines, input, setInput, run, history, hIdx, setHIdx,
  promptEl, linkClass, outClass, inputCaret, placeholder, noWrap, fontFamily,
}: {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLInputElement | null>;
  lines: Line[];
  input: string;
  setInput: (s: string) => void;
  run: (s: string) => void;
  history: string[];
  hIdx: number;
  setHIdx: (n: number) => void;
  promptEl: React.ReactNode;
  linkClass: string;
  outClass: string;
  inputCaret: string;
  placeholder: string;
  noWrap?: boolean;
  fontFamily?: string;
}) {
  const preClass = noWrap ? "whitespace-pre" : "whitespace-pre-wrap";
  return (
    <div
      ref={scrollRef}
      className="h-72 overflow-y-auto overflow-x-hidden p-3 text-[12.5px] leading-snug"
      style={fontFamily ? { fontFamily } : undefined}
    >
      <style>{`.term-link a{ text-decoration: underline; } .term-link a{ color: inherit; }`}</style>
      {lines.map((l, i) => (
        <div key={i} className={l.kind === "sys" ? "text-white/70" : l.kind === "in" ? "text-white" : outClass}>
          {l.kind === "in" ? (
            <span className={noWrap ? "whitespace-pre" : ""}>{promptEl} <span>{l.text}</span></span>
          ) : l.html ? (
            <pre
              className={`term-link ${linkClass} ${l.wrapIndent ? "whitespace-pre-wrap" : preClass}`}
              style={{
                ...(l.wrapIndent ? { paddingLeft: `${l.wrapIndent}ch`, textIndent: `-${l.wrapIndent}ch` } : {}),
                ...(fontFamily ? { fontFamily } : {}),
              }}
              dangerouslySetInnerHTML={{ __html: l.text }}
            />
          ) : (
            <pre
              className={l.wrapIndent ? "whitespace-pre-wrap break-words" : preClass}
              style={{
                ...(l.wrapIndent ? { paddingLeft: `${l.wrapIndent}ch`, textIndent: `-${l.wrapIndent}ch` } : {}),
                ...(fontFamily ? { fontFamily } : {}),
              }}
            >{l.text}</pre>
          )}
        </div>
      ))}
      <form
        onSubmit={(e) => { e.preventDefault(); run(input); setInput(""); }}
        className={`flex items-center gap-2 mt-1 ${noWrap ? "whitespace-pre" : ""}`}
      >
        {promptEl}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              if (!history.length) return;
              const next = hIdx === -1 ? history.length - 1 : Math.max(0, hIdx - 1);
              setHIdx(next);
              setInput(history[next]);
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              if (hIdx === -1) return;
              const next = hIdx + 1;
              if (next >= history.length) { setHIdx(-1); setInput(""); }
              else { setHIdx(next); setInput(history[next]); }
            }
          }}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          className={`flex-1 bg-transparent outline-none border-0 text-white ${inputCaret}`}
          style={fontFamily ? { fontFamily } : undefined}
          placeholder={placeholder}
        />
      </form>
    </div>
  );
}

function ClassicWinBtn({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center justify-center text-[11px] leading-none w-4 h-3.5 font-bold text-black"
      style={{
        backgroundColor: "#c0c0c0",
        border: "1px solid",
        borderTopColor: "#ffffff",
        borderLeftColor: "#ffffff",
        borderRightColor: "#404040",
        borderBottomColor: "#404040",
      }}
    >
      {children}
    </span>
  );
}

function ClassicWinFlag({ className = "" }: { className?: string }) {
  // Classic waving 4-color Windows flag (XP/2000 era)
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <g transform="skewY(-8)">
        <rect x="2"  y="6"  width="9" height="6" fill="#e81123" />
        <rect x="12" y="6"  width="9" height="6" fill="#7eb900" />
        <rect x="2"  y="13" width="9" height="6" fill="#00a4ef" />
        <rect x="12" y="13" width="9" height="6" fill="#ffb900" />
      </g>
    </svg>
  );
}

function MacDot({ color }: { color: string }) {
  return (
    <span
      className="inline-block w-3 h-3 rounded-full"
      style={{
        backgroundColor: color,
        boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.4)",
      }}
    />
  );
}
