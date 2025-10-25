console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

const BASE_PATH = (location.hostname === "localhost" || location.hostname === "127.0.0.1")
  ? "/"                  // Local server
  : "/portfolio/";         // GitHub Pages repo name

let pages = [
  { url: 'index.html', title: 'Home' },
  { url: 'contact/', title: 'Contact'},
  { url: 'projects/', title: 'Projects'},
  { url: 'resume/', title: 'Resume'},
  { url: 'https://github.com/cedjj', title: 'Github Profile'}
];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
    let url = p.url;
    let title = p.title;

    url = !url.startsWith('http') ? BASE_PATH + url : url;

    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;

    a.classList.toggle(
    'current',
    a.host === location.host && a.pathname === location.pathname,
    );

    if (a.host !== location.host) {
        a.target = "_blank";
    }

    nav.append(a);
}

function getOSColorScheme() {
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "Dark";
  } else {
    return "Light";
  }
}

document.body.insertAdjacentHTML(
  'afterbegin',
  `
	<label class="color-scheme">
        <select name="Theme">
            <option value="light dark">Auto (${getOSColorScheme()})</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
        </select>
    </label>`,
);

const select = document.querySelector('.color-scheme select');

function setColorScheme(colorScheme) {
    document.documentElement.style.setProperty('color-scheme', colorScheme);
    select.value = colorScheme;
    localStorage.colorScheme = colorScheme;
}

if ('colorScheme' in localStorage) {
    setColorScheme(localStorage.colorScheme);
}

select.addEventListener('input', function (event) {
  console.log('color scheme changed to', event.target.value);
  setColorScheme(event.target.value)
});

const form = document.querySelector('form');
form?.addEventListener('submit', function(event) {
    event.preventDefault();
  
    const data = new FormData(this);

    let url = 'mailto:cejeng@ucsd.edu?';
    
    for (let [name, value] of data) {
        url += name + '=' + encodeURIComponent(value) + '&';
        console.log(name, encodeURIComponent(value));
    } 
  
    url = url.slice(0, -1);

    location.href = url;
});

export async function fetchJSON(url) {
  try {
    // Fetch the JSON file from the given URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching or parsing JSON data:', error);
    return [];
  }
}

export function renderProjects(project, containerElement, headingLevel = 'h2') {
  containerElement.innerHTML = '';

  project.forEach(proj => {
  const article = document.createElement('article');
  const imagePath = location.pathname.includes('/projects/')
    ? '../' + proj.image
    : proj.image;

  article.innerHTML = `
    <${headingLevel}>${proj.title}</${headingLevel}>
    <img src="${imagePath}" alt="${proj.title}" style="width: 250px; height: auto; border-radius: 10px;">
    <p>${proj.description}</p>
  `;
  containerElement.appendChild(article);
  });
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}
