co(function*() {

  const baseUrl = `https://crossorigin.me/https://api-v2.soundcloud.com`;


  function searchSongs(q) {
    const url = `${baseUrl}/search/tracks?q=${q}&sc_a_id=b09fd3ab-0576-406d-b069-5edbd43bdf06&facet=genre&user_id=413791-622410-772944-424777&client_id=02gUJC0hH2ct1EGOcYXQIzRFU91c72Ea&limit=10&offset=0&linked_partitioning=1&app_version=1476820058`;
    return fetch(url).then(n => n.json());
  }


  function getRelated(songId) {
    const url = `${baseUrl}/tracks/${songId}/related?anon_user_id=13874249&client_id=02gUJC0hH2ct1EGOcYXQIzRFU91c72Ea&limit=10&offset=0&linked_partitioning=1&app_version=1476719521`;
    return fetch(url).then(n => n.json());
  }

  Graph.render();

  let group = 1;
  let nodes = [];
  let links = [];

  const results = yield searchSongs('techno');

  const source = results.collection[0];
  nodes.push({
    id: source.id,
    image: source.artwork_url || source.user.avatar_url,
    href: source.permalink_url,
    group
  });

  yield loadMore(source.id);



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

  document.body.addEventListener('dblclick', e => {
    const el = e.target;
    if (e.target.classList.contains('song')) {
      const id = el.children[0].textContent;
      co(loadMore, +id);
    }
  })

}).catch(e => console.log(e));