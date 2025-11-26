import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NotificationPayload {
  deviceToken: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { deviceToken, title, body, data }: NotificationPayload = await req.json();

    if (!deviceToken) {
      return new Response(
        JSON.stringify({ error: "Device token is required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const firebaseProjectId = Deno.env.get("FIREBASE_PROJECT_ID");
    const firebasePrivateKey = Deno.env.get("FIREBASE_PRIVATE_KEY");
    const firebaseClientEmail = Deno.env.get("FIREBASE_CLIENT_EMAIL");

    if (!firebaseProjectId || !firebasePrivateKey || !firebaseClientEmail) {
      return new Response(
        JSON.stringify({ error: "Firebase credentials not configured" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const accessToken = await getAccessToken(firebasePrivateKey, firebaseClientEmail);

    const messagePayload = {
      message: {
        token: deviceToken,
        notification: {
          title,
          body,
        },
        data: data || {},
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

    const result = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify(result), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, messageId: result.name }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return new Response(
      JSON.stringify({ error: "Failed to send notification" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function getAccessToken(privateKey: string, clientEmail: string): Promise<string> {
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

  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", cryptoKey, new TextEncoder().encode(message));

  const signatureEncoded = btoa(String.fromCharCode(...new Uint8Array(signature)))
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
