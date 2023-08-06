export function user_extra_params(query, params, rtc) {
  var queries = params || [];

  for (var key in query.user_query) {
    if (
      key === 'app' ||
      key === 'autostart' ||
      key === 'dir' ||
      key === 'filename' ||
      key === 'host' ||
      key === 'hostname' ||
      key === 'http_port' ||
      key === 'pathname' ||
      key === 'port' ||
      key === 'server' ||
      key === 'stream' ||
      key === 'buffer' ||
      key === 'schema' ||
      key === 'vhost' ||
      key === 'api' ||
      key === 'path'
    ) {
      continue;
    }

    if (query[key]) {
      queries.push(key + '=' + query[key]);
    }
  }

  return queries;
}
export function build_default_whip_whep_url(query, apiPath) {
  // The format for query string to overwrite configs of server.
  console.log(
    '?eip=x.x.x.x to overwrite candidate. 覆盖服务器candidate(外网IP)配置'
  );
  console.log('?api=x to overwrite WebRTC API(1985).');
  console.log('?schema=http|https to overwrite WebRTC API protocol.');
  console.log(`?path=xxx to overwrite default ${apiPath}`);

  var server = !query.server ? window.location.hostname : query.server;
  var vhost = !query.vhost ? window.location.hostname : query.vhost;
  var app = !query.app ? 'live' : query.app;
  var stream = !query.stream ? 'livestream' : query.stream;
  var api =
    ':' +
    (query.api || (window.location.protocol === 'http:' ? '1985' : '1990'));
  const realApiPath = query.path || apiPath;

  var queries = [];
  if (server !== vhost && vhost !== '__defaultVhost__') {
    queries.push('vhost=' + vhost);
  }
  if (query.schema && window.location.protocol !== query.schema + ':') {
    queries.push('schema=' + query.schema);
  }
  queries = user_extra_params(query, queries, true);

  var uri =
    window.location.protocol +
    '//' +
    server +
    api +
    realApiPath +
    '?app=' +
    app +
    '&stream=' +
    stream +
    '&' +
    queries.join('&');
  while (uri.lastIndexOf('?') === uri.length - 1) {
    uri = uri.slice(0, uri.length - 1);
  }
  while (uri.lastIndexOf('&') === uri.length - 1) {
    uri = uri.slice(0, uri.length - 1);
  }

  return uri;
}
