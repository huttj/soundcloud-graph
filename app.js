co(function*() {

  const baseUrl = `http://localhost:5000/https://api-v2.soundcloud.com`;

  let group, nodes, links, results, resizeTimeoutId;

  let svg = qs('svg');

  Graph.render();
  setSvgWidth();


  document.body.addEventListener('submit', co.wrap(function* (e) {
     e.preventDefault();

      const q = qs('input').value;

      results = yield searchSongs(q);

      qs('ul').innerHTML = results.collection.map((song, i) => `
      
      <li>
        <a href="#" class="song-result" data-index="${i}">
          ${song.title} ${song.tag_list}
        </a>
      </li>
      
    `).join('');

  }));

  document.body.addEventListener('click', e => {
    if (e.target.classList.contains('song-result')) {
      e.preventDefault();
      const i = e.target.dataset.index;
      const song = results.collection[i];
      co(run, song).catch(toss);
    }
  });

  document.body.addEventListener('dblclick', e => {
    const el = e.target;
    if (e.target.classList.contains('song')) {
      const id = el.children[0].textContent;
      co(loadMore, +id);
    }
  });

  window.onresize = queueSvgWidth;


  function* run(source) {

    group = 1;
    nodes = [];
    links = [];

    nodes.push({
      id: source.id,
      image: source.artwork_url || source.user.avatar_url,
      href: source.permalink_url,
      group
    });

    yield loadMore(source.id);

  }

  function* loadMore(id) {

    const nodeHash = nodes.reduce((acc, n) => {
      acc[n.id] = n;
      return acc;
    }, {});

    const linkHash = links.reduce((acc, n) => {
      const source = n.source.id;
      const target = n.target.id;
      acc[`${source}:${target}`] = n;
      return acc;
    }, {});

    const related = yield getRelated(id);

    for (let song of related.collection) {

      if (!nodeHash[song.id]) {
        nodeHash[song.id] = {
          id: song.id,
          image: song.artwork_url || song.user.avatar_url,
          href: song.permalink_url,
          group
        };
      }

      if (!linkHash[`${id}:${song.id}`]) {
        linkHash[`${id}:${song.id}`] = {
          source: nodeHash[id],
          target: nodeHash[song.id]
        };
      }
    }

    console.log('nodeHash', nodeHash);
    console.log('linkHash', linkHash);

    nodes = values(nodeHash);
    links = values(linkHash);

    Graph.loadData({ nodes, links });

    group++;

  }

  function values(obj) {
    return Object.keys(obj || {}).map(key => obj[key]);
  }
  
  function qs(sel) {
    return document.querySelector(sel);
  }
  
  function qsa(sel) {
    return document.querySelectorAll(sel);
  }

  function toss(e) {
    console.error(e);
    throw e;
  }

  function queueSvgWidth() {
    clearTimeout(resizeTimeoutId);
    resizeTimeoutId = setTimeout(setSvgWidth, 300);
  }

  function setSvgWidth() {
    svg.setAttribute('width', window.outerWidth*.95);
    svg.setAttribute('height', window.outerHeight*.95);
  }

  function searchSongs(q) {
    // const url = `${baseUrl}/search/tracks?q=${q}&sc_a_id=b09fd3ab-0576-406d-b069-5edbd43bdf06&facet=genre&user_id=413791-622410-772944-424777&client_id=fDoItMDbsbZz8dY16ZzARCZmzgHBPotA&limit=10&offset=0&linked_partitioning=1&app_version=1476820058`;
    const url = `${baseUrl}/search/tracks?q=${q}&sc_a_id=b09fd3ab-0576-406d-b069-5edbd43bdf06&facet=genre&user_id=264875-138197-544227-860883&client_id=fDoItMDbsbZz8dY16ZzARCZmzgHBPotA&limit=10&offset=0&linked_partitioning=1&app_version=1481937886`;
    return fetch(url).then(n => n.json());
  }


  function getRelated(songId) {
    const url = `${baseUrl}/tracks/${songId}/related?anon_user_id=79622734&client_id=fDoItMDbsbZz8dY16ZzARCZmzgHBPotA&limit=10&offset=0&linked_partitioning=1&app_version=1481937886`;
    return fetch(url).then(n => n.json());
  }

}).catch(e => console.log(e));
