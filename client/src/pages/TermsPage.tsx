import { Helmet } from 'react-helmet';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Términos y Condiciones | Hub Madridista</title>
      </Helmet>
      
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold mb-6 text-[#001C58] border-b pb-4">Términos y Condiciones de Uso</h1>
        
        <div className="prose prose-lg max-w-none">
          <h2 className="text-xl font-semibold mt-6 mb-4 text-[#001C58]">1.1. Información del titular</h2>
          <ul className="list-disc ml-6 mb-4">
            <li>Titular: Gabriel Carreras Albiol</li>
            <li>Domicilio: C/ Sant Rafael 104, 07701, Palma de Mallorca</li>
            <li>DNI: 41496108Z</li>
            <li>Correo electrónico de contacto: contacto@hubmadridista.com</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-4 text-[#001C58]">1.2. Objeto</h2>
          <p className="mb-4">
            "Hub Madridista" (en adelante, "el Sitio Web") actúa como un hub de contenidos relacionados con el Real Madrid, permitiendo a los usuarios:
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li>Incrustar (embeder) videos de plataformas como YouTube y TikTok.</li>
            <li>Crear perfiles de usuario y gestionar listas de favoritos.</li>
            <li>Posiblemente, enlazar a una tienda online en otro dominio.</li>
            <li>Acceder a suscripciones con servicios adicionales de pago.</li>
          </ul>
          <p className="mb-4">
            La utilización del Sitio Web confiere la condición de Usuario y expresa la aceptación plena y sin reservas de todos los puntos recogidos en este documento legal.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4 text-[#001C58]">1.3. Requisitos de uso</h2>
          <p className="mb-4">Para hacer uso de los servicios ofrecidos, se requiere:</p>
          <ul className="list-disc ml-6 mb-4">
            <li>Ser mayor de edad o contar con autorización de padres/tutores.</li>
            <li>Aceptar la totalidad de estas disposiciones.</li>
            <li>Proporcionar información veraz y lícita en el registro.</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-4 text-[#001C58]">1.4. Contenidos incrustados</h2>
          <p className="mb-4">
            Los videos incrustados de YouTube/TikTok se muestran mediante el reproductor oficial de dichas plataformas. El titular no asume responsabilidad por los contenidos de terceros ni por su disponibilidad o licitud. Los usuarios deben respetar las políticas de derechos de autor y el contenido no autorizado será retirado si se notifica su infracción.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4 text-[#001C58]">1.5. Suscripciones y servicios de pago</h2>
          <p className="mb-4">Si el Usuario opta por servicios de membresía, se compromete a:</p>
          <ul className="list-disc ml-6 mb-4">
            <li>Pagar las cuotas correspondientes en la forma indicada.</li>
            <li>Usar las funcionalidades de acuerdo con la licencia concedida.</li>
            <li>Cancelar la suscripción cuando así lo desee (los pagos ya efectuados no serán reembolsables, salvo lo exigido por la ley).</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-4 text-[#001C58]">1.6. Responsabilidad</h2>
          <p className="mb-4">
            El titular no garantiza la disponibilidad permanente del Sitio Web ni la ausencia de errores. No será responsable de daños derivados del uso del Sitio Web, salvo que se derive de una actuación dolosa o negligente grave.
          </p>
        </div>
      </div>
    </div>
  );
}