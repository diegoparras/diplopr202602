// Única pieza que ve la clave de Artificial Analysis.
// Corre en el servidor de Vercel, normaliza la respuesta y la devuelve
// con caché de 24 horas en el borde: un pedido por día a la API,
// entren diez personas o diez mil.

export default async function handler(req, res) {
  try {
    const r = await fetch('https://artificialanalysis.ai/api/v2/data/llms/models', {
      headers: { 'x-api-key': process.env.AA_API_KEY }
    });

    if (!r.ok) {
      res.status(502).json({ error: 'Artificial Analysis respondió ' + r.status });
      return;
    }

    const crudo = await r.json();

    const modelos = (crudo.data || [])
      .map(m => ({
        n:  m.name,
        s:  m.slug,
        f:  m.release_date,
        c:  m.model_creator && m.model_creator.name,
        i:  m.evaluations && m.evaluations.artificial_analysis_intelligence_index,
        cd: m.evaluations && m.evaluations.artificial_analysis_coding_index,
        mt: m.evaluations && m.evaluations.artificial_analysis_math_index,
        pe: m.pricing && m.pricing.price_1m_input_tokens,
        ps: m.pricing && m.pricing.price_1m_output_tokens,
        p:  m.pricing && m.pricing.price_1m_blended_3_to_1,
        v:  m.median_output_tokens_per_second
      }))
      .filter(m => m.i != null && m.f);

    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=604800');
    res.status(200).json({
      fecha: new Date().toISOString().slice(0, 10),
      fuente: 'Artificial Analysis Intelligence Index',
      modelos
    });

  } catch (e) {
    res.status(500).json({ error: 'No se pudo obtener el panorama de modelos' });
  }
}
