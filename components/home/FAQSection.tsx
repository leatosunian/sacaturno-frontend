"use client";

import Accordion from "@/components/home/Accordion";

const FAQSection = () => {
  return (
    <>
      <div className="flex flex-col items-center justify-center w-full gap-12 h-fit ">
        <header className="text-center">
          <div className="w-full text-center h-fit">
            <h3 className="mb-1 text-2xl font-semibold text-black md:text-3xl">
              Preguntas frecuentes
            </h3>
            <span className="flex items-center justify-center gap-2 text-lg font-normal text-gray-600 px-7 md:px-0">
              Pagá de manera segura mediante Mercado Pago
            </span>
          </div>
        </header>

        <div className="w-full px-6 md:w-4/6 lg:w-1/2 md:px-0 h-fit rounded-xl ">
          <Accordion
            title="¿Cómo reservo un turno?"
            answer='En la pagina principal accedé al menú, hacé click en "Reservar turno", buscá el nombre de la empresa. En el resultado de la busqueda pulsá en el ícono del calendario, cliqueá en el turno disponible que desees, llená tus datos y realizá la reserva. Una vez hecho el turno, recibirás un correo con los datos de la reserva. Si no lo recibiste, revisá la carpeta de correo no deseado.'
          />
          <Accordion
            title="¿Cómo creo mi empresa?"
            answer='Primero debés registrarte y confirmar tu cuenta en el correo que te enviaremos luego del registro. Una vez hayas activado tu cuenta, iniciá sesión y accedé a "Mi empresa", completá los datos de tu negocio y hacé click en "Crear empresa". Recordá crear un servicio para poder comenzar a cargar tus turnos. '
          />
          <Accordion
            title="¿Cómo cancelo un turno?"
            answer="Podés cancelar el turno en el mismo momento que hiciste la reserva. Si necesitás cancelarlo luego, debés contactarte con el dueño de la empresa mediante el correo o el teléfono de contacto que te enviamos en el correo al realizar la reserva del turno."
          />
          <Accordion
            title="Pagos en la aplicación"
            answer="El servicio se abona mediante la pasarela de pago de Mercado Pago. Por lo tanto, todos los datos que ingreses no estarán a nuestra disposición. Tampoco tendrás que vincular tu tarjeta de crédito para activar tu período gratuito ni para futuros pagos automáticos del servicio."
          />
          <Accordion
            title="No recibo los correos"
            answer="Los correos pueden llegar a la carpeta de spam o de correo no deseado. Recordá revisar esa carpeta o si estas teniendo problemas no dudes en contactarnos."
          />
        </div>
      </div>
    </>
  );
};

export default FAQSection;
