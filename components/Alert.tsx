import AlertInterface from '../interfaces/alert.interface';
import correct from '../public/correct.png'
import remove from '../public/remove.png'
import { useEffect } from 'react';
import Image from 'next/image';

type Props = AlertInterface

const Alert: React.FC<Props> = ({alertType, msg, error}) => {

  return (
    <>
      <div className={`notificationContainer ${error ? "actived": ''}`} >
        <div className='notificationImgCont'>
          {
            alertType === 'OK_ALERT' &&
            <Image placeholder='blur' src={correct} alt="" className='notificationImage'/>
          }
          
          {
            alertType === 'ERROR_ALERT' &&
            <Image placeholder='blur' src={remove} alt="" className='notificationImage'/>
          }
          <span>{msg}</span>
        </div>
      </div>
    </>
  )
}

export default Alert