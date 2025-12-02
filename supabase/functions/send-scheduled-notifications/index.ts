import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface DeviceToken {
  user_identifier: string;
  device_token: string;
}

async function sendFCMNotification(
  deviceToken: string,
  title: string,
  body: string,
  firebaseProjectId: string,
  accessToken: string
): Promise<boolean> {
  try {
    const messagePayload = {
      message: {
        token: deviceToken,
        notification: {
          title,
          body,
        },
      },
    };

    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${firebaseProjectId}/messages:send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(messagePayload),
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Error sending FCM notification:", error);
    return false;
  }
}

async function getAccessToken(
  privateKey: string,
  clientEmail: string
): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = 3600;

  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const payload = {
    iss: clientEmail,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    exp: now + expiresIn,
    iat: now,
  };

  const headerEncoded = btoa(JSON.stringify(header))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const payloadEncoded = btoa(JSON.stringify(payload))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const message = `${headerEncoded}.${payloadEncoded}`;

  const keyData = privateKey
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\n/g, "");

  const binaryString = atob(keyData);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    bytes.buffer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(message)
  );

  const signatureEncoded = btoa(
    String.fromCharCode(...new Uint8Array(signature))
  )
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");

  const jwt = `${message}.${signatureEncoded}`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { userIdentifier, title, body } = await req.json();

    if (!userIdentifier || !title || !body) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const firebaseProjectId = Deno.env.get("FIREBASE_PROJECT_ID");
    const firebasePrivateKey = Deno.env.get("FIREBASE_PRIVATE_KEY");
    const firebaseClientEmail = Deno.env.get("FIREBASE_CLIENT_EMAIL");

    if (
      !supabaseUrl ||
      !supabaseServiceKey ||
      !firebaseProjectId ||
      !firebasePrivateKey ||
      !firebaseClientEmail
    ) {
      return new Response(
        JSON.stringify({ error: "Missing configuration" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const tokensResponse = await fetch(
      `${supabaseUrl}/rest/v1/device_tokens?user_identifier=eq.${userIdentifier}&is_active=eq.true`,
      {
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
          apikey: supabaseServiceKey,
        },
      }
    );

    if (!tokensResponse.ok) {
      throw new Error(`Failed to fetch device tokens: ${tokensResponse.statusText}`);
    }

    const deviceTokens = (await tokensResponse.json()) as DeviceToken[];

    if (deviceTokens.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "No active device tokens found",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const accessToken = await getAccessToken(
      firebasePrivateKey,
      firebaseClientEmail
    );

    const results = await Promise.all(
      deviceTokens.map((token) =>
        sendFCMNotification(
          token.device_token,
          title,
          body,
          firebaseProjectId,
          accessToken
        )
      )
    );

    const successCount = results.filter((r) => r).length;

    return new Response(
      JSON.stringify({
        success: true,
        message: `Sent to ${successCount}/${deviceTokens.length} devices`,
        sentCount: successCount,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
