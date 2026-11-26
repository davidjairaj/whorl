(() => {
  'use strict';
  const slides = [
    { image: './assets/tutorial/open-moon.png', title: 'Your shortcuts, together.', description: 'Tap the centre button to open or close your shortcuts.', alt: 'Whorl’s Moon button with eight shortcuts arranged around it.' },
    { image: './assets/tutorial/open-moon.png', title: 'Choose each shortcut.', description: 'Hold a shortcut. Choose what it opens, then tap Save.', alt: 'The open Moon ring, with the Camera shortcut highlighted as an example to long-press.', callout: 'shortcut' },
    { image: './assets/tutorial/button-picker.png', title: 'Find your favourite.', description: 'Tap the palette to choose from twelve designs.', alt: 'Whorl’s native design picker showing all twelve button designs.' },
    { image: './assets/tutorial/open-vinyl.png', title: 'Home is still home.', description: 'Tap the house to return to your original Home screen.', alt: 'Whorl with a Vinyl button and the original Home screen control highlighted below the ring.', callout: 'home' }
  ];
  let currentSlide = 0;
  const slideImage = document.getElementById('slide-image');
  const previous = document.getElementById('previous-slide');
  const next = document.getElementById('next-slide');
  function showSlide(index) {
    currentSlide = (index + slides.length) % slides.length;
    const slide = slides[currentSlide];
    slideImage.src = slide.image;
    slideImage.alt = slide.alt;
    const callout = document.getElementById('screen-callout');
    callout.hidden = !slide.callout;
    callout.dataset.target = slide.callout || '';
    document.getElementById('slide-title').textContent = slide.title;
    document.getElementById('slide-description').textContent = slide.description;
    document.getElementById('slide-position').textContent = `${currentSlide + 1} / ${slides.length}`;
  }
  previous.disabled = false;
  next.disabled = false;
  previous.addEventListener('click', () => showSlide(currentSlide - 1));
  next.addEventListener('click', () => showSlide(currentSlide + 1));
})();
