import { goBack } from '../navigation';

export function renderAboutPage(): void {
  const bodyContainer = document.querySelector('#page-about .page__body');
  if (bodyContainer) {
    bodyContainer.innerHTML = `
      <div style="text-align: center; margin-bottom: 24px;">
        <img src="../../assets/icon-16.png" alt="PixelPals" style="width: 40px; height: 40px; image-rendering: pixelated; margin: 0 auto 8px; display: block;" />
        <p style="font-size: 16px; font-weight: 700; color: var(--color-primary); margin: 0 0 8px 0;">PixelPals</p>
        <p style="font-size: 12px; color: var(--color-text-muted); margin: 0;">v1.0</p>
      </div>

      <p style="font-size: 14px; line-height: 1.8; color: var(--color-text-secondary); text-align: center; margin: 0 0 24px 0;">
        Cute pixel art companions living in your browser. They watch you type, react to videos, and wander around\u2014just keeping you company.
      </p>

      <p style="font-size: 12px; color: var(--color-text-muted); text-align: center; margin: 0;">
        Made with \u2764\uFE0F by <strong><a href="https://github.com/Relja92" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: none;">Relja92</a></strong> & <strong><a href="https://github.com/skakac" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: none;">skakac</a></strong>
      </p>
    `;

    // Add spacer and credits at the bottom
    const spacer = document.createElement('div');
    spacer.style.flex = '1';
    spacer.style.minHeight = '0';
    bodyContainer.appendChild(spacer);

    const creditsSection = document.createElement('div');
    creditsSection.style.marginTop = '40px';
    creditsSection.style.paddingTop = '24px';
    creditsSection.innerHTML = `
      <div id="credits-toggle" class="credits-header">
        <h3 style="font-size: 13px; font-weight: 600; color: var(--color-text-secondary); text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">Credits</h3>
        <span class="credits-toggle-icon">\u203A</span>
      </div>

      <div id="credits-content" class="credits-content">
        <p style="font-size: 12px; color: var(--color-text-secondary); line-height: 1.6; margin-bottom: 12px; margin-top: 12px;">
          Pet assets from the <strong><a href="https://github.com/tonybaloney/vscode-pets" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: none;">VS Code Pets</a></strong> project by <a href="https://github.com/tonybaloney" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: none;">Anthony Shaw</a>. Artists:
        </p>

        <ul style="font-size: 12px; color: var(--color-text-secondary); padding-left: 16px; margin: 0 0 12px 0; line-height: 2;">
          <li><strong>Clippy, Rocky, Zappy, Rubber Duck, Snake, Cockatiel, Crab, Mod</strong> \u2014 <a href="https://twitter.com/marcduiker" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: none;">Marc Duiker</a></li>
          <li><strong>Dog</strong> \u2014 <a href="https://nvph-studio.itch.io/dog-animation-4-different-dogs" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: none;">NVPH Studio</a></li>
          <li><strong>Akita</strong> \u2014 <a href="https://github.com/kevin2huang" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: none;">Kevin Huang</a></li>
          <li><strong>Fox</strong> \u2014 <a href="https://twitter.com/pixelthen" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: none;">Elthen</a></li>
          <li><strong>Panda</strong> \u2014 <a href="https://github.com/jeferris" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: none;">Jessie Ferris</a></li>
          <li><strong>Horse, Skeleton</strong> \u2014 <a href="https://github.com/thechriskent" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: none;">Chris Kent</a></li>
          <li><strong>Turtle</strong> \u2014 <a href="https://www.pixilart.com/draw" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: none;">enkeefe</a></li>
          <li><strong>Snail</strong> \u2014 <a href="https://github.com/WoofWoof0" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: none;">Kennet Shin</a></li>
          <li><strong>Crab concept</strong> \u2014 <a href="https://www.aldeka.net" target="_blank" rel="noopener noreferrer" style="color: var(--color-primary); text-decoration: none;">Karen Rustad T\u00F6lva</a></li>
          <li><strong>Chicken, Deno, Monkey, Totoro, Rat, Morph, Vampire</strong> \u2014 community contributors</li>
        </ul>

        <p style="font-size: 11px; color: var(--color-text-muted);">
          Licensed under MIT. Special thanks to all the pixel artists who made these adorable creatures possible.
        </p>
      </div>
    `;

    bodyContainer.appendChild(creditsSection);

    // Wire credits toggle
    const creditsToggle = document.getElementById('credits-toggle');
    const creditsContent = document.getElementById('credits-content') as HTMLElement | null;

    if (creditsToggle && creditsContent) {
      creditsToggle.addEventListener('click', () => {
        const isExpanded = creditsContent.dataset.expanded === 'true';
        creditsContent.dataset.expanded = String(!isExpanded);
        creditsToggle.classList.toggle('expanded');
      });
    }
  }

  const backBtn = document.getElementById('back-from-about');
  if (backBtn) {
    backBtn.addEventListener('click', () => goBack());
  }
}
