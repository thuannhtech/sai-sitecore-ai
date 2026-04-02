import { NextResponse } from 'next/server';

export async function GET() {
  const contextId = process.env.SITECORE_EDGE_CONTEXT_ID || '';
  const publicContextId = process.env.NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID || '';
  
  // Hàm làm mờ secret (chỉ giữ lại 4 ký tự đầu và 4 ký tự cuối)
  const maskSecret = (secret: string) => {
    if (!secret) return '[NOT DEFINED] ❌';
    if (secret.length <= 8) return '[TOO SHORT] ❌';
    return `${secret.slice(0, 4)}...${secret.slice(-4)} ✅ (Length: ${secret.length})`;
  };

  return NextResponse.json({
    status: "Diagnostic Check",
    environmentVariables: {
      NODE_ENV: process.env.NODE_ENV || 'Not Set',
      SITECORE_EDGE_CONTEXT_ID: maskSecret(contextId),
      NEXT_PUBLIC_SITECORE_EDGE_CONTEXT_ID: maskSecret(publicContextId),
      NEXT_PUBLIC_DEFAULT_SITE_NAME: process.env.NEXT_PUBLIC_DEFAULT_SITE_NAME || '[NOT DEFINED] ❌'
    },
    message: "If any variables are [NOT DEFINED], you must add them in Azure Portal -> App Service -> Environment Variables."
  });
}
