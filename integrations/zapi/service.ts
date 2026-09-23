import { useZApiStore } from './store';

const PROXY_URL = "https://corsproxy.io/?";

export const zApiRequest = async (method: 'GET' | 'POST', path: string, body?: any) => {
  const { credentials, addLog } = useZApiStore.getState();
  const { instanceId, token, clientToken } = credentials;

  if (!instanceId || !token) {
    throw new Error("Erro na integração da API do Whatsapp. Contate o suporte.");
  }

  const baseUrl = `https://api.z-api.io/instances/${instanceId}/token/${token}`;
  const fullUrl = `${baseUrl}${path}`;
  const proxiedUrl = `${PROXY_URL}${encodeURIComponent(fullUrl)}`;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (clientToken) headers['client-token'] = clientToken;

  try {
    const response = await fetch(proxiedUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined
    });

    const data = await response.json();
    
    addLog({
      method,
      endpoint: path,
      requestBody: body,
      responseBody: data,
      status: response.ok ? 'success' : 'error'
    });

    if (!response.ok) {
        console.error(`[Z-API] Erro real:`, data);
        throw new Error("Erro na integração da API do Whatsapp. Contate o suporte.");
    }

    return data;
  } catch (error: any) {
    if (error.message.includes('Erro na integração')) throw error;

    console.error("[Z-API] Erro técnico:", error);
    addLog({
      method,
      endpoint: path,
      requestBody: body,
      responseBody: { error: error.message },
      status: 'error'
    });
    throw new Error("Erro na integração da API do Whatsapp. Contate o suporte.");
  }
};

export const checkZApiStatus = () => zApiRequest('GET', '/status');

export const sendZApiText = (phone: string, message: string) => {
  const cleanPhone = phone.replace(/\D/g, '');
  return zApiRequest('POST', '/send-text', {
    phone: cleanPhone,
    message
  });
};