import Link from "next/link";

export default function CustomFooter() {
  return (
    <footer className="border-t justify-items-center w-full"> {/*fixed bottom-0*/}
      <div className="mx-auto max-w-5xl space-y-5 px-3 py-5">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Invoice Generator . Me</h3>
            <div className="flex items-center">
              {/* <Image alt="pms logo" width={30} height={30} src="/pmslogo.png"/> */}
              <p className="text-sm text-muted-foreground flex pl-2">
                Product of   <a href="https://www.youtube.com/@pms_code" style={{ color: 'green', textDecoration: 'underline', cursor: 'pointer', paddingLeft: '5px', paddingRight: '5px' }}>{"  "} Programming make sense</a> Youtube Channel
              </p>
            </div>

          </div>
          <div className="flex flex-wrap gap-5 text-sm text-muted-foreground">
            <Link href="https://github.com/prasath95/Invoice-Generator-.Me/issues/1" className="hover:underline">
              Request Features,Bugs and Reviews
            </Link>
            {/* <Link href="/contact" className="hover:underline">
              Contact
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms of Service
            </Link>
            <Link href="/privacy" className="hover:underline">
              Privacy Policy
            </Link> */}
          </div>
        </div>
        <div className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} All rights reserved.
        </div>
      </div>
    </footer>
  );
}