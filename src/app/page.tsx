import WebConnector from "@/components/WebConnector";
import { auth, signIn } from "@/auth"
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";

export default async function Home() {
  const session = await auth()
  if (session?.user) {
    return (
      <div className="container">
        <SignOutButton/>
        <WebConnector />
      </div>
    );
  }
  else {
    redirect("/login");
    // return (
    //   <form
    //     action={async () => {
    //       "use server"
    //       try {
    //         await signIn();
    //       } catch (error) {
    //         if (isRedirectError(error)) {
    //           const errorRd = error as RedirectError<string>;
    //           const url = errorRd.digest.split(";")[2];
    //           redirect(url);
    //         }
    //       }
    //     }}
    //   >
    //     <Button type="primary" htmlType="submit">
    //       <span>Sign in</span>
    //     </Button>
    //   </form>
    // )
  }
  
}
