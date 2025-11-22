export async function pinFileToIPFS(
  file: File, 
  options?: {
    jwt?: string;
    apiKey?: string;
    secretKey?: string;
  }
): Promise<{ cid: string }> {
  const form = new FormData();
  form.append("file", file);

  // Pinata file upload prioritizes API Key + Secret Key, which is the recommended method
  const apiKey = options?.apiKey || process.env.NEXT_PUBLIC_PINATA_API_KEY;
  const secretKey = options?.secretKey || process.env.NEXT_PUBLIC_PINATA_SECRET_KEY;
  
  // If API Key is provided, use API Key method (recommended)
  let headers: HeadersInit = {};
  if (apiKey && secretKey) {
    headers = {
      pinata_api_key: apiKey.trim(),
      pinata_secret_api_key: secretKey.trim(),
    };
  } else {
    // Otherwise use JWT (compatible with old code)
    const jwt = options?.jwt || process.env.NEXT_PUBLIC_PINATA_JWT;
    const token = jwt?.trim();
    if (!token) {
      throw new Error("Missing Pinata credentials. Provide either (API Key + Secret Key) or JWT");
    }
    headers = {
      Authorization: `Bearer ${token}`,
    };
  }

  // Note: When using FormData, don't manually set Content-Type, let the browser set it automatically
  const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers,
    body: form,
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    let errorMessage = `Pinata upload failed: ${res.status}`;
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = `Pinata upload failed: ${res.status} ${JSON.stringify(errorJson, null, 2)}`;
    } catch {
      errorMessage = `Pinata upload failed: ${res.status} ${errorText}`;
    }
    throw new Error(errorMessage);
  }

  const data = await res.json();
  return { cid: data.IpfsHash };
}
