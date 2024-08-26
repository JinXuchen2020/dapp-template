import { providerMap, signIn } from "@/auth";
import { Login } from "@/components/Login";
import { SignInButton } from "@/components/SignInButton";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

export default function Page() {
  return (
    <div className='flex flex-col w-screen h-screen justify-center items-center gap-10'>
      <Login callback={async (data: any) => {
        "use server"
        try {      
          await signIn("credentials", {
            ...data,
            redirect: false
          });
        }
        catch (error) {
          if (error instanceof AuthError) {
            return redirect(`/login?error=${error.type}`)
          }
        }
        finally {
          redirect("/");
        }
      }} />
      {
        Object.values(providerMap).map((provider) => (
          <SignInButton key={provider.id} provider={provider} />
        ))
      }
    </div>
  ) 
}