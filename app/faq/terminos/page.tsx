import HeaderPublicBlack from "@/components/HeaderPublicBlack";
import Footer from "@/components/home/Footer";
import stylesHome from "@/app/css-modules/HomeWhite.module.css";
import Link from "next/link";

const Terminos = () => {
  return (
    <>
    <div id="top">

      <HeaderPublicBlack />
      <div className="flex flex-col items-center w-full px-8 mx-auto text-justify mb-28 pt-28 md:pt-32 md:w-3/4 lg:px-20 xl:px-56">
        <h3 className="text-2xl font-bold text-center mb-14 md:text-4xl">
          Términos y condiciones
        </h3>

        <div className="mb-20">
          <span className="text-base font-bold">Información relevante</span>
          <p className="mt-6 text-sm font-normal">
            Es requisito necesario para el uso del servicio bridado en esta
            aplicación, que lea y esté de acuerdo con los siguientes Términos y
            Condiciones mencionados a continuación. El uso de nuestros servicios
            implicará que usted ha leído y aceptado los Términos y Condiciones
            de Uso en el presente documento. Para utilizar nuestro servicio,
            será necesario el registro por parte del usuario, con ingreso de
            datos personales fidedignos y definición de una contraseña.
          </p>
          <p className="mt-5 text-sm font-normal">
            El usuario puede elegir y cambiar la clave para su acceso de
            administración de la cuenta en cualquier momento, en caso de que se
            haya registrado y que sea necesario para la compra de alguno de
            nuestros servicios. No asume la responsabilidad en caso de que
            entregue dicha clave a terceros.
          </p>
          <p className="mt-5 text-sm font-normal">
            Todas las compras y transacciones que se lleven a cabo por medio de
            este sitio web, están sujetas a un proceso de confirmación y
            verificación, el cual podría incluir la validación de la forma de
            pago, validación de la factura (en caso de existir) y el
            cumplimiento de las condiciones requeridas por el medio de pago
            seleccionado. En algunos casos puede que se requiera una
            verificación por medio de correo electrónico.
          </p>
          <p className="mt-5 text-sm font-normal">
            Los precios de los servicios ofrecidos en esta aplicación son
            válidos solamente en las compras realizadas en este sitio web.
          </p>
        </div>

        <div className="mb-20">
          <span className="text-base font-bold">Propiedad</span>
          <p className="mt-6 text-sm font-normal">
            No realizamos reembolsos después de el pago del servicio, ya que
            usted tiene la responsabilidad de entender antes de comprarlo. Le
            pedimos que lea cuidadosamente antes de comprarlo. Hacemos solamente
            excepciones con esta regla cuando ocurra un mal funcionamiento del
            servicio. correctamente.
          </p>
        </div>

        <div className="mb-20">
          <span className="text-base font-bold">Comprobación antifraude</span>
          <p className="mt-6 text-sm font-normal">
            La compra del cliente puede ser aplazada para la comprobación
            antifraude. También puede ser suspendida por más tiempo para una
            investigación más rigurosa, para evitar transacciones fraudulentas.
          </p>
        </div>
        <Link className="mx-auto" href={"/faq/privacidad#top"}>
          <button
            type="submit"
            className={`${stylesHome.btnAnimated}`}
            style={{
              fontSize: "12px",
              letterSpacing: ".5px",
              width: "100%",
              padding: "11px 17px",
            }}
          >
            ver políticas de privacidad
          </button>
        </Link>
      </div>
      <Footer />
    </div>
    </>
  );
};

export default Terminos;
