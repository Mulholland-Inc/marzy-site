// <mz-family-hero></mz-family-hero> — hero with a human-feel typewriter that
// types a product vertical, pauses, then backspace-deletes it (jittery timing).
const WORDS = ["Dental", "Accounting", "Healthcare", "Payroll", "Operations"];
const rand = (a, b) => a + Math.random() * (b - a);
class MzFamilyHero extends HTMLElement {
  connectedCallback() {
    this.classList.add("famhero");
    this.innerHTML = `
      <h1 class="famhero-title">Marzy for<br /><span class="typer"><span class="type-text">${WORDS[0]}</span><span class="type-cursor" aria-hidden="true"></span></span></h1>
      <p class="lead">One AI agent for the back office — now tailored to your industry. Same engine, built for the way your field actually works.</p>
      <div class="actions">
        <a class="btn btn-primary" href="#">Get a demo</a>
        <a class="btn btn-outline" href="#">Explore products</a>
      </div>`;

    const out = this.querySelector(".type-text");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return; // keep static word

    let wi = 0;
    let ci = WORDS[0].length;
    let deleting = true; // start by deleting the pre-filled first word
    const tick = () => {
      const word = WORDS[wi];
      if (!deleting) {
        ci++;
        out.textContent = word.slice(0, ci);
        if (ci >= word.length) {
          deleting = true;
          return setTimeout(tick, rand(1200, 1900)); // linger on the full word
        }
        // typing: jittery, with the occasional small hesitation
        setTimeout(tick, rand(55, 145) + (Math.random() < 0.12 ? 230 : 0));
      } else {
        ci--;
        out.textContent = word.slice(0, ci);
        if (ci <= 0) {
          deleting = false;
          wi = (wi + 1) % WORDS.length;
          return setTimeout(tick, rand(280, 520)); // beat before the next word
        }
        setTimeout(tick, rand(38, 95)); // deleting runs a touch faster
      }
    };
    setTimeout(tick, 1400);
  }
}
customElements.define("mz-family-hero", MzFamilyHero);
