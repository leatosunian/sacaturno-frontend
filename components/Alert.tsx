import AlertInterface from "../interfaces/alert.interface";
import correct from "../public/correct.png";
import remove from "../public/remove.png";
import { useEffect } from "react";
import Image from "next/image";
import { MdCancel } from "react-icons/md";
import { BsFillCheckCircleFill } from "react-icons/bs";

type Props = AlertInterface;

const Alert: React.FC<Props> = ({ alertType, msg, error }) => {
  return (
    <>
      <div className={`notificationContainer ${error ? "actived" : ""}`}>
        <div className="notificationImgCont">
          {alertType === "OK_ALERT" && (
            <>
              <BsFillCheckCircleFill
                className="hidden md:block"
                size={38}
                color="#4bc720"
              />
              <BsFillCheckCircleFill
                className="block md:hidden"
                size={26}
                color="#4bc720"
              />
            </>
          )}

          {alertType === "ERROR_ALERT" && (
            <>
            <MdCancel size={40} className="hidden md:block" color="#ff0000" />
            <MdCancel size={30} className="block md:hidden" color="#ff0000" />            
            </>
          )}
          <span>{msg}</span>
        </div>
      </div>
    </>
  );
};

export default Alert;
