export default async function callback(request) {
  const originPattern = 'localhost'
  const provider = 'github';
  let message;
  
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  console.log(code);

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
        console.log("receiveMessage %o", e)
        if (!e.origin.match(${JSON.stringify(originPattern)})) {
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

// Repo "tompeace/amelie-peace-website" not found.

// Please ensure the repo information is spelled correctly.

// If the repo is private, make sure you're logged into a GitHub account with access.

// If your repo is under an organization, ensure the organization has granted access to Netlify
// CMS.