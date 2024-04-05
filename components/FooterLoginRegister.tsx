import styles from "@/app/css-modules/login.module.css";
import Link from "next/link";

const LoginRegisterFooter = () => {
  return (
    <>
      <div
        className="absolute flex items-center justify-center w-full text-sm font-thin py-7 h-fit"
        style={{ color: "rgba(255, 255, 255, 0.715)" }}
      >
        <span className="cursor-default">
          created by{" "}
          <Link className={styles.footerLink} href="https://tosunian.dev">
            tosunian.dev
          </Link>{" "}
        </span>
      </div>
    </>
  );
};

export default LoginRegisterFooter;
