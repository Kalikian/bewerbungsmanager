// public layout
import Footer from "@/components/layout/footer"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main>{children}</main>
    </>
  )
}