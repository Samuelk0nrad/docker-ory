'use client'

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { getCsrfToken } from "@/lib/utils"
import { kratos, LoginFlowPayload } from "@/ory/kratos"
import { LoginFlow } from "@ory/client"
import { AxiosError } from "axios"
import { useEffect, useState } from "react"
import { Spinner } from "./ui/spinner"
import { Label } from "./ui/label"
import { ResponseUI } from "@/ory/kratos/types"

export function LoginForm({ flowId }: { flowId?: string }) {
  const [flow, setFlow] = useState<LoginFlow>()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [message, setMessage] = useState("")
  const [emailError, setEmailError] = useState("")
  const [passwordError, setPasswordError] = useState("")

  const [isLoading, setIsLoading] = useState(false)

  const submitForm = async (e?: React.SubmitEvent<HTMLFormElement>) => {
    e?.preventDefault()

    setIsLoading(true)
    const isValid = await validateInput()
    if (!isValid) {
      setIsLoading(false)
      return;
    }

    const body: LoginFlowPayload = {
      identifier: email,
      password: password,
      csrf_token: getCsrfToken(flow),
      method: "password"
    }

    try {
      await kratos.updateLoginFlow({
        flow: flow!.id,
        updateLoginFlowBody: body
      })
      setMessage("")
    } catch (e: unknown) {
      handleLoginError(e)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginError = (error: unknown) => {
    if (error instanceof AxiosError) {
      const responseUi: ResponseUI = error.response?.data?.ui;
      if (responseUi.messages?.length > 0) {
        const message = responseUi.messages[0];
        console.error(responseUi.messages[0].text)
        setMessage(message.text);
      }
      if (responseUi.nodes?.length > 0) {
        const nodes = responseUi.nodes;
        nodes.forEach((node: any) => {
          if (node.attributes.name === "identifier" && node.messages.length > 0) {
            setEmailError(node.messages[0].text);
          }

          if (node.attributes.name === "password" && node.messages.length > 0) {
            setPasswordError(node.messages[0].text);
          }
        });
      }
    } else {
      console.error(error)
      setMessage("an error occurred, please try again later")
    }
  }

  const validateInput = async (): Promise<boolean> => {
    if (!flow) {
      try {
        await getLoginFlow()
      } catch (e: unknown) {
        console.error("Failed to get login flow", e)
        setMessage("an error occurred, please try again later")
        return false;
      }
    } else {
      setMessage("")
    }

    if (email === "") {
      setEmailError("Email is required")
      return false;
    } else {
      setEmailError("")
    }
    if (password === "") {
      setPasswordError("Password is required")
      return false;
    } else {
      setPasswordError("")
    }
    return true;
  }

  const getLoginFlow = async () => {
    if (!flowId) {
      const { data } = await kratos.createBrowserLoginFlow()
      setFlow(data)
      console.log(data)
    } else {
      const { data } = await kratos.getLoginFlow({ id: flowId })
      setFlow(data)
      console.log(data)
    }
  }

  useEffect(() => {
    getLoginFlow()
  }, [flowId])

  return (
    <div className={"flex flex-col gap-6"}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submitForm}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="max@mustermann.com"
                  required
                  value={email} onChange={(event) => { setEmail(event.target.value) }}
                  onBlur={validateInput}
                />
                <span className={"text-red-500"}>{emailError}</span>
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input id="password" type="password" required value={password} onChange={(event) => { setPassword(event.target.value) }} onBlur={validateInput} />
                <span className={"text-red-500"}>{passwordError}</span>
              </Field>
              <Field>
                <Button type="submit" disabled={isLoading}>{isLoading ? <Spinner /> : "Login"}</Button>
                <Label className={"text-red-500"}>{message}</Label>
                <Button variant="outline" type="button">
                  Login with Google
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="#">Sign up</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
