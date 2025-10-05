const body = document.body;
const themeToggle = document.getElementById('theme-toggle');
const aboutToggle = document.getElementById('toggle-about');
const aboutText = document.getElementById('about-text');
const skillGrid = document.getElementById('skill-grid');

const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
if (!prefersDark) {
    body.classList.add('light');
    themeToggle.textContent = 'Dark Mode';
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('light');
    const usingLight = body.classList.contains('light');
    themeToggle.textContent = usingLight ? 'Dark Mode' : 'Light Mode';
});

aboutToggle.addEventListener('click', () => {
    const expanded = aboutText.classList.toggle('expanded');
    aboutToggle.textContent = expanded ? 'Collapse story' : 'Read the full story';
});

skillGrid.querySelectorAll('.skill-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
        chip.classList.toggle('active');
    });
});

let highlightIndex = 0;
const highlightSkills = () => {
    const chips = [...skillGrid.querySelectorAll('.skill-chip')];
    chips.forEach((chip, index) => {
        chip.classList.toggle('active', index === highlightIndex);
    });
    highlightIndex = (highlightIndex + 1) % chips.length;
};

const highlightInterval = setInterval(highlightSkills, 4500);

document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        clearInterval(highlightInterval);
    }
});
