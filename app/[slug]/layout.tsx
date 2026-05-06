import HeaderPublic from "@/components/home/HeaderPublic";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <>
        <div className="h-screen">
          <HeaderPublic/>
          {children}
        </div> 
      </>
  );
}
