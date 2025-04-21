import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();
  const { latitude, longitude, target, area, point, attempts, avgSnr } = body;

  try {
    // サービスアカウントキーをハードコード
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: "service_account",
        project_id: "ujs-location",
        private_key_id: "4be635d413493d22f5eec1834ca95ea1d8298cad",
        private_key:
          "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCgX+dp3JGbc4hj\npVk+Pdpi2iqmM1kC3S70DVB5DLEQT8+5WUL6IJZN8IgaOAqD4mc/9p3b2FUr+OBR\nduj3h+eiJyC0njQAzeSKCWawuHZq5gddf9T4Gdn3HYVrM0SEX05og3+TszBO6Tei\nOIN6dm1fBWb/zK6I2eQ3BM7YGiHF4vQzcN28b2HIYar7T/RwbCKNZR6b4eOrFyI9\npl/kXi++EkhtflXCnuiN9kV+KXQnYHml3qoE2Np1ftky8wq4v5guMGKu2N0nLiIO\nJ7Zhfj60nCFxf/EpRS97F/j+mbAW7zIgDnNp5p5bscllI7twldwuMMs1NshLeEGt\nXmdhWHXlAgMBAAECggEAIANE1FLdFeS4AvwMlmoOX9Eg1lBFola4eqr1t1QbPCBS\nXLM+tWMv3Zr38BPjtXPKHHCEDlBeoApr7JcJ5e9RA4M/+g3iX4654fwCbaBEsw37\nxmQwBN5ULgnMihuPv8SuiBpHqxoHuJjBLDaPuDBPoLoZV1JqPJMSBRGGoIiG2VMl\nPPYSgUwUGMWYQAZ0AMur5CKg+QwNGzdlRXrcX0aMs/+Ar1SV9H+g/vXrRwnBHZO2\nKnHf475LjrJtPu7giurT2w3jSRbjOtQnv04VbhBW2RP9i7RvBsJk+hvI1HNp8fw0\ntQT4iSNeHHoOlfMF2c7uEi3P9kc2eLKqzqUmAf8V+QKBgQDa9XFYabzNhdpqf8bd\nreB/sn+tATwl7QAe2fp+flvlJpHbosTHnnICv380y9QrFRpctX0EOVP/3jhVq3+8\nBOtgdbVuOD04HIntqJVmBtWycI6BzOQzdQ2DDo4v8E5z+zJQzCwhgkUjeIogRoR9\nILy6bCGXYW2FIW/eB4CZDDqMgwKBgQC7gVQbn9OfjdXcEAKmcwYftVBYrgAleM5n\nNmzzKhIuhPJDaDC0W5A9Oouvp8jvOWU7iqlhbcfLCKhl/h0Y5F9CSkX+ssJig1Cs\nZ1YHAdH6GQZA5X/ISXYGblLbVBxhEO7OcHX+0DBs/xiSYWYRK3lTNNpJE8rkN79y\nOHowCXs3dwKBgATysPoHga2/TZ1Ef/D4ge9A0GPPeFV/Epaf5GpBXsBB69/jwMCm\nEvt+6lf+FzBWDL91lnqm9P/+PJWrB3rvPYZzgoMYIEIJWxCU07N3ihK7Om0yfSGw\njnqctJfevVcfoRZ0Vrb3I6rWiYCLN2lAeSNZWDT8jaYJiGajEsPio9wTAoGAWuDv\n9wOb+jUwdhx8bFhLm4qxiomrIH5Q682BOMonTcy57tnM4V2Pp1183oIf7XKQEi++\nsK4Yq9tiYyyqxanKUcLV8gCKHl0u+KCNHZBQSTtfwIx7RoP0ZGGMXymBJ7qhRAVV\n607Uab+qFSiH48KCZ0WylsC1Ea/DZoThE+9EfTkCgYBQsw/vzN26Ms1JjhsRySKJ\nJvSXFVZ3u6JyfJufhycCNKqAi5cK+JPZTbudV7cMs3pXB8BkYVnIwp3m2f4wWd6T\nq9Mk6kW0aObg91IIvGh2NVsSBT5GRdoQMyp96P80NUwBAntKhbhIINvv99nQfKVg\nUuEt/USJnv8I+8WiWDBPeA==\n-----END PRIVATE KEY-----\n",
        client_email: "usj-location@ujs-location.iam.gserviceaccount.com",
        client_id: "108949737024240092634",
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url:
          "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url:
          "https://www.googleapis.com/robot/v1/metadata/x509/usj-location%40ujs-location.iam.gserviceaccount.com",
        universe_domain: "googleapis.com",
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const spreadsheetId = "183Q3tvGu7swkauuvIyNtOhIKFor9rzQSPQ0eVHJnqlU"; // スプレッドシートのID
    const range = "data"; // シート名のみ指定（最後の行に自動追加）

    // データをスプレッドシートに追加
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[latitude, longitude, target, area, point, attempts, avgSnr]],
      },
    });

    return NextResponse.json({ message: "データが追加されました！" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "bデータの追加に失敗しました。" },
      { status: 500 }
    );
  }
}
