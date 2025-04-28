/**
 * scrape-gabaritos-multiplo.js
 * ───────────────────────────────────────────────────────────────────
 * • Node ≥ 18 – sem dependências externas
 * • Faz login 1× e percorre ANOS 2006‑2025,
 *   provas T1 / T2 / TP, questões sequenciais até 404.
 * • Salva:
 *     ▸ JSON individual de cada questão em  json/ANO/EXAM/QNN.json
 *     ▸ JSON consolidado por prova         json/ANO/EXAM/questions.json
 *     ▸ JSON consolidado por ano           json/ANO/questions.json
 *     ▸ JSON geral                         questions.json
 * • Baixa todas as imagens para:
 *     ./imagens/ANO/EXAM/arquivo.png
 *   As tags <img> nos JSONs já apontam para
 *   https://oftquest.vercel.app/imagens/ANO/EXAM/arquivo.png
 */

import { type PathLike } from "fs";
import fs from "fs/promises";
import path from "path";
import { setTimeout as sleep } from "timers/promises";

//──────────── credenciais (trocar por process.env.* em produção)
const { CPF, SENHA } = {
  CPF: "237.768.731-83",
  SENHA: "sadQec-9rijsy-niwqew",
};
if (!CPF || !SENHA) {
  console.error("Defina CPF e SENHA em variáveis de ambiente");
  process.exit(1);
}

//──────────── util de console
const clr = {
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
};
const sym = { ok: "✔", err: "✖", skip: "↳", start: "➤" };

//──────────── fetch com timeout
async function fetchWithTimeout(
  url: string | URL | Request,
  opts = {},
  ms = 15000,
) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

//──────────── helpers de string / HTML
const strip = (s: string) =>
  s
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
const find = (h: string, re: RegExp): string => h.match(re)?.[1] ?? "";
const all = (h: string, re: RegExp) => [...h.matchAll(re)];
const cleanAttrs = (h: string): string =>
  h.replace(/<(\w+)\s*([^>]*)>/gi, (_, tag: string, attrs: string) => {
    if (tag.toLowerCase() === "img") {
      const src = /src="[^"]+"/i.exec(attrs);
      return src ? `<img ${src[0]}>` : "<img>";
    }
    if (tag.toLowerCase() === "iframe") {
      // Preserve all iframe attributes
      return `<iframe ${attrs}>`;
    }
    return `<${tag.toLowerCase()}>`;
  });
const tidy = (h: string) =>
  h
    .replace(/&nbsp;/gi, " ")
    .replace(/<(\w+)>\s*<\/\1>/g, "")
    .replace(/\s{2,}/g, " ")
    .replace(/\n{2,}/g, "\n")
    .trim();

//──────────── download de imagens
async function ensureDir(dir: PathLike) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch {}
}
async function saveImage(relPath: string, originalUrl: string | URL | Request) {
  const dest = path.join(process.cwd(), "public", relPath);
  await ensureDir(path.dirname(dest));
  const res = await fetchWithTimeout(originalUrl);
  if (!res.ok) {
    console.warn("Falha no download:", originalUrl);
    return;
  }
  const buf = await res.arrayBuffer();
  await fs.writeFile(dest, Buffer.from(buf));
}

//──────────── login
const loginUrl = "https://www.oftalmomaster.com.br/minha-conta/autenticar";
async function login() {
  const body = new URLSearchParams({ cpf: CPF, senha: SENHA }).toString();
  const r = await fetchWithTimeout(loginUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Content-Length": String(body.length),
      "User-Agent": "ScraperBot",
      "X-Requested-With": "XMLHttpRequest",
    },
    body,
  });
  if (!r.ok) throw Error(`Login → ${r.status}`);
  const ck = r.headers.get("set-cookie")?.split(";")[0];
  if (!ck?.startsWith("ci_session=")) throw Error("ci_session ausente");
  return ck;
}

//──────────── helpers específicos de questão
function convertSrc(oldSrc: string, task: { year: number; examCode: string }) {
  const filename = oldSrc.substring(oldSrc.lastIndexOf("/") + 1);
  const rel = `/imagens/${task.year}/${task.examCode}/${filename}`;
  const absNew = `https://oftquest.vercel.app${rel}`;
  return { rel, absNew, original: oldSrc };
}

// Add interfaces after the imports
interface Task {
  year: number;
  examCode: string;
  typeSlug: string;
  num: number;
}

interface ImageInfo {
  rel: string;
  absNew: string;
  original: string;
}

interface Question {
  year: number;
  type: string;
  number: number;
  topic: string;
  statement: string;
  options: {
    text: string;
    images: string[];
    isCorrect: boolean;
  }[];
  explanation: string;
  images: string[];
  comments: string[];
  questionListsItem: string[];
  userFavorites: string[];
}

interface ParseResult {
  json: Question;
  imageObjs: ImageInfo[];
}

// Fix the parse function signature
function parse(html: string, task: Task): ParseResult {
  const topic = strip(
    find(
      html,
      new RegExp(
        `<li[^>]*id="questao-${task.num}"[\\s\\S]*?<span class="cbo">[^|]*\\|([^<]+)`,
        "i",
      ),
    ),
  );

  //──────── enunciado
  const stmtBlock = find(html, /<div class="enunciado">([\s\S]*?)<\/div>/i);
  const statement = stmtBlock.replace(/<img[^>]*>/gi, ""); // Remove img tags
  const enunImgs = all(stmtBlock, /<img[^>]+src="([^"]+)"/gi)
    .map((m) => (m[1] ? convertSrc(m[1], task) : null))
    .filter((img): img is NonNullable<typeof img> => img !== null);

  // Handle YouTube iframes in statement
  const statementWithIframes = statement.replace(
    /<iframe[^>]*src="[^"]*youtube[^"]*"[^>]*>.*?<\/iframe>/gi,
    (iframe) => `<div data-youtube-video>${iframe}</div>`,
  );

  //──────── opções (inclui imagens das opções)
  const optionImgsAll: ImageInfo[] = [];
  const options = all(
    html,
    /<li[^>]*class="radio[^"]*"[^>]*>([\s\S]*?)<\/li>/gi,
  ).map((li) => {
    const optImgs = li[1]
      ? all(li[1], /<img[^>]+src="([^"]+)"/gi)
          .map((m) => (m[1] ? convertSrc(m[1], task) : null))
          .filter((img): img is NonNullable<typeof img> => img !== null)
      : [];
    optionImgsAll.push(...optImgs);

    // Extract the text content after the span and remove img tags
    const textContent = li[1]
      ? (li[1].split("</span>")[1] ?? "").replace(/<img[^>]*>/gi, "")
      : "";

    return {
      text: textContent, // Keep HTML content
      images: optImgs.map((o) => o.rel),
      isCorrect: li[1] ? li[1].includes("checked") : false,
    };
  });

  //──────── explicação (limpa attrs e troca src)
  let expl = find(
    html,
    /<div class="comentario">[\s\S]*?<div class="texto">([\s\S]*?)<\/div>/i,
  );
  expl = tidy(cleanAttrs(expl)).replace(/\\/g, "");

  // Handle YouTube iframes
  expl = expl.replace(
    /<iframe[^>]*src="[^"]*youtube[^"]*"[^>]*>.*?<\/iframe>/gi,
    (iframe) => `<div data-youtube-video>${iframe}</div>`,
  );

  const explImgs: ImageInfo[] = [];
  expl = expl.replace(
    /<img[^>]+src="([^"]+)"/gi,
    (tag: string, oldSrc: string) => {
      const info = convertSrc(oldSrc, task);
      explImgs.push(info);
      return tag.replace(oldSrc, info.absNew);
    },
  );

  return {
    json: {
      year: task.year,
      type: task.typeSlug,
      number: task.num,
      topic,
      statement: statementWithIframes,
      options,
      explanation: expl,
      images: enunImgs.map((o) => o.rel), // Only statement images
      comments: [],
      questionListsItem: [],
      userFavorites: [],
    },
    imageObjs: [...enunImgs, ...explImgs, ...optionImgsAll],
  };
}

// Fix the fetchHtml function signature
async function fetchHtml(
  cookie: string,
  task: { year: number; examCode: string; typeSlug?: string; num: number },
) {
  const url = `https://www.oftalmomaster.com.br/minha-conta/gabaritos/${task.year}/${task.examCode}/${task.num}`;
  const r = await fetchWithTimeout(url, {
    headers: { Cookie: cookie, "User-Agent": "ScraperBot" },
    redirect: "follow",
  });
  if (r.status === 404) throw new Error("404");
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.text();
}

// Fix the scrapeYear function
async function scrapeYear(year: number, cookie: string): Promise<Question[]> {
  const examInfo: [string, string][] = [
    ["TP", "teorico-pratica"],
    ["T1", "teorica-1"],
    ["T2", "teorica-2"],
  ];

  console.log("\n" + clr.cyan(`${sym.start} Ano ${year} — início`));

  const results: Question[] = [];

  for (const [examCode, typeSlug] of examInfo) {
    const examDir = path.join(
      process.cwd(),
      "public",
      "json",
      String(year),
      examCode,
    );
    await ensureDir(examDir);

    console.log(clr.cyan(`${sym.start} ${year} ${examCode} — Q1 em diante`));

    const examResults: Question[] = [];

    /* ───────────────────── retomada, se houver arquivos prévios ───────── */
    let startNum = 1;
    try {
      const files = await fs.readdir(examDir);
      for (const f of files) {
        const m = /^Q(\d+)\.json$/i.exec(f);
        if (m) {
          const n = Number(m[1]);
          startNum = Math.max(startNum, n + 1);
          const data = JSON.parse(
            await fs.readFile(path.join(examDir, f), "utf-8"),
          ) as Question;
          examResults.push(data);
          results.push(data);
        }
      }
    } catch {}
    if (startNum > 1) {
      console.log(
        clr.yellow(
          `${sym.skip} retomando ${year} ${examCode} a partir da Q${String(
            startNum,
          ).padStart(2, "0")}`,
        ),
      );
    }
    /* ─────────────────────────────────────────────────────────────────── */

    for (let num = startNum; ; num++) {
      const task: Task = { year, examCode, typeSlug, num };
      try {
        const html = await fetchHtml(cookie, task);
        const { json, imageObjs } = parse(html, task);

        examResults.push(json);
        results.push(json);

        // salva JSON individual
        const qFile = path.join(
          examDir,
          `Q${String(num).padStart(2, "0")}.json`,
        );
        await fs.writeFile(qFile, JSON.stringify(json, null, 2));

        // baixa imagens
        await Promise.all(imageObjs.map((o) => saveImage(o.rel, o.original)));

        console.log(
          clr.green(
            `${sym.ok} ${year} ${examCode} Q${String(num).padStart(2, "0")}`,
          ),
        );

        await sleep(150); // espaçamento entre requisições
      } catch (e: unknown) {
        if (e instanceof Error && e.message === "404") {
          console.log(
            clr.yellow(
              `${sym.skip} ${year} ${examCode} terminou em ${num - 1}`,
            ),
          );
          break;
        }
        console.error(
          clr.red(
            `${sym.err} ${year}/${examCode}/${num}: ${e instanceof Error ? e.message : String(e)}`,
          ),
        );
        break;
      }
    }

    /* salva JSON consolidado POR PROVA */
    {
      const file = path.join(examDir, "questions.json");
      await fs.writeFile(file, JSON.stringify(examResults, null, 2));
      console.log(
        clr.green(`${sym.ok} [${year} ${examCode}] arquivo salvo → ${file}`),
      );
    }
  }

  /* salva JSON consolidado POR ANO */
  {
    const yearDir = path.join(process.cwd(), "public", "json", String(year));
    await ensureDir(yearDir);
    const file = path.join(yearDir, "questions.json");
    await fs.writeFile(file, JSON.stringify(results, null, 2));
    console.log(clr.green(`${sym.ok} [${year}] arquivo salvo → ${file}`));
  }

  console.log(
    clr.cyan(`— Ano ${year} concluído: ${results.length} questões válidas —`),
  );
  return results;
}

// Fix the main execution
void (async () => {
  try {
    const cookie = await login();
    const all: Question[] = [];
    const years = Array.from({ length: 2025 - 2006 + 1 }, (_, i) => 2006 + i);
    const PAR_YEARS = 25; // anos simultâneos

    for (let i = 0; i < years.length; i += PAR_YEARS) {
      const batch = years.slice(i, i + PAR_YEARS);
      const results = await Promise.all(
        batch.map((yr) => scrapeYear(yr, cookie)),
      );
      all.push(...results.flat());
    }

    const file = path.join(process.cwd(), "public", "questions.json");
    await fs.writeFile(file, JSON.stringify(all, null, 2));
    console.log(
      clr.green(
        `\n${sym.ok} Total geral: ${all.length} questões salvas em 1 arquivo`,
      ),
    );
  } catch (error) {
    console.error("Error:", error);
  }
})();
