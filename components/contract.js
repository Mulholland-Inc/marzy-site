// <mz-contract></mz-contract> — contract / agreement template (sample).
const CLAUSES = [
  ["Services", "Marzy will operate the back-office workflows agreed by the parties, acting within scoped, revocable connections to the Client's systems."],
  ["Human oversight", "Marzy acts autonomously only on workflows the Client has explicitly trusted. All other actions are queued for the Client's review before execution."],
  ["Data & security", "Each workspace runs in an isolated environment. Every action is logged with its source and reasoning, and the Client may export or revoke access at any time."],
  ["Fees", "The Client agrees to the fees set out in the applicable order, billed monthly net 30. Either party may terminate with thirty (30) days' written notice."],
  ["Confidentiality", "Each party will protect the other's confidential information and use it solely to perform under this agreement."],
];
class MzContract extends HTMLElement {
  connectedCallback() {
    this.classList.add("document");
    const clauses = CLAUSES.map(
      ([h, p], i) => `<li class="clause"><span class="clause-n">${i + 1}</span><div><h3>${h}</h3><p>${p}</p></div></li>`
    ).join("");
    this.innerHTML = `
      <article class="doc">
        <h1>Service agreement</h1>
        <div class="doc-meta"><span>Between Marzy, Inc. and Lazarco Inc.</span><span>Effective Jun 15, 2026</span></div>
        <p class="lead">This agreement sets out the terms under which Marzy provides autonomous back-office services to the Client.</p>
        <ol class="clauses">${clauses}</ol>
        <div class="sign-grid">
          <div class="sign-line"><b>Marzy, Inc.</b><br />Signature &middot; Date</div>
          <div class="sign-line"><b>Lazarco Inc.</b><br />Signature &middot; Date</div>
        </div>
      </article>`;
  }
}
customElements.define("mz-contract", MzContract);
