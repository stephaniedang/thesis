const sections = Array.from(document.querySelectorAll('section'));
let currentSectionIndex = 0;

// Create a map of section IDs to their respective indices
const sectionIndices = sections.reduce((indices, section, index) => {
    indices[section.id] = index;
    return indices;
}, {});

function navigateToSection(index) {
    if (index >= 0 && index < sections.length) {
        currentSectionIndex = index;
        sections[currentSectionIndex].scrollIntoView({
            behavior: 'smooth'
        });
    }
}

document.querySelector('#prev').addEventListener('click', function (e) {
    e.preventDefault();
    navigateToSection(currentSectionIndex - 1);
});

document.querySelector('#next').addEventListener('click', function (e) {
    e.preventDefault();
    navigateToSection(currentSectionIndex + 1);
});

Array.from(document.querySelectorAll('.circle')).forEach(circle => {
    circle.addEventListener('click', function (e) {
        e.preventDefault();
        // Get the target section ID from the circle's href attribute, removing the '#' at the start
        const sectionId = e.currentTarget.getAttribute('href').substring(1);
        // Use the section ID to find the corresponding section index
        const sectionIndex = sectionIndices[sectionId];
        navigateToSection(sectionIndex);
    });
});