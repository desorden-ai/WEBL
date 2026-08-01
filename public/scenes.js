const ABOUT_PORTRAIT = './1000091026.jpg?v=20260801-cinematic-1';

const AVATARS = {
  leire: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAA0JCgwKCA0MCwwPDg0QFCIWFBISFCkdHxgiMSszMjArLy42PE1CNjlJOi4vQ1xESVBSV1dXNEFfZl5UZU1VV1P/2wBDAQ4PDxQSFCcWFidTNy83U1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1NTU1P/wgARCABwAHADASIAAhEBAxEB/8QAGgAAAgMBAQAAAAAAAAAAAAAAAQMAAgQFBv/EABgBAAMBAQAAAAAAAAAAAAAAAAACAwEE/9oADAMBAAIQAxAAAAHzQgwMEAwQDAQhrAtKwLSpASDQyNwjA2dYlcY0QPRudHJrCQTQg3wMFsazCUpBp6CtzVWcrZs/V49JUl6UkXofjNiQtLSnWM04N75V8+zdz2zTyu5w3kxTFvNkF8YFxWivS+V9Cu2083oTfLwulmddfF9N5vUtS9KyuxTVbUh6Z3zdLHHnv02pK2MY9rJ0vOek84ZFtVaB6PN2pTTi05Eo/LZzoNOLWu5tBYru5XZzGc1RF+f/xAAmEAACAgEDBAICAwAAAAAAAAABAgADERIhMQQQIjITICNBM0RQ/9oACAEBAAEFAv8AACQAZazTNbQYaNTt9/WY2A8TBANqzDuTt9fULCZWuousSomaIQcvWdJ8h3UbncrFqOXOmdPUbD1GlUS2fJDbqqyQzc9gvj4CfLsGOT5Tpm1V24189q1/BOUgjNmZAhYkIuo00SvafGHS6jQp446SL2X2WHnG1RxYhytY8Kz49S/ipn9aJ7xYvsBlyIOaT+OqnYAKl28qXxwIYnvE5q/k4bPjK2PxJVkJlVvbxThN2PCe0X2q9/02wKytsGqmrFzKgfOpTiVHAb2GydkGzbAxmyp9ldhEWNz+6/ZhpsfbvS2zbQmCdQMW6iJXZmWphqsYo3nVV6H7f//EACARAAICAwABBQAAAAAAAAAAAAABEBECAyESIDAxQVH/2gAIAQMBAT8B9lIs8U/QhfrKXycZnShF0K2fUbIRRrh9ZtjEYuOMes2xrfTIy6ISNkf/xAAgEQACAQMEAwAAAAAAAAAAAAAAAQIQESEDEjFBIDBh/9oACAECAQE/AfS2bUNtcePxF2sGUQu6MsOyOzkhRlydFhGmdkhDyqNWRpUnwQQsDQ3gg80//8QAKRAAAgEDAgUEAgMAAAAAAAAAAAEQAhEhElEDIDFhcSIwMkFQgWKRsf/aAAgBAQAGPwL8BnBhf2enB1PUjVS7r2P5c1mWfXfm7ucmD/BRqO65M9EXj1FkZ+J1WOS52lGcmEp8GpjiuPE72PibFi9SRxLRq+xM4ntVPvyW3pcKGKG/pS9VWCwzJp2ohR+ikZaHZl9Zmu6LbnDRU+XwMS3izLssjJTDG/1OJUWuamMSEVLZiU6TMWPMWq6HYbqh8TvP/8QAJhABAAICAQQCAwADAQAAAAAAAQARITFBEFFhcYGRIKGxMEDR4f/aAAgBAQABPyH/AA30uXL/ANPJn6czQFd8omHyRuu8ep9mI/xQ7JVP5GZ45/iFG88zNVqbzI+ekwulwkyHwwf9QKRwn4m71eCDMAAiE68EC4GVwMLTywwWu4bHrc+BfZ+BNu4YlluDgL7HeOtGU2XnxLZgP3K0CdCJbeoB2Esyt4Yd4EAYbZOqVavKsKOXzGlDeoC914IlYZ/XxBBds3oVA4mceL/Ucz7V0FoS1VAwPUpaSkFDxGrbi3wVQh48EquGqfMKgrCweINs5L++m6dzpqe2ZtmC4afOUz0LZjMHvM8inqN+L+jp+zHc/hBZeZanaWdIb9+ItPp3DYdcsxJ0Q0vJmQB/6Qae8/ZjubPaZ+6Bb+Yq3CJWZrIxLA+4GWFoqDi2oP2J7sQUJydi+mr6h39okKcxt6jgjxOxEdkt+ZzD4J7D+So+wwaOUjtJ7l1Al5ZjPJN28svfNU/E3+4EBR23t8zNu+CVhRq3meYiYOzv31yezJHtlLIFrygvWqJOwI4QBcwySENlWIgQbTDau7Ftt30//9oADAMBAAIAAwAAABBf/wD7vN5EDWc9tMT15PvU+aMeymZVeVAf6/FvkJqSW9ebK7b5/wD/xAAcEQEBAQEAAwEBAAAAAAAAAAABABEhEDFBYSD/2gAIAQMBAT8Q/jfG+AjJa5YcSTPAbHWD+No6jDYpz7PIntsjCw/kjAw7cITfMe7LiR07BEIdG+XSH7HnhaZLVb4n0QGGdobMXGyUYaCS63//xAAdEQEBAQADAQADAAAAAAAAAAABABEQITFBUWFx/9oACAECAQE/EMss4yyzhcmgCQ2DvC4T0Sj+SQYu7uQd+kO2/C7+yT9whN+LvrHqX1Pkj2M9PUxVn7w8P8nrfNLvRZIS9j1iui6IiyYNLUJZIYML/8QAJxABAAIBAwIHAQEBAQAAAAAAAQARITFBUXGxEGGBkaHB0SDh8PH/2gAIAQEAAT8QWXLly5cuXL8F/wABZcuXL8DMRNRJcuXLly/5ZGoLwtHTb1hRWOpWfqCFY3BliAndy8SiE3sW+IaqupwfQxSCImEdv6CgBVwBEMabjqeU5e0Rht6nniFQAbrUzdZOagwf8xMwWnTo7ME0bXQBsNZ34P1BLUUjt/Nh236urKbbnxNkGvWaIXp9YtKHpDKqqndIgVVKOH/3vNRtj1ltqqFzbZhcmjXn9Dt0/hgVhRzwerElybXiIghOgZgnWW6Lg612l1Bxo2/1DF+uX4EY4ez16QYq1zFG0J8ymTVegtfcAWzdpetL6Dt6aeKwAHpGNA7vrBljhwPhWXB91o5lgC+uC5Y7U+YqcivJEhDBZfxFEJTIJWIV31Yq1RcvUMVles1Dlej/AL38KM1WpkLKl22UkQs/VX7jgA7GorbIgqHzNmlXXPnC4VADukBoN03E4hqu5xDGbNXSBsTHRA/JFjvn59/XhjwD7C5nbLYi5fSEBzHD91ALhIL5eb9oCgzvC4VUEud25JVSOAPICdoz3hIKRxNdNbww+E95HlwQMSho6ukVGuZkNTSJqaURRMartGMKastY3SCs0Y/clhamPYwgDQXPj+8dt84jPv2JgXTGBxyr2wfcTYq1sSkUAyMKXGeXvh8ZuOGAEAekzt9aKi0R+UKNuh0LDtGC65fSYjnew8FVuj3YjgZjN12jCOqPuy5XMPl2fsJDKqDbZtQEGwL17SrFrQl2bTadk5U/zQM//NE1C3HSego7vb58Bps1gxUZ3lfyEyh1h++UCs+ReWGNlWuVfkNDVaIFMGnlEEtt2Q2Oq/SL1KtZkBQH0iCYQHvPMJvqZfo8XUZXTze33M3SZfN2I/mVz1gIF6glZ6L1QQomY5mKhwMK+UbCwWp2Iu2tSFnkH3InBhH/AMebGZLTau/h/9k=',
  rosalia: 'data:image/jpeg;base64,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',
  rozalen: 'data:image/jpeg;base64,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'
};

export const scenesConfig = [
  {
    id: 'services',
    number: '02',
    sectionLabel: 'QUÈ FEM',
    position: { x: 0, y: 0, z: -150 },
    html: `
      <article class="panel panel--services">
        <h2 class="services-title">QUÈ FEM</h2>
        <div class="services-space">
          <svg class="service-links" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <line x1="50" y1="50" x2="19" y2="29"></line>
            <line x1="50" y1="50" x2="79" y2="25"></line>
            <line x1="50" y1="50" x2="24" y2="75"></line>
            <line x1="50" y1="50" x2="77" y2="74"></line>
            <line x1="50" y1="50" x2="9" y2="53"></line>
            <line x1="50" y1="50" x2="88" y2="54"></line>
          </svg>
          <div class="service-node service-node--core" data-x="0" data-y="0" data-z="0">DESORDEN</div>
          <ul class="service-nodes" aria-label="QUÈ FEM">
            <li class="service-node" data-x="-31" data-y="-21" data-z="-12">VÍDEO</li>
            <li class="service-node" data-x="29" data-y="-25" data-z="15">FOTOGRAFIA</li>
            <li class="service-node" data-x="-26" data-y="25" data-z="34">DRON</li>
            <li class="service-node" data-x="27" data-y="24" data-z="-20">IA</li>
            <li class="service-node" data-x="-41" data-y="3" data-z="54">WEB</li>
            <li class="service-node" data-x="38" data-y="4" data-z="48">ESTRATÈGIA</li>
          </ul>
        </div>
      </article>
    `
  },
  {
    id: 'about',
    number: '02',
    sectionLabel: 'QUI SOC',
    position: { x: 0, y: 0, z: -185 },
    html: `
      <article class="panel panel--about">
        <img class="panel__media panel__media--about" src="${ABOUT_PORTRAIT}" alt="Retrat de David Milla amb contrallum taronja" loading="lazy" decoding="async">
        <div class="panel__orange-glow"></div>
        <div class="panel__veil panel__veil--about"></div>
        <div class="kinetic-word kinetic-word--about" aria-hidden="true">DESORDEN</div>
        <div class="about-copy">
          <h2>QUI SOC</h2>
          <p>David Milla, creador i director<br>de <strong>DESORDEN.</strong></p>
          <p>Direcció visual, vídeo,<br>fotografia, dron, IA i web.</p>
          <p>Un <strong>únic interlocutor</strong> durant<br>tot el procés.</p>
        </div>
        <section class="credentials" aria-label="Formacions i acreditacions">
          <h3>FORMACIONS <span>|</span> ACREDITACIONS</h3>
          <div class="credentials__grid">
            <div class="credential"><div class="credential__google" aria-hidden="true">G</div><p>Fundamentals of<br>Digital Marketing<br>Certification</p></div>
            <div class="credential"><div class="credential__aesa" aria-hidden="true"><i></i><i></i><i></i><b>AESA</b></div><p>Certificació oficial de<br>pilot de dron (AESA)</p></div>
          </div>
        </section>
      </article>
    `
  },
  {
    id: 'radar',
    number: '03',
    sectionLabel: 'EN EL RADAR',
    position: { x: 0, y: 0, z: -370 },
    html: `
      <article class="panel panel--radar">
        <header class="radar-header"><h2>EN EL RADAR</h2><p>Proves reals. Interacció <strong>orgànica.</strong></p></header>
        <div class="radar-list">
          <article class="radar-card radar-card--one">
            <img src="${AVATARS.rosalia}" alt="Imatge de referència del cas Rosalía">
            <div class="radar-card__body"><h3>ROSALÍA <span class="verified" aria-label="Interacció documentada">✓</span></h3><ul><li>Vídeo IA enviado</li><li>Respuesta directa</li><li>Juego secreto <strong>007 / 006</strong></li></ul><div class="radar-code"><span>007</span><i>♛</i><span>006</span></div></div>
            <span class="radar-arrow" aria-hidden="true">→</span>
          </article>
          <article class="radar-card radar-card--two">
            <img src="${AVATARS.rozalen}" alt="Imatge de referència del cas Rozalén">
            <div class="radar-card__body"><h3>ROZALÉN <span class="verified" aria-label="Interacció documentada">✓</span></h3><ul><li>Comentario + <strong>like + mención</strong></li><li>Interacción orgánica</li></ul><div class="radar-icons" aria-hidden="true">◯　♡　@</div></div>
            <span class="radar-arrow" aria-hidden="true">→</span>
          </article>
          <article class="radar-card radar-card--three">
            <img src="${AVATARS.leire}" alt="Imatge de referència del cas Leire Martínez">
            <div class="radar-card__body"><h3>LEIRE MARTÍNEZ <span class="verified" aria-label="Interacció documentada">✓</span></h3><ul><li>Reacción a una pieza</li><li>Señal <strong>real</strong></li></ul><div class="wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div></div>
            <span class="radar-arrow" aria-hidden="true">→</span>
          </article>
        </div>
      </article>
    `
  },
  {
    id: 'contact',
    number: '05',
    sectionLabel: 'CONTACTE',
    position: { x: 0, y: 0, z: -555 },
    html: `
      <article class="panel panel--contact">
        <div class="kinetic-word kinetic-word--contact" aria-hidden="true">PARLEM</div>
        <header class="contact-header"><h2>PARLEM DEL<br>TEU PROJECTE</h2><p>Fem visible allò que tens al cap.</p></header>
        <form class="contact-form" id="contact-form">
          <label><span aria-hidden="true">♙</span><input name="nom" autocomplete="name" placeholder="Nom" aria-label="Nom" required></label>
          <label><span aria-hidden="true">⌕</span><input name="contacte" autocomplete="email" placeholder="Contacte" aria-label="Contacte" required></label>
          <label class="contact-form__message"><span aria-hidden="true">⊙</span><textarea name="objectiu" placeholder="Objectiu" aria-label="Objectiu" required></textarea></label>
          <button type="submit">PARLEM <span>→</span></button>
        </form>
        <div class="contact-actions">
          <a href="https://wa.me/34640925788" target="_blank" rel="noopener"><span>◉</span> WHATSAPP</a>
          <a href="https://www.desorden.cat/#contacte" target="_blank" rel="noopener"><span>✉</span> CORREU</a>
        </div>
        <p class="contact-note" id="contact-note" aria-live="polite"></p>
      </article>
    `
  }
];
