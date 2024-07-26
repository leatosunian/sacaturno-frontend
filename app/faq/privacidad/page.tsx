import HeaderPublicBlack from "@/components/home/HeaderPublicBlack";
import Footer from "@/components/home/Footer";
import stylesHome from "@/app/css-modules/HomeWhite.module.css";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidad | SacaTurno",
  description: "Aplicación de turnos online",
};

const Privacidad = () => {
  return (
    <>
      <div id="top">
        <HeaderPublicBlack />
        <div className="flex flex-col items-center w-full px-8 mx-auto text-justify mb-28 pt-28 md:pt-32 md:w-3/4 lg:px-20 xl:px-56">
          <h3 className="text-2xl font-bold text-center mb-14 md:text-4xl">
            Política de privacidad
          </h3>
          <p className="mb-20 text-sm font-medium">
            La presente Política de Privacidad establece los términos en que se
            usa y protege la información que es proporcionada por nuestros
            usuarios al momento de utilizar nuestra aplicación web. SacaTurno
            está comprometido con la seguridad de los datos de sus usuarios.
            Cuando le pedimos llenar los campos de información personal con la
            cual usted pueda ser identificado, lo hacemos asegurando que sólo se
            empleará de acuerdo con los términos de este documento y solamente
            para las funcionalidades a la hora del uso del servicio. Sin
            embargo, esta Política de Privacidad puede cambiar con el tiempo o
            ser actualizada por lo que le recomendamos y enfatizamos revisar
            continuamente esta página para asegurarse que está de acuerdo con
            dichos cambios.
          </p>

          <div className="mb-20">
            <span className="text-base font-bold">
              Información que es recogida
            </span>
            <p className="mt-6 text-sm font-normal">
              Nuestro sitio web podrá recoger información personal, por ejemplo:
              Nombre, información de contacto como su dirección de correo
              electrónico y número de teléfono. Así mismo cuando sea necesario
              podrá ser requerida información específica para realizar una
              facturación a la hora de realizar el pago de un plan. Actualmente
              no pedimos datos, solamente los que Mercado Pago solicite a la
              hora de efectuar el pago de nuestros servicios en su aplicación.
            </p>
          </div>

          <div className="mb-20">
            <span className="text-base font-bold">
              Uso de la información recogida
            </span>
            <p className="mt-6 text-sm font-normal">
              Nuestro sitio web emplea la información con el fin de proporcionar
              el mejor servicio posible, particularmente para mantener un
              registro de usuarios y mejorar nuestros productos y servicios.
              Siendo cliente, serán enviados correos electrónicos con
              información a la hora de solicitar un turno. Siendo usuario,
              recibirá correos electrónicos a la hora de: activar su cuenta,
              recibir una reserva de turno, reestablecer su contraseña y cuando
              su suscripción caduque. Estos serán enviados a la dirección que
              usted proporcione y podrán ser cancelados en cualquier momento.
            </p>
            <p className="mt-5 text-sm font-normal">
              SacaTurno está altamente comprometido para cumplir con el
              compromiso de mantener su información segura. Usamos los sistemas
              más avanzados y los actualizamos constantemente para asegurarnos
              que no exista ningún acceso no autorizado.
            </p>
          </div>

          <div className="mb-20">
            <span className="text-base font-bold">Cookies</span>
            <p className="mt-6 text-sm font-normal">
              Una cookie se refiere a un fichero que es enviado con la finalidad
              de solicitar permiso para almacenarse en su ordenador, al aceptar
              dicho fichero se crea y la cookie sirve entonces para tener
              información respecto al tráfico web, y también facilita las
              futuras visitas a una web recurrente. Otra función que tienen las
              cookies es que con ellas las web pueden reconocerte
              individualmente y por tanto brindarte el mejor servicio
              personalizado de su web.
            </p>
            <p className="mt-5 text-sm font-normal">
              Nuestro sitio web emplea las cookies solamente para almacenar
              datos de inicio de sesión, por lo que si usted no acepta las
              cookies la aplicación no podrá funcionar correctamente. Usted
              puede aceptar o negar el uso de cookies. Sin embargo, la mayoría
              de navegadores aceptan cookies automáticamente pues sirve para
              tener un mejor servicio web. También usted puede cambiar la
              configuración de su ordenador para declinar las cookies. Si se
              declinan es posible que no pueda utilizar algunos de nuestros
              servicios.
            </p>
          </div>

          <div className="mb-20">
            <span className="text-base font-bold">Enlaces a Terceros</span>
            <p className="mt-6 text-sm font-normal">
              Este sitio web pudiera contener en laces a otros sitios que
              pudieran ser de su interés. Una vez que usted de clic en estos
              enlaces y abandone nuestra página, ya no tenemos control sobre al
              sitio al que es redirigido y por lo tanto no somos responsables de
              los términos o privacidad ni de la protección de sus datos en esos
              otros sitios terceros. Dichos sitios están sujetos a sus propias
              políticas de privacidad por lo cual es recomendable que los
              consulte para confirmar que usted está de acuerdo con estas.
            </p>
          </div>

          <div className="mb-14">
            <span className="text-base font-bold">
              Control de su información personal
            </span>
            <p className="mt-6 text-sm font-normal">
              En cualquier momento usted puede restringir la recopilación o el
              uso de la información personal que es proporcionada a nuestro
              sitio web. Cada vez que se le solicite rellenar un formulario,
              como el de alta de usuario, puede marcar o desmarcar la opción de
              recibir información por correo electrónico. En caso de que haya
              marcado la opción de recibir nuestro boletín o publicidad usted
              puede cancelarla en cualquier momento.
            </p>

            <p className="mt-5 text-sm font-normal">
              SacaTurno no venderá, cederá ni distribuirá la información
              personal que es recopilada sin su consentimiento, salvo que sea
              requerido por un juez con un orden judicial.
            </p>
            <p className="mt-5 text-sm font-normal">
              Se reserva el derecho de cambiar los términos de la presente
              Política de Privacidad en cualquier momento.
            </p>
          </div>

          <Link href={"/faq/terminos#top"}>
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
              ver términos y condiciones
            </button>
          </Link>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default Privacidad;
