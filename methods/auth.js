export default function auth(request) {
  let url = `https://github.com/login/oauth/authorize?client_id=${CLIENT_ID}`;
  url += `&redirect_uri=http://oauth.peacemeal.workers.dev/callback`
  url += `&scope=repo,user`

  return Response.redirect(url, 302);
}