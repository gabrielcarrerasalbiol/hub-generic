import { Helmet } from 'react-helmet';

export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Política de Cookies | Hub Madridista</title>
      </Helmet>
      
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold mb-6 text-[#001C58] border-b pb-4">Política de Cookies</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="mb-4">
            Esta Política de Cookies explica el uso de cookies y tecnologías similares en "Hub Madridista".
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4 text-[#001C58]">3.1. Definición de cookies</h2>
          <p className="mb-4">
            Las cookies son pequeños archivos que se descargan en el dispositivo del Usuario al visitar ciertas páginas web. 
            Permiten, entre otras cosas, reconocer un dispositivo, recordar preferencias y recopilar información sobre 
            hábitos de navegación.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4 text-[#001C58]">3.2. Tipos de cookies utilizadas</h2>
          <ul className="mb-4">
            <li className="mb-2">
              <strong>Cookies propias</strong>: Para recordar sesiones de usuario y preferencias de idioma.
            </li>
            <li className="mb-2">
              <strong>Cookies de terceros</strong>:
              <ul className="list-disc ml-6 mb-2">
                <li>Google Analytics: Recopila datos anónimos de uso y visitas para estadísticas.</li>
                <li>Publicidad: Podrían utilizarse redes publicitarias que instalen cookies para mostrar anuncios relevantes.</li>
                <li>Redes sociales o incrustaciones de video (YouTube, TikTok): Pueden instalar cookies al reproducir contenido embebido.</li>
              </ul>
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-4 text-[#001C58]">3.3. Finalidad</h2>
          <p className="mb-4">Las cookies se utilizan para:</p>
          <ul className="list-disc ml-6 mb-4">
            <li>Facilitar la navegación y sesión del Usuario.</li>
            <li>Analizar el tráfico y rendimiento del Sitio Web.</li>
            <li>Personalizar la experiencia, incluyendo publicidad ajustada a los intereses.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-4 text-[#001C58]">3.4. Consentimiento</h2>
          <p className="mb-4">
            Al acceder por primera vez a Hub Madridista, se muestra un aviso de cookies. El Usuario puede aceptar todas, 
            configurarlas o rechazarlas. La instalación de cookies opcionales solo se realiza con consentimiento. 
            El Usuario puede retirar su consentimiento en cualquier momento desde la configuración de cookies del Sitio Web.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4 text-[#001C58]">3.5. Desactivación</h2>
          <p className="mb-4">
            El Usuario puede configurar el navegador para bloquear o eliminar cookies, aunque esto puede afectar el pleno 
            funcionamiento del Sitio Web.
          </p>
          
          <h2 className="text-xl font-semibold mt-6 mb-4 text-[#001C58]">4. LEGISLACIÓN APLICABLE Y JURISDICCIÓN</h2>
          <p className="mb-4">
            Estos documentos se rigen por la legislación española. Para la resolución de cualquier controversia, 
            el Usuario y el titular se someten a los Juzgados y Tribunales de Palma de Mallorca (España), 
            salvo que la normativa disponga otro fuero imperativo en favor del consumidor.
          </p>
        </div>
      </div>
    </div>
  );
}