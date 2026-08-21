const MODEL = '@cf/google/gemma-4-26b-a4b-it';
const MAX_BODY_BYTES = 7 * 1024 * 1024;

const corsHeaders = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,OPTIONS',
  'access-control-allow-headers': 'content-type',
  'access-control-max-age': '86400',
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders,
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
}

function emptyExtracted() {
  return {
    customer: { name: '', phone: '', email: '', address: '', city: '' },
    servicePro: { workOrder: '', serviceAppointment: '' },
    equipment: { indoorModel: '', outdoorModel: '' },
    job: { description: '', errorCode: '' },
    meta: { confidence: 0, warnings: [] },
  };
}

function asString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeExtracted(input) {
  const source = input && typeof input === 'object' ? input : {};
  const result = emptyExtracted();
  const customer = source.customer && typeof source.customer === 'object' ? source.customer : {};
  const servicePro = source.servicePro && typeof source.servicePro === 'object' ? source.servicePro : {};
  const equipment = source.equipment && typeof source.equipment === 'object' ? source.equipment : {};
  const job = source.job && typeof source.job === 'object' ? source.job : {};
  const meta = source.meta && typeof source.meta === 'object' ? source.meta : {};

  result.customer.name = asString(customer.name);
  result.customer.phone = asString(customer.phone);
  result.customer.email = asString(customer.email);
  result.customer.address = asString(customer.address);
  result.customer.city = asString(customer.city);
  result.servicePro.workOrder = asString(servicePro.workOrder);
  result.servicePro.serviceAppointment = asString(servicePro.serviceAppointment);
  result.equipment.indoorModel = asString(equipment.indoorModel);
  result.equipment.outdoorModel = asString(equipment.outdoorModel);
  result.job.description = asString(job.description);
  result.job.errorCode = asString(job.errorCode).toUpperCase();

  const confidence = Number(meta.confidence);
  result.meta.confidence = Number.isFinite(confidence) ? Math.max(0, Math.min(100, confidence)) : 0;
  result.meta.warnings = Array.isArray(meta.warnings)
    ? meta.warnings.filter((item) => typeof item === 'string').slice(0, 8)
    : [];

  return result;
}

function parseJsonResponse(value) {
  if (value && typeof value === 'object') return value;
  const text = String(value || '').trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('MODEL_JSON_INVALID');
  return JSON.parse(text.slice(start, end + 1));
}

function dataUrlToBlob(dataUrl, declaredMimeType) {
  const match = /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=\r\n]+)$/.exec(dataUrl);
  if (!match) throw new Error('IMAGE_FORMAT_UNSUPPORTED');
  const mimeType = match[1];
  if (declaredMimeType && declaredMimeType !== mimeType) throw new Error('IMAGE_MIME_MISMATCH');
  const binary = atob(match[2].replace(/\s+/g, ''));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  if (bytes.byteLength > 5 * 1024 * 1024) throw new Error('IMAGE_TOO_LARGE');
  const extension = mimeType === 'image/png' ? 'png' : mimeType === 'image/webp' ? 'webp' : 'jpg';
  return { blob: new Blob([bytes], { type: mimeType }), extension };
}

async function imageToText(env, image, mimeType) {
  const { blob, extension } = dataUrlToBlob(image, mimeType);
  const converted = await env.AI.toMarkdown(
    { name: `servicepro-capture.${extension}`, blob },
    {
      conversionOptions: {
        output: { format: 'text' },
        image: { descriptionLanguage: 'es' },
      },
    },
  );
  if (!converted || converted.format === 'error' || typeof converted.data !== 'string') {
    throw new Error('IMAGE_OCR_FAILED');
  }
  return converted.data.trim();
}

async function extractFields(env, sourceText) {
  const prompt = `Extrae datos de una captura o texto de Panasonic ServicePro para un técnico SAT.\n\nREGLAS OBLIGATORIAS:\n- Usa únicamente información explícitamente visible en la fuente.\n- No inventes ni completes valores ausentes.\n- Si un dato no está claro, devuelve cadena vacía y añade una advertencia breve.\n- Mantén Work Order y Service Appointment exactamente como aparecen.\n- Los modelos de unidad deben conservar guiones, letras y números.\n- confidence es un número de 0 a 100 sobre la fiabilidad global.\n- Devuelve SOLO JSON válido, sin Markdown ni explicación.\n\nSCHEMA EXACTO:\n{\n  \"customer\": {\"name\":\"\",\"phone\":\"\",\"email\":\"\",\"address\":\"\",\"city\":\"\"},\n  \"servicePro\": {\"workOrder\":\"\",\"serviceAppointment\":\"\"},\n  \"equipment\": {\"indoorModel\":\"\",\"outdoorModel\":\"\"},\n  \"job\": {\"description\":\"\",\"errorCode\":\"\"},\n  \"meta\": {\"confidence\":0,\"warnings\":[]}\n}\n\nFUENTE:\n${sourceText.slice(0, 24000)}`;

  const response = await env.AI.run(MODEL, {
    messages: [
      { role: 'system', content: 'Eres un extractor de datos técnico, conservador y determinista. Nunca inventes información.' },
      { role: 'user', content: prompt },
    ],
    temperature: 0,
    max_completion_tokens: 1200,
  });

  const modelText = typeof response === 'string'
    ? response
    : response?.response ?? response?.result ?? response?.output_text ?? '';
  return normalizeExtracted(parseJsonResponse(modelText));
}

async function handleExtract(request, env) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY_BYTES) return json({ error: 'PAYLOAD_TOO_LARGE' }, 413);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'INVALID_JSON' }, 400);
  }

  const text = typeof body?.text === 'string' ? body.text.trim() : '';
  const image = typeof body?.image === 'string' ? body.image : '';
  const mimeType = typeof body?.mimeType === 'string' ? body.mimeType : '';

  if (!text && !image) return json({ error: 'EMPTY_INPUT' }, 400);

  try {
    const sourceText = text || await imageToText(env, image, mimeType);
    if (!sourceText) return json({ error: 'NO_TEXT_DETECTED' }, 422);
    const extracted = await extractFields(env, sourceText);
    return json({ extracted });
  } catch (error) {
    const code = error instanceof Error ? error.message : 'EXTRACTION_FAILED';
    console.error('SAT extraction failed:', code);
    return json({ error: 'EXTRACTION_FAILED', code }, 502);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS' && url.pathname.startsWith('/api/sat/')) {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    if (url.pathname === '/api/sat/health' && request.method === 'GET') {
      return json({ ok: true, service: 'panasonic-sat-extractor', model: MODEL });
    }

    if (url.pathname === '/api/sat/extract-servicepro') {
      if (request.method !== 'POST') return json({ error: 'METHOD_NOT_ALLOWED' }, 405);
      return handleExtract(request, env);
    }

    return env.ASSETS.fetch(request);
  },
};
