// <mz-family-hero></mz-family-hero>, product-family hero with a typewriter
// headline that rotates through the verticals Marzy serves. The animated
// conversation card now lives in its own component, <mz-thread>.
const WORDS = ["Dental", "Accounting", "Healthcare", "Payroll", "Operations"];
const rand = (a, b) => a + Math.random() * (b - a);

class MzFamilyHero extends HTMLElement {
  connectedCallback() {
    this.classList.add("famhero");
    this.innerHTML = `
      <div class="famhero-copy">
        <h1 class="famhero-title">Marzy for<br /><span class="typer"><span class="type-text">${WORDS[0]}</span><span class="type-cursor" aria-hidden="true"></span></span></h1>
        <p class="lead">One AI agent for the back office, now tailored to your industry. Same engine, built for the way your field actually works.</p>
        <div class="actions">
          <a class="btn btn-primary" href="#">Get a demo</a>
          <a class="btn btn-outline" href="#">Explore products</a>
        </div>
      </div>`;

    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const out = this.querySelector(".type-text");

    let wi = 0, ci = WORDS[0].length, deleting = true;
    const tick = () => {
      const word = WORDS[wi];
      if (!deleting) {
        ci++;
        out.textContent = word.slice(0, ci);
        if (ci >= word.length) {
          deleting = true;
          return setTimeout(tick, rand(2600, 3400));
        }
        setTimeout(tick, rand(55, 145) + (Math.random() < 0.12 ? 230 : 0));
      } else {
        ci--;
        out.textContent = word.slice(0, ci);
        if (ci <= 0) {
          deleting = false;
          wi = (wi + 1) % WORDS.length;
          return setTimeout(tick, rand(280, 520));
        }
        setTimeout(tick, rand(38, 95));
      }
    };
    setTimeout(tick, 2600);
  }
}
customElements.define("mz-family-hero", MzFamilyHero);
