import Link from "next/link";

export default function LegalPage() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <header className="mb-8">
        <Link href="/" className="text-sm text-accent hover:underline">
          &larr; Inicio
        </Link>
        <h1 className="text-2xl font-semibold mt-2 font-[family-name:var(--font-source-serif)] text-text-primary">
          Aviso Legal
        </h1>
      </header>

      <div className="prose prose-sm max-w-none text-text-primary space-y-6">
        <p className="text-text-secondary text-sm">
          Al acceder y utilizar este sitio web, usted acepta los siguientes
          términos y condiciones.
        </p>

        <section>
          <h2 className="text-lg font-semibold font-[family-name:var(--font-source-serif)] mb-2">
            1. Información general
          </h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            Este sitio web es un proyecto sin ánimo de lucro cuyo único propósito
            es facilitar la lectura de la Biblia Reina Valera 1960 en formato
            digital. No se realiza ninguna actividad comercial, no se venden
            productos ni servicios, y no se obtiene beneficio económico alguno de
            su funcionamiento.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold font-[family-name:var(--font-source-serif)] mb-2">
            2. Propiedad intelectual
          </h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            El texto bíblico corresponde a la versión Reina Valera 1960. El
            diseño, código fuente y elementos gráficos de esta web son propiedad
            de sus autores. Queda prohibida la reproducción, distribución o
            comunicación pública del diseño y código sin autorización expresa. El
            texto bíblico es de dominio público y puede ser compartido libremente.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold font-[family-name:var(--font-source-serif)] mb-2">
            3. Política de privacidad
          </h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            Este sitio web recopila únicamente los datos necesarios para el
            funcionamiento de las cuentas de usuario: nombre, dirección de correo
            electrónico e imagen de perfil (en caso de registro mediante Google).
            Estos datos se utilizan exclusivamente para identificar al usuario y
            gestionar sus preferencias de lectura (favoritos, progreso de lectura
            y posición de lectura).
          </p>
          <p className="text-sm leading-relaxed text-text-secondary mt-2">
            No se comparten datos personales con terceros. No se utilizan los
            datos con fines comerciales, publicitarios ni de análisis. El usuario
            puede solicitar la eliminación de su cuenta y todos sus datos
            asociados en cualquier momento.
          </p>
          <p className="text-sm leading-relaxed text-text-secondary mt-2">
            De conformidad con el Reglamento General de Protección de Datos (RGPD)
            (UE) 2016/679 y la Ley Orgánica 3/2018 de Protección de Datos
            Personales, el usuario tiene derecho de acceso, rectificación,
            supresión, limitación y oposición al tratamiento de sus datos.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold font-[family-name:var(--font-source-serif)] mb-2">
            4. Cookies
          </h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            Este sitio utiliza únicamente cookies técnicas necesarias para el
            funcionamiento de la autenticación y la sesión del usuario. No se
            utilizan cookies de seguimiento, analítica ni publicidad.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold font-[family-name:var(--font-source-serif)] mb-2">
            5. Responsabilidad
          </h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            El titular de este sitio web no se responsabiliza de posibles errores
            tipográficos en el texto bíblico, aunque se ha procurado la máxima
            fidelidad al texto original de la Reina Valera 1960. El sitio se
            ofrece tal cual, sin garantías de disponibilidad continua.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold font-[family-name:var(--font-source-serif)] mb-2">
            6. Enlaces externos
          </h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            Este sitio puede contener funciones para compartir contenido en
            plataformas externas (WhatsApp, etc.). No nos hacemos responsables del
            contenido ni de las políticas de privacidad de dichas plataformas.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold font-[family-name:var(--font-source-serif)] mb-2">
            7. Modificaciones
          </h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            Nos reservamos el derecho de modificar este aviso legal en cualquier
            momento. Las modificaciones entrarán en vigor desde su publicación en
            esta página.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold font-[family-name:var(--font-source-serif)] mb-2">
            8. Legislación aplicable
          </h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            Este aviso legal se rige por la legislación española, en particular
            por el Reglamento General de Protección de Datos (UE) 2016/679, la
            Ley Orgánica 3/2018 de Protección de Datos y la Ley 34/2002 de
            Servicios de la Sociedad de la Información y de Comercio Electrónico.
          </p>
        </section>
      </div>
    </div>
  );
}
