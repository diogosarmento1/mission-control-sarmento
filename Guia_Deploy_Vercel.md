# Mission Control — site próprio com login (fora da Google)

Isto cria um site novo, num serviço chamado Vercel (gratuito para este uso), com uma página de login a sério — utilizador e password, sessão guardada com segurança, funciona em qualquer navegador/dispositivo. Os dados continuam a vir do Apps Script/Google Sheets como até agora; só a "porta de entrada" muda.

Tudo feito pela interface (sem terminal, sem linha de comandos).

## Passo 1 — Conta GitHub (se ainda não tiveres)

1. Vai a github.com → Sign up → cria a conta (é grátis).

## Passo 2 — Criar o repositório e enviar os ficheiros

1. Em github.com, clica no `+` no canto superior direito → `New repository`.
2. Nome: `mission-control-sarmento` → `Create repository` (pode ficar privado).
3. Nessa página nova, clica em `uploading an existing file` (ou `Add file` → `Upload files`).
4. Arrasta para lá **todo o conteúdo** da pasta `vercel_site` (não a pasta em si — o que está dentro dela: `api`, `lib`, `login.html`, `vercel.json`, `package.json`).
5. `Commit changes`.

## Passo 3 — Conta Vercel e importar o projeto

1. Vai a vercel.com → `Sign up` → escolhe `Continue with GitHub` (mais simples, liga logo as duas contas).
2. No painel da Vercel, `Add New` → `Project`.
3. Escolhe o repositório `mission-control-sarmento` → `Import`.
4. Antes de clicar em Deploy, abre `Environment Variables` e acrescenta estas 5 (nome à esquerda, valor à direita):

| Nome | Valor |
|---|---|
| `AUTH_USERNAME` | `diogo` |
| `AUTH_PASSWORD_HASH` | `ab9869e0dee6f7f8c4b6c2fdb57c3302:a59976c85dc78fdbeca48f04444ae9d0721367bc4e7f22742ee31013c045a26999e83b7a1e2ddc7886525489ca4901ced996f07731aeb8e5e0137bd5733a0770` |
| `SESSION_SECRET` | `CNVghOqQ72QdahhdQTCeJmfEK2EObdhs5jx143kmAE8` |
| `APPS_SCRIPT_URL` | `https://script.google.com/macros/s/AKfycbxFYjiiJ0M009-Jqj4elxI41xti1gjr5402gp_M3D7Puz96KR4lCu0hTfbWGhof10Qk/exec` |
| `APPS_SCRIPT_KEY` | `4yz6esPPnaXT71udcZYDW-W7HLEn0ZaM` |

5. `Deploy`.

Ao fim de ~1 minuto, a Vercel dá-te um link tipo `mission-control-sarmento.vercel.app` — é esse o teu site novo.

## As tuas credenciais de login

- **Utilizador:** `diogo`
- **Password:** `5d9rFzaddrDda3vd`

Guarda a password nalgum sítio seguro (ex. gestor de passwords) — não fica visível em lado nenhum depois disto. Se a quiseres mudar mais tarde, diz-me e gero um novo `AUTH_PASSWORD_HASH` para colocares na Vercel (Settings → Environment Variables), sem precisares de tocar no código.

## O que muda no dia a dia

- Nada na forma como atualizas os dados — continua tudo igual (exportas o Diamante, eu trato do resto, aparece sozinho).
- O link a usar/partilhar passa a ser o da Vercel (`https://mission-control-sarmento.vercel.app`), não mais o do Apps Script — esse deixa de ser preciso partilhar, fica só a funcionar "por trás" a fornecer os dados.
- Para dar acesso a mais alguém no futuro (ex. o teu superior), digo-te o que fazer — passa por gerar um novo utilizador/password e acrescentar mais uma verificação, é rápido de fazer.

## Nota técnica (só para referência)

O Apps Script (`MissionControl.gs`) ganhou um "modo API": se o link tiver `?formato=json&chave=...`, devolve só os dados em JSON em vez da página HTML completa — é isto que o site novo usa para ir buscar os dados, sem que o utilizador final alguma vez veja ou precise desse link. O link do Apps Script com a chave continua a existir e a funcionar como antes (`?chave=...` sem `formato=json` mostra a página normal), mas não precisa de ser partilhado com ninguém — só o site novo o usa, do lado do servidor.
