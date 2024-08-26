import { signOut } from "@/auth"
import { Button } from "antd"
 
export function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server"
        await signOut()
      }}
    >
      <Button type="primary" htmlType="submit">Sign out</Button>
    </form>
  )
}