import { signIn } from "@/auth"
import { Button } from "antd"
import { AuthError } from "next-auth"
import { isRedirectError, type RedirectError } from "next/dist/client/components/redirect"
import { redirect } from "next/navigation"
import { FunctionComponent } from "react"
 
export const SignInButton: FunctionComponent<{provider: any}> = ({provider}) => {
  return (    
    <form
      action={async () => {
        "use server"
        try {
          await signIn(provider.id, { redirectTo: "/" });
        } catch (error) {
          if (isRedirectError(error)) {
            const errorRd = error as RedirectError<string>;
            const url = errorRd.digest.split(";")[2];
            redirect(url);
          }
          if (error instanceof AuthError) {
            return redirect(`/login?error=${error.type}`)
          }
        }
      }}
    >
      <Button type="primary" htmlType="submit">
        <span>Sign in with {provider.name}</span>
      </Button>
    </form>
  )
}