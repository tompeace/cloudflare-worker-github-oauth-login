export default async function callback(request) {
  const provider = 'github';
  let message;
  
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  const response = await fetch(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "cloudflare-worker-github-oauth-login-demo",
        accept: "application/json",
      },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code
      }),
    }
  ).catch((error) => {
    console.error('Access Token Error', error.message)
    message = 'error'
    content = error
  });

  const result = await response.json();

  if (result.error) {
    return new Response(JSON.stringify(result), {
      status: 401,
      headers: { "Access-Control-Allow-Origin": "*" }
    });
  }

  message = 'success'
  content = {
    token: result.access_token,
    provider
  }

  const script = `
    <!DOCTYPE html>
    <body>Redirecting...</body>
    <script type="application/javascript">
    (() => {
      const fn = (e) => {
        // receive message
        if (!e.origin.match("${ORIGIN_PATTERN}")) {
          console.log('Invalid origin: %s', e.origin);
          return;
        }
        // send message to main window
        window.opener.postMessage(
          'authorization:${provider}:${message}:${JSON.stringify(content)}',
          e.origin
        )
      }
      window.addEventListener("message", fn, false)
      // Start handshake with parent
      console.log("Sending message: %o", "${provider}")
      window.opener.postMessage("authorizing:${provider}", "*")
    })()
    </script>`

  return new Response(script, {
    status: 201,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "content-type": "text/html;charset=UTF-8"
    }
  });
}
