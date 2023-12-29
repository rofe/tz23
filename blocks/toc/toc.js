export default function decorate(block) {
  const ul = document.createElement('ul');
  document.querySelectorAll('h2').forEach((heading, i) => {
    if (i > 0) {
      const li = document.createElement('li');
      const jumpLink = document.createElement('a');
      const title = heading.textContent;
      jumpLink.textContent = title;
      jumpLink.title = title;
      jumpLink.href = `#${title.toLocaleLowerCase().replaceAll(' ', '-')}`;
      li.append(jumpLink);
      ul.append(li);

      const topLink = document.createElement('a');
      topLink.textContent = '^';
      topLink.className = 'toc-back-to-top';
      topLink.title = 'Zurück nach oben';
      topLink.href = '#';
      heading.append(topLink);
    }
  });
  block.append(ul);
}
