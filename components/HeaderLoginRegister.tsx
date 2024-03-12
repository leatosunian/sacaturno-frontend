import Image from 'next/image';
import sacaturno_logo from '@/public/st_logo_white.png'

const HeaderLoginRegister = () => {
  return (
    <>
      <div className="flex items-center justify-center w-full py-12 h-fit lg:h-full lg:w-1/2">
        <Image className="w-44 lg:mt-0 lg:w-96" alt="" src={sacaturno_logo} />
      </div>
    </>
  );
};

export default HeaderLoginRegister;
