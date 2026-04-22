import Image from "next/image";

export default function PageLoader() {
  return (
    <div className="pageLoader">
      <div className="pageLoaderInner">
        <Image
          src="/sacaturno-orange.svg"
          alt="SacaTurno"
          width={180}
          height={45}
          className="pageLoaderLogo"
        />
        <div className="pageLoaderTrack">
          <div className="pageLoaderFill" />
        </div>
      </div>
    </div>
  );
}
