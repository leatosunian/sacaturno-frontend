import { NextPage } from 'next'
import styles from '../css-modules/home.module.css'
import LoggedInHeader from '@/components/LoggedInHeader'
import Link from 'next/link'
interface Props {}

const Home: NextPage<Props> = ({}) => {
  return (
    <>
        <div style={{width: '100%', height:'calc(100% - 64px)', zIndex:'2000'}} className='flex flex-col justify-center w-full h-full px-3 text-center text-black gap-7 align-center'>
            <div className='flex flex-col gap-8'>
                <div className='mx-auto text-center w-fit'>
                    <h3 className='mb-4 text-4xl font-bold md:text-5xl'>¡Bienvenido a SacaTurno!</h3>
                    <p className='font-semibold text-gray-600 md:text-xl text-md'>A continuación, seleccioná qué deseas hacer</p>
                </div>
                <div className='flex gap-5 mx-auto'>
                    <Link href='' className={styles.btn1}>Sacar Turno</Link>
                    <Link href='/turnos/misturnos' className={styles.btn2}>Gestionar mis Turnos</Link>
                </div>
            </div>

        </div>
    </>
  )
}

export default Home