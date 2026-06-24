/**
 * Round 3: HTML Structure Tests
 * Tests for validating the cyberpunk website structure
 */

describe('HTML Structure', () => {
  let document;

  beforeAll(async () => {
    // Load the HTML file
    const fs = require('fs');
    const html = fs.readFileSync('../index.html', 'utf8');
    document = new DOMParser().parseFromString(html, 'text/html');
  });

  test('has loading screen', () => {
    const loading = document.querySelector('#loading');
    expect(loading).not.toBeNull();
  });

  test('has particle field', () => {
    const particles = document.querySelector('.particle-field');
    expect(particles).not.toBeNull();
  });

  test('has grid overlay', () => {
    const grid = document.querySelector('.grid-overlay');
    expect(grid).not.toBeNull();
  });

  test('has scanlines effect', () => {
    const scanlines = document.querySelector('.scanlines');
    expect(scanlines).not.toBeNull();
  });

  test('has cyber navigation', () => {
    const nav = document.querySelector('.cyber-nav');
    expect(nav).not.toBeNull();
    expect(nav.querySelector('.nav-logo')).not.toBeNull();
  });

  test('has hero section', () => {
    const hero = document.querySelector('.hero');
    expect(hero).not.toBeNull();
    expect(hero.querySelector('.hero-title')).not.toBeNull();
  });

  test('has hero visual with neural rings', () => {
    const visual = document.querySelector('.hero-visual');
    expect(visual).not.toBeNull();
    const rings = visual.querySelectorAll('.neural-ring');
    expect(rings.length).toBe(3);
  });

  test('has features section', () => {
    const features = document.querySelector('.features');
    expect(features).not.toBeNull();
    const cards = features.querySelectorAll('.feature-card');
    expect(cards.length).toBe(3);
  });

  test('has cyber footer', () => {
    const footer = document.querySelector('.cyber-footer');
    expect(footer).not.toBeNull();
  });
});

describe('Typography', () => {
  let document;

  beforeAll(async () => {
    const fs = require('fs');
    const html = fs.readFileSync('../index.html', 'utf8');
    document = new DOMParser().parseFromString(html, 'text/html');
  });

  test('uses Clash Display font', () => {
    const style = document.querySelector('style').innerHTML;
    expect(style).toContain('Clash Display');
  });

  test('uses Satoshi font', () => {
    const style = document.querySelector('style').innerHTML;
    expect(style).toContain('Satoshi');
  });
});

describe('Color Palette', () => {
  let document;

  beforeAll(async () => {
    const fs = require('fs');
    const html = fs.readFileSync('../index.html', 'utf8');
    document = new DOMParser().parseFromString(html, 'text/html');
  });

  test('has navy background color', () => {
    const style = document.querySelector('style').innerHTML;
    expect(style).toContain('#0a0f1c');
  });

  test('has neon cyan accent', () => {
    const style = document.querySelector('style').innerHTML;
    expect(style).toContain('#00ffcc');
  });

  test('has neon magenta accent', () => {
    const style = document.querySelector('style').innerHTML;
    expect(style).toContain('#ff00aa');
  });
});

describe('Animations', () => {
  let document;

  beforeAll(async () => {
    const fs = require('fs');
    const html = fs.readFileSync('../index.html', 'utf8');
    document = new DOMParser().parseFromString(html, 'text/html');
  });

  test('has particle animation', () => {
    const style = document.querySelector('style').innerHTML;
    expect(style).toContain('@keyframes float');
  });

  test('has glow animation', () => {
    const style = document.querySelector('style').innerHTML;
    expect(style).toContain('@keyframes pulse-glow');
  });

  test('has rotation animation', () => {
    const style = document.querySelector('style').innerHTML;
    expect(style).toContain('@keyframes rotate');
  });

  test('has glitch animation', () => {
    const style = document.querySelector('style').innerHTML;
    expect(style).toContain('@keyframes glitch');
  });
});
