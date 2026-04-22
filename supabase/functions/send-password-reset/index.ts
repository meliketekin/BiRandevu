const BREVO_API_KEY = Deno.env.get("BREVO_API_KEY")!;
const FIREBASE_PROJECT_ID = "burandevu-dc9c0";

async function getGoogleAccessToken(): Promise<string> {
  const raw = Deno.env.get("FIREBASE_SERVICE_ACCOUNT")!;
  const sa = JSON.parse(raw);

  const now = Math.floor(Date.now() / 1000);
  const jwtPayload = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/firebase",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const header = { alg: "RS256", typ: "JWT" };
  const encode = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");

  const signingInput = `${encode(header)}.${encode(jwtPayload)}`;

  const pemBody = sa.private_key
    .replace("-----BEGIN PRIVATE KEY-----", "")
    .replace("-----END PRIVATE KEY-----", "")
    .replace(/\s/g, "");
  const binaryKey = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  const encodedSig = btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  const jwt = `${signingInput}.${encodedSig}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    throw new Error(`Google token hatası: ${JSON.stringify(tokenData)}`);
  }
  return tokenData.access_token;
}

async function generatePasswordResetLink(email: string, accessToken: string): Promise<string> {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/accounts:sendOobCode`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requestType: "PASSWORD_RESET",
        email,
        returnOobLink: true,
      }),
    }
  );

  const data = await res.json();
  if (!data.oobLink) {
    const code = data.error?.message ?? "UNKNOWN";
    throw new Error(code);
  }
  return data.oobLink;
}

function buildEmailHtml(resetLink: string): string {
  return `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Şifre Sıfırlama</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f7;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:36px 40px;text-align:center;">
            <p style="margin:0 0 6px;font-size:13px;letter-spacing:3px;color:rgba(255,255,255,0.45);text-transform:uppercase;">BuRandevu</p>
            <h1 style="margin:0;font-size:26px;font-weight:700;color:#ffffff;">Şifre Sıfırlama</h1>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 8px;font-size:20px;font-weight:600;color:#1a1a2e;">Merhaba 👋</p>
            <p style="margin:0 0 28px;font-size:15px;color:#555;line-height:1.7;">
              BuRandevu hesabınız için bir şifre sıfırlama talebi aldık.
              Şifrenizi sıfırlamak için aşağıdaki butona tıklayın.
            </p>

            <!-- CTA Button -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding-bottom:28px;">
                  <a href="${resetLink}" target="_blank"
                    style="display:inline-block;background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;padding:16px 40px;border-radius:12px;letter-spacing:0.3px;">
                    Şifremi Sıfırla
                  </a>
                </td>
              </tr>
            </table>

            <!-- Info box -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8fc;border-radius:12px;border:1px solid #e8eaf0;margin-bottom:24px;">
              <tr>
                <td style="padding:16px 20px;">
                  <p style="margin:0;font-size:13px;color:#888;line-height:1.6;">
                    ⏱ Bu bağlantı <strong style="color:#555;">1 saat</strong> geçerlidir.<br>
                    🔒 Eğer bu talebi siz yapmadıysanız bu e-postayı güvenle görmezden gelebilirsiniz.
                  </p>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:12px;color:#bbb;line-height:1.6;">
              Buton çalışmıyorsa aşağıdaki bağlantıyı tarayıcınıza kopyalayın:<br>
              <a href="${resetLink}" style="color:#1a1a2e;word-break:break-all;">${resetLink}</a>
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f7f8fc;padding:20px 40px;text-align:center;border-top:1px solid #e8eaf0;">
            <p style="margin:0;font-size:12px;color:#aaa;">Bu mail <strong style="color:#888;">BuRandevu</strong> tarafından otomatik gönderilmiştir.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let email: string;
  try {
    ({ email } = await req.json());
    if (!email) throw new Error("email gerekli");
  } catch {
    return new Response(JSON.stringify({ error: "Geçersiz istek" }), { status: 400 });
  }

  try {
    const accessToken = await getGoogleAccessToken();
    const resetLink = await generatePasswordResetLink(email, accessToken);

    const mailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": BREVO_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: "BuRandevu", email: "burandevu.official@gmail.com" },
        to: [{ email }],
        subject: "BuRandevu - Şifre Sıfırlama",
        htmlContent: buildEmailHtml(resetLink),
      }),
    });

    if (!mailRes.ok) {
      const err = await mailRes.text();
      throw new Error(`Brevo hatası: ${err}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);

    let clientError = "Bir hata oluştu. Lütfen tekrar deneyin.";
    if (msg === "EMAIL_NOT_FOUND") {
      clientError = "Bu e-posta adresine kayıtlı bir hesap bulunamadı.";
    } else if (msg === "TOO_MANY_ATTEMPTS_TRY_LATER") {
      clientError = "Çok fazla deneme. Lütfen daha sonra tekrar deneyin.";
    }

    return new Response(JSON.stringify({ error: clientError }), {
      status: 400,
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  }
});
