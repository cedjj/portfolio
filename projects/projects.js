import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const titleElement = document.querySelector('.projects-title');
const searchInput = document.querySelector('.searchBar');

renderProjects(projects, projectsContainer, 'h2');

if (titleElement) {
    titleElement.textContent = `${projects.length} Projects`;
}

let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let selectedIndex = -1;

let selectedYear = null;
let currentQuery = '';

function getFilteredProjects() {
  return projects.filter((project) => {
    const matchesSearch = 
    currentQuery === '' || Object.values(project).join('\n').toLowerCase().includes(currentQuery.toLowerCase());
    const matchesYear = 
    selectedYear === null || project.year === selectedYear;
    return matchesSearch && matchesYear;
  });
}

function renderPieChart(projectsGiven) {
  let svg = d3.select('#projects-pie-plot');
  svg.selectAll('path').remove();
  d3.select('.legend').selectAll('*').remove();
  
  let newRolledData = d3.rollups(
    projectsGiven,
    (v) => v.length,
    (d) => d.year,
  );
  
  let newData = newRolledData.map(([year, count]) => {
    return { value: count, label: year };
  });
  
  let newSliceGenerator = d3.pie().value((d) => d.value);
  let newArcData = newSliceGenerator(newData);
  let newArcs = newArcData.map((d) => arcGenerator(d));
  
  let colors = d3.scaleOrdinal(d3.schemeTableau10);
  
  newArcs.forEach((arc, i) => {
    d3.select('#projects-pie-plot')
      .append('path')
      .attr('d', arc)
      .attr('fill', colors(i))
      .on('click', () => {
          selectedIndex = selectedIndex === i ? -1 : i;
          selectedYear = selectedIndex === -1 ? null : newData[selectedIndex].label;

          let filteredProjects = getFilteredProjects();
          renderProjects(filteredProjects, projectsContainer, 'h2');
          if (titleElement) {
            titleElement.textContent = `${filteredProjects.length} Projects`;
          }

          svg.selectAll('path').attr('class', (_, idx) => {
            return idx === selectedIndex ? 'selected' : null;
          });
          legend.selectAll('li').attr('class', (_, idx) => {
            return idx === selectedIndex ? 'legend-item selected' : 'legend-item';
          });
      });
  });
  
  let legend = d3.select('.legend');
  newData.forEach((d, i) => {
    legend
      .append('li')
      .attr('style', `--color:${colors(i)}`)
      .attr('class', 'legend-item')
      .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
      .on('click', () => {
          selectedIndex = selectedIndex === i ? -1 : i;
          selectedYear = selectedIndex === -1 ? null : newData[selectedIndex].label;

          let filteredProjects = getFilteredProjects();
          renderProjects(filteredProjects, projectsContainer, 'h2');
          if (titleElement) {
            titleElement.textContent = `${filteredProjects.length} Projects`;
          }
    
          svg.selectAll('path').attr('class', (_, idx) => {
            return idx === selectedIndex ? 'selected' : null;
          });
          legend.selectAll('li').attr('class', (_, idx) => {
            return idx === selectedIndex ? 'legend-item selected' : 'legend-item';
          });
      });
  });
}

renderPieChart(projects);

searchInput.addEventListener('change', (event) => {
  currentQuery = event.target.value;

  if (currentQuery.trim() === '') {
    selectedIndex = -1;
    selectedYear = null;
  }
  let filteredProjects = getFilteredProjects();
  
  renderProjects(filteredProjects, projectsContainer, 'h2');
  renderPieChart(filteredProjects);
  
  if (titleElement) {
    titleElement.textContent = `${filteredProjects.length} Projects`;
  }
});