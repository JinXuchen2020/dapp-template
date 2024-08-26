import { signIn } from "@/auth"
import { Button, Input } from "antd"
import { AuthError } from "next-auth"
import { isRedirectError, type RedirectError } from "next/dist/client/components/redirect"
import { redirect } from "next/navigation"
import { FunctionComponent } from "react"
 
export const SignInButton: FunctionComponent<{provider: any}> = ({provider}) => {
  return ( 
    <form className="flex flex-col justify-center items-center gap-2 min-w-96"
      action={async (formData) => {
        "use server"
        try {
          await signIn(provider.id, {email:formData.get("Email"), redirectTo: "/" });
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
      {
        provider.id === "resend" && (            
          <Input name='Email' type='email' placeholder='请输入邮箱'/>
        )
      }
      <Button type="primary" htmlType="submit">
        <span>Sign in with {provider.name}</span>
      </Button>
    </form>
  )
}