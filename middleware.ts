export const config = {
  matcher: ['/', '/index.html'],
};

export default async function middleware(req: Request) {
  const url = new URL(req.url);

  // Se o parâmetro bypass estiver ativo, deixa passar direto para evitar loops recursivos de fetch
  if (url.searchParams.get('bypass') === 'true') {
    return;
  }

  try {
    const supabaseUrl = "https://yyntswapsjtksjqdvabf.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5bnRzd2Fwc2p0a3NqcWR2YWJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNTc3MjIsImV4cCI6MjA4ODczMzcyMn0.AFdqH8qZE8enI0yQAgPbkEXvkmMrgFIYFzULgI9mHOI";

    // Consultar o Supabase via REST de forma ultra rápida com timeout de 1.5s
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const dbRes = await fetch(`${supabaseUrl}/rest/v1/system_settings?id=eq.global_limits&select=seo_title,seo_description,seo_keywords`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    let seoTitle = "Advogado Rio de Janeiro | Consulta Processo - Consulta Processual";
    let seoDescription = "Monitore seus processos jurídicos com inteligência artificial.";
    let seoKeywords = "advogado, processo, cnj, tribunal";

    if (dbRes.ok) {
      const data = await dbRes.json();
      if (data && data.length > 0) {
        seoTitle = data[0].seo_title || seoTitle;
        seoDescription = data[0].seo_description || seoDescription;
        seoKeywords = data[0].seo_keywords || seoKeywords;
      }
    }

    // Buscar o arquivo index.html original adicionando a query de bypass
    const originUrl = new URL(url.pathname, req.url);
    originUrl.searchParams.set('bypass', 'true');

    const htmlRes = await fetch(originUrl.toString());
    if (!htmlRes.ok) {
      return; // Fallback se falhar ao carregar o index.html original
    }

    let html = await htmlRes.text();

    // Substituir cirurgicamente a tag <title>...</title>
    html = html.replace(/<title>[^]*?<\/title>/, `<title>${seoTitle}</title>`);

    // Injetar tags adicionais de SEO e Open Graph antes do fechamento </head>
    const metaTags = `
    <meta name="description" content="${seoDescription}" />
    <meta name="keywords" content="${seoKeywords}" />
    <meta property="og:title" content="${seoTitle}" />
    <meta property="og:description" content="${seoDescription}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${url.origin}" />
    </head>`;

    html = html.replace('</head>', metaTags);

    // Retorna o HTML reescrito com cabeçalho de texto correto
    return new Response(html, {
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'x-seo-middleware': 'active'
      }
    });

  } catch (err) {
    console.error("[SEO Middleware] Erro ao injetar metatags de SEO:", err);
    return; // Fallback silencioso: deixa o HTML estático padrão carregar normalmente
  }
}
