import { useForm } from '@tanstack/react-form'
import { toast } from 'sonner'
import * as z from 'zod'
import { useNavigate } from '@tanstack/react-router'
import { CombinedGraphQLErrors } from '@apollo/client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { RavnLogoShort } from '@/shared/components/logos/ravn-logo-short'
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/shared/components/ui/field'
import { useLogin } from './hooks/use-login'

const formSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
})

export function LoginScreen() {
  const navigate = useNavigate()
  const { login, loading } = useLogin()

  const loginForm = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    validators: {
      onSubmit: formSchema,
    },
    onSubmit: async ({ value }) => {
      try {
        await login({
          input: {
            email: value.email,
            password: value.password,
          },
        })

        toast.success('Login successful!', {
          description: 'Welcome to Ravn Skills Platform',
          position: 'bottom-right',
        })

        // Navigate to home or dashboard after successful login
        navigate({ to: '/' })
      } catch (error) {
        let errorMessage = 'An error occurred during login'

        if (CombinedGraphQLErrors.is(error)) {
          const gqlError = error.errors[0]
          if (gqlError?.extensions?.code === 'INVALID_CREDENTIALS') {
            errorMessage = 'Invalid email or password'
          } else if (gqlError?.message) {
            errorMessage = gqlError.message
          } else if (error.message) {
            errorMessage = error.message
          }
        } else if (error instanceof Error) {
          errorMessage = error.message
        }

        toast.error('Login failed', {
          description: errorMessage,
          position: 'bottom-right',
        })
      }
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    loginForm.handleSubmit()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <Card className="p-4 sm:p-6 shadow-lg gap-8">
          <CardHeader className="flex items-center justify-center p-0 gap-4">
            <RavnLogoShort className="fill-primary h-6 w-6 dark:fill-white" />
            <CardTitle className="text-2xl font-bold">
              Ravn Skills Platform
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <form
              id="login-form"
              onSubmit={handleSubmit}
              className="space-y-4 sm:space-y-5"
            >
              <FieldGroup>
                <loginForm.Field
                  name="email"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel
                          htmlFor={field.name}
                          className="text-sm sm:text-base"
                        >
                          Email
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Enter your email"
                          className="text-sm sm:text-base"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />
                <loginForm.Field
                  name="password"
                  children={(field) => {
                    const isInvalid =
                      field.state.meta.isTouched && !field.state.meta.isValid
                    return (
                      <Field data-invalid={isInvalid}>
                        <FieldLabel
                          htmlFor={field.name}
                          className="text-sm sm:text-base"
                        >
                          Password
                        </FieldLabel>
                        <Input
                          id={field.name}
                          name={field.name}
                          type="password"
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          aria-invalid={isInvalid}
                          placeholder="Enter your password"
                          className="text-sm sm:text-base"
                        />
                        {isInvalid && (
                          <FieldError errors={field.state.meta.errors} />
                        )}
                      </Field>
                    )
                  }}
                />
              </FieldGroup>
            </form>
          </CardContent>
          <Button
            type="submit"
            form="login-form"
            className="w-full text-sm sm:text-base"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Internal use only - Ravn employees
          </p>
        </Card>
      </div>
    </div>
  )
}
