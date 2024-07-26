"use client"
import HeaderPublicBlack from '@/components/home/HeaderPublicBlack'
import Footer from '@/components/home/Footer'
import React from 'react'

const GuiaDeUso = () => {
  return (
    <>
      <HeaderPublicBlack/>
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
       
      </div>
      <Footer />
    </>
  )
}

export default GuiaDeUso