import Image from "next/image";
import mockup from "@/public/deviceframes2.png";
import mockup2 from "@/public/deviceframes4.png";
import styles from "@/app/css-modules/HomeWhite.module.css";
import Link from "next/link";
import { MdOutlineAddBusiness } from "react-icons/md";

const HeroSection = () => {
  return (
    <>
      <div
        className={styles.heroContainer} >
        <div className="flex flex-col h-full w-fit md:flex-row ">
          <div className="flex flex-col justify-around w-full h-full gap-8 my-auto md:gap-16 md:h-fit">
            <h4 className="text-4xl font-bold md:text-5xl lg:text-7xl ">
              Digitalizá la gestión de tu negocio
            </h4>
            <div>
              <p className="mb-3 text-sm font-medium text-gray-500 xl:text-xl sm:text-md md:text-base">
                Tu solución para la gestión de turnos. Simplificá tu
                día a día, maximizá tu eficiencia y ofrecé una experiencia
                excepcional a tus clientes mediante la automatización de tus reservas con SacaTurno.
              </p>
              <p className="mb-2 text-sm font-medium text-gray-500 xl:text-xl sm:text-md md:text-base">
                ¡Regístrate hoy mismo para obtener una prueba gratuita de 15
                días! Cliqueá el boton debajo, creá tu
                empresa y comenzá a gestionar tus turnos.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex justify-center w-fit ">
                <Link
                  href="/register"
                  type="submit"
                  className={`${styles.btnAnimated} font-normal`}
                >
                  <MdOutlineAddBusiness size={24} />
                  Crear empresa
                </Link>
              </div>
              <span>o</span>
              <div className="flex justify-center w-fit ">
                <Link
                  href="/public/search"
                  type="submit"
                  className={`${styles.btnAnimatedWhite} font-normal`}
                >
                  <MdOutlineAddBusiness size={24} />
                  Reservar un turno
                </Link>
              </div>
            </div>
          </div>

          <div className="m-auto ">
            <Image src={mockup} className="hidden 2xl:block" width={1300} alt="Mockup" />
            <Image src={mockup} className="hidden md:block 2xl:hidden" width={1140} alt="Mockup" />
            <Image src={mockup2} className="block mt-3 md:hidden" width={340} alt="Mockup" />
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;
