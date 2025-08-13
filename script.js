const letter = document.getElementById('letter');
const content = document.getElementById('letter-content');
const container = document.getElementById('letter-container');
const clickToReveal = document.getElementById('click-to-reveal');
const signature = document.getElementById('signature');
const confettiCanvas = document.getElementById('confetti-canvas');
const chime = document.getElementById('chime');

let tapStep = 0; // 0 = blank, 1 = "Tap again", 2 = letter reveal

// Letter content
async function loadLetter() {
  const text = `Hey Baby,
On your 22nd birthday, I wish you every happiness in the world because you truly deserve the best. Yes, we haven’t known each other for long, but as someone wiser once said, “sometimes time doesn't matter,” and I believe in that now.

Can’t wait to celebrate many more birthdays with you. Distance won't be troubling us forever, so let’s have patience and trust the process. Big things are coming, baby! 

Every little thing about you, your eyes, your smile, your jokes, and all of you brings me nothing but absolute joy. I love you, my favorite sunshine! 💖`;
  return text;
}

// Typing animation
async function typeWriter(text, element, delay = 40) {
  element.textContent = '';
  letter.style.minHeight = '150px';
  for(let i = 0; i < text.length; i++) {
    if (text[i] === '\n') {
      element.innerHTML += '<br>';
    } else {
      element.innerHTML += text[i];
    }

    const lineCount = element.scrollHeight / 24;
    const newHeight = Math.min(150 + lineCount*24, window.innerHeight*0.8);
    letter.style.minHeight = `${newHeight}px`;

    await new Promise(r => setTimeout(r, delay));
  }
}

// Confetti
function runConfetti() {
  const ctx = confettiCanvas.getContext('2d');
  let width = confettiCanvas.width = window.innerWidth;
  let height = confettiCanvas.height = window.innerHeight;

  const confettiCount = 150;
  const confettiPieces = [];

  function randomRange(min, max) { return Math.random() * (max - min) + min; }

  class Confetti {
    constructor() {
      this.x = randomRange(0, width);
      this.y = randomRange(-height, 0);
      this.size = randomRange(5, 10);
      this.speedY = randomRange(1, 3);
      this.speedX = randomRange(-0.5, 0.5);
      this.color = `hsl(${randomRange(330, 350)}, 90%, 65%)`;
      this.rotation = randomRange(0, 360);
      this.rotationSpeed = randomRange(-5, 5);
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.rotation += this.rotationSpeed;
      if (this.y > height) { this.y = -this.size; this.x = randomRange(0, width); }
      if (this.x > width) this.x = 0;
      if (this.x < 0) this.x = width;
    }
    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation * Math.PI / 180);
      ctx.fillStyle = this.color;
      ctx.fillRect(-this.size/2, -this.size/2, this.size, this.size);
      ctx.restore();
    }
  }

  for (let i = 0; i < confettiCount; i++) confettiPieces.push(new Confetti());

  function animate() {
    ctx.clearRect(0,0,width,height);
    confettiPieces.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(animate);
  }
  animate();
  confettiCanvas.style.display = 'block';

  window.addEventListener('resize', () => {
    width = confettiCanvas.width = window.innerWidth;
    height = confettiCanvas.height = window.innerHeight;
  });
}

// Fade chime volume
function fadeToVolume(audio, targetVolume = 0.3, duration = 5000) {
  const stepTime = 50;
  const steps = duration / stepTime;
  let currentStep = 0;
  const initialVolume = audio.volume;

  const interval = setInterval(() => {
    currentStep++;
    audio.volume = initialVolume + (targetVolume - initialVolume) * (currentStep / steps);
    if (currentStep >= steps) clearInterval(interval);
  }, stepTime);
}

// Click handler
container.addEventListener('click', async () => {
  if (tapStep === 0) {
    // First tap: show "Tap again to reveal" and soft chime
    clickToReveal.textContent = 'Tap again to reveal 💌';
    clickToReveal.style.display = 'block';
    chime.volume = 0.05;
    chime.loop = true;
    chime.play().catch(() => {});
    tapStep = 1;
  } else if (tapStep === 1) {
    // Second tap: reveal letter, fade chime, confetti
    clickToReveal.style.display = 'none';
    letter.classList.add('revealed');
    fadeToVolume(chime, 0.3, 5000);
    runConfetti();

    const text = await loadLetter();
    await typeWriter(text, content);

    letter.classList.add('signature-visible');
    tapStep = 2;
  }
});
