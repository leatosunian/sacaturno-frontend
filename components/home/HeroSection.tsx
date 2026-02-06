import Image from "next/image";
import mockup from "@/public/deviceframes2.png";
import mockup2 from "@/public/deviceframes4.png";
import styles from "@/app/css-modules/HomeWhite.module.css";
import Link from "next/link";
import { MdLogin, MdOutlineAddBusiness } from "react-icons/md";

const HeroSection = () => {
  return (
    <>
      <div
        className={styles.heroContainer} >
        <div className="flex flex-col h-full w-fit md:flex-row ">
          <div className="flex flex-col justify-around w-full h-full gap-8 my-auto md:gap-10 2xl:gap-14 md:h-fit">
            <h4 className="text-4xl font-bold md:text-5xl lg:text-5xl 2xl:text-6xl ">
              {/* Optimizá la agenda de tu negocio. */}
              {/* La forma más simple de gestionar turnos. */}
              {/* Ahorrá tiempo con tu agenda online profesional. */}
              {/* Optimizá tu agenda y ahorrá tiempo. */}
              {/* Automatizá tu agenda, tu tiempo vale. */}
              Automatizá tus reservas, tu tiempo vale.
            </h4>
            <div>
              <p className="mb-3 text-sm font-medium text-gray-500 2xl:text-lg md:text-base">
                {/* Automatizá tus reservas, organizá tu agenda y dejá que tus clientes reserven solos, las 24 hs. Con SacaTurno, ahorrás tiempo, ganás eficiencia y mejorás la experiencia de tus clientes desde el primer día. */}
                Ofrecé a tus clientes una forma moderna y profesional de reservar turnos desde cualquier dispositivo y simplificá la gestión de tu agenda con reservas online rápidas y centralizadas.
              </p>
              <p className="mb-2 text-sm font-medium text-gray-500 2xl:text-lg md:text-base">
                Empezá hoy con una prueba gratuita de 15 días. Creá tu empresa y automatizá tu agenda ahora.
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 sm:justify-start sm:gap-4">
              <div className="justify-center hidden md:flex w-fit ">
                <Link
                  href="/register"
                  type="submit"
                  className={`${styles.btnAnimated} text-sm font-medium md:font-semibold rounded-xl gap-3`}
                >
                  <MdOutlineAddBusiness size={24} />
                  Comenzar prueba gratuita
                </Link>

              </div>
              <div className="flex justify-center w-full md:hidden sm:w-fit ">
                <Link
                  href="/register"
                  type="submit"
                  className={`${styles.btnAnimated}  w-full sm:w-fit font-normal rounded-xl gap-2`}
                >
                  <MdOutlineAddBusiness className="block sm:hidden" size={20} />
                  <MdOutlineAddBusiness className="hidden sm:block" size={24} />
                  Probar gratis
                </Link>
              </div>
              {/* <span>o</span> */}
              <div className="flex justify-center w-full sm:w-fit ">
                <Link
                  href="/public/search"
                  type="submit"
                  className={`${styles.btnAnimatedWhite} w-full sm:w-fit text-sm font-medium md:font-semibold rounded-xl gap-2`}
                >
                  <MdLogin className="hidden sm:block" size={24} />
                  <MdLogin className="block sm:hidden" size={17} />
                  Iniciar sesión
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
