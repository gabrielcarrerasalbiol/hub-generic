import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
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
  urlOrOptions: string | RequestInit,
  options?: RequestInit
): Promise<T> {
  let url: string;
  let requestOptions: RequestInit;

  if (typeof urlOrOptions === 'string') {
    url = urlOrOptions;
    requestOptions = options || { method: 'GET' };
  } else {
    // En este caso, el primer argumento es las opciones de la solicitud
    // y debe contener un campo url
    url = '/api'; // Valor por defecto, se debería sobrescribir
    requestOptions = urlOrOptions;
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
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
