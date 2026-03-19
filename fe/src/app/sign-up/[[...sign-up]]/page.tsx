<<<<<<< Updated upstream
import { SignIn } from "@clerk/nextjs"
=======
import { SignUp } from "@clerk/nextjs"
>>>>>>> Stashed changes

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
<<<<<<< Updated upstream
      <SignIn
        path="/sign-in"
        routing="path"
        signUpUrl="/sign-up"
        forceRedirectUrl="/post-auth"
      />
=======
      <SignUp fallbackRedirectUrl="/" />
>>>>>>> Stashed changes
    </div>
  )
}