import HeaderPublicBlack from "@/components/home/HeaderPublicBlack";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <>
        <div className="h-screen">
          <HeaderPublicBlack/>
          {children}
        </div> 
      </>
  );
}
