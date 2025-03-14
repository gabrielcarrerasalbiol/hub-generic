import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Variable global para control de solicitudes bloqueadas
// Se reduce significativamente el uso del rate limiting en el lado del cliente
const RATE_LIMIT_FLAG = 'hubmadridista_rate_limited';
let apiRateLimited = false;

// Verificar si el servicio ya fue bloqueado previamente
if (typeof window !== 'undefined') {
  const rateLimitFlag = window.localStorage.getItem(RATE_LIMIT_FLAG);
  if (rateLimitFlag) {
    console.log('API actualmente rate-limited, bloqueando solicitudes');
    
    // Programar una limpieza del bloqueo después de 5 minutos
    const blockTime = parseInt(rateLimitFlag, 10);
    const now = Date.now();
    
    // Si el bloqueo tiene más de 2 segundos, limpiarlo (reducido drásticamente)
    if ((now - blockTime) > 2 * 1000) {
      console.log('Limpiando bloqueo de API que expiró');
      window.localStorage.removeItem(RATE_LIMIT_FLAG);
      apiRateLimited = false;
    } else {
      apiRateLimited = true;
    }
  }
}

// Función para bloquear la API cuando se detecta un rate limit
function blockApiRequests() {
  apiRateLimited = true;
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(RATE_LIMIT_FLAG, Date.now().toString());
  }
}

async function throwIfResNotOk(res: Response) {
  // Verificar si estamos en estado de bloqueo primero
  if (apiRateLimited) {
    throw new Error('API actualmente limitada. Por favor, inténtelo más tarde.');
  }
  
  // Verificar 429 específicamente
  if (res.status === 429) {
    // Marcar que todas las solicitudes deben ser bloqueadas durante un tiempo
    blockApiRequests();
    
    let retryAfter = '60';
    try {
      const responseText = await res.text();
      const errorData = JSON.parse(responseText);
      if (errorData.retryAfter) {
        retryAfter = errorData.retryAfter;
      }
    } catch (e) {
      // Ignorar errores y usar valor por defecto
    }
    
    throw new Error(`Rate limit excedido. Por favor, inténtelo después de ${retryAfter} segundos.`);
  }
  
  if (!res.ok) {
    let text = '';
    try {
      // Intentar obtener el cuerpo de la respuesta como texto
      const responseText = await res.text();
      
      // Si hay texto, intenta parsearlo como JSON
      if (responseText) {
        try {
          const errorJson = JSON.parse(responseText);
          // Si tiene un campo de error, usa ese mensaje
          if (errorJson.error) {
            text = errorJson.error;
          } else {
            text = responseText;
          }
        } catch (e) {
          // Si no es JSON válido, usa el texto tal cual
          text = responseText;
        }
      } else {
        // Si no hay texto, usa el statusText
        text = res.statusText;
      }
    } catch (e) {
      // Si hay algún error al obtener el texto, usa el statusText
      text = res.statusText;
    }
    
    throw new Error(text || `Error ${res.status}`);
  }
}

export async function apiRequest<T = any>(
  methodOrUrlOrOptions: string | RequestInit,
  urlOrOptions?: string | Record<string, any>,
  data?: Record<string, any>
): Promise<T> {
  let method: string = 'GET';
  let url: string;
  let requestOptions: RequestInit = {};

  // Primer patrón: apiRequest(url, options)
  if (typeof methodOrUrlOrOptions === 'string' && 
      (methodOrUrlOrOptions.startsWith('/') || methodOrUrlOrOptions.startsWith('http'))) {
    url = methodOrUrlOrOptions;
    if (urlOrOptions && typeof urlOrOptions !== 'string') {
      requestOptions = urlOrOptions as RequestInit;
    }
  } 
  // Segundo patrón: apiRequest(method, url, data)
  else if (typeof methodOrUrlOrOptions === 'string' && typeof urlOrOptions === 'string') {
    method = methodOrUrlOrOptions.toUpperCase();
    url = urlOrOptions;
    if (data) {
      requestOptions.body = JSON.stringify(data);
    }
  }
  // Tercer patrón: apiRequest(options)
  else {
    requestOptions = methodOrUrlOrOptions as RequestInit;
    url = '/api'; // Valor por defecto, debería sobrescribirse
  }

  // Asignar método si no está en las opciones
  if (!requestOptions.method) {
    requestOptions.method = method;
  }

  // Asegurarse de que las cabeceras se envíen correctamente
  if (!requestOptions.headers && requestOptions.body) {
    requestOptions.headers = {
      'Content-Type': 'application/json'
    };
  }

  // Siempre incluir credenciales
  requestOptions.credentials = 'include';

  // Añadir token de autenticación de localStorage si existe
  const token = localStorage.getItem('hubmadridista_token');
  if (token) {
    requestOptions.headers = {
      ...requestOptions.headers,
      'Authorization': `Bearer ${token}`
    };
    console.log('Token añadido a la solicitud:', `Bearer ${token.substring(0, 10)}...`);
  } else {
    console.log('No se encontró token de autenticación');
  }

  const res = await fetch(url, requestOptions);
  await throwIfResNotOk(res);
  
  // Para peticiones HEAD o si la respuesta está vacía
  if (res.status === 204 || requestOptions.method === 'HEAD') {
    return {} as T;
  }
  
  // Intentar parsear como JSON
  return await res.json() as T;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const token = localStorage.getItem('hubmadridista_token');
    
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('Token añadido a la consulta:', `Bearer ${token.substring(0, 10)}...`);
    } else {
      console.log('No se encontró token de autenticación para la consulta');
    }

    const res = await fetch(url, {
      credentials: "include",
      headers
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 60000, // 1 minuto (reducido de Infinity para pruebas)
      retry: 1, // Intentar una vez más (para manejar posibles errores temporales)
      retryDelay: 1000, // Esperar 1 segundo entre reintentos
    },
    mutations: {
      retry: 1, // Intentar una vez más
      retryDelay: 1000, // Esperar 1 segundo entre reintentos
    },
  },
});
