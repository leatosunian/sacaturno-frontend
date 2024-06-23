import FormCreateBusiness from "@/components/FormCreateBusiness";
import styles from "@/app/css-modules/miempresa.module.css";

const CreateBusiness: React.FC = () => {
  return (
    <>
      <header className="flex justify-center w-full mt-5 mb-5 md:mt-7 md:mb-7 h-fit">
        <h4 style={{ fontSize: "22px" }} className="font-bold uppercase ">
          Crear Empresa
        </h4>
      </header>

      <div className="flex flex-col justify-center w-full mt-7 h-fit">
        <div className={styles.cont}>
          <FormCreateBusiness />
        </div>
        {/* SPACER */}
        <div className="w-full h-2 md:h-20 "></div>
      </div>
    </>
  );
};

export default CreateBusiness;
