import { Helmet } from 'react-helmet';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Política de Privacidad | Hub Madridista</title>
      </Helmet>
      
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold mb-6 text-[#001C58] border-b pb-4">Política de Privacidad</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="mb-4">
            Esta Política de Privacidad describe cómo recopilamos, usamos y protegemos los datos personales de los usuarios 
            en cumplimiento del <strong>Reglamento (UE) 2016/679 (RGPD)</strong> y la normativa aplicable en España.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4 text-[#001C58]">2.1. Responsable del Tratamiento</h2>
          <ul className="list-disc ml-6 mb-4">
            <li>Nombre: Gabriel Carreras Albiol</li>
            <li>DNI: 41496108Z</li>
            <li>Domicilio: C/ Sant Rafael 104, 07701, Palma de Mallorca</li>
            <li>Correo: contacto@hubmadridista.com</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-4 text-[#001C58]">2.2. Datos recabados y finalidad</h2>
          <ul className="mb-4">
            <li className="mb-2">
              <strong>Datos de registro</strong>: nombre de usuario, email y contraseña, imprescindibles para la creación 
              de perfil y acceso a funcionalidades.
            </li>
            <li className="mb-2">
              <strong>Datos de uso</strong>: información sobre actividad en el Sitio (favoritos, suscripciones) para prestar 
              el servicio y mejorar la experiencia.
            </li>
            <li className="mb-2">
              <strong>Datos de pago</strong>: en caso de suscripciones de pago, se gestionan a través de plataformas seguras 
              de terceros; no se almacenan los datos completos de tarjetas en nuestros servidores.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-4 text-[#001C58]">2.3. Base de legitimación</h2>
          <ul className="list-disc ml-6 mb-4">
            <li>
              <strong>Ejecución de un contrato</strong>: para gestionar el registro y los servicios solicitados.
            </li>
            <li>
              <strong>Consentimiento</strong>: para comunicaciones comerciales si el Usuario así lo autoriza.
            </li>
            <li>
              <strong>Interés legítimo</strong>: análisis anónimos de uso para mejorar el Sitio Web.
            </li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-4 text-[#001C58]">2.4. Conservación</h2>
          <p className="mb-4">
            Los datos se conservan mientras dure la relación con el Usuario. Finalizada dicha relación, 
            mantendremos la información bloqueada por el tiempo estrictamente requerido para el cumplimiento 
            de obligaciones legales.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4 text-[#001C58]">2.5. Derechos de los usuarios</h2>
          <p className="mb-4">
            Los usuarios pueden ejercer sus derechos de acceso, rectificación, supresión, oposición, 
            limitación del tratamiento y portabilidad enviando un correo a <strong>contacto@hubmadridista.com</strong>, 
            indicando el derecho que desean ejercer e identificándose debidamente. También tienen derecho a 
            presentar una reclamación ante la Agencia Española de Protección de Datos si consideran vulnerados sus derechos.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4 text-[#001C58]">2.6. Transferencias internacionales</h2>
          <p className="mb-4">
            En caso de usar servicios o herramientas ubicadas fuera del Espacio Económico Europeo 
            (por ejemplo, proveedores de hosting o newsletter), se garantizará un nivel de protección 
            adecuado mediante cláusulas contractuales tipo o una decisión de adecuación de la Comisión Europea.
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-4 text-[#001C58]">2.7. Seguridad</h2>
          <p className="mb-4">
            Se aplican medidas técnicas y organizativas para proteger los datos contra accesos no autorizados, 
            alteración, divulgación o destrucción.
          </p>
        </div>
      </div>
    </div>
  );
}